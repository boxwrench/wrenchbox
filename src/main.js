/**
 * wrenchbox - Main Application
 * Phase 6: Horror mode with corruption spread
 *
 * Learning goals:
 * - Cellular automata for corruption spread
 * - Real-time audio effect manipulation
 * - Progressive visual corruption
 * - State-driven transformation
 */

// App state
const state = {
    slots: [], // { id, soundName, element, active, muted, soloed }
    initialized: false,
    soloedSlotId: null // Track which slot is soloed (only one at a time)
};

// Config
const CONFIG = {
    NUM_SLOTS: 7,
    BPM: 120
};

// Icons for sounds
const SOUND_ICONS = {
    kick: '🥁',
    snare: '🪘',
    hihat: '🎩',
    bass: '🎸',
    lead: '🎹',
    cursed: '💀'
};

/**
 * Initialize the app
 */
function init() {
    const overlay = document.getElementById('startOverlay');
    overlay.addEventListener('click', handleStart);
    console.log('[wrenchbox] Ready - click to start');
}

/**
 * Handle start overlay click
 */
async function handleStart() {
    if (state.initialized) return;

    const overlay = document.getElementById('startOverlay');
    const app = document.getElementById('app');
    const startContent = overlay.querySelector('.start-content p');

    try {
        // Update overlay to show loading
        startContent.textContent = 'Initializing audio...';

        await audioEngine.init();

        // Try to preload samples (only works on HTTP, not file://)
        if (typeof sampleManager !== 'undefined' && typeof SAMPLE_CONFIG !== 'undefined') {
            if (window.location.protocol !== 'file:') {
                startContent.textContent = 'Loading samples...';
                sampleManager.registerSamples(SAMPLE_CONFIG);

                try {
                    await sampleManager.preload((progress, name) => {
                        startContent.textContent = `Loading: ${name} (${Math.round(progress * 100)}%)`;
                    });
                } catch (err) {
                    console.warn('[wrenchbox] Sample preload failed, using synths:', err);
                }
            } else {
                console.log('[wrenchbox] Running from file://, using synths (samples require HTTP server)');
            }
        }

        window.sequencer = new Sequencer(audioEngine, CONFIG.BPM);
        sequencer.init();

        // Initialize bonus system
        setupBonusSystem();

        // Initialize horror mode system
        setupHorrorSystem();

        createSlots();
        createSoundIcons();
        createBonusIndicator();
        createCureButton();
        setupDragDrop();
        setupEventListeners();
        updateBpmDisplay();
        updateModeIndicator();

        overlay.style.display = 'none';
        app.style.display = 'flex';

        state.initialized = true;

        const mode = audioEngine.canUseSamples() && sampleManager.loaded ? 'samples' : 'synths';
        console.log('[wrenchbox] Phase 6 ready, using:', mode);
    } catch (err) {
        console.error('[wrenchbox] Failed to initialize:', err);
        startContent.textContent = 'Error: ' + err.message;
    }
}

/**
 * Create empty character slots
 */
function createSlots() {
    const container = document.getElementById('slots');

    for (let i = 0; i < CONFIG.NUM_SLOTS; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot empty';
        slot.dataset.slotId = i;

        slot.innerHTML = `
            <div class="slot-content">
                <span class="slot-icon">+</span>
            </div>
            <span class="slot-label">drop sound</span>
            <div class="slot-controls">
                <button class="slot-btn mute-btn" title="Mute (click)">M</button>
                <button class="slot-btn solo-btn" title="Solo (S)">S</button>
            </div>
            <div class="beat-indicator"></div>
        `;

        state.slots.push({
            id: i,
            soundName: null,
            element: slot,
            active: false,
            muted: false,
            soloed: false
        });

        container.appendChild(slot);
    }
}

/**
 * Create sound icons in palette
 */
function createSoundIcons() {
    const container = document.getElementById('soundIcons');
    const sounds = Sequencer.getSoundNames();

    for (const soundName of sounds) {
        const sound = Sequencer.getSound(soundName);
        const icon = document.createElement('div');
        icon.className = 'sound-icon';
        icon.dataset.soundName = soundName;
        icon.dataset.type = sound.type;
        icon.innerHTML = SOUND_ICONS[soundName];
        icon.title = `Drag ${soundName} to a slot`;

        // Mark cursed sounds
        if (sound.cursed) {
            icon.classList.add('cursed');
            icon.title = `⚠️ CURSED: ${soundName} - triggers horror mode!`;
        }

        container.appendChild(icon);
    }
}

/**
 * Set up drag-drop functionality
 */
function setupDragDrop() {
    window.dragDrop = new DragDrop({
        onDrop: (slotId, soundName) => assignSoundToSlot(slotId, soundName),
        onRemove: (slotId) => removeSoundFromSlot(slotId)
    });
    dragDrop.init();
}

/**
 * Assign a sound to a slot
 */
function assignSoundToSlot(slotId, soundName) {
    const slot = state.slots[slotId];
    if (!slot) return;

    const sound = Sequencer.getSound(soundName);
    if (!sound) return;

    // If slot already has a sound, stop it first
    if (slot.active) {
        sequencer.stopPattern(slotId);
    }

    // Update state
    slot.soundName = soundName;
    slot.active = true;
    slot.muted = false;

    // Update UI
    const slotEl = slot.element;
    slotEl.classList.remove('empty');
    slotEl.classList.add('active');
    slotEl.dataset.soundName = soundName;
    slotEl.dataset.type = sound.type;

    const iconEl = slotEl.querySelector('.slot-icon');
    const labelEl = slotEl.querySelector('.slot-label');
    iconEl.textContent = SOUND_ICONS[soundName];
    labelEl.textContent = soundName;

    // Make slot draggable
    dragDrop.updateSlotDraggable(slotEl, true);

    // Start the pattern (quantized to next bar)
    startPatternQuantized(slotId, soundName);

    // Apply current solo state
    updateMuteStates();

    // Check for bonus triggers
    checkForBonus();

    // Check if this is a cursed sound - trigger horror mode
    if (sound.cursed && !corruptionManager.isHorrorMode()) {
        corruptionManager.startCorruption(slotId);
    }

    console.log('[wrenchbox] Assigned', soundName, 'to slot', slotId);
}

/**
 * Remove sound from a slot
 */
function removeSoundFromSlot(slotId) {
    const slot = state.slots[slotId];
    if (!slot || !slot.soundName) return;

    // Stop the pattern
    if (slot.active) {
        sequencer.stopPattern(slotId);
    }

    // If this slot was soloed, clear solo
    if (state.soloedSlotId === slotId) {
        state.soloedSlotId = null;
    }

    // Update state
    const oldSound = slot.soundName;
    slot.soundName = null;
    slot.active = false;
    slot.muted = false;
    slot.soloed = false;

    // Update UI
    const slotEl = slot.element;
    slotEl.classList.add('empty');
    slotEl.classList.remove('active', 'muted', 'soloed');
    delete slotEl.dataset.soundName;
    delete slotEl.dataset.type;

    const iconEl = slotEl.querySelector('.slot-icon');
    const labelEl = slotEl.querySelector('.slot-label');
    iconEl.textContent = '+';
    labelEl.textContent = 'drop sound';

    // Make slot not draggable
    dragDrop.updateSlotDraggable(slotEl, false);

    // Update mute states for remaining slots
    updateMuteStates();

    console.log('[wrenchbox] Removed', oldSound, 'from slot', slotId);
}

/**
 * Start pattern quantized to next bar
 */
function startPatternQuantized(slotId, soundName) {
    const slot = state.slots[slotId];

    // Schedule start at next bar boundary
    const startTime = Tone.Transport.nextSubdivision('1m');

    Tone.Transport.scheduleOnce((time) => {
        if (slot.soundName === soundName && slot.active) {
            sequencer.startPattern(slotId, soundName);
        }
    }, startTime);

    // Ensure transport is running
    if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
    }
}

/**
 * Toggle mute on a slot
 */
function toggleMute(slotId) {
    const slot = state.slots[slotId];
    if (!slot || !slot.soundName) return;

    slot.muted = !slot.muted;
    audioEngine.muteSlot(slotId, slot.muted);

    slot.element.classList.toggle('muted', slot.muted);

    console.log('[wrenchbox] Slot', slotId, slot.muted ? 'muted' : 'unmuted');
}

/**
 * Toggle solo on a slot (exclusive - only one at a time)
 */
function toggleSolo(slotId) {
    const slot = state.slots[slotId];
    if (!slot || !slot.soundName) return;

    if (state.soloedSlotId === slotId) {
        // Unsolo
        state.soloedSlotId = null;
        slot.soloed = false;
        slot.element.classList.remove('soloed');
    } else {
        // Solo this slot, unsolo previous
        if (state.soloedSlotId !== null) {
            const prevSlot = state.slots[state.soloedSlotId];
            prevSlot.soloed = false;
            prevSlot.element.classList.remove('soloed');
        }

        state.soloedSlotId = slotId;
        slot.soloed = true;
        slot.element.classList.add('soloed');
    }

    updateMuteStates();
    console.log('[wrenchbox] Solo:', state.soloedSlotId !== null ? `slot ${state.soloedSlotId}` : 'off');
}

/**
 * Update mute states based on solo
 */
function updateMuteStates() {
    for (const slot of state.slots) {
        if (!slot.soundName) continue;

        let shouldMute = slot.muted;

        // If any slot is soloed, mute all others (unless explicitly muted)
        if (state.soloedSlotId !== null && slot.id !== state.soloedSlotId) {
            shouldMute = true;
        }

        audioEngine.muteSlot(slot.id, shouldMute);
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Slot control clicks (mute/solo buttons)
    document.getElementById('slots').addEventListener('click', (e) => {
        const muteBtn = e.target.closest('.mute-btn');
        const soloBtn = e.target.closest('.solo-btn');
        const slot = e.target.closest('.slot');

        if (!slot) return;
        const slotId = parseInt(slot.dataset.slotId);

        if (muteBtn) {
            toggleMute(slotId);
        } else if (soloBtn) {
            toggleSolo(slotId);
        }
        // Note: clicking slot itself does nothing in Phase 2 (use drag to add/remove)
    });

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetAll);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();

        // M to mute focused/hovered slot
        // S to solo focused/hovered slot
        // 1-7 to toggle mute on specific slot
        // Space/Escape to reset

        if (key >= '1' && key <= '7') {
            const slotId = parseInt(key) - 1;
            if (slotId < state.slots.length && state.slots[slotId].soundName) {
                toggleMute(slotId);
            }
        } else if (key === ' ' || key === 'escape') {
            e.preventDefault();
            resetAll();
        }
    });
}

/**
 * Reset all slots
 */
function resetAll() {
    if (!state.initialized) return;

    // Clear solo state
    state.soloedSlotId = null;

    // Remove all sounds from slots
    for (let i = 0; i < state.slots.length; i++) {
        if (state.slots[i].soundName) {
            removeSoundFromSlot(i);
        }
    }

    // Reset sequencer
    sequencer.reset();

    // Reset bonus system (allow re-triggering)
    bonusManager.reset();
    updateBonusIndicator();

    // Reset horror mode
    corruptionManager.reset();
    horrorEffects.reset();

    console.log('[wrenchbox] Reset');
}

/**
 * Update BPM display
 */
function updateBpmDisplay() {
    const display = document.getElementById('bpmDisplay');
    if (display) {
        display.textContent = `${CONFIG.BPM} BPM`;
    }
}

/**
 * Set up the bonus system
 */
function setupBonusSystem() {
    // Initialize overlay
    bonusOverlay.init();

    // Register bonus definitions
    if (typeof BONUS_CONFIG !== 'undefined') {
        bonusManager.registerBonuses(BONUS_CONFIG);
    }

    // Set up callbacks
    bonusManager.onBonusTriggered = (bonus) => {
        bonusOverlay.show(bonus);
        updateBonusIndicator();
    };

    bonusManager.onBonusEnded = (bonus) => {
        bonusOverlay.hide();
    };

    console.log('[wrenchbox] Bonus system initialized');
}

/**
 * Create bonus indicator in header
 */
function createBonusIndicator() {
    const controls = document.querySelector('.controls');
    if (!controls) return;

    const indicator = document.createElement('div');
    indicator.className = 'bonus-indicator';
    indicator.id = 'bonusIndicator';

    // Create badge for each bonus
    const bonuses = bonusManager.getBonusStatus();
    for (const bonus of bonuses) {
        const badge = document.createElement('div');
        badge.className = 'bonus-badge';
        badge.dataset.bonusId = bonus.id;
        badge.textContent = bonus.icon;
        badge.title = `${bonus.title}: ${bonus.requiredSounds.join(' + ')}`;
        indicator.appendChild(badge);
    }

    controls.insertBefore(indicator, controls.firstChild);
}

/**
 * Update bonus indicator badges
 */
function updateBonusIndicator() {
    const bonuses = bonusManager.getBonusStatus();

    for (const bonus of bonuses) {
        const badge = document.querySelector(`.bonus-badge[data-bonus-id="${bonus.id}"]`);
        if (badge) {
            badge.classList.toggle('unlocked', bonus.triggered);
        }
    }
}

/**
 * Get array of currently active sound names
 */
function getActiveSoundNames() {
    return state.slots
        .filter(s => s.soundName && s.active)
        .map(s => s.soundName);
}

/**
 * Check for bonus triggers
 */
function checkForBonus() {
    const activeSounds = getActiveSoundNames();
    const bonus = bonusManager.checkBonus(activeSounds);

    if (bonus) {
        bonusManager.triggerBonus(bonus);
    }
}

/**
 * Set up the horror mode system
 */
function setupHorrorSystem() {
    // Initialize corruption manager
    corruptionManager.init(CONFIG.NUM_SLOTS);

    // Initialize horror effects
    horrorEffects.init();

    // Set up callbacks
    corruptionManager.onCorruptionChanged = (slotId, level, tier) => {
        // Update visual effects on slot
        const slot = state.slots[slotId];
        if (slot && slot.element) {
            horrorEffects.applyVisualCorruption(slot.element, tier, level);
        }

        // Update audio effects if slot is active
        // Note: Effect chains are created when slot becomes active

        // Update global horror ambiance
        const maxCorruption = Math.max(...Array.from(corruptionManager.corruption.values()));
        horrorEffects.updateGlobalEffects(maxCorruption);
    };

    corruptionManager.onHorrorModeStart = () => {
        document.body.classList.add('horror-mode');
        console.log('[wrenchbox] HORROR MODE ACTIVATED');
    };

    corruptionManager.onHorrorModeEnd = () => {
        document.body.classList.remove('horror-mode');

        // Clear all visual corruption
        for (const slot of state.slots) {
            if (slot.element) {
                horrorEffects.applyVisualCorruption(slot.element, 'none', 0);
            }
        }

        // Reset audio effects
        horrorEffects.reset();

        console.log('[wrenchbox] Horror mode ended - peace restored');
    };

    console.log('[wrenchbox] Horror system initialized');
}

/**
 * Create cure button in header
 */
function createCureButton() {
    const controls = document.querySelector('.controls');
    if (!controls) return;

    const cureBtn = document.createElement('button');
    cureBtn.className = 'cure-btn';
    cureBtn.textContent = '🌿 Cure';
    cureBtn.title = 'Reduce corruption (or reset to fully cure)';

    cureBtn.addEventListener('click', () => {
        corruptionManager.cure(30);
    });

    controls.appendChild(cureBtn);
}

/**
 * Update mode indicator (samples vs synths)
 */
function updateModeIndicator() {
    const badge = document.querySelector('.phase-badge');
    if (badge) {
        const hasSamples = typeof sampleManager !== 'undefined' &&
                          sampleManager.loaded &&
                          window.location.protocol !== 'file:';
        const mode = hasSamples ? '(Samples)' : '(Synths)';
        badge.textContent = `Phase 3: Sample-Based Audio ${mode}`;
    }
}

// Start app when DOM ready
document.addEventListener('DOMContentLoaded', init);

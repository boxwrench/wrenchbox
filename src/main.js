/**
 * wrenchbox - Main Application
 * Phase 1: Click-to-toggle interface
 *
 * Learning goals:
 * - DOM manipulation
 * - Event handling
 * - State management (simple)
 * - Connecting UI to audio engine
 */

// App state
const state = {
    slots: [], // { id, soundName, element }
    initialized: false
};

// Config
const CONFIG = {
    NUM_SLOTS: 7,
    BPM: 120
};

// Icons for sounds (Phase 1: emoji, Phase 2+: SVG)
const SOUND_ICONS = {
    kick: '🥁',
    snare: '🪘',
    hihat: '🎩',
    bass: '🎸',
    lead: '🎹'
};

/**
 * Initialize the app
 */
function init() {
    // Create sequencer (needs audioEngine)
    window.sequencer = new Sequencer(audioEngine, CONFIG.BPM);

    // Build UI
    createSlots();
    createSoundIcons();
    setupEventListeners();

    // Add phase badge
    const badge = document.createElement('div');
    badge.className = 'phase-badge';
    badge.textContent = 'Phase 1: Foundation';
    document.body.appendChild(badge);

    console.log('[wrenchbox] Initialized');
}

/**
 * Create character slots
 */
function createSlots() {
    const container = document.getElementById('slots');
    const sounds = Sequencer.getSoundNames();

    for (let i = 0; i < CONFIG.NUM_SLOTS; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.dataset.slotId = i;

        // Phase 1: Pre-assign sounds to slots for simplicity
        // Phase 2+: Slots will be empty until drag-drop
        if (i < sounds.length) {
            const soundName = sounds[i];
            const sound = Sequencer.getSound(soundName);
            slot.dataset.soundName = soundName;
            slot.dataset.type = sound.type;
            slot.innerHTML = `
                ${SOUND_ICONS[soundName]}
                <span class="slot-label">${soundName}</span>
            `;
        } else {
            slot.innerHTML = `
                <span style="opacity: 0.3">+</span>
                <span class="slot-label">empty</span>
            `;
        }

        state.slots.push({
            id: i,
            soundName: i < sounds.length ? sounds[i] : null,
            element: slot,
            active: false
        });

        container.appendChild(slot);
    }
}

/**
 * Create sound icons in palette
 * Phase 1: Visual only (shows what sounds exist)
 * Phase 2: Will be draggable
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
        icon.title = soundName;

        container.appendChild(icon);
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Slot clicks
    document.getElementById('slots').addEventListener('click', (e) => {
        const slot = e.target.closest('.slot');
        if (slot) {
            handleSlotClick(parseInt(slot.dataset.slotId));
        }
    });

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => {
        resetAll();
    });

    // Initialize audio on first interaction (browser requirement)
    document.body.addEventListener('click', initAudio, { once: true });
    document.body.addEventListener('keydown', initAudio, { once: true });
}

/**
 * Initialize audio context (required after user interaction)
 */
function initAudio() {
    if (!state.initialized) {
        audioEngine.init();
        state.initialized = true;
        console.log('[wrenchbox] Audio initialized');
    }
}

/**
 * Handle slot click - toggle sound on/off
 */
function handleSlotClick(slotId) {
    initAudio();

    const slot = state.slots[slotId];
    if (!slot || !slot.soundName) return;

    if (slot.active) {
        // Turn off
        sequencer.stopPattern(slotId);
        slot.element.classList.remove('active');
        slot.active = false;
    } else {
        // Turn on
        sequencer.startPattern(slotId, slot.soundName);
        slot.element.classList.add('active');
        slot.active = true;
    }
}

/**
 * Reset all slots
 */
function resetAll() {
    sequencer.reset();

    for (const slot of state.slots) {
        slot.element.classList.remove('active');
        slot.active = false;
    }

    console.log('[wrenchbox] Reset');
}

// Start app when DOM ready
document.addEventListener('DOMContentLoaded', init);

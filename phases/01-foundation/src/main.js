/**
 * wrenchbox - Main Application
 * Phase 1: Click-to-toggle interface with Tone.js
 *
 * Learning goals:
 * - DOM manipulation
 * - Event handling
 * - Async audio initialization
 * - Connecting UI to Tone.js-based audio engine
 */

// App state
const state = {
    slots: [], // { id, soundName, element, active }
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
 * Initialize the app (called on DOMContentLoaded)
 */
function init() {
    // Set up the start overlay click handler
    const overlay = document.getElementById('startOverlay');
    overlay.addEventListener('click', handleStart);

    console.log('[wrenchbox] Ready - click to start');
}

/**
 * Handle start overlay click - initialize audio and show app
 */
async function handleStart() {
    if (state.initialized) return;

    const overlay = document.getElementById('startOverlay');
    const app = document.getElementById('app');

    try {
        // Initialize Tone.js audio context (must be after user gesture)
        await audioEngine.init();

        // Create sequencer with audio engine
        window.sequencer = new Sequencer(audioEngine, CONFIG.BPM);
        sequencer.init();

        // Build UI
        createSlots();
        createSoundIcons();
        setupEventListeners();

        // Update BPM display
        updateBpmDisplay();

        // Hide overlay, show app
        overlay.style.display = 'none';
        app.style.display = 'flex';

        state.initialized = true;
        console.log('[wrenchbox] Initialized with Tone.js');
    } catch (err) {
        console.error('[wrenchbox] Failed to initialize audio:', err);
    }
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
                <div class="beat-indicator"></div>
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

    // Keyboard shortcuts (1-5 for slots, space for reset)
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key >= '1' && key <= '7') {
            const slotId = parseInt(key) - 1;
            if (slotId < state.slots.length) {
                handleSlotClick(slotId);
            }
        } else if (key === ' ' || key === 'Escape') {
            e.preventDefault();
            resetAll();
        }
    });
}

/**
 * Handle slot click - toggle sound on/off
 */
function handleSlotClick(slotId) {
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
    if (!state.initialized) return;

    sequencer.reset();

    for (const slot of state.slots) {
        slot.element.classList.remove('active');
        slot.active = false;
    }

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

// Start app when DOM ready
document.addEventListener('DOMContentLoaded', init);

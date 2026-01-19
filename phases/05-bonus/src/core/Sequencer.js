/**
 * Sequencer - Pattern-based timing for wrenchbox using Tone.js
 * Phase 3: Supports both sample loops and synth patterns
 *
 * Learning goals:
 * - Tone.Transport for global timing
 * - Tone.Sequence for synth pattern playback
 * - Tone.Player for sample loops
 * - Coordinating both modes
 */

class Sequencer {
    constructor(audioEngine, bpm = 120) {
        this.audio = audioEngine;
        this.bpm = bpm;

        // Active sequences (synth mode only): slotId -> Tone.Sequence
        this.activeSequences = new Map();

        // Track which slots are active and their mode
        this.activeSlots = new Map(); // slotId -> { soundName, mode }
    }

    /**
     * Sound definitions with patterns (for synth mode)
     * Pattern values: null = rest, note string = trigger
     */
    static SOUNDS = {
        kick: {
            type: 'beats',
            icon: '🥁',
            pattern: ['C1', null, null, null, 'C1', null, null, null],
            subdivision: '8n'
        },
        snare: {
            type: 'beats',
            icon: '🪘',
            pattern: [null, null, 'C2', null, null, null, 'C2', null],
            subdivision: '8n'
        },
        hihat: {
            type: 'effects',
            icon: '🎩',
            pattern: ['C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4'],
            subdivision: '8n'
        },
        bass: {
            type: 'bass',
            icon: '🎸',
            pattern: ['C2', null, null, 'C2', 'Eb2', 'C2', null, 'G2',
                      null, 'C2', null, 'Eb2', 'G2', 'Eb2', 'C2', null],
            subdivision: '16n'
        },
        lead: {
            type: 'melodies',
            icon: '🎹',
            pattern: ['G4', 'Eb4', null, 'C4', 'G4', 'Eb4', 'Bb4', 'G4',
                      'C5', 'Bb4', null, 'G4', 'Eb4', 'C4', 'Eb4', 'G4'],
            subdivision: '16n'
        }
    };

    /**
     * Get available sound names
     */
    static getSoundNames() {
        return Object.keys(Sequencer.SOUNDS);
    }

    /**
     * Get sound info
     */
    static getSound(name) {
        return Sequencer.SOUNDS[name];
    }

    /**
     * Initialize the sequencer
     */
    init() {
        Tone.Transport.bpm.value = this.bpm;
        console.log('[Sequencer] Initialized at', this.bpm, 'BPM');
    }

    /**
     * Start a sound pattern for a slot
     * Handles both sample and synth modes
     */
    startPattern(slotId, soundName) {
        const sound = Sequencer.SOUNDS[soundName];
        if (!sound) {
            console.warn('[Sequencer] Unknown sound:', soundName);
            return;
        }

        // Stop existing pattern on this slot if any
        if (this.activeSlots.has(slotId)) {
            this.stopPattern(slotId);
        }

        // Create audio source (sample or synth)
        const mode = this.audio.createSource(soundName, slotId);

        if (mode === 'sample') {
            // Sample mode: just start the looping player
            this.audio.startPlayer(slotId, Tone.now());
            this.activeSlots.set(slotId, { soundName, mode: 'sample' });
        } else if (mode === 'synth') {
            // Synth mode: create and start a Tone.Sequence
            const sequence = new Tone.Sequence(
                (time, note) => {
                    if (note !== null) {
                        this.audio.triggerSound(slotId, note, sound.subdivision, time);
                    }
                },
                sound.pattern,
                sound.subdivision
            );

            sequence.start(0);
            this.activeSequences.set(slotId, { sequence, soundName });
            this.activeSlots.set(slotId, { soundName, mode: 'synth' });
        }

        // Start Transport if not running
        if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
        }

        console.log('[Sequencer] Started pattern:', soundName, 'on slot:', slotId, 'mode:', mode);
    }

    /**
     * Stop a pattern
     */
    stopPattern(slotId) {
        const slotInfo = this.activeSlots.get(slotId);
        if (!slotInfo) return;

        if (slotInfo.mode === 'sample') {
            // Stop the player
            this.audio.stopPlayer(slotId, Tone.now());
        } else if (slotInfo.mode === 'synth') {
            // Stop and dispose the sequence
            const seqData = this.activeSequences.get(slotId);
            if (seqData) {
                seqData.sequence.stop();
                seqData.sequence.dispose();
                this.activeSequences.delete(slotId);
            }
        }

        // Dispose the audio source
        this.audio.disposeSlot(slotId);
        this.activeSlots.delete(slotId);

        console.log('[Sequencer] Stopped slot:', slotId);

        // Stop Transport if no patterns active
        if (this.activeSlots.size === 0) {
            Tone.Transport.stop();
            Tone.Transport.position = 0;
        }
    }

    /**
     * Check if a pattern is active
     */
    isPatternActive(slotId) {
        return this.activeSlots.has(slotId);
    }

    /**
     * Get all active slot IDs
     */
    getActiveSlots() {
        return Array.from(this.activeSlots.keys());
    }

    /**
     * Get mode for a slot
     */
    getSlotMode(slotId) {
        const info = this.activeSlots.get(slotId);
        return info ? info.mode : null;
    }

    /**
     * Toggle A/B variation for a slot (sample mode only)
     */
    toggleVariation(slotId) {
        const info = this.activeSlots.get(slotId);
        if (info && info.mode === 'sample') {
            this.audio.toggleVariation(slotId);
        }
    }

    /**
     * Reset everything
     */
    reset() {
        // Stop all patterns
        for (const slotId of this.activeSlots.keys()) {
            this.stopPattern(slotId);
        }

        // Reset transport
        Tone.Transport.stop();
        Tone.Transport.position = 0;

        // Clear audio
        this.audio.disposeAll();

        console.log('[Sequencer] Reset');
    }

    /**
     * Set BPM
     */
    setBpm(bpm) {
        this.bpm = bpm;
        Tone.Transport.bpm.value = bpm;
        console.log('[Sequencer] BPM set to', bpm);
    }

    /**
     * Get current BPM
     */
    getBpm() {
        return Tone.Transport.bpm.value;
    }

    /**
     * Get current transport position
     */
    getPosition() {
        return Tone.Transport.position;
    }

    /**
     * Check if transport is running
     */
    isRunning() {
        return Tone.Transport.state === 'started';
    }
}

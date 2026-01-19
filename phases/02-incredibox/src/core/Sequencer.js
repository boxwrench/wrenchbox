/**
 * Sequencer - Pattern-based timing for wrenchbox using Tone.js
 * Phase 1: Uses Tone.Transport and Tone.Sequence for precise timing
 *
 * Learning goals:
 * - Tone.Transport for global timing (lookahead scheduling built-in)
 * - Tone.Sequence for pattern playback
 * - Pattern arrays (0 = rest, note values = trigger)
 * - Coordinating multiple sequences
 */

class Sequencer {
    constructor(audioEngine, bpm = 120) {
        this.audio = audioEngine;
        this.bpm = bpm;

        // Active sequences: slotId -> Tone.Sequence
        this.activeSequences = new Map();

        // Track which slots are active
        this.activeSlots = new Set();
    }

    /**
     * Sound definitions with patterns
     * Pattern values: null = rest, note string = trigger
     * Using Tone.js note format (e.g., "C2", "E4")
     */
    static SOUNDS = {
        kick: {
            type: 'beats',
            icon: '🥁',
            // 8 steps (8th notes in one bar at 4/4)
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
            // 16 steps (16th notes), using notes from C minor scale
            pattern: ['C2', null, null, 'C2', 'Eb2', 'C2', null, 'G2',
                      null, 'C2', null, 'Eb2', 'G2', 'Eb2', 'C2', null],
            subdivision: '16n'
        },
        lead: {
            type: 'melodies',
            icon: '🎹',
            // 16 steps, melody in C minor
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
     * Initialize the sequencer (set BPM on Transport)
     */
    init() {
        Tone.Transport.bpm.value = this.bpm;
        console.log('[Sequencer] Initialized at', this.bpm, 'BPM');
    }

    /**
     * Start a sound pattern for a slot
     */
    startPattern(slotId, soundName) {
        const sound = Sequencer.SOUNDS[soundName];
        if (!sound) {
            console.warn('[Sequencer] Unknown sound:', soundName);
            return;
        }

        // Stop existing pattern on this slot if any
        if (this.activeSequences.has(slotId)) {
            this.stopPattern(slotId);
        }

        // Create synth for this slot
        this.audio.createSynth(soundName, slotId);

        // Create Tone.Sequence for this pattern
        const sequence = new Tone.Sequence(
            (time, note) => {
                if (note !== null) {
                    this.audio.triggerSound(slotId, note, sound.subdivision, time);
                }
            },
            sound.pattern,
            sound.subdivision
        );

        // Start the sequence
        sequence.start(0);
        this.activeSequences.set(slotId, { sequence, soundName });
        this.activeSlots.add(slotId);

        // Start Transport if not running
        if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
        }

        console.log('[Sequencer] Started pattern:', soundName, 'on slot:', slotId);
    }

    /**
     * Stop a pattern
     */
    stopPattern(slotId) {
        const seqData = this.activeSequences.get(slotId);
        if (seqData) {
            seqData.sequence.stop();
            seqData.sequence.dispose();
            this.activeSequences.delete(slotId);
        }

        // Dispose the synth
        this.audio.disposeSynth(slotId);
        this.activeSlots.delete(slotId);

        console.log('[Sequencer] Stopped slot:', slotId);

        // Stop Transport if no patterns active
        if (this.activeSequences.size === 0) {
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
        return Array.from(this.activeSlots);
    }

    /**
     * Reset everything
     */
    reset() {
        // Stop all sequences
        for (const slotId of this.activeSequences.keys()) {
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
     * Get current transport position (for visualizations)
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

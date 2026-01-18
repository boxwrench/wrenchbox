/**
 * Sequencer - Pattern-based timing for wrenchbox
 * Phase 1: Simple interval-based sequencer
 *
 * Learning goals:
 * - setInterval for basic timing
 * - Pattern arrays (0 = rest, 1+ = trigger)
 * - Beat counting and looping
 * - Coordinating multiple patterns
 */

class Sequencer {
    constructor(audioEngine, bpm = 120) {
        this.audio = audioEngine;
        this.bpm = bpm;
        this.beatDuration = 60000 / bpm / 2; // 8th notes
        this.currentBeat = 0;
        this.isRunning = false;
        this.intervalId = null;

        // Active patterns: slotId -> { type, pattern, noteIndex? }
        this.activePatterns = new Map();
    }

    /**
     * Sound definitions with patterns
     * Pattern values: 0 = rest, 1-9 = trigger (for melodic, selects note)
     */
    static SOUNDS = {
        kick: {
            type: 'beats',
            pattern: [1, 0, 0, 0, 1, 0, 0, 0], // 8 beats
            play: (audio, time) => audio.playKick(time)
        },
        snare: {
            type: 'beats',
            pattern: [0, 0, 1, 0, 0, 0, 1, 0],
            play: (audio, time) => audio.playSnare(time)
        },
        hihat: {
            type: 'effects',
            pattern: [1, 1, 1, 1, 1, 1, 1, 1],
            play: (audio, time) => audio.playHiHat(time)
        },
        bass: {
            type: 'bass',
            // 16-beat pattern, values select from notes array
            pattern: [1, 0, 0, 1, 2, 1, 0, 1, 0, 1, 0, 1, 2, 1, 3, 0],
            notes: [82.41, 98.00, 110.00, 130.81], // E2, G2, A2, C3
            play: (audio, time, noteIndex, notes) => {
                if (noteIndex > 0 && notes) {
                    audio.playBass(notes[noteIndex - 1], time, 0.35);
                }
            }
        },
        lead: {
            type: 'melodies',
            // 16-beat pattern
            pattern: [1, 2, 0, 1, 3, 2, 3, 4, 1, 2, 0, 1, 3, 2, 3, 4],
            notes: [329.63, 392.00, 440.00, 523.25], // E4, G4, A4, C5
            play: (audio, time, noteIndex, notes) => {
                if (noteIndex > 0 && notes) {
                    audio.playLead(notes[noteIndex - 1], time, 0.25);
                }
            }
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
     * Start a sound pattern for a slot
     */
    startPattern(slotId, soundName) {
        const sound = Sequencer.SOUNDS[soundName];
        if (!sound) {
            console.warn('[Sequencer] Unknown sound:', soundName);
            return;
        }

        this.activePatterns.set(slotId, {
            soundName,
            sound,
            patternLength: sound.pattern.length
        });

        console.log('[Sequencer] Started pattern:', soundName, 'on slot:', slotId);

        // Start the sequencer if not running
        if (!this.isRunning) {
            this.start();
        }
    }

    /**
     * Stop a pattern
     */
    stopPattern(slotId) {
        this.activePatterns.delete(slotId);
        console.log('[Sequencer] Stopped slot:', slotId);

        // Stop sequencer if no patterns active
        if (this.activePatterns.size === 0) {
            this.stop();
        }
    }

    /**
     * Check if a pattern is active
     */
    isPatternActive(slotId) {
        return this.activePatterns.has(slotId);
    }

    /**
     * Main sequencer loop
     */
    tick() {
        const time = this.audio.currentTime;

        for (const [slotId, data] of this.activePatterns) {
            const { sound, patternLength } = data;
            const beatIndex = this.currentBeat % patternLength;
            const value = sound.pattern[beatIndex];

            if (value > 0) {
                sound.play(this.audio, time, value, sound.notes);
            }
        }

        this.currentBeat++;
    }

    /**
     * Start the sequencer
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.currentBeat = 0;

        this.intervalId = setInterval(() => {
            this.tick();
        }, this.beatDuration);

        console.log('[Sequencer] Started at', this.bpm, 'BPM');
    }

    /**
     * Stop the sequencer
     */
    stop() {
        if (!this.isRunning) return;

        clearInterval(this.intervalId);
        this.intervalId = null;
        this.isRunning = false;
        this.currentBeat = 0;

        console.log('[Sequencer] Stopped');
    }

    /**
     * Reset everything
     */
    reset() {
        this.stop();
        this.activePatterns.clear();
        this.audio.stopAll();
    }

    /**
     * Set BPM (restarts if running)
     */
    setBpm(bpm) {
        this.bpm = bpm;
        this.beatDuration = 60000 / bpm / 2;

        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }
}

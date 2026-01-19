/**
 * AudioEngine - Tone.js wrapper for wrenchbox
 * Phase 1: Synthesized sounds using Tone.js synths
 *
 * Learning goals:
 * - Tone.js synth types (MembraneSynth, NoiseSynth, MetalSynth, MonoSynth)
 * - Tone.Transport for global timing
 * - Tone.Channel for per-slot routing
 * - Proper audio context initialization
 */

class AudioEngine {
    constructor() {
        this.initialized = false;
        this.synths = new Map();  // slotId -> synth instance
        this.channels = new Map(); // slotId -> Tone.Channel
    }

    /**
     * Initialize Tone.js (must be called after user interaction)
     */
    async init() {
        if (this.initialized) return;

        await Tone.start();
        console.log('[AudioEngine] Tone.js started, context state:', Tone.context.state);

        // Set global BPM
        Tone.Transport.bpm.value = 120;

        this.initialized = true;
    }

    /**
     * Create synths for all sound types
     * Each synth is connected to its own channel for independent volume control
     */
    createSynth(soundName, slotId) {
        // Create a channel for this slot (allows mute/solo later)
        const channel = new Tone.Channel({ volume: 0 }).toDestination();
        this.channels.set(slotId, channel);

        let synth;

        switch (soundName) {
            case 'kick':
                // MembraneSynth: Pitched membrane with quick decay (kick drums)
                synth = new Tone.MembraneSynth({
                    pitchDecay: 0.05,
                    octaves: 6,
                    oscillator: { type: 'sine' },
                    envelope: {
                        attack: 0.001,
                        decay: 0.3,
                        sustain: 0,
                        release: 0.1
                    }
                }).connect(channel);
                break;

            case 'snare':
                // NoiseSynth: Filtered noise burst (snare, hats)
                synth = new Tone.NoiseSynth({
                    noise: { type: 'white' },
                    envelope: {
                        attack: 0.001,
                        decay: 0.15,
                        sustain: 0,
                        release: 0.05
                    }
                }).connect(channel);
                // Add bandpass filter for snare character
                const snareFilter = new Tone.Filter(3000, 'bandpass').connect(channel);
                synth.connect(snareFilter);
                break;

            case 'hihat':
                // MetalSynth: Metallic, inharmonic tones (hats, cymbals)
                synth = new Tone.MetalSynth({
                    frequency: 300,
                    envelope: {
                        attack: 0.001,
                        decay: 0.15,
                        release: 0.05
                    },
                    harmonicity: 5.1,
                    modulationIndex: 20,
                    resonance: 5000,
                    octaves: 1.2
                }).connect(channel);
                synth.volume.value = -6;
                break;

            case 'bass':
                // MonoSynth: Single oscillator with filter (bass, leads)
                synth = new Tone.MonoSynth({
                    oscillator: { type: 'triangle' },
                    envelope: {
                        attack: 0.01,
                        decay: 0.3,
                        sustain: 0.4,
                        release: 0.2
                    },
                    filterEnvelope: {
                        attack: 0.01,
                        decay: 0.2,
                        sustain: 0.5,
                        release: 0.2,
                        baseFrequency: 200,
                        octaves: 2
                    }
                }).connect(channel);
                break;

            case 'lead':
                // MonoSynth with square wave for bright leads
                synth = new Tone.MonoSynth({
                    oscillator: { type: 'square' },
                    envelope: {
                        attack: 0.01,
                        decay: 0.2,
                        sustain: 0.3,
                        release: 0.3
                    },
                    filterEnvelope: {
                        attack: 0.01,
                        decay: 0.1,
                        sustain: 0.8,
                        release: 0.2,
                        baseFrequency: 400,
                        octaves: 3
                    }
                }).connect(channel);
                synth.volume.value = -8; // Square waves are loud
                break;

            default:
                console.warn('[AudioEngine] Unknown sound type:', soundName);
                return null;
        }

        this.synths.set(slotId, { synth, soundName });
        return synth;
    }

    /**
     * Trigger a synth to play a note
     * @param {number} slotId - Slot identifier
     * @param {string|number} note - Note to play (e.g., 'C2' for bass, or frequency)
     * @param {string} duration - Duration (e.g., '8n' for eighth note)
     * @param {number} time - When to play (Tone.Transport time)
     */
    triggerSound(slotId, note, duration = '8n', time) {
        const synthData = this.synths.get(slotId);
        if (!synthData) return;

        const { synth, soundName } = synthData;

        // Different trigger methods for different synth types
        if (soundName === 'kick') {
            synth.triggerAttackRelease('C1', duration, time);
        } else if (soundName === 'snare' || soundName === 'hihat') {
            synth.triggerAttackRelease(duration, time);
        } else {
            // Bass and lead need actual notes
            synth.triggerAttackRelease(note, duration, time);
        }
    }

    /**
     * Get the synth for a slot
     */
    getSynth(slotId) {
        const data = this.synths.get(slotId);
        return data ? data.synth : null;
    }

    /**
     * Dispose of a synth (clean up)
     */
    disposeSynth(slotId) {
        const synthData = this.synths.get(slotId);
        if (synthData) {
            synthData.synth.dispose();
            this.synths.delete(slotId);
        }

        const channel = this.channels.get(slotId);
        if (channel) {
            channel.dispose();
            this.channels.delete(slotId);
        }
    }

    /**
     * Dispose all synths
     */
    disposeAll() {
        for (const slotId of this.synths.keys()) {
            this.disposeSynth(slotId);
        }
    }

    /**
     * Mute a slot (Phase 2 feature, but set up the infrastructure)
     */
    muteSlot(slotId, muted) {
        const channel = this.channels.get(slotId);
        if (channel) {
            channel.mute = muted;
        }
    }

    /**
     * Solo a slot (mute all others)
     */
    soloSlot(slotId, solo) {
        const channel = this.channels.get(slotId);
        if (channel) {
            channel.solo = solo;
        }
    }

    /**
     * Set slot volume (in dB)
     */
    setSlotVolume(slotId, volumeDb) {
        const channel = this.channels.get(slotId);
        if (channel) {
            channel.volume.value = volumeDb;
        }
    }
}

// Global instance
const audioEngine = new AudioEngine();

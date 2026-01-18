/**
 * AudioEngine - Web Audio API wrapper for wrenchbox
 * Phase 1: Synthesized sounds (oscillators + noise)
 *
 * Learning goals:
 * - AudioContext lifecycle
 * - Oscillator types (sine, triangle, square, sawtooth)
 * - Noise generation with buffers
 * - Gain nodes for volume control
 * - Biquad filters for shaping sound
 */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.activeSources = new Map(); // slotId -> { source, gain, type }
    }

    /**
     * Initialize audio context (must be called after user interaction)
     */
    init() {
        if (this.ctx) return;

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.8;

        console.log('[AudioEngine] Initialized, sample rate:', this.ctx.sampleRate);
    }

    /**
     * Get current audio time (for scheduling)
     */
    get currentTime() {
        return this.ctx ? this.ctx.currentTime : 0;
    }

    /**
     * Create a noise buffer for percussion
     */
    createNoiseBuffer(duration = 0.5) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        return buffer;
    }

    /**
     * Play a kick drum sound
     * Technique: Sine wave with rapid pitch drop
     */
    playKick(time = this.currentTime) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(55, time + 0.1);

        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.3);

        return { osc, gain };
    }

    /**
     * Play a snare drum sound
     * Technique: Filtered white noise burst
     */
    playSnare(time = this.currentTime) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.2);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 3000;
        filter.Q.value = 1;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(time);
        noise.stop(time + 0.15);

        return { noise, gain };
    }

    /**
     * Play a hi-hat sound
     * Technique: High-passed white noise, very short
     */
    playHiHat(time = this.currentTime) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.1);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(time);
        noise.stop(time + 0.08);

        return { noise, gain };
    }

    /**
     * Play a bass note
     * Technique: Triangle wave for warm, round tone
     */
    playBass(frequency, time = this.currentTime, duration = 0.3) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(frequency, time);

        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + duration);

        return { osc, gain };
    }

    /**
     * Play a lead note
     * Technique: Square wave for bright, cutting tone
     */
    playLead(frequency, time = this.currentTime, duration = 0.3) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(frequency, time);

        // Lower volume for square wave (harsh)
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + duration);

        return { osc, gain };
    }

    /**
     * Start a continuous sound for a slot (Phase 1: drums only)
     * Returns control object for later manipulation
     */
    startContinuousNoise(type, slotId) {
        if (this.activeSources.has(slotId)) {
            this.stopSlot(slotId);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(2);
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        if (type === 'hihat') {
            filter.type = 'highpass';
            filter.frequency.value = 5000;
        } else {
            filter.type = 'bandpass';
            filter.frequency.value = 10000;
        }

        const gain = this.ctx.createGain();
        gain.gain.value = 0; // Start silent, sequencer triggers hits

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();

        this.activeSources.set(slotId, { source: noise, gain, type });
        return { noise, gain };
    }

    /**
     * Stop a slot's sound
     */
    stopSlot(slotId) {
        const active = this.activeSources.get(slotId);
        if (active) {
            try {
                active.source.stop();
            } catch (e) {
                // Already stopped
            }
            this.activeSources.delete(slotId);
        }
    }

    /**
     * Stop all sounds
     */
    stopAll() {
        for (const slotId of this.activeSources.keys()) {
            this.stopSlot(slotId);
        }
    }

    /**
     * Check if a slot is active
     */
    isSlotActive(slotId) {
        return this.activeSources.has(slotId);
    }
}

// Global instance
const audioEngine = new AudioEngine();

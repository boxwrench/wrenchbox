# **Architectural Specification and Design Strategy for "Wrenchbox": A Web-Based Interactive Music Engine**

## **1\. Introduction: The Interactive Audio Paradigm**

The development of "Wrenchbox," an open-source music creation engine, situates itself at the intersection of interactive media, digital signal processing (DSP), and emergent ludology. Inspired by the loop-layering mechanics of *Incredibox*, the collection dynamics of *My Singing Monsters*, and the harmonic enforcement of *DropMix*, Wrenchbox aims to democratize musical composition through a web-based interface. A distinct differentiator for this project is the integration of a "horror mode" transformation mechanic, influenced by the viral *Sprunki* phenomenon, which subverts the traditional "happy" aesthetics of music games with dissonance and visual corruption.

Building a robust audio engine in the browser presents unique challenges compared to native application development. The Web Audio API provides powerful primitives for synthesis and sample playback, but it operates within the constraints of the JavaScript event loop, which is single-threaded and susceptible to latency drift. Consequently, the architecture of Wrenchbox cannot rely on standard timing functions; it requires a rigorous lookahead scheduling system to ensure sample-accurate synchronization. Furthermore, the game design must balance the user's creative freedom with harmonic constraints to ensure that every combination of loops results in a pleasing auditory experience—a concept known as "safe" or "constraint-based" creativity.

This report provides an exhaustive analysis of the technical, design, and legal frameworks required to realize Wrenchbox. It explores the implementation of high-precision audio clocks, the mathematics of corruption algorithms for the horror mode, and the data structures necessary to support a vibrant modding community. By synthesizing research from existing engines, DSP literature, and community-driven modding resources, this document serves as a comprehensive roadmap for the development of a scalable, performant, and legally compliant web music engine.

## ---

**2\. Audio Engine Architecture: Precision in a Latency-Prone Environment**

The core of Wrenchbox is its audio engine. Unlike a standard media player that streams a single file, an interactive music engine must layer multiple, synchronized loops (stems) that start, stop, and switch states with millisecond precision. The primary technical hurdle in a browser environment is the discrepancy between the JavaScript execution clock and the hardware audio subsystem clock.

### **2.1 The Timing Problem: JavaScript vs. Hardware Clocks**

A fundamental misunderstanding in web audio development is the reliance on JavaScript’s standard timing functions, such as setTimeout or setInterval, for musical sequencing. These functions operate on the main browser thread, which handles everything from DOM manipulation to garbage collection. If the main thread is blocked—for instance, by a complex layout recalculation or a heavy calculation—the callback for a setInterval loop will be delayed. In a musical context, a delay of even 20 milliseconds is perceptible as a "flam" or a broken rhythm, destroying the user's sense of groove.1

The Web Audio API exposes a separate time coordinate system, accessed via AudioContext.currentTime. This property represents the time of the underlying hardware audio subsystem (the audio card's clock), which advances independently of the main JavaScript thread. It is a high-precision, monotonically increasing floating-point number representing seconds. To achieve sample-accurate playback, Wrenchbox must schedule audio events against this hardware clock rather than the visual clock.2

#### **2.1.1 Lookahead Scheduling Architecture**

The industry-standard solution to this timing problem is the "Lookahead Scheduling" pattern, often referred to as "A Tale of Two Clocks".4 This architecture uses a requestAnimationFrame loop (or setInterval in a Web Worker) to frequently wake up and inspect the schedule.

1. **The Lookahead Loop:** The system wakes up at a regular interval (e.g., every 25ms).  
2. **The Scheduling Window:** It looks ahead into the future (e.g., 100ms) to see if any musical events (note onsets, loop restarts) are due to occur within that window.  
3. **Scheduling Events:** If an event falls within the window, the engine schedules it immediately using AudioBufferSourceNode.start(time). This pushes the command to the audio thread's queue.

This decoupling ensures that even if the main thread (and thus the visual UI) stutters or lags for a few frames, the audio instructions have already been queued in the audio subsystem's buffer, guaranteeing glitch-free playback. The precise value of the lookahead determines the system's resilience: a longer lookahead provides more safety against main-thread blocking but increases the latency between a user's interaction (clicking a mute button) and the audible result.3

| Parameter | Recommended Value | Description |
| :---- | :---- | :---- |
| **Lookahead Interval** | 25ms | Frequency at which the scheduler function runs. Tied to requestAnimationFrame generally results in \~16ms (60Hz) or \~8ms (120Hz). |
| **Schedule Ahead Time** | 100ms | The buffer of time into the future that the scheduler manages. Balancing this is key to responsiveness vs. stability. |
| **Audio Context Latency** | Hardware Dependent | The baseLatency of the AudioContext varies by OS (e.g., 0ms on Firefox, variable on Chrome/Android). |

### **2.2 Buffer Management and Polyphony**

Wrenchbox, like *Incredibox*, relies heavily on pre-recorded loops rather than real-time synthesis. This shifts the bottleneck from CPU processing (DSP) to Memory (RAM) management.

#### **2.2.1 AudioBufferSourceNode**

The primary primitive for playback is the AudioBufferSourceNode. This node holds audio data in memory (AudioBuffer) and is highly optimized for short-to-medium length sounds. When a user activates a character, the engine creates a new AudioBufferSourceNode, connects it to the mixer graph, and schedules it to start at the next musical quantization point (next bar or beat).5

It is crucial to note that AudioBufferSourceNode is a "fire-and-forget" object. Once it has finished playing, it cannot be restarted. To loop a sound, one sets source.loop \= true. To stop and restart, one must destroy the old node and instantiate a new one. This pattern is computationally inexpensive in modern browsers, but the referenced AudioBuffer (the actual PCM data) must be cached and reused to prevent massive memory spikes.6

#### **2.2.2 Mobile Memory Constraints**

Research into iOS Safari reveals strict memory limitations for the web process. Historically, tabs consuming more than \~300-400MB of RAM are terminated by the OS.7 A typical *Incredibox* version might have 20 characters, each with 2-3 states (Normal, Horror, transition), totaling 60+ audio files. If these are loaded as uncompressed stereo PCM WAVs (1411 kbps), the memory footprint can easily exceed mobile limits.

**Design Implication:** Wrenchbox must implement a robust asset loading strategy:

* **Compression:** Assets should be transmitted as AAC (m4a) or MP3 to save bandwidth.  
* **Decoding:** The AudioContext.decodeAudioData() method converts these to Linear PCM for playback.  
* **Lazy Loading:** To support the "Horror Mode," assets should ideally be loaded only when the transformation is imminent or triggered, rather than holding two full sets of audio (Normal \+ Horror) in memory simultaneously on low-end devices.

### **2.3 Pitch Shifting and Time Stretching**

A critical feature for music engines is the ability to match the key and tempo of different user-generated samples, similar to *DropMix*.

#### **2.3.1 PlaybackRate vs. Phase Vocoding**

The Web Audio API provides a native playbackRate property on source nodes.

* **Behavior:** Setting playbackRate to 0.5 slows the audio by 50% *and* lowers the pitch by one octave. This behavior mimics a physical tape or vinyl record.4  
* **Limitations:** This effectively links pitch and tempo. It is impossible to change one without the other using only playbackRate.

To achieve independent pitch shifting (changing key without changing speed) or time stretching (changing speed without changing key), a **Phase Vocoder** algorithm is required. While libraries like PhaseVocoder.js exist 10, pure JavaScript implementations of FFT-based time stretching often suffer from "phasiness" (a metallic, smeared sound) and transient smearing, particularly on rhythmic material like drums.11 High-quality time stretching, such as the Zplane Elastique algorithm used in DAWs, is generally proprietary and too heavy for a client-side web game.12

Recommendation for MVP:  
For the initial release of Wrenchbox, avoiding real-time pitch shifting is advisable. Instead, the engine should enforce a standardized BPM (e.g., 120 or 140\) and Root Key (e.g., C Minor) for all assets within a specific "Version" or "Mod." This ensures high-fidelity audio without the artifacts of client-side stretching.13 The playbackRate property should be reserved for special effects, such as the "Tape Stop" effect often used in horror transitions.

### **2.4 Stem Separation (The "Fuser" Mechanic)**

To emulate the functionality of *Fuser*, where users can extract specific instrument groups (stems) from a mixed song, Wrenchbox requires source separation technology.

#### **2.4.1 Client-Side vs. Server-Side Separation**

Recent advancements in WebAssembly (WASM) have enabled machine learning models to run in the browser. Libraries like **Transformers.js** and **ONNX Runtime Web** can theoretically run models like Demucs or Spleeter client-side.14

However, benchmarks indicate that running a high-quality separation model (like Demucs v4) in the browser is extremely resource-intensive. It requires downloading model weights (often hundreds of megabytes) and can take significant processing time, blocking the UI thread or draining battery on mobile devices.16

Architectural Decision:  
Stem separation should be treated as an offline preprocessing step.

1. **Upload:** The user uploads a song to the Wrenchbox toolset.  
2. **Processing:** A server-side worker (using Python/PyTorch) or a dedicated desktop companion app processes the file using Demucs to generate four stems: Vocals, Drums, Bass, and Other.  
3. Integration: These stems are then saved as distinct assets within the mod structure.  
   This approach preserves the runtime performance of the web game while delivering the creative flexibility of stem mixing.18

## ---

**3\. Game Design Patterns: Affordances and Constraints**

The success of *Incredibox* and *DropMix* lies not in their complexity, but in their carefully curated constraints. They are designed as "instruments for non-musicians," employing negative constraints to prevent the user from making a "mistake."

### **3.1 The Constraint System: Harmonic Safety**

To answer the user's question regarding "how to make combinations sound good," the answer lies in strict harmonic enforcement.

* **Key Uniformity:** All loops in a Wrenchbox version must be in the same key or relative keys (e.g., C Major and A Minor). This guarantees that no matter which combination of bass, melody, and choir is active, they will be consonant.19  
* **The Camelot Wheel:** For more advanced implementations allowing key changes (like *DropMix*), the engine can utilize the Camelot Wheel system. This maps musical keys to a clock face; moving one step clockwise or counter-clockwise represents a harmonically compatible key change (a perfect fifth). The engine can restrict users to selecting assets only from adjacent keys.13

### **3.2 Loop Quantization and Synchronization**

In *Incredibox*, dragging a character onto a slot does not trigger the sound instantly. Instead, the character performs an "entry animation," and the sound unmutes exactly at the start of the next musical bar.

The "Next Bar" Logic:  
Wrenchbox must track the global transport position.

* *Global Loop Length:* Typically 4 or 8 bars.  
* *Quantization Grid:* If the transport is at measure 1.3 (Beat 3 of Bar 1), and a user activates a slot, the engine queues the sound to start at measure 2.1 (Beat 1 of Bar 2).  
* *Asset Design:* To support this, all audio loops must be trimmed to exact musical lengths. A loop that is 4 bars long must be exactly 4 bars worth of samples at the target sample rate. Any silence at the beginning of the file will disrupt the groove.3

### **3.3 Affordances and Feedback Loops**

User Interface (UI) feedback is critical for connecting the visual action to the auditory result.

* **Visualizers:** Each active slot should feature a real-time visualizer. This can be achieved using the Web Audio AnalyserNode. By analyzing the Fast Fourier Transform (FFT) data or simple amplitude (RMS), the engine can drive visual parameters—such as the mouth opening of a character or the pulsing of a sprite—synced to the audio.20  
* **Mute/Solo Groups:** Following the *Incredibox* pattern, users need rapid control over the mix. Long-pressing a character should "Solo" them (muting all others), creating a moment of discovery where the user can hear the intricate details of a specific stem. Releasing the hold returns the mix to its previous state. This "momentary" interaction pattern is a powerful affordance for live performance.21

## ---

**4\. Horror and Transformation Mechanics**

The "Sprunki" mod demonstrates the viral potential of subverting the "cute" aesthetic of music games with sudden, jarring horror. Wrenchbox aims to systematize this transformation.

### **4.1 The Corruption Logic**

While *Sprunki* often uses a binary switch (equipping a specific item transforms the whole stage), Wrenchbox can implement a more dynamic **Progressive Corruption** system based on infectious disease modeling.

#### **4.1.1 Cellular Automata and SIR Models**

The corruption can spread across the grid slots (e.g., a 1x7 row or a 2x5 grid) using a simplified SIR (Susceptible, Infected, Recovered) model or Cellular Automata rules.22

* **Grid Topology:** Each slot has neighbors (left and right).  
* **Infection Algorithm:**  
  * Let $S\_i$ be the state of Slot $i$ (0 \= Normal, 1 \= Corrupted).  
  * If $S\_i$ is Corrupted, there is a probability $P$ (Spread Rate) that neighbors $S\_{i-1}$ and $S\_{i+1}$ will become corrupted in the next Tick (time unit).  
  * This turns the arrangement of characters into a strategic puzzle. Placing a "Patient Zero" (the source of corruption) in the center of the choir will infect the group faster than placing them at the edge.24

### **4.2 Audio Horror Techniques (DSP)**

The transformation from "Normal" to "Horror" requires distinct audio processing techniques to induce unease. The Web Audio API allows for real-time DSP effects graph manipulation.

| Technique | Description | Web Audio Implementation |
| :---- | :---- | :---- |
| **Bitcrushing** | Reduces sample rate and bit depth, creating metallic, jagged distortion. | Use an AudioWorklet or ScriptProcessor to sample-and-hold the signal. Formula: output\[i\] \= input\[i \- (i % reduction)\]. |
| **Ring Modulation** | Multiplies the input signal with a high-frequency carrier wave (oscillator). | Connect Source $\\to$ GainNode. Connect OscillatorNode (Sine, \~30Hz) $\\to$ GainNode.gain. Result is inharmonic sidebands ("Dalek" voice).25 |
| **Tape Warble** | Simulates an unstable analog tape motor, causing pitch drift. | Connect a Low Frequency Oscillator (LFO, \~0.5Hz) to the detune parameter of the AudioBufferSourceNode.4 |
| **Non-Linear Distortion** | Adds harmonics and "grit" by clipping the waveform. | Use WaveShaperNode with a sigmoid curve function to soft-clip or hard-clip the signal.26 |

Trigger Design:  
Upon corruption, the engine should execute a crossfade (e.g., 500ms) between the Normal loop and the Horror loop if they are distinct assets. If the horror mode uses the same assets but processed, the engine dynamically patches the BitCrusher or RingModulator nodes into the signal chain of the corrupted slot.25

### **4.3 Visual Glitch Mechanics**

Visual horror in a web context can be achieved through:

* **CSS Filters:** Applying filter: invert(100%) contrast(300%) to the character container. Syncing hue-rotate to the kick drum frequency creates a disorienting, strobing effect.27  
* **Sprite Swapping:** The engine swaps the src of the character's image from /assets/normal/char1.png to /assets/horror/char1.png. This is the standard method used in *Sprunki*.21  
* **WebGL Shaders:** For advanced users, employing Three.js to map the character sprites to a plane and applying a "Glitch Shader" (fragment shader that displaces UV coordinates randomly) provides a more visceral, "digital rot" aesthetic.29

## ---

**5\. Technical Implementation: Frameworks and Performance**

### **5.1 Framework Selection: Tone.js vs. Vanilla Web Audio**

A critical decision for the "MVP audio engine" question is the choice of abstraction level.

| Feature | Vanilla Web Audio API | Tone.js |
| :---- | :---- | :---- |
| **Scheduling** | Requires manual requestAnimationFrame and lookahead logic. High complexity. | Built-in Transport handles precise timing, BPM, and quantization. |
| **Abstraction** | Low-level nodes (GainNode, OscillatorNode). | High-level instruments (Synth, Player) and Effects (BitCrusher, Reverb). |
| **File Size** | Zero overhead (Built into browser). | \~10KB \- 30KB (Gzipped). |
| **Browser Compat.** | Requires handling vendor prefixes and quirks manually. | Abstracts away cross-browser inconsistencies (Safari quirks). |

Recommendation:  
For Wrenchbox, Tone.js is the superior choice. It abstracts the complex "Lookahead Scheduling" logic into a robust Transport system, allowing developers to focus on game logic rather than clock synchronization. It also provides pre-built effects (BitCrusher, PitchShift) essential for the horror mode, which would otherwise need to be written from scratch as AudioWorklets.30

### **5.2 State Management and The "Clicking" Problem**

A common issue in digital audio is the "click" or "pop" heard when audio starts or stops instantly. This occurs because the waveform is cut at a non-zero amplitude, creating a discontinuity.

The Solution: Micro-Fades (Envelopes)  
Wrenchbox must never stop audio instantly. Instead, it should apply a rapid envelope.

* **Code Pattern:**  
  JavaScript  
  // Stop with fade out  
  const now \= context.currentTime;  
  gainNode.gain.cancelScheduledValues(now);  
  gainNode.gain.setValueAtTime(gainNode.gain.value, now);  
  gainNode.gain.exponentialRampToValueAtTime(0.001, now \+ 0.05); // 50ms fade  
  source.stop(now \+ 0.05);

This ensures a smooth transition to silence, eliminating artifacts.32

### **5.3 Mobile Specifics: The "Tap" and Latency**

Mobile browsers (iOS and Android) implement an "Autoplay Policy." The AudioContext begins in a suspended state and can only be resumed inside a synchronous user interaction event (click or tap).

* **The "Start" Overlay:** Wrenchbox must launch with a "Click to Start" overlay. The click handler for this overlay must execute Tone.start() or context.resume(). This "unlocks" the audio engine for the remainder of the session.27  
* **Android Latency:** Android Chrome has historically suffered from high output latency (sometimes 100ms+). While this has improved, it creates a "sluggish" feeling for real-time tapping (finger drumming). Wrenchbox's loop-based design is advantageous here; since users are triggering *loops* that quantize to the *next bar*, the perceived latency is masked by the quantization window. The user taps, an animation plays immediately (visual feedback), and the sound joins perfectly on the beat (audio feedback).33

## ---

**6\. Modding & Data-Driven Design**

To support a community ecosystem, Wrenchbox must be data-driven, allowing users to create "Mods" (new characters, sounds, and graphics) without touching the core codebase.

### **6.1 Reverse Engineering the Incredibox Format**

Analysis of Incredibox mod structures reveals a specific hierarchy 21:

* **app.xml / app.json:** The manifest file. It defines the tempo (BPM), the total loop length, and lists the character IDs.  
* **anime directory:** Contains sprite sheets (.png) and coordinate descriptors (often XML or JSON) for animation frames.  
* **sound directory:** Contains the audio loops.  
* **asset-v1:** A versioning folder that allows multiple iterations of a mod to coexist.

### **6.2 Proposed Wrenchbox JSON Schema**

Wrenchbox should standardize this into a strict JSON schema. The schema must support the "Horror" polymorphism, where a single slot definition contains data for both its normal and corrupted states.

JSON

{  
  "meta": {  
    "name": "Wrenchbox Horror Vol. 1",  
    "bpm": 120,  
    "loopLengthSeconds": 8.0,  
    "baseKey": "C Minor",  
    "version": "1.0.0"  
  },  
  "corruption": {  
    "triggerItemId": "cursed\_hat",  
    "spreadAlgorithm": "neighbor\_infection",  
    "spreadRate": 0.5,  
    "globalEffectChain": \["bitcrusher", "reverb"\]  
  },  
  "slots": \[  
    {  
      "id": "beat\_1",  
      "type": "percussion",  
      "name": "Kicker",  
      "assets": {  
        "normal": {  
          "sound": "sounds/beat1\_clean.mp3",  
          "icon": "img/icon\_beat1.png",  
          "animation": "anim/beat1\_idle.json"  
        },  
        "horror": {  
          "sound": "sounds/beat1\_distorted.mp3",  
          "icon": "img/icon\_beat1\_evil.png",  
          "animation": "anim/beat1\_glitch.json",  
          "audioEffects": \["ringModulator"\]   
        }  
      }  
    }  
  \]  
}

### **6.3 Tooling and Distribution**

* **Sprite Packing:** To optimize performance, individual frames of character animation should be packed into "Texture Atlases" using tools like **TexturePacker**. This significantly reduces the number of HTTP requests and GPU draw calls required to render the choir.34  
* **Hot Reloading:** The development environment should support "Hot Reloading" of this JSON file. If a modder updates the spreadRate in the JSON, the game engine should reflect this immediately without requiring a page refresh, facilitating rapid iteration.

## ---

**7\. Legal and Ethical Considerations**

The development of a platform that encourages "remix culture" and "horror mods" necessitates a careful legal strategy.

### **7.1 The "Mascot Horror" Trap and Content Safety**

The *Sprunki* mod faced removal from platforms like Scratch and Cocrea due to violations of "Age Appropriate" guidelines.35 "Mascot Horror"—the juxtaposition of child-friendly aesthetics with gore or psychological horror—creates a high risk of exposing children to traumatic content.

**Ethical Mandate:** Wrenchbox must implement a strict **Content Warning (CW)** system.

* **Age Gating:** Mods tagged with "Horror" or "Gore" should require an affirmative click-through age gate.  
* **Photosensitivity:** Glitch visual effects often involve high-frequency flashing. A "Reduce Motion / No Flashing" accessibility toggle is mandatory to prevent seizures in photosensitive users.

### **7.2 Music Licensing and Copyright**

* **Derivative Works:** Analyzing or separating copyrighted music (e.g., using Demucs to strip vocals from a commercial track) creates a derivative work. While users may do this privately, *hosting* these stems on a Wrenchbox server constitutes copyright infringement.  
* **UGC Liability:** The platform must define clear Terms of Service (ToS) indemnifying the host from User Generated Content (UGC). Implementing a DMCA takedown workflow is essential if the platform hosts user mods.38  
* **Asset Hygiene:** To avoid the legal fate of many *Incredibox* fan games, Wrenchbox must not distribute *any* assets ripped from the original *Incredibox* game. All default assets provided with the engine must be original or CC0 (Public Domain).

## ---

**8\. Adjacent Inspirations**

Wrenchbox draws from a lineage of interactive music systems that prioritize "play" over "production."

* **Electroplankton (Nintendo DS):** This title pioneered the "instrument as toy" concept. It demonstrated that visual feedback (plankton moving) could directly represent audio parameters (pitch/pan), a concept Wrenchbox adopts for its visualizers.40  
* **Rez / Child of Eden:** These games utilize "quantized sound effects." When a player shoots an enemy, the explosion sound doesn't play instantly; it is quantized to the nearest 16th note. Wrenchbox applies this same logic to its "mute/unmute" interactions.40  
* **Björk’s Biophilia:** This app-album explored the educational potential of interactive music. Wrenchbox can similarly serve as an educational tool for explaining musical structure (rhythm vs. melody) and mixing concepts (frequency masking).

## ---

**9\. Conclusion**

Wrenchbox represents a sophisticated engineering challenge that creates a simplified user experience. By leveraging the Web Audio API's precise timing mechanisms through Tone.js, adopting a constraint-based game design philosophy, and structuring data for extensibility, it is possible to build a robust, browser-based music engine. The integration of "Horror Mode" offers a unique narrative hook, transforming the engine from a mere instrument into a vehicle for storytelling.

However, success relies on strict adherence to performance budgets—particularly regarding memory on mobile devices—and a proactive approach to content moderation and copyright safety. The roadmap defined herein prioritizes a stable, harmonically safe MVP, with advanced features like AI stem separation reserved for offline preprocessing, ensuring a seamless and responsive experience for the end user.

# ---

**Specific Answers to User Questions**

1\. MVP audio engine?  
The MVP should utilize Tone.js. It creates a wrapper around the Web Audio API that solves the critical "clock drift" issue inherent in JavaScript. The core components are Tone.Transport (for global timing/BPM) and Tone.Player (for managing sample playback). This allows the developer to focus on game logic (triggering sounds on beat) rather than low-level audio graph scheduling.  
2\. How to make combinations sound good?  
The solution is Harmonic Constraint, not real-time processing. Enforce that all submitted assets for a specific "Mod" or "Level" share the same Root Key (e.g., C Minor) and BPM (e.g., 120). By restricting the pool of available sounds to a single scale, it becomes mathematically impossible for the user to create a dissonant or "wrong" combination. Use the Camelot Wheel logic if allowing key changes.  
**3\. Effective web horror techniques?**

* **Audio:** Use **Ring Modulation** (multiplying the audio signal by a \~30Hz sine wave) to create robotic/metallic textures. Use **Bitcrushing** (reducing sample rate) to degrade audio quality.  
* **Visual:** Use CSS filters like hue-rotate and invert that are bound to the audio amplitude, causing the visuals to pulse and distort in sync with the distorted audio.

4\. Corruption spread math?  
Use a Cellular Automata algorithm on the character grid.

* *Rule:* If a slot is "Corrupted," check its immediate neighbors (Left/Right).  
* *Probability:* Apply a contagion probability (e.g., $P \= 0.5$ per tick).  
* *Evolution:* Over time, the corruption "grows" outward from the source, creating a dynamic puzzle where the user must isolate corrupted characters to save the choir.

5\. Successful mod system traits?  
A successful system requires Decoupling. The game engine should be a generic "player" that consumes a JSON configuration file. It should not have hard-coded character names or paths. Supporting "Hot Reloading" (drag-and-drop JSON updates) is crucial for modder velocity.  
6\. Web Audio real-time pitch shifting?  
For an MVP, avoid high-quality polyphonic pitch shifting in the browser. It is computationally expensive and prone to artifacts ("phasiness"). Use playbackRate for "Tape Stop" effects (which slow down and pitch down simultaneously), but rely on pre-processed samples for musical key changes.  
7\. Data-driven audio structure?  
Adopt a schema that defines a Slot object containing polymorphic states:

JSON

"slot\_01": {  
  "normal": { "src": "beat.mp3", "anim": "beat.json" },  
  "horror": { "src": "beat\_distorted.mp3", "anim": "beat\_glitch.json" }  
}

This allows the engine to seamlessly switch between states by referencing the parent object.

**8\. Balancing freedom vs guidance?**

* **Guidance:** Use strict categorization (colors/icons) for Beat, Melody, Chorus, and Voice to teach users about arrangement structure. Prevent users from activating 5 basslines at once (frequency masking) by enforcing "Mute Groups."  
* **Freedom:** Allow the "Horror Trigger" to be a user-controlled narrative choice, letting them break the harmonic rules intentionally to create chaos.

## ---

**10\. Sources**

* 2  
  web.dev: Web Audio API Intro (Scheduling)  
* 4  
  MDN: Advanced Web Audio Techniques (Lookahead)  
* 1  
  StackOverflow: Web Audio Timing Precision  
* 3  
  Catarak: Web Audio Timing Tutorial  
* 40  
  YouTube: Incredibox Audio Engine Reverse Engineering  
* 28  
  Reddit: Sprunki Horror Mechanics  
* 30  
  Tone.js Documentation  
* 25  
  BBC R\&D: Ring Modulation in Web Audio  
* 32  
  StackOverflow: Preventing Audio Glitches (Envelopes)  
* 19  
  MixedInKey: Harmonic Mixing Guide  
* 13  
  Digital DJ Tips: Keymixing Guide  
* 21  
  Fandom: Incredibox Modding File Structure  
* 4  
  MDN: Audio Buffer Source Node  
* 18  
  EngineDJ: Stem Separation Architecture  
* 5  
  MDN: AudioBufferSourceNode  
* 7  
  StackOverflow: iOS Safari Memory Limits  
* 34  
  MelonJS: TexturePacker Guide  
* 14  
  YouTube: Transformers.js and WebGPU  
* 15  
  ONNX Runtime: Web Assembly Inference  
* 21  
  Incredibox Modding Wiki: File Structures  
* 22  
  PMC: Cellular Automata for Epidemic Spreading

#### **Works cited**

1. Web Audio Api precise looping in different browsers \- Stack Overflow, accessed January 18, 2026, [https://stackoverflow.com/questions/54683770/web-audio-api-precise-looping-in-different-browsers](https://stackoverflow.com/questions/54683770/web-audio-api-precise-looping-in-different-browsers)  
2. Getting started with Web Audio API | Articles \- web.dev, accessed January 18, 2026, [https://web.dev/articles/webaudio-intro](https://web.dev/articles/webaudio-intro)  
3. Web Audio Timing Tutorial \- Ear to the Bits, accessed January 18, 2026, [https://catarak.github.io/blog/2014/12/02/web-audio-timing-tutorial/](https://catarak.github.io/blog/2014/12/02/web-audio-timing-tutorial/)  
4. Advanced techniques: Creating and sequencing audio \- Web APIs | MDN, accessed January 18, 2026, [https://developer.mozilla.org/en-US/docs/Web/API/Web\_Audio\_API/Advanced\_techniques](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques)  
5. AudioBufferSourceNode \- Web APIs | MDN, accessed January 18, 2026, [https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode)  
6. Web Audio API \- MDN Web Docs \- Mozilla, accessed January 18, 2026, [https://developer.mozilla.org/en-US/docs/Web/API/Web\_Audio\_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)  
7. How much the memory limitation is on the iOS device browser? \- Stack Overflow, accessed January 18, 2026, [https://stackoverflow.com/questions/74506298/how-much-the-memory-limitation-is-on-the-ios-device-browser](https://stackoverflow.com/questions/74506298/how-much-the-memory-limitation-is-on-the-ios-device-browser)  
8. Surprisingly big memory footprint on Safari against Chromium \- Babylon.js Forum, accessed January 18, 2026, [https://forum.babylonjs.com/t/surprisingly-big-memory-footprint-on-safari-against-chromium/39130](https://forum.babylonjs.com/t/surprisingly-big-memory-footprint-on-safari-against-chromium/39130)  
9. Web audio playbackRate explained \- Media \- MDN Web Docs \- Mozilla, accessed January 18, 2026, [https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio\_and\_video\_delivery/WebAudio\_playbackRate\_explained](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_delivery/WebAudio_playbackRate_explained)  
10. echo66/PhaseVocoderJS \- GitHub, accessed January 18, 2026, [https://github.com/echo66/PhaseVocoderJS](https://github.com/echo66/PhaseVocoderJS)  
11. Time Stretching & Pitch Shifting with the Web Audio API: Where are we at?, accessed January 18, 2026, [https://repository.gatech.edu/bitstreams/f4b1290d-061f-45ab-8016-dfa8240b024e/download](https://repository.gatech.edu/bitstreams/f4b1290d-061f-45ab-8016-dfa8240b024e/download)  
12. Top DAWs and Their Time‑Stretch Algorithms (2025) | Wide Blue Sound, accessed January 18, 2026, [https://www.widebluesound.com/blog/top-daws-and-their-time%E2%80%91stretch-algorithms-2025/](https://www.widebluesound.com/blog/top-daws-and-their-time%E2%80%91stretch-algorithms-2025/)  
13. The Ultimate Guide To Keymixing For DJs \- Digital DJ Tips, accessed January 18, 2026, [https://www.digitaldjtips.com/the-ultimate-guide-to-keymixing-for-djs/](https://www.digitaldjtips.com/the-ultimate-guide-to-keymixing-for-djs/)  
14. Transformers.js: State-of-the-art Machine Learning for the web \- YouTube, accessed January 18, 2026, [https://www.youtube.com/watch?v=n18Lrbo8VU8](https://www.youtube.com/watch?v=n18Lrbo8VU8)  
15. How to add machine learning to your web application with ONNX Runtime, accessed January 18, 2026, [https://onnxruntime.ai/docs/tutorials/web/](https://onnxruntime.ai/docs/tutorials/web/)  
16. Just open-sourced a 100% local AI stem splitter (Demucs \+ MDX-Net) – no uploads, unlimited, actually sounds good : r/edmproduction \- Reddit, accessed January 18, 2026, [https://www.reddit.com/r/edmproduction/comments/1pb6n3n/just\_opensourced\_a\_100\_local\_ai\_stem\_splitter/](https://www.reddit.com/r/edmproduction/comments/1pb6n3n/just_opensourced_a_100_local_ai_stem_splitter/)  
17. Self-hostable web app for isolating the vocal, accompaniment, bass, and drums of any song. Supports Spleeter, Demucs, BS-RoFormer. Built with React and Django. \- GitHub, accessed January 18, 2026, [https://github.com/JeffreyCA/spleeter-web](https://github.com/JeffreyCA/spleeter-web)  
18. MacOS user new to engine DJ stem separation and solution, accessed January 18, 2026, [https://community.enginedj.com/t/macos-user-new-to-engine-dj-stem-separation-and-solution/66301](https://community.enginedj.com/t/macos-user-new-to-engine-dj-stem-separation-and-solution/66301)  
19. Harmonic Mixing Guide \- Mixed In Key, accessed January 18, 2026, [https://mixedinkey.com/harmonic-mixing-guide/](https://mixedinkey.com/harmonic-mixing-guide/)  
20. JavaScript Audio Visualizer | Real-Time Music Beat Effects with HTML5 & Canvas, accessed January 18, 2026, [https://www.youtube.com/watch?v=OTJFI4\_qDxE](https://www.youtube.com/watch?v=OTJFI4_qDxE)  
21. A guide on how to edit... | Incredibox Wiki \- Fandom, accessed January 18, 2026, [https://incredibox.fandom.com/wiki/User\_blog:Wisp3Abyss/Guide\_to\_how\_I\_edit...](https://incredibox.fandom.com/wiki/User_blog:Wisp3Abyss/Guide_to_how_I_edit...)  
22. Modeling epidemics using cellular automata \- PMC \- PubMed Central, accessed January 18, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC7127728/](https://pmc.ncbi.nlm.nih.gov/articles/PMC7127728/)  
23. maxbrenner-ai/epidemic\_cellular\_automation: An epidemic simulation based on cellular automation for modeling different safety policies' effectiveness for COVID-19 spread prevention \- GitHub, accessed January 18, 2026, [https://github.com/maxbrenner-ai/epidemic\_cellular\_automation](https://github.com/maxbrenner-ai/epidemic_cellular_automation)  
24. Spatial Partition \- Game Programming Patterns, accessed January 18, 2026, [https://gameprogrammingpatterns.com/spatial-partition.html](https://gameprogrammingpatterns.com/spatial-partition.html)  
25. webaudio.prototyping.bbc.co.uk/src/ring-modulator.coffee at master · bbc/webaudio ... \- GitHub, accessed January 18, 2026, [https://github.com/bbc/webaudio.prototyping.bbc.co.uk/blob/master/src/ring-modulator.coffee](https://github.com/bbc/webaudio.prototyping.bbc.co.uk/blob/master/src/ring-modulator.coffee)  
26. Designing distortion effects using Javascript and the Web Audio API | by Alexander Leon, accessed January 18, 2026, [https://alexanderleon.medium.com/web-audio-series-part-2-designing-distortion-using-javascript-and-the-web-audio-api-446301565541](https://alexanderleon.medium.com/web-audio-series-part-2-designing-distortion-using-javascript-and-the-web-audio-api-446301565541)  
27. Audio for Web games \- Game development \- MDN Web Docs, accessed January 18, 2026, [https://developer.mozilla.org/en-US/docs/Games/Techniques/Audio\_for\_Web\_Games](https://developer.mozilla.org/en-US/docs/Games/Techniques/Audio_for_Web_Games)  
28. Let's talk about Sprunki (Incredibox mod), and how it unexpectedly became the next big mascot horror game. : r/mascothorror \- Reddit, accessed January 18, 2026, [https://www.reddit.com/r/mascothorror/comments/1gjw9r5/lets\_talk\_about\_sprunki\_incredibox\_mod\_and\_how\_it/](https://www.reddit.com/r/mascothorror/comments/1gjw9r5/lets_talk_about_sprunki_incredibox_mod_and_how_it/)  
29. HRD-gl Experimental Audioreactive Custom Shader Three.js powered Drawing App., accessed January 18, 2026, [https://discourse.threejs.org/t/hrd-gl-experimental-audioreactive-custom-shader-three-js-powered-drawing-app/87827](https://discourse.threejs.org/t/hrd-gl-experimental-audioreactive-custom-shader-three-js-powered-drawing-app/87827)  
30. Tone.js, accessed January 18, 2026, [https://tonejs.github.io/](https://tonejs.github.io/)  
31. Tone.js and the Web Audio API \- DEV Community, accessed January 18, 2026, [https://dev.to/snelson723/tonejs-and-the-web-audio-api-36cj](https://dev.to/snelson723/tonejs-and-the-web-audio-api-36cj)  
32. Web audio api "clicks" "crackles" "pops" & distortion noise elimination. Can I do any more?, accessed January 18, 2026, [https://stackoverflow.com/questions/71460284/web-audio-api-clicks-crackles-pops-distortion-noise-elimination-can-i-d](https://stackoverflow.com/questions/71460284/web-audio-api-clicks-crackles-pops-distortion-noise-elimination-can-i-d)  
33. WebAudio high latency on Android \[40103372\] \- Chromium Issue, accessed January 18, 2026, [https://issues.chromium.org/40103372](https://issues.chromium.org/40103372)  
34. How to use Texture Atlas with TexturePacker · melonjs/melonJS Wiki \- GitHub, accessed January 18, 2026, [https://github.com/melonjs/melonjs/wiki/How-to-use-Texture-Atlas-with-TexturePacker](https://github.com/melonjs/melonjs/wiki/How-to-use-Texture-Atlas-with-TexturePacker)  
35. so something happened \- Parasprunki Fanon Wiki, accessed January 18, 2026, [https://parasprunki-fanon.fandom.com/f/p/4400000000000073428](https://parasprunki-fanon.fandom.com/f/p/4400000000000073428)  
36. Bad News I Have To Tell You All \- itch.io, accessed January 18, 2026, [https://itch.io/blog/950179/bad-news-i-have-to-tell-you-all](https://itch.io/blog/950179/bad-news-i-have-to-tell-you-all)  
37. Sprunki | Safety Guide | eSafety Commissioner, accessed January 18, 2026, [https://www.esafety.gov.au/key-topics/esafety-guide/sprunki](https://www.esafety.gov.au/key-topics/esafety-guide/sprunki)  
38. Music Licensing for Video Games: The Essential 2025 Guide \- \- ThatPitch, accessed January 18, 2026, [https://thatpitch.com/blog/music-licensing-for-video-games/](https://thatpitch.com/blog/music-licensing-for-video-games/)  
39. User-Generated Content \- CopyrightUser |, accessed January 18, 2026, [https://www.copyrightuser.org/understand/user-generated-content/](https://www.copyrightuser.org/understand/user-generated-content/)  
40. Incredibox v8 \- Organ sound "Behind the Scenes" \- YouTube, accessed January 18, 2026, [https://www.youtube.com/watch?v=c0L9aqK10aI](https://www.youtube.com/watch?v=c0L9aqK10aI)
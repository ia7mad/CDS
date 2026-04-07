// src/utils/sensory.js

// Initialize a single global AudioContext lazily to comply with browser autoplay policies
let audioCtx = null;

if (typeof window !== 'undefined') {
  window.sensoryInit = () => { getContext(); };
}

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Programmatic Web Audio Synthesizer
 */
const synth = {
  playTone: (freq, type, duration, vol) => {
    try {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore errors (e.g., user hasn't interacted with document yet)
    }
  },

  pickup: () => {
    // Soft wooden pop
    synth.playTone(400, 'sine', 0.05, 0.2);
    setTimeout(() => synth.playTone(600, 'triangle', 0.05, 0.1), 20);
  },

  drop: () => {
    // Soft click
    synth.playTone(300, 'sine', 0.08, 0.1);
  },

  correct: () => {
    // Pleasant ascending chime
    synth.playTone(523.25, 'sine', 0.15, 0.15); // C5
    setTimeout(() => synth.playTone(659.25, 'sine', 0.15, 0.15), 100); // E5
    setTimeout(() => synth.playTone(783.99, 'sine', 0.4, 0.2), 200);   // G5
  },

  wrong: () => {
    // Dull flat buzz
    synth.playTone(150, 'sawtooth', 0.2, 0.1);
    setTimeout(() => synth.playTone(130, 'square', 0.3, 0.15), 150);
  }
};

/**
 * Haptic Vibration Engine
 */
const haptics = {
  vibrate: (pattern) => {
    try {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(pattern);
      }
    } catch (e) {
      // Ignore errors (iOS Safari often blocks this or it fails silently)
    }
  },
  
  pickup: () => haptics.vibrate(15),           // Light tap
  correct: () => haptics.vibrate(30),          // Solid affirmative thump
  wrong: () => haptics.vibrate([40, 50, 40])   // Stutter double-buzz
};

export const sensoryEngine = {
  init: () => {
    getContext(); // Eagerly boot up the AudioContext on first user click
  },
  playPickup: () => {
    synth.pickup();
    haptics.pickup();
  },
  playDrop: () => {
    synth.drop();
  },
  playCorrect: () => {
    synth.correct();
    haptics.correct();
  },
  playWrong: () => {
    synth.wrong();
    haptics.wrong();
  }
};

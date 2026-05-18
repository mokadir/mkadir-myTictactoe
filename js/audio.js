/* ============================================================
   NEON TIC TAC TOE — AUDIO MODULE
   Web Audio API sound effects for mark placement & game over
   No external files required — all sounds are synthesized
   ============================================================ */

/**
 * AudioManager — encapsulates all sound effect generation
 * using the Web Audio API. Sounds are created procedurally
 * so no external audio files are needed.
 */
class AudioManager {
  constructor() {
    /** @type {AudioContext|null} */
    this.ctx = null;
  }

  /**
   * Lazily initialises the AudioContext.
   * Must be called from a user gesture (click/touch) due to
   * browser autoplay policies.
   * @returns {AudioContext}
   */
  _getContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Plays a short "pop" sound when a mark is placed on the board.
   * Produces a pleasant, arpeggiated tone.
   */
  playMark() {
    const ctx = this._getContext();
    const now = ctx.currentTime;

    // Create gain envelope for smooth attack/release
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    // Oscillator: short bright tone (square-like via detune)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.15);
    osc.connect(gainNode);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Plays a winning fanfare when a player wins.
   * Ascending arpeggio with a triumphant character.
   */
  playWin() {
    const ctx = this._getContext();
    const now = ctx.currentTime;

    // Three ascending notes
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const start = now + i * 0.15;
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      gainNode.gain.setValueAtTime(0.25, start);
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      osc.connect(gainNode);
      osc.start(start);
      osc.stop(start + 0.35);
    });

    // Sparkle effect (high-frequency noise-like)
    for (let i = 0; i < 5; i++) {
      const start = now + 0.2 + i * 0.08;
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      gainNode.gain.setValueAtTime(0.12, start);
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + i * 300, start);
      osc.connect(gainNode);
      osc.start(start);
      osc.stop(start + 0.15);
    }
  }

  /**
   * Plays a draw/game-over sound.
   * A gentle descending tone to signal the end of the game.
   */
  playDraw() {
    const ctx = this._getContext();
    const now = ctx.currentTime;

    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.5);
    osc.connect(gainNode);
    osc.start(now);
    osc.stop(now + 0.6);
  }
}

// Export a singleton instance for use across the application
const audio = new AudioManager();
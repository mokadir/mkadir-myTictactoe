/* ============================================================
   NEON TIC TAC TOE — GAME LOGIC MODULE
   Pure game state management, win detection, and score tracking.
   No DOM manipulation — kept separate for modularity.
   ============================================================ */

/**
 * Game class — manages all game state and logic.
 * Handles turns, win/draw detection, and score keeping.
 */
class Game {
  /**
   * Winning line combinations (indices into the board array).
   * @type {number[][]}
   */
  static WIN_LINES = [
    [0, 1, 2], // top row
    [3, 4, 5], // middle row
    [6, 7, 8], // bottom row
    [0, 3, 6], // left column
    [1, 4, 7], // middle column
    [2, 5, 8], // right column
    [0, 4, 8], // diagonal top-left → bottom-right
    [2, 4, 6], // diagonal top-right → bottom-left
  ];

  constructor() {
    this.reset();
  }

  /**
   * Resets the board and current turn, but preserves scores.
   * Call this to start a new round.
   */
  reset() {
    /** @type {string[]} Board state: '' = empty, 'X' or 'O' */
    this.board = Array(9).fill('');
    /** @type {'X'|'O'} Current player turn */
    this.currentPlayer = 'X';
    /** @type {'playing'|'won'|'draw'} Game status */
    this.status = 'playing';
    /** @type {number[]|null} Winning line indices (if status === 'won') */
    this.winningLine = null;
  }

  /**
   * Resets everything including scores.
   */
  resetAll() {
    this.reset();
    this.scores = { X: 0, O: 0, draw: 0 };
  }

  /**
   * Initialises (or resets) scores.
   */
  resetScores() {
    this.scores = { X: 0, O: 0, draw: 0 };
  }

  /**
   * Attempts to place the current player's mark at the given cell index.
   *
   * @param {number} index - Cell index (0–8)
   * @returns {{ success: boolean, result?: 'win'|'draw'|'continue' }}
   *   - success: false if cell is occupied or game is over
   *   - result:  outcome after the move (if success is true)
   */
  makeMove(index) {
    // Guard: invalid index, cell occupied, or game already over
    if (index < 0 || index > 8 || this.board[index] !== '' || this.status !== 'playing') {
      return { success: false };
    }

    // Place the mark
    this.board[index] = this.currentPlayer;

    // Check for a win
    const winLine = this._checkWin(this.currentPlayer);
    if (winLine) {
      this.status = 'won';
      this.winningLine = winLine;
      this.scores[this.currentPlayer]++;
      return { success: true, result: 'win' };
    }

    // Check for a draw (board full with no winner)
    if (this.board.every((cell) => cell !== '')) {
      this.status = 'draw';
      this.scores.draw++;
      return { success: true, result: 'draw' };
    }

    // Switch turns
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    return { success: true, result: 'continue' };
  }

  /**
   * Checks whether the specified player has won.
   *
   * @param {'X'|'O'} player
   * @returns {number[]|null} Array of indices forming the winning line, or null
   */
  _checkWin(player) {
    for (const line of Game.WIN_LINES) {
      const [a, b, c] = line;
      if (this.board[a] === player && this.board[b] === player && this.board[c] === player) {
        return line;
      }
    }
    return null;
  }
}

// Export a singleton instance for use across the application
const game = new Game();
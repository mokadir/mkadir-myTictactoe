/* ============================================================
   NEON TIC TAC TOE — APPLICATION MODULE
   UI rendering, event handling, and coordination between
   game logic (game.js) and audio (audio.js).
   ============================================================ */

/* ---------- DOM References ---------- */

/** @type {HTMLElement} Game board container */
const boardEl = document.getElementById('board');

/** @type {HTMLElement} Turn indicator badge */
const turnBadge = document.getElementById('turnBadge');

/** @type {HTMLElement} Score displays */
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreDrawEl = document.getElementById('scoreDraw');

/** @type {HTMLElement} Buttons */
const btnRestart = document.getElementById('btnRestart');
const btnResetScores = document.getElementById('btnResetScores');
const btnPlayAgain = document.getElementById('btnPlayAgain');

/** @type {HTMLElement} Game over overlay */
const overlay = document.getElementById('gameOverOverlay');
const overlayIcon = document.getElementById('overlayIcon');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');

/** @type {NodeListOf<HTMLElement>} All board cells (populated after creation) */
let cells = [];

/* ---------- Board Initialisation ---------- */

/**
 * Creates the 9 cell elements and appends them to the board container.
 * Each cell gets a data-index attribute for easy lookup.
 */
function createBoard() {
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.setAttribute('role', 'button');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', `Cell ${i + 1}`);
    boardEl.appendChild(cell);
  }
  cells = boardEl.querySelectorAll('.cell');
}

/* ---------- UI Rendering ---------- */

/**
 * Updates the visual state of all cells to match the game board.
 */
function renderBoard() {
  cells.forEach((cell, i) => {
    const mark = game.board[i];

    // Clear previous mark classes and text
    cell.classList.remove('mark-x', 'mark-o', 'taken', 'win-highlight');
    cell.textContent = '';

    if (mark === 'X') {
      cell.textContent = 'X';
      cell.classList.add('mark-x', 'taken');
    } else if (mark === 'O') {
      cell.textContent = 'O';
      cell.classList.add('mark-o', 'taken');
    }
  });

  // Highlight winning cells if the game was won
  if (game.status === 'won' && game.winningLine) {
    game.winningLine.forEach((index) => {
      cells[index].classList.add('win-highlight');
    });
  }
}

/**
 * Updates the turn badge to show the current player.
 */
function updateTurnIndicator() {
  turnBadge.textContent = game.currentPlayer;
  turnBadge.className = 'turn-badge';
  if (game.currentPlayer === 'X') {
    turnBadge.classList.add('turn-x');
  } else {
    turnBadge.classList.add('turn-o');
  }

  // Force reflow to restart animation
  void turnBadge.offsetWidth;
  turnBadge.style.animation = 'none';
  void turnBadge.offsetWidth;
  turnBadge.style.animation = '';
}

/**
 * Updates all score display elements.
 */
function updateScores() {
  scoreXEl.textContent = game.scores.X;
  scoreOEl.textContent = game.scores.O;
  scoreDrawEl.textContent = game.scores.draw;
}

/**
 * Enables or disables click/keyboard interaction on cells.
 * @param {boolean} disabled - Whether cells should be disabled
 */
function setCellsDisabled(disabled) {
  cells.forEach((cell) => {
    cell.classList.toggle('disabled', disabled);
  });
}

/* ---------- Game Over Overlay ---------- */

/**
 * Shows the game-over overlay with appropriate messaging.
 * @param {'win'|'draw'} result
 */
function showOverlay(result) {
  if (result === 'win') {
    const winner = game.currentPlayer; // currentPlayer is the one who just won
    overlayIcon.textContent = '🏆';
    overlayTitle.textContent = 'Game Over';
    overlayMessage.textContent = `${winner} Wins!`;
    overlayMessage.className = `overlay-message win-${winner.toLowerCase()}`;
  } else {
    overlayIcon.textContent = '🤝';
    overlayTitle.textContent = 'Draw';
    overlayMessage.textContent = "It's a Tie!";
    overlayMessage.className = 'overlay-message draw';
  }

  overlay.classList.remove('hidden');
}

/**
 * Hides the game-over overlay.
 */
function hideOverlay() {
  overlay.classList.add('hidden');
}

/* ---------- Game Flow ---------- */

/**
 * Handles a player clicking (or keyboard-triggering) a cell.
 * @param {number} index - The cell index (0–8)
 */
function handleCellClick(index) {
  const result = game.makeMove(index);
  if (!result.success) return;

  // Update the UI
  renderBoard();
  updateScores();

  // Play sound based on result
  if (result.result === 'win') {
    audio.playWin();
    setCellsDisabled(true);
    showOverlay('win');
  } else if (result.result === 'draw') {
    audio.playDraw();
    setCellsDisabled(true);
    showOverlay('draw');
  } else {
    audio.playMark();
    updateTurnIndicator();
  }
}

/**
 * Resets the board for a new round while keeping scores.
 */
function startNewGame() {
  game.reset();
  hideOverlay();
  renderBoard();
  updateTurnIndicator();
  setCellsDisabled(false);
}

/**
 * Resets everything: board, scores, and overlay.
 */
function resetAllScores() {
  game.resetScores();
  startNewGame();
}

/* ---------- Event Binding ---------- */

/**
 * Attaches all event listeners for the game.
 */
function bindEvents() {
  // Board cell clicks (event delegation)
  boardEl.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell || cell.classList.contains('taken') || cell.classList.contains('disabled')) return;
    handleCellClick(parseInt(cell.dataset.index, 10));
  });

  // Keyboard support for cells (Enter / Space)
  boardEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const cell = e.target.closest('.cell');
      if (!cell || cell.classList.contains('taken') || cell.classList.contains('disabled')) return;
      e.preventDefault();
      handleCellClick(parseInt(cell.dataset.index, 10));
    }
  });

  // New Game button
  btnRestart.addEventListener('click', startNewGame);

  // Reset Scores button
  btnResetScores.addEventListener('click', () => {
    resetAllScores();
  });

  // Play Again button (inside overlay)
  btnPlayAgain.addEventListener('click', startNewGame);
}

/* ---------- Initialisation ---------- */

/**
 * Initialises the entire application.
 */
function init() {
  createBoard();
  startNewGame();
  bindEvents();
}

// Start the app once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
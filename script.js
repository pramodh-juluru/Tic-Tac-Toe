/**
 * Tic-Tac-Toe Master
 * Logic, AI with Minimax, Web Audio FX, Canvas Confetti, and LocalStorage
 */

(() => {
  'use strict';

  // --- Winning Combinations ---
  const WINNING_COMBOS = [
    [0, 1, 2], // Row 1
    [3, 4, 5], // Row 2
    [6, 7, 8], // Row 3
    [0, 3, 6], // Col 1
    [1, 4, 7], // Col 2
    [2, 5, 8], // Col 3
    [0, 4, 8], // Diagonal 1
    [2, 4, 6]  // Diagonal 2
  ];

  // --- State Variables ---
  let board = Array(9).fill('');
  let currentPlayer = 'X';
  let gameActive = true;
  let gameMode = 'ai'; // 'ai' | 'pvp'
  const humanPlayer = 'X';
  const aiPlayer = 'O';
  let aiDifficulty = 'hard'; // 'easy' | 'hard'
  let soundEnabled = true;
  let isAiThinking = false;
  let winningCombo = null;

  // Saved Scores
  const defaultScores = { x: 0, o: 0, ties: 0 };
  let scores = { ...defaultScores };

  // --- DOM Elements ---
  const boardEl = document.getElementById('board');
  const boardWrapperEl = document.querySelector('.board-wrapper');
  const cells = document.querySelectorAll('.cell');
  const strikeLineEl = document.getElementById('strikeLine');
  const statusMessageEl = document.getElementById('statusMessage');
  const turnDotEl = document.getElementById('turnDot');
  const pvpModeBtn = document.getElementById('pvpModeBtn');
  const aiModeBtn = document.getElementById('aiModeBtn');
  const aiDifficultyContainer = document.getElementById('aiDifficultyContainer');
  const difficultySelect = document.getElementById('difficultySelect');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIconOn = document.getElementById('soundIconOn');
  const soundIconOff = document.getElementById('soundIconOff');
  const restartBtn = document.getElementById('restartBtn');
  const resetScoreBtn = document.getElementById('resetScoreBtn');
  
  const scoreXEl = document.getElementById('scoreX');
  const scoreOEl = document.getElementById('scoreO');
  const scoreTiesEl = document.getElementById('scoreTies');
  const scoreCardX = document.getElementById('scoreCardX');
  const scoreCardO = document.getElementById('scoreCardO');
  const labelPlayerX = document.getElementById('labelPlayerX');
  const labelPlayerO = document.getElementById('labelPlayerO');

  const gameModal = document.getElementById('gameModal');
  const modalBadge = document.getElementById('modalBadge');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const modalPlayAgainBtn = document.getElementById('modalPlayAgainBtn');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  const confettiCanvas = document.getElementById('confettiCanvas');
  const confettiCtx = confettiCanvas.getContext('2d');

  // --- Sound Synthesizer (Web Audio API) ---
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.12, gainLevel = 0.15) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(gainLevel, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio context might fail silently if disabled or unsupported
    }
  }

  function playMoveSound(player) {
    if (player === 'X') {
      playTone(523.25, 'triangle', 0.12, 0.18); // C5 note
    } else {
      playTone(659.25, 'triangle', 0.12, 0.18); // E5 note
    }
  }

  function playWinSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          playTone(freq, 'sine', 0.22, 0.2);
        }, idx * 120);
      });
    } catch {}
  }

  function playTieSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      playTone(350, 'sawtooth', 0.15, 0.12);
      setTimeout(() => playTone(260, 'sawtooth', 0.25, 0.12), 140);
    } catch {}
  }

  function playClickSound() {
    playTone(800, 'sine', 0.05, 0.08);
  }

  // --- Confetti Particle System ---
  let confettiParticles = [];
  let confettiAnimFrame = null;

  function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfettiCanvas);
  resizeConfettiCanvas();

  function triggerConfetti() {
    confettiParticles = [];
    const colors = ['#00f2fe', '#ff3366', '#fbbf24', '#ffffff', '#a855f7'];
    const count = 90;

    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.45,
        w: Math.random() * 8 + 5,
        h: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.8) * 16,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: Math.random() * 0.008 + 0.006
      });
    }

    if (confettiAnimFrame) cancelAnimationFrame(confettiAnimFrame);
    animateConfetti();
  }

  function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let activeParticles = 0;

    for (const p of confettiParticles) {
      if (p.opacity > 0) {
        activeParticles++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98; // air resistance
        p.rotation += p.rotSpeed;
        p.opacity -= p.decay;

        confettiCtx.save();
        confettiCtx.globalAlpha = Math.max(0, p.opacity);
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        confettiCtx.restore();
      }
    }

    if (activeParticles > 0) {
      confettiAnimFrame = requestAnimationFrame(animateConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  // --- LocalStorage Storage ---
  function loadStoredSettings() {
    try {
      const savedScores = localStorage.getItem('ttt_master_scores');
      if (savedScores) scores = JSON.parse(savedScores);

      const savedSound = localStorage.getItem('ttt_master_sound');
      if (savedSound !== null) {
        soundEnabled = savedSound === 'true';
        updateSoundUI();
      }
    } catch {
      scores = { ...defaultScores };
    }
    updateScoreUI();
  }

  function saveScores() {
    try {
      localStorage.setItem('ttt_master_scores', JSON.stringify(scores));
    } catch {}
  }

  function saveSoundPref() {
    try {
      localStorage.setItem('ttt_master_sound', soundEnabled.toString());
    } catch {}
  }

  // --- UI Update Helpers ---
  function updateScoreUI() {
    scoreXEl.textContent = scores.x;
    scoreOEl.textContent = scores.o;
    scoreTiesEl.textContent = scores.ties;
  }

  function updateSoundUI() {
    if (soundEnabled) {
      soundIconOn.classList.remove('hidden');
      soundIconOff.classList.add('hidden');
      soundToggleBtn.classList.remove('muted');
    } else {
      soundIconOn.classList.add('hidden');
      soundIconOff.classList.remove('hidden');
      soundToggleBtn.classList.add('muted');
    }
  }

  function updateTurnUI() {
    boardEl.classList.remove('turn-x', 'turn-o');

    if (isAiThinking) {
      boardEl.classList.add('thinking');
      statusMessageEl.textContent = 'AI is thinking...';
      turnDotEl.classList.add('turn-o');
      scoreCardO.classList.add('active-turn');
      scoreCardX.classList.remove('active-turn');
      return;
    }

    boardEl.classList.remove('thinking');
    boardEl.classList.add(currentPlayer === 'X' ? 'turn-x' : 'turn-o');

    if (gameActive) {
      if (currentPlayer === 'X') {
        statusMessageEl.textContent = gameMode === 'ai' ? 'Your Turn (X)' : "Player X's Turn";
        turnDotEl.classList.remove('turn-o');
        scoreCardX.classList.add('active-turn');
        scoreCardO.classList.remove('active-turn');
      } else {
        statusMessageEl.textContent = gameMode === 'ai' ? "AI's Turn (O)" : "Player O's Turn";
        turnDotEl.classList.add('turn-o');
        scoreCardO.classList.add('active-turn');
        scoreCardX.classList.remove('active-turn');
      }
    } else {
      scoreCardX.classList.remove('active-turn');
      scoreCardO.classList.remove('active-turn');
    }
  }

  // --- Strike Line Geometry Calculation ---
  function drawStrikeLine(combo, winner) {
    if (!combo) return;
    const [idxA, , idxC] = combo;
    const cellA = cells[idxA];
    const cellC = cells[idxC];

    const rectA = cellA.getBoundingClientRect();
    const rectC = cellC.getBoundingClientRect();
    const wrapperRect = boardWrapperEl.getBoundingClientRect();

    const x1 = rectA.left + rectA.width / 2 - wrapperRect.left;
    const y1 = rectA.top + rectA.height / 2 - wrapperRect.top;
    const x2 = rectC.left + rectC.width / 2 - wrapperRect.left;
    const y2 = rectC.top + rectC.height / 2 - wrapperRect.top;

    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    strikeLineEl.style.width = `${length}px`;
    strikeLineEl.style.height = '6px';
    strikeLineEl.style.left = `${x1}px`;
    strikeLineEl.style.top = `${y1 - 3}px`;
    strikeLineEl.style.transformOrigin = '0 50%';
    strikeLineEl.style.transform = `rotate(${angle}deg)`;

    strikeLineEl.className = 'strike-line show ' + (winner === 'X' ? 'winner-x' : 'winner-o');
  }

  function hideStrikeLine() {
    strikeLineEl.className = 'strike-line';
    strikeLineEl.style.width = '0px';
    strikeLineEl.style.transform = 'none';
  }

  // Re-calculate strike line on window resize if game is finished with a winner
  window.addEventListener('resize', () => {
    if (!gameActive && winningCombo) {
      const winner = board[winningCombo[0]];
      drawStrikeLine(winningCombo, winner);
    }
  });

  // --- Game Mechanics ---
  function checkWinner(currentBoard) {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], combo };
      }
    }
    if (currentBoard.every(cell => cell !== '')) {
      return { winner: 'tie', combo: null };
    }
    return null;
  }

  // --- Move Processing & Turn Flow ---
  function handleCellClick(index) {
    if (!gameActive || isAiThinking || board[index] !== '') {
      return;
    }

    // In vs AI mode, user can only click when it's their turn
    if (gameMode === 'ai' && currentPlayer !== humanPlayer) {
      return;
    }

    executeMove(index, currentPlayer);
  }

  function executeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    cell.classList.add('taken');
    cell.setAttribute('aria-label', `Cell ${index + 1}, occupied by ${player}`);

    const markSpan = document.createElement('span');
    markSpan.className = player === 'X' ? 'mark-x' : 'mark-o';
    markSpan.textContent = player === 'X' ? '✕' : '◯';
    cell.appendChild(markSpan);

    playMoveSound(player);

    const result = checkWinner(board);
    if (result) {
      endGame(result);
      return;
    }

    // Switch Player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnUI();

    // If game mode is AI and it's now AI's turn, trigger AI move automatically!
    if (gameActive && gameMode === 'ai' && currentPlayer === aiPlayer) {
      triggerAiMove();
    }
  }

  function triggerAiMove() {
    isAiThinking = true;
    updateTurnUI();
    const thinkDelay = aiDifficulty === 'hard' ? 380 : 300;

    setTimeout(() => {
      if (!gameActive || currentPlayer !== aiPlayer) {
        isAiThinking = false;
        updateTurnUI();
        return;
      }

      let moveIndex;
      if (aiDifficulty === 'easy') {
        const emptyIndices = getEmptyIndices(board);
        if (Math.random() < 0.55 && emptyIndices.length > 0) {
          moveIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        } else {
          moveIndex = getBestMove(board, aiPlayer).index;
        }
      } else {
        moveIndex = getBestMove(board, aiPlayer).index;
      }

      isAiThinking = false;

      if (moveIndex !== undefined && moveIndex !== null && board[moveIndex] === '') {
        executeMove(moveIndex, aiPlayer);
      }
    }, thinkDelay);
  }

  function endGame(result) {
    gameActive = false;
    isAiThinking = false;
    winningCombo = result.combo;

    if (result.winner === 'tie') {
      scores.ties++;
      saveScores();
      updateScoreUI();
      statusMessageEl.textContent = "It's a Draw!";
      playTieSound();

      setTimeout(() => {
        showModal('🤝', "It's a Tie!", gameMode === 'ai' ? 'Well played! Neither you nor the AI gave an inch.' : 'Well matched! Neither player gave an inch.');
      }, 450);
    } else {
      const winner = result.winner;
      if (winner === 'X') scores.x++;
      else scores.o++;

      saveScores();
      updateScoreUI();

      // Highlight winning cells
      result.combo.forEach(idx => {
        cells[idx].classList.add('winner', winner === 'X' ? 'winner-x' : 'winner-o');
      });

      drawStrikeLine(result.combo, winner);
      playWinSound();
      triggerConfetti();

      const winnerTitle = gameMode === 'ai'
        ? (winner === humanPlayer ? 'You Won!' : 'AI Outsmarted You!')
        : `Player ${winner} Triumphs!`;

      const winnerMessage = gameMode === 'ai'
        ? (winner === humanPlayer ? 'Incredible strategy! You conquered the AI.' : 'Better luck next round! Keep practicing.')
        : `Player ${winner} connected three marks in a row!`;

      statusMessageEl.textContent = gameMode === 'ai'
        ? (winner === humanPlayer ? 'You Win the Round!' : 'AI Wins the Round!')
        : `${winner} Wins the Round!`;

      setTimeout(() => {
        showModal(winner === humanPlayer ? '🏆' : '🤖', winnerTitle, winnerMessage);
      }, 700);
    }

    updateTurnUI();
  }

  function showModal(badge, title, msg) {
    modalBadge.textContent = badge;
    modalTitle.textContent = title;
    modalMessage.textContent = msg;
    gameModal.classList.add('open');
    gameModal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    gameModal.classList.remove('open');
    gameModal.setAttribute('aria-hidden', 'true');
  }

  function resetBoard() {
    board = Array(9).fill('');
    gameActive = true;
    currentPlayer = 'X';
    isAiThinking = false;
    winningCombo = null;

    hideStrikeLine();

    cells.forEach((cell, idx) => {
      cell.textContent = '';
      cell.className = 'cell';
      cell.setAttribute('aria-label', `Cell ${idx + 1}`);
    });

    closeModal();
    updateTurnUI();

    // If AI is configured to start first, trigger AI move automatically
    if (gameMode === 'ai' && currentPlayer === aiPlayer) {
      triggerAiMove();
    }
  }

  function resetScores() {
    scores = { x: 0, o: 0, ties: 0 };
    saveScores();
    updateScoreUI();
    playClickSound();
  }

  // --- AI Implementation & Minimax Algorithm ---
  function getEmptyIndices(currBoard) {
    const empty = [];
    for (let i = 0; i < currBoard.length; i++) {
      if (currBoard[i] === '') empty.push(i);
    }
    return empty;
  }

  function getBestMove(newBoard, player) {
    const availSpots = getEmptyIndices(newBoard);
    const opponent = player === 'X' ? 'O' : 'X';

    // Fast opening: if center is available, take it
    if (availSpots.length === 9) {
      return { index: 4 };
    }
    if (availSpots.length === 8 && availSpots.includes(4)) {
      return { index: 4 };
    }

    function minimax(tempBoard, currentPl, depth, alpha = -Infinity, beta = Infinity) {
      const outcome = checkWinner(tempBoard);
      if (outcome) {
        if (outcome.winner === player) return { score: 10 - depth };
        if (outcome.winner === opponent) return { score: depth - 10 };
        if (outcome.winner === 'tie') return { score: 0 };
      }

      const emptyCells = getEmptyIndices(tempBoard);

      if (currentPl === player) {
        // Maximizing player (AI)
        let maxEval = -Infinity;
        let bestMove = null;

        for (const spot of emptyCells) {
          tempBoard[spot] = player;
          const evaluation = minimax(tempBoard, opponent, depth + 1, alpha, beta).score;
          tempBoard[spot] = '';

          if (evaluation > maxEval) {
            maxEval = evaluation;
            bestMove = spot;
          }
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) break; // Alpha-beta prune
        }
        return { score: maxEval, index: bestMove };
      } else {
        // Minimizing player (Opponent)
        let minEval = Infinity;
        let bestMove = null;

        for (const spot of emptyCells) {
          tempBoard[spot] = opponent;
          const evaluation = minimax(tempBoard, player, depth + 1, alpha, beta).score;
          tempBoard[spot] = '';

          if (evaluation < minEval) {
            minEval = evaluation;
            bestMove = spot;
          }
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) break; // Alpha-beta prune
        }
        return { score: minEval, index: bestMove };
      }
    }

    return minimax(newBoard, player, 0);
  }

  // --- Mode & Setting Handlers ---
  function setMode(mode) {
    if (gameMode === mode) return;
    gameMode = mode;
    playClickSound();

    if (mode === 'pvp') {
      pvpModeBtn.classList.add('active');
      pvpModeBtn.setAttribute('aria-checked', 'true');
      aiModeBtn.classList.remove('active');
      aiModeBtn.setAttribute('aria-checked', 'false');
      aiDifficultyContainer.classList.add('hidden');
      labelPlayerX.textContent = 'PLAYER X';
      labelPlayerO.textContent = 'PLAYER O';
    } else {
      aiModeBtn.classList.add('active');
      aiModeBtn.setAttribute('aria-checked', 'true');
      pvpModeBtn.classList.remove('active');
      pvpModeBtn.setAttribute('aria-checked', 'false');
      aiDifficultyContainer.classList.remove('hidden');
      labelPlayerX.textContent = 'YOU (X)';
      labelPlayerO.textContent = 'AI (O)';
    }

    resetBoard();
  }

  // --- Event Listeners ---
  cells.forEach(cell => {
    const index = parseInt(cell.getAttribute('data-index'), 10);
    cell.addEventListener('click', () => handleCellClick(index));
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCellClick(index);
      }
    });
  });

  pvpModeBtn.addEventListener('click', () => setMode('pvp'));
  aiModeBtn.addEventListener('click', () => setMode('ai'));

  difficultySelect.addEventListener('change', (e) => {
    aiDifficulty = e.target.value;
    playClickSound();
    resetBoard();
  });

  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    saveSoundPref();
    updateSoundUI();
    if (soundEnabled) playClickSound();
  });

  restartBtn.addEventListener('click', () => {
    playClickSound();
    resetBoard();
  });

  resetScoreBtn.addEventListener('click', resetScores);
  modalPlayAgainBtn.addEventListener('click', () => {
    playClickSound();
    resetBoard();
  });
  modalCloseBtn.addEventListener('click', () => {
    playClickSound();
    closeModal();
  });

  // Close modal when clicking backdrop
  gameModal.addEventListener('click', (e) => {
    if (e.target === gameModal) {
      closeModal();
    }
  });

  // --- Initial Launch ---
  loadStoredSettings();
  updateTurnUI();
})();

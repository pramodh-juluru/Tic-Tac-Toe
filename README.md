# 🎮 Tic-Tac-Toe Master

A modern, responsive, and aesthetic Tic-Tac-Toe game built purely with **HTML**, **CSS**, and **JavaScript** (no third-party dependencies or build steps required).

---

## ✨ Features

- **Two Game Modes**:
  - **vs AI (Active by default)**: Instantly play against the computer. Whenever you place your mark as **X**, the AI automatically and seamlessly analyzes the board and plays its move as **O** with natural timing. Selectable difficulty:
    - *Master (Unbeatable - Default)*: Implements an optimal **Minimax algorithm** with alpha-beta pruning that never loses.
    - *Casual (Easy)*: Relaxed play with casual moves.
  - **2 Players (Local PvP)**: Play locally against a friend on the same device.
- **Modern Cyberpunk / Glassmorphic UI**:
  - Dark mode aesthetic with luminous Cyan (`X`) and Rose (`O`) neon accents.
  - Tactile interactive grid with dynamic hover ghost marks previewing the current player's mark.
  - Dynamic winning strike line calculating exact angles across rows, columns, and diagonals.
- **Built-in Web Audio Sound FX**:
  - Synthesized directly through the browser's `AudioContext` (no external MP3/WAV files required).
  - Placed mark tones, victory fanfare, draw tone, and click feedback.
  - Sound mute/unmute toggle that remembers your preference.
- **Celebration Effects**:
  - Interactive full-screen Canvas confetti animation upon winning.
  - Victory modal with options to "Play Again" or "View Board".
- **Persistent Scoreboard**:
  - Tracks Player X wins, Player O wins, and Draws.
  - Saved in browser `localStorage` across page reloads.
  - "Reset Scores" button to clear score history anytime.
- **Accessibility & Responsiveness**:
  - Fully accessible keyboard navigation (`Tab`, `Enter`, `Space`).
  - Seamlessly scales across mobile phones, tablets, laptops, and ultra-wide screens.

---

## 📁 Project Structure

This project follows a minimal, clean 3-file structure:

```text
├── index.html     # Semantic HTML5 layout, ARIA attributes, and SVG icons
├── style.css      # Glassmorphic design, neon styling, keyframe animations, and layout
├── script.js      # Game state, Minimax AI, Web Audio synthesizer, and Confetti engine
└── README.md      # Documentation and run guide
```

---

## 🚀 How to Run and Play

### Option 1: Direct Browser Launch (Easiest)
1. Navigate to the project directory:
   ```
   d:\Project\Project-2
   ```
2. Double-click **`index.html`** or right-click and choose **"Open with"** -> Google Chrome, Edge, Firefox, or Safari.

### Option 2: Using Any Local Web Server
You can also preview it with any lightweight HTTP server:

- **Using Python**:
  ```bash
  python -m http.server 8000
  ```
  Then open `http://localhost:8000` in your browser.

- **Using Node / npx**:
  ```bash
  npx serve .
  ```
- **Using VS Code / IDE Live Server**:
  Right-click `index.html` and click **"Open with Live Server"**.

---

## 🕹️ Game Rules

1. The game is played on a 3x3 grid.
2. Player **X** always starts first, followed by Player **O**.
3. Players take turns placing their mark in an empty cell.
4. The first player to connect **3 of their marks** in a horizontal, vertical, or diagonal row wins the round!
5. If all 9 cells are filled and no player has 3 in a row, the match ends in a **Draw**.

---

## 🛠️ Built With

- **HTML5**
- **Vanilla CSS3**
- **Modern JavaScript (ES6+)**
- **Web Audio API**
- **HTML5 Canvas API**

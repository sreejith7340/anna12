// Heart Puzzle Game
// A 3x3 sliding tile puzzle revealing the starry night couple illustration.

import { effects } from '../effects.js';
import { romanticMusic } from '../music.js';

class HeartPuzzle {
  constructor() {
    this.gridContainer = null;
    this.resultOverlay = null;
    
    // 0 to 8: 8 is the empty slot (bottom right)
    this.board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    this.tiles = [];
    this.gameActive = false;
  }

  init() {
    const panel = document.getElementById('game-puzzle');
    this.gridContainer = panel.querySelector('.puzzle-grid');
    this.resultOverlay = panel.querySelector('.game-result-overlay');
    
    const resetBtn = panel.querySelector('.game-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.start());
    }
  }

  start() {
    this.gameActive = true;
    this.resultOverlay.classList.remove('active');
    
    this.shuffleBoard();
    this.renderBoard();
  }

  // Shuffle board and ensure it is solvable
  shuffleBoard() {
    do {
      // Shuffling algorithm
      for (let i = this.board.length - 2; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.board[i], this.board[j]] = [this.board[j], this.board[i]];
      }
    } while (!this.isSolvable() || this.isSolved());
  }

  // A 3x3 puzzle is solvable if the number of inversions is even
  isSolvable() {
    let inversions = 0;
    for (let i = 0; i < this.board.length - 1; i++) {
      for (let j = i + 1; j < this.board.length; j++) {
        // Skip empty tile (value 8)
        if (this.board[i] !== 8 && this.board[j] !== 8 && this.board[i] > this.board[j]) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  }

  isSolved() {
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i] !== i) return false;
    }
    return true;
  }

  renderBoard() {
    this.gridContainer.innerHTML = '';
    this.tiles = [];

    this.board.forEach((value, index) => {
      const tile = document.createElement('div');
      tile.className = 'puzzle-tile';
      tile.dataset.index = index;
      tile.dataset.value = value;
      
      if (value === 8) {
        // Empty tile
        tile.classList.add('empty');
      } else {
        // Calculate background slice coordinates for value (0-7)
        // 3x3 grid, each tile is 1/3 of width (100px in a 300px container)
        const row = Math.floor(value / 3);
        const col = value % 3;
        
        // Dynamic background position percentage
        const xPercent = (col / 2) * 100;
        const yPercent = (row / 2) * 100;
        
        tile.style.backgroundImage = 'url(/images/starry_night.png)';
        tile.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
      }
      
      tile.addEventListener('click', () => this.clickTile(index));
      this.gridContainer.appendChild(tile);
      this.tiles.push(tile);
    });
  }

  clickTile(index) {
    if (!this.gameActive) return;
    
    // Find where the empty tile is
    const emptyIndex = this.board.indexOf(8);
    
    // Verify adjacency (top, bottom, left, right)
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;
    
    const isAdjacent = (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1;
    
    if (isAdjacent) {
      romanticMusic.playPop();
      
      // Swap on the board array
      [this.board[index], this.board[emptyIndex]] = [this.board[emptyIndex], this.board[index]];
      
      // Re-render
      this.renderBoard();
      
      // Check win condition
      if (this.isSolved()) {
        this.winPuzzle();
      }
    }
  }

  winPuzzle() {
    this.gameActive = false;
    
    // Reveal the empty tile's part of the image for full picture display
    const emptyTile = this.gridContainer.querySelector('.puzzle-tile.empty');
    if (emptyTile) {
      emptyTile.classList.remove('empty');
      emptyTile.style.backgroundImage = 'url(/images/starry_night.png)';
      emptyTile.style.backgroundPosition = '100% 100%';
    }
    
    setTimeout(() => {
      this.resultOverlay.classList.add('active');
      effects.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2);
      effects.triggerExplosion(window.innerWidth / 3, window.innerHeight / 2);
    }, 600);
  }
}

export const heartPuzzle = new HeartPuzzle();

// Love Memory Game
// Matching pairs of romantic icons in a 4x4 grid.

import { effects } from '../effects.js';
import { romanticMusic } from '../music.js';

class MemoryGame {
  constructor() {
    this.gridContainer = null;
    this.resultOverlay = null;
    
    // 8 romantic symbols duplicated (16 cards total)
    this.symbols = ['❤️', '💖', '⭐', '💍', '🎁', '🦋', '🌸', '👑',
                    '❤️', '💖', '⭐', '💍', '🎁', '🦋', '🌸', '👑'];
    
    this.flippedCards = [];
    this.matchedCount = 0;
    this.lockGrid = false;
  }

  init() {
    this.gridContainer = document.querySelector('.memory-grid');
    const panel = document.getElementById('game-memory');
    this.resultOverlay = panel.querySelector('.game-result-overlay');
    
    const resetBtn = panel.querySelector('.game-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.start());
    }
  }

  start() {
    this.flippedCards = [];
    this.matchedCount = 0;
    this.lockGrid = false;
    this.resultOverlay.classList.remove('active');
    
    this.shuffleSymbols();
    this.buildGrid();
  }

  shuffleSymbols() {
    // Fisher-Yates shuffle
    for (let i = this.symbols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.symbols[i], this.symbols[j]] = [this.symbols[j], this.symbols[i]];
    }
  }

  buildGrid() {
    this.gridContainer.innerHTML = '';
    
    this.symbols.forEach((symbol, index) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.index = index;
      card.dataset.symbol = symbol;
      
      card.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-front">💝</div>
          <div class="memory-card-back">${symbol}</div>
        </div>
      `;
      
      card.addEventListener('click', () => this.flipCard(card));
      this.gridContainer.appendChild(card);
    });
  }

  flipCard(card) {
    if (this.lockGrid) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    romanticMusic.playPop();
    card.classList.add('flipped');
    this.flippedCards.push(card);
    
    if (this.flippedCards.length === 2) {
      this.checkMatch();
    }
  }

  checkMatch() {
    this.lockGrid = true;
    const [card1, card2] = this.flippedCards;
    
    if (card1.dataset.symbol === card2.dataset.symbol) {
      // Match found!
      setTimeout(() => {
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.matchedCount++;
        
        // Spawn sparks at the card locations
        const r1 = card1.getBoundingClientRect();
        const r2 = card2.getBoundingClientRect();
        effects.spawnSparkle(r1.left + r1.width / 2, r1.top + r1.height / 2);
        effects.spawnSparkle(r2.left + r2.width / 2, r2.top + r2.height / 2);
        
        this.flippedCards = [];
        this.lockGrid = false;
        
        if (this.matchedCount === 8) {
          this.winGame();
        }
      }, 500);
    } else {
      // No match - flip back
      setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        this.flippedCards = [];
        this.lockGrid = false;
      }, 1000);
    }
  }

  winGame() {
    setTimeout(() => {
      this.resultOverlay.classList.add('active');
      effects.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2);
    }, 600);
  }
}

export const memoryGame = new MemoryGame();

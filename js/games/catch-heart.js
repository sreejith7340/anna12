// Catch My Heart Game
// Hearts fall from the sky, player catches them using a basket.

import { effects } from '../effects.js';
import { romanticMusic } from '../music.js';

class CatchHeartGame {
  constructor() {
    this.container = null;
    this.basket = null;
    this.scoreVal = null;
    this.resultOverlay = null;
    
    this.score = 0;
    this.gameActive = false;
    this.heartInterval = null;
    this.gameLoopId = null;
    this.hearts = [];
  }

  init() {
    this.container = document.querySelector('.catch-game-container');
    this.basket = document.querySelector('.catch-basket');
    this.scoreVal = document.getElementById('catch-score-val');
    this.resultOverlay = this.container.querySelector('.game-result-overlay');
    
    // Set up control inputs
    this.container.addEventListener('mousemove', (e) => this.moveBasket(e));
    this.container.addEventListener('touchmove', (e) => this.moveBasketTouch(e), { passive: true });
    
    // Reset/start button listeners
    const resetBtn = this.container.querySelector('.game-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.start());
    }
  }

  start() {
    this.stop();
    this.score = 0;
    this.scoreVal.textContent = this.score;
    this.hearts = [];
    this.gameActive = true;
    
    // Hide win overlay
    this.resultOverlay.classList.remove('active');
    
    // Start falling hearts loop
    this.heartInterval = setInterval(() => this.spawnHeart(), 900);
    this.gameLoop();
  }

  stop() {
    this.gameActive = false;
    clearInterval(this.heartInterval);
    cancelAnimationFrame(this.gameLoopId);
    
    // Clear DOM hearts
    const oldHearts = this.container.querySelectorAll('.falling-heart');
    oldHearts.forEach(h => h.remove());
  }

  spawnHeart() {
    if (!this.gameActive) return;
    
    const heart = document.createElement('div');
    heart.className = 'falling-heart';
    heart.textContent = Math.random() < 0.2 ? '💖' : '❤️';
    
    // Random horizontal position and size
    const containerWidth = this.container.clientWidth;
    const xPos = Math.random() * (containerWidth - 30);
    const speed = Math.random() * 2 + 1.5; // fall speed pixels per frame
    const size = Math.random() * 0.4 + 0.8; // scale
    
    heart.style.left = `${xPos}px`;
    heart.style.top = `-40px`;
    heart.style.transform = `scale(${size})`;
    
    this.container.appendChild(heart);
    
    this.hearts.push({
      element: heart,
      y: -40,
      x: xPos,
      speed: speed
    });
  }

  moveBasket(e) {
    if (!this.gameActive) return;
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    this.updateBasketPosition(x);
  }

  moveBasketTouch(e) {
    if (!this.gameActive || !e.touches[0]) return;
    const rect = this.container.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    this.updateBasketPosition(x);
  }

  updateBasketPosition(x) {
    const basketWidth = this.basket.clientWidth;
    const containerWidth = this.container.clientWidth;
    
    // Constrain inside container bounds
    let leftPos = x - basketWidth / 2;
    if (leftPos < 0) leftPos = 0;
    if (leftPos > containerWidth - basketWidth) leftPos = containerWidth - basketWidth;
    
    this.basket.style.left = `${leftPos + basketWidth / 2}px`;
  }

  gameLoop() {
    if (!this.gameActive) return;
    
    const containerHeight = this.container.clientHeight;
    const basketRect = this.basket.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    
    // Basket coordinates relative to container
    const bLeft = basketRect.left - containerRect.left;
    const bRight = bLeft + basketRect.width;
    const bTop = containerHeight - 50; // basket vertical zone
    
    for (let i = this.hearts.length - 1; i >= 0; i--) {
      let h = this.hearts[i];
      h.y += h.speed;
      h.element.style.top = `${h.y}px`;
      
      // Collision detection
      if (h.y >= bTop && h.y <= bTop + 30) {
        if (h.x + 15 >= bLeft && h.x <= bRight) {
          // Heart caught!
          this.score++;
          this.scoreVal.textContent = this.score;
          h.element.remove();
          this.hearts.splice(i, 1);
          
          romanticMusic.playPop();
          effects.spawnSparkle(containerRect.left + h.x + 15, containerRect.top + h.y);
          
          if (this.score >= 10) {
            this.winGame();
          }
          continue;
        }
      }
      
      // Remove when off screen
      if (h.y > containerHeight) {
        h.element.remove();
        this.hearts.splice(i, 1);
      }
    }
    
    this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
  }

  winGame() {
    this.stop();
    this.resultOverlay.classList.add('active');
    effects.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2);
  }
}

export const catchHeartGame = new CatchHeartGame();

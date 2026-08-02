// Kiss Counter Game
// Clicking a button counts kisses and spawns floating 💋 emojis.

import { effects } from '../effects.js';
import { romanticMusic } from '../music.js';

class KissCounter {
  constructor() {
    this.container = null;
    this.btn = null;
    this.countText = null;
    this.milestoneText = null;
    
    this.count = 0;
  }

  init() {
    const panel = document.getElementById('game-kiss');
    this.container = panel.querySelector('.kiss-container');
    this.btn = panel.querySelector('.kiss-btn');
    this.countText = panel.querySelector('.kiss-count-val');
    this.milestoneText = panel.querySelector('.kiss-milestone-text');

    this.btn.addEventListener('click', (e) => this.clickKiss(e));
    
    // Reset/start button
    const resetBtn = panel.querySelector('.game-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }
  }

  start() {
    // Game is persistent, does not need a reset on show unless requested
  }

  reset() {
    this.count = 0;
    this.countText.textContent = this.count;
    this.milestoneText.textContent = '';
    this.btn.style.boxShadow = '';
  }

  clickKiss(e) {
    this.count++;
    this.countText.textContent = this.count;
    
    // Play synth sound
    romanticMusic.playPop();
    
    // Spawn floating lips element
    this.spawnFloatingKiss(e);

    // Update milestones
    this.updateMilestones();
  }

  spawnFloatingKiss(e) {
    const kiss = document.createElement('div');
    kiss.className = 'floating-kiss-icon';
    kiss.textContent = Math.random() < 0.35 ? '❤️' : '💋';
    
    // Position near the button click or center of button
    const rect = this.btn.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    
    let x = e.clientX - containerRect.left;
    let y = e.clientY - containerRect.top;
    
    // Fallback if triggered via keyboard or touch edge
    if (!x || !y) {
      x = rect.left + rect.width / 2 - containerRect.left;
      y = rect.top + rect.height / 2 - containerRect.top;
    }
    
    kiss.style.left = `${x}px`;
    kiss.style.top = `${y}px`;
    
    // Random side rotation
    const rot = Math.random() * 40 - 20;
    kiss.style.setProperty('--rot', `${rot}deg`);
    
    this.container.appendChild(kiss);
    
    // Remove from DOM after CSS animation completes
    setTimeout(() => {
      kiss.remove();
    }, 1200);
  }

  updateMilestones() {
    if (this.count === 1) {
      this.milestoneText.textContent = "First kiss! ❤️";
    } else if (this.count === 5) {
      this.milestoneText.textContent = "Muah! Sending you warm hugs! 🥰";
    } else if (this.count === 10) {
      this.milestoneText.textContent = "You're accumulating so much love! 😘";
    } else if (this.count === 15) {
      this.milestoneText.textContent = "Ettay sends infinite kisses back! 💋";
    } else if (this.count === 20) {
      this.milestoneText.textContent = "Unlimited kisses unlocked ❤️";
      this.btn.style.boxShadow = "0 0 30px var(--accent), 0 0 50px var(--accent-glow)";
      effects.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2);
    }
  }
}

export const kissCounter = new KissCounter();

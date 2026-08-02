// Romantic Interactive Effects Manager
// Handles: Sakura petals, mouse sparkles, cursor heart trails, heart explosions, and hidden love notes.

import { romanticMusic } from './music.js';

class EffectsManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.petals = [];
    this.sparkles = [];
    this.explosions = [];
    this.maxPetals = 35;
    this.mouseX = 0;
    this.mouseY = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.mouseActive = false;
    this.heartTrailDelay = 0;
    
    // Love notes quotes bank
    this.loveNotes = [
      "You are my sunshine on a rainy day! ☀️",
      "I love the way your eyes sparkle when you laugh. 😊",
      "You make my heart beat faster every single day. 💓",
      "Holding your hand is my absolute favorite place to be. 🤝",
      "I am so incredibly proud of the person you are. 🌟",
      "Thank you for being my constant, my love, and my best friend. 🌸",
      "You are the best thing that ever happened to me. 💖",
      "No matter what, I will always choose you. 🔐"
    ];
  }

  init() {
    this.canvas = document.getElementById('effect-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Track mouse coordinates
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.mouseActive = true;
      
      // Spawn cursor sparkles
      if (Math.random() < 0.4) {
        this.spawnSparkle(this.mouseX, this.mouseY);
      }
      
      // Spawn cursor hearts
      this.heartTrailDelay++;
      if (this.heartTrailDelay > 12) {
        this.spawnTrailHeart(this.mouseX, this.mouseY);
        this.heartTrailDelay = 0;
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
        this.spawnSparkle(this.mouseX, this.mouseY);
      }
    }, { passive: true });

    // Initialize Sakura Petals
    for (let i = 0; i < this.maxPetals; i++) {
      this.petals.push(this.createPetal(true));
    }

    // Set up hidden love note listeners on the document
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('hidden-love-note-trigger')) {
        this.triggerHiddenNote(e);
      }
    });

    // Start animation loop
    this.animate();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Sakura Petals Logic
  createPetal(randomY = false) {
    return {
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : -20,
      size: Math.random() * 8 + 6,
      speedY: Math.random() * 1.5 + 0.8,
      speedX: Math.random() * 1.0 - 0.5,
      oscillation: Math.random() * 0.02 + 0.01,
      oscillationSpeed: Math.random() * 0.02 + 0.01,
      angle: Math.random() * 360,
      rotationSpeed: Math.random() * 2 - 1,
      opacity: Math.random() * 0.4 + 0.4,
      color: `hsl(${340 + Math.random() * 20}, 90%, ${80 + Math.random() * 10}%)` // Pink/lavender shades
    };
  }

  updatePetals() {
    for (let i = 0; i < this.petals.length; i++) {
      let p = this.petals[i];
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.y * p.oscillation) * 0.5;
      p.angle += p.rotationSpeed;

      // Reset when falling off screen
      if (p.y > this.canvas.height + 20 || p.x < -20 || p.x > this.canvas.width + 20) {
        this.petals[i] = this.createPetal(false);
      }
    }
  }

  drawPetals() {
    for (let p of this.petals) {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.angle * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;

      // Draw stylized sakura petal
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.bezierCurveTo(-p.size, -p.size / 2, -p.size, p.size / 2, 0, p.size);
      this.ctx.bezierCurveTo(p.size, p.size / 2, p.size, -p.size / 2, 0, 0);
      this.ctx.fill();
      
      this.ctx.restore();
    }
  }

  // Mouse Sparkles
  spawnSparkle(x, y) {
    this.sparkles.push({
      x: x,
      y: y,
      size: Math.random() * 5 + 3,
      color: Math.random() < 0.5 ? '#ff6584' : '#ffd700', // Pink or gold sparkles
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 1.5 + 0.5,
      alpha: 1,
      decay: Math.random() * 0.02 + 0.015
    });
  }

  updateSparkles() {
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      let s = this.sparkles[i];
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed + 0.2; // slight gravity
      s.alpha -= s.decay;
      if (s.alpha <= 0) {
        this.sparkles.splice(i, 1);
      }
    }
  }

  drawSparkles() {
    for (let s of this.sparkles) {
      this.ctx.save();
      this.ctx.globalAlpha = s.alpha;
      this.ctx.fillStyle = s.color;
      
      // Draw a 4-point star sparkle
      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y - s.size);
      this.ctx.quadraticCurveTo(s.x, s.y, s.x + s.size, s.y);
      this.ctx.quadraticCurveTo(s.x, s.y, s.x, s.y + s.size);
      this.ctx.quadraticCurveTo(s.x, s.y, s.x - s.size, s.y);
      this.ctx.quadraticCurveTo(s.x, s.y, s.x, s.y - s.size);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  // Floating HTML cursor hearts
  spawnTrailHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'trail-heart';
    heart.innerHTML = '❤️';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    
    // Random offsets and rotations
    const rot = Math.random() * 40 - 20;
    heart.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
    
    document.body.appendChild(heart);
    
    // Remove after animation finishes (1.2s in CSS)
    setTimeout(() => {
      heart.remove();
    }, 1200);
  }

  // Big screen Heart Explosion
  triggerExplosion(x, y) {
    // Play success noise
    romanticMusic.playSuccess();

    const colors = ['#ff6584', '#ff477e', '#ffccd5', '#ffd700', '#c2b5cf'];
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 3;
      this.explosions.push({
        x: x || window.innerWidth / 2,
        y: y || window.innerHeight / 2,
        size: Math.random() * 12 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01
      });
    }
  }

  updateExplosions() {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      let e = this.explosions[i];
      e.x += e.speedX;
      e.y += e.speedY;
      e.speedY += 0.12; // Gravity
      e.alpha -= e.decay;
      if (e.alpha <= 0) {
        this.explosions.splice(i, 1);
      }
    }
  }

  drawExplosions() {
    for (let e of this.explosions) {
      this.ctx.save();
      this.ctx.globalAlpha = e.alpha;
      this.ctx.fillStyle = e.color;
      this.ctx.translate(e.x, e.y);
      
      // Draw small filled heart
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      // Left curve
      this.ctx.bezierCurveTo(-e.size / 2, -e.size / 2, -e.size, 0, 0, e.size);
      // Right curve
      this.ctx.bezierCurveTo(e.size, 0, e.size / 2, -e.size / 2, 0, 0);
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  // Hidden Love Notes Mechanism
  triggerHiddenNote(e) {
    const trigger = e.target;
    
    // Select a random love note
    const note = this.loveNotes[Math.floor(Math.random() * this.loveNotes.length)];
    
    // Spawn custom styled popup message
    this.createPopupMessage(e.clientX, e.clientY, note);
    
    // Small local burst
    this.triggerExplosion(e.clientX, e.clientY);
  }

  createPopupMessage(x, y, text) {
    const popup = document.createElement('div');
    popup.className = 'custom-alert';
    popup.innerHTML = `<i class="fas fa-heart"></i> <span>${text}</span>`;
    document.body.appendChild(popup);
    
    // Set position
    popup.style.left = `${x}px`;
    popup.style.top = `${y - 40}px`;
    popup.style.transform = `translateX(-50%) translateY(0)`;
    
    // Show and slide up
    setTimeout(() => {
      popup.classList.add('show');
    }, 10);

    // Fade out and remove
    setTimeout(() => {
      popup.classList.remove('show');
      popup.style.transform = `translateX(-50%) translateY(-30px)`;
      setTimeout(() => {
        popup.remove();
      }, 500);
    }, 3500);
  }

  // Starry theme stars generation (for dark mode starry night background)
  generateStarrySky() {
    const starContainer = document.getElementById('starry-sky');
    if (!starContainer) return;
    
    // Clear old stars
    starContainer.innerHTML = '';
    
    const count = 120;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'starry-star';
      
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      
      // Delay and duration randomized
      star.style.animationDelay = `${Math.random() * 3}s`;
      star.style.animationDuration = `${Math.random() * 3 + 2}s`;
      
      starContainer.appendChild(star);
    }
  }

  // Animation Loop
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.updatePetals();
    this.drawPetals();

    this.updateSparkles();
    this.drawSparkles();

    this.updateExplosions();
    this.drawExplosions();

    requestAnimationFrame(() => this.animate());
  }
}

export const effects = new EffectsManager();
export function triggerConfetti() {
  effects.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2);
  effects.triggerExplosion(window.innerWidth / 4, window.innerHeight / 2);
  effects.triggerExplosion(3 * window.innerWidth / 4, window.innerHeight / 2);
}

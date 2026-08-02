// Main App Coordinator
// Handles navigation routing, event binds, letters, checklists, passcode surpise, and sub-game triggers.

import { romanticMusic } from './music.js';
import { effects, triggerConfetti } from './effects.js';

// Import Mini Games
import { catchHeartGame } from './games/catch-heart.js';
import { memoryGame } from './games/memory.js';
import { loveQuiz } from './games/quiz.js';
import { kissCounter } from './games/kiss.js';
import { heartPuzzle } from './games/puzzle.js';

class App {
  constructor() {
    this.currentSection = 'home';
    this.activeGame = 'catch';
    
    // Customize your relationship anniversary date here! (YYYY-MM-DD format)
    this.anniversaryDate = new Date('2023-10-24T00:00:00');
    
    this.letterTypingInterval = null;
    this.letterOpened = false;
  }

  init() {
    // 1. Initialize Global Visual Effects
    effects.init();

    // 2. Setup Event Listeners
    this.setupNavigation();
    this.setupThemeToggle();
    this.setupMusicToggle();
    this.setupScrollProgress();
    this.setupLoveLetter();
    this.setupWhyCards();
    this.setupGalleryLightbox();
    this.setupPromisesChecklist();
    this.setupSecretSurprise();
    this.setupGameHub();
    this.setupTimelineScroll();
    
    // 3. Hide loading screen
    const loader = document.getElementById('loader');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 600);
      }, 1500);
    }
  }

  // --- SPA Navigation ---
  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
    const openHeartBtn = document.getElementById('open-heart-btn');
    const welcomeHero = document.getElementById('welcome-hero');

    // "Open My Heart" button transition
    if (openHeartBtn) {
      openHeartBtn.addEventListener('click', () => {
        // Trigger heart explosion
        effects.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2);
        
        // Start background music automatically
        romanticMusic.start();
        const musicIcon = document.querySelector('#music-toggle i');
        if (musicIcon) {
          musicIcon.className = 'fas fa-volume-up';
          musicIcon.parentElement.classList.add('pulse');
        }

        // Fade out welcome screen
        welcomeHero.classList.add('fade-out');
        
        // Navigate home
        this.navigateTo('home');
      });
    }

    // Nav list clicks
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('href').substring(1);
        this.navigateTo(targetSection);
        this.closeMobileMenu();
      });
    });

    // Mobile Hamburger Menu Trigger
    const menuToggle = document.getElementById('menu-toggle');
    const mobilePanel = document.getElementById('mobile-nav-panel');
    const mobileClose = document.getElementById('mobile-nav-close');
    const mobileBackdrop = document.getElementById('mobile-backdrop');

    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        mobilePanel.classList.add('open');
        mobileBackdrop.classList.add('open');
      });
    }

    if (mobileClose) {
      mobileClose.addEventListener('click', () => this.closeMobileMenu());
    }
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', () => this.closeMobileMenu());
    }
  }

  closeMobileMenu() {
    document.getElementById('mobile-nav-panel').classList.remove('open');
    document.getElementById('mobile-backdrop').classList.remove('open');
  }

  navigateTo(sectionId) {
    if (sectionId === this.currentSection) return;

    // Remove active styles from previous link
    document.querySelectorAll(`.nav-links a, .mobile-nav-links a`).forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('href') === `#${sectionId}`) {
        l.classList.add('active');
      }
    });

    // Transition between sections
    const prevSection = document.getElementById(`${this.currentSection}-section`);
    const nextSection = document.getElementById(`${sectionId}-section`);

    if (prevSection) {
      prevSection.style.opacity = '0';
      prevSection.style.transform = 'scale(0.97)';
      setTimeout(() => {
        prevSection.classList.remove('active');
        this.showNextSection(nextSection, sectionId);
      }, 400);
    } else {
      this.showNextSection(nextSection, sectionId);
    }
  }

  showNextSection(nextSection, sectionId) {
    if (nextSection) {
      nextSection.classList.add('active');
      // Trigger browser layout pass
      nextSection.offsetHeight; 
      nextSection.style.opacity = '1';
      nextSection.style.transform = 'scale(1)';
      
      this.currentSection = sectionId;
      window.scrollTo(0, 0);

      // Trigger section-specific scripts
      this.onSectionEnter(sectionId);
    }
  }

  onSectionEnter(sectionId) {
    // Scroll progress reset
    this.updateScrollIndicator();

    if (sectionId === 'games') {
      this.switchGame(this.activeGame);
    } else if (sectionId === 'letter') {
      // Re-trigger letter typewriter only if it was opened
      if (this.letterOpened) {
        this.typeLetter();
      }
    }
  }

  // --- Scroll Indicator & Page Progress ---
  setupScrollProgress() {
    window.addEventListener('scroll', () => this.updateScrollIndicator());
  }

  updateScrollIndicator() {
    const scrollProgress = document.getElementById('scroll-progress');
    if (!scrollProgress) return;
    const windowScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (windowScroll / height) * 100 : 0;
    scrollProgress.style.width = `${scrolled}%`;
  }

  // --- Theme Toggle (Starry Night vs Soft Pastel) ---
  setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    const starryBg = document.getElementById('starry-sky');

    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      
      const isDark = document.body.classList.contains('dark-theme');
      themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      
      if (isDark) {
        starryBg.style.display = 'block';
        effects.generateStarrySky();
      } else {
        starryBg.style.display = 'none';
      }
      
      // Explosion at button position
      const rect = themeBtn.getBoundingClientRect();
      effects.triggerExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
  }

  // --- Background Music Toggle ---
  setupMusicToggle() {
    const musicBtn = document.getElementById('music-toggle');
    const musicIcon = musicBtn.querySelector('i');

    musicBtn.addEventListener('click', () => {
      if (romanticMusic.isPlaying) {
        romanticMusic.stop();
        musicIcon.className = 'fas fa-volume-mute';
        musicBtn.classList.remove('pulse');
      } else {
        romanticMusic.start();
        musicIcon.className = 'fas fa-volume-up';
        musicBtn.classList.add('pulse');
      }
      
      // Local burst
      const rect = musicBtn.getBoundingClientRect();
      effects.triggerExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
  }



  // --- Love Letter Screen ---
  setupLoveLetter() {
    const envelope = document.getElementById('letter-envelope');
    const paper = document.getElementById('letter-paper');
    
    envelope.addEventListener('click', () => {
      envelope.style.display = 'none';
      paper.classList.add('open');
      this.letterOpened = true;
      this.typeLetter();
    });
  }

  typeLetter() {
    const textContainer = document.getElementById('letter-text');
    const signature = document.getElementById('letter-signature');
    
    clearInterval(this.letterTypingInterval);
    signature.classList.remove('show');
    textContainer.classList.add('typing');
    
    const fullText = `Dearest Kuttapii,

From the moment you came into my life, everything changed for the better. Your beautiful smile has a magical way of brightening even my darkest days, and your kindness inspires me to be a better person.

I appreciate your strength, your gentle support, and the warmth of your laugh. You give my life so much meaning, and I cherish every conversation and memory we build together. Thank you for simply being you. 

No matter where life takes us, I promise to stand beside you, support your dreams, and love you more with each passing day.`;

    textContainer.textContent = '';
    let idx = 0;
    
    this.letterTypingInterval = setInterval(() => {
      textContainer.textContent += fullText.charAt(idx);
      idx++;
      
      // Auto scroll inside letter paper if height expands on mobile
      const paperEl = document.getElementById('letter-paper');
      if (idx % 10 === 0) {
        paperEl.scrollTop = paperEl.scrollHeight;
      }

      if (idx >= fullText.length) {
        clearInterval(this.letterTypingInterval);
        textContainer.classList.remove('typing');
        signature.classList.add('show');
      }
    }, 45); // Adjust typing speed
  }

  // --- Why I Love You Cards ---
  setupWhyCards() {
    // 3D perspective flip cards
    const cards = document.querySelectorAll('.flip-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
        
        // Spawn sparks
        const rect = card.getBoundingClientRect();
        effects.spawnSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
      });
    });
  }

  // --- Gallery Lightbox ---
  setupGalleryLightbox() {
    const polaroids = document.querySelectorAll('.polaroid-card');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxCap = lightbox.querySelector('.lightbox-caption');
    const lightboxClose = lightbox.querySelector('.lightbox-close');

    polaroids.forEach(card => {
      // Add random rotation offsets to polaroids for playful aesthetic
      const rot = (Math.random() * 8 - 4).toFixed(1);
      card.style.setProperty('--rot', `${rot}deg`);

      card.addEventListener('click', () => {
        const img = card.querySelector('img');
        const caption = card.querySelector('.polaroid-caption').textContent;
        
        lightboxImg.src = img.src;
        lightboxCap.textContent = caption;
        lightbox.classList.add('open');
      });
    });

    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('open');
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('open');
      }
    });
  }

  // --- Timeline Scroll Effects ---
  setupTimelineScroll() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineProgress = document.getElementById('timeline-progress');

    const checkTimeline = () => {
      const triggerBottom = window.innerHeight * 0.85;

      timelineItems.forEach((item, idx) => {
        const itemTop = item.getBoundingClientRect().top;

        if (itemTop < triggerBottom) {
          item.classList.add('active');
          
          // Animate timeline progress line based on active items
          const progressPercent = ((idx + 1) / timelineItems.length) * 100;
          timelineProgress.style.height = `${progressPercent}%`;
        }
      });
    };

    window.addEventListener('scroll', checkTimeline);
    // Initial check in case they are already scrolled
    checkTimeline();
  }

  // --- Promises Checklist ---
  setupPromisesChecklist() {
    const items = document.querySelectorAll('.promise-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('completed');
        
        if (item.classList.contains('completed')) {
          const rect = item.getBoundingClientRect();
          effects.triggerExplosion(rect.left + 30, rect.top + 15);
        }
      });
    });
  }

  // --- Secret Surprise Page ---
  setupSecretSurprise() {
    const input = document.getElementById('passcode-input');
    const form = document.getElementById('passcode-form');
    const lockbox = document.getElementById('secret-lockbox');
    const reveal = document.getElementById('secret-revealed-container');
    const bigHeart = document.getElementById('magical-heart');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const pass = input.value.trim().toLowerCase();
      if (pass === 'kuttapii') {
        // Unlock secret surprise!
        lockbox.style.display = 'none';
        reveal.classList.add('open');
        
        // Celebrations!
        triggerConfetti();
        setInterval(triggerConfetti, 2500); // Recurring loop of sparkles
      } else {
        // Fail wobble animation
        input.value = '';
        input.placeholder = 'Wrong passcode 🥺';
        input.style.transform = 'translateX(8px)';
        setTimeout(() => input.style.transform = 'translateX(-8px)', 80);
        setTimeout(() => input.style.transform = 'translateX(0)', 160);
      }
    });

    bigHeart.addEventListener('click', (e) => {
      effects.triggerExplosion(e.clientX, e.clientY);
      romanticMusic.playSuccess();
    });
  }

  // --- Mini Games Sub Router ---
  setupGameHub() {
    const buttons = document.querySelectorAll('.game-select-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const gameId = btn.dataset.game;
        this.switchGame(gameId);
      });
    });

    // Initialize individual games DOM bindings
    catchHeartGame.init();
    memoryGame.init();
    loveQuiz.init();
    kissCounter.init();
    heartPuzzle.init();
  }

  switchGame(gameId) {
    // Terminate old game loops
    catchHeartGame.stop();
    // (memory, quiz, kiss, puzzle don't run requestAnimationFrame ticks in background when idle)

    // Swap game panels
    document.querySelectorAll('.game-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`game-${gameId}`);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    this.activeGame = gameId;

    // Start selected game
    if (gameId === 'catch') {
      catchHeartGame.start();
    } else if (gameId === 'memory') {
      memoryGame.start();
    } else if (gameId === 'quiz') {
      loveQuiz.start();
    } else if (gameId === 'kiss') {
      kissCounter.start();
    } else if (gameId === 'puzzle') {
      heartPuzzle.start();
    }
    
    // Play transition chime
    romanticMusic.playPop();
  }
}

// Instantiate and initialize app once DOM loads
window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});

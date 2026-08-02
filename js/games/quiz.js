// Love Quiz Game
// Custom romantic quiz for Anna. Correct answers trigger confetti.

import { effects } from '../effects.js';
import { romanticMusic } from '../music.js';

class LoveQuiz {
  constructor() {
    this.container = null;
    this.qText = null;
    this.optionsContainer = null;
    this.progressVal = null;
    this.progressFill = null;
    this.resultOverlay = null;

    this.currentIndex = 0;
    this.lockQuiz = false;

    this.questions = [
      {
        question: "Who is Ettay's absolute favorite person in the entire universe? 🌌",
        options: ["Someone else...", "Kuttapii! ❤️", "The neighbors"],
        correct: 1
      },
      {
        question: "What makes Ettay the happiest on any given day? ☀️",
        options: ["Winning a video game", "Eating hot pizza", "Seeing Kuttapii smile ❤️"],
        correct: 2
      },
      {
        question: "Who owns Ettay's heart completely and forever? 🔐",
        options: ["Kuttapii ❤️", "He rented it out", "No one, it's independent"],
        correct: 0
      }
    ];
  }

  init() {
    const panel = document.getElementById('game-quiz');
    this.container = panel.querySelector('.quiz-card');
    this.qText = panel.querySelector('.quiz-question');
    this.optionsContainer = panel.querySelector('.quiz-options');
    this.progressVal = panel.querySelector('.quiz-progress-val');
    this.progressFill = panel.querySelector('.quiz-progress-fill');
    this.resultOverlay = panel.querySelector('.game-result-overlay');

    const resetBtn = panel.querySelector('.game-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.start());
    }
  }

  start() {
    this.currentIndex = 0;
    this.lockQuiz = false;
    this.resultOverlay.classList.remove('active');
    this.showQuestion();
  }

  showQuestion() {
    const q = this.questions[this.currentIndex];
    
    // Update progress
    this.progressVal.textContent = `${this.currentIndex + 1}/${this.questions.length}`;
    const fillPercent = (this.currentIndex / this.questions.length) * 100;
    this.progressFill.style.width = `${fillPercent}%`;

    // Render text
    this.qText.textContent = q.question;
    
    // Clear & build options
    this.optionsContainer.innerHTML = '';
    
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => this.selectOption(idx, btn));
      this.optionsContainer.appendChild(btn);
    });
  }

  selectOption(selectedIndex, button) {
    if (this.lockQuiz) return;
    
    const q = this.questions[this.currentIndex];
    
    if (selectedIndex === q.correct) {
      // Correct!
      this.lockQuiz = true;
      button.classList.add('correct');
      
      // Play sound and explode sparkles/confetti
      romanticMusic.playSuccess();
      const rect = button.getBoundingClientRect();
      effects.triggerExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2);
      
      // Proceed to next question after brief delay
      setTimeout(() => {
        this.currentIndex++;
        this.lockQuiz = false;
        
        if (this.currentIndex >= this.questions.length) {
          this.winQuiz();
        } else {
          this.showQuestion();
        }
      }, 1200);
    } else {
      // Incorrect!
      romanticMusic.playPop();
      button.classList.add('incorrect');
      // Briefly animate shake
      button.style.transform = 'translateX(5px)';
      setTimeout(() => button.style.transform = 'translateX(-5px)', 80);
      setTimeout(() => button.style.transform = 'translateX(0)', 160);
      
      // Let them try again (do not lock)
    }
  }

  winQuiz() {
    this.progressFill.style.width = '100%';
    this.resultOverlay.classList.add('active');
    effects.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2);
    effects.triggerExplosion(window.innerWidth / 3, window.innerHeight / 3);
  }
}

export const loveQuiz = new LoveQuiz();

// Romantic Ambient Audio Controller
// Hybrid: Synthesizes pop/success sound effects offline via Web Audio,
// and streams the song "her" by JVKE in the background using YouTube's Iframe API.

class RomanticMusicController {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.ytPlayer = null;
    this.ytReady = false;
    this.ytTargetState = false; // Tracks if video should play once API is loaded

    // YouTube Video ID for JVKE - "her" (official lyric video)
    this.videoId = 'q6g4hYjNlOQ';
  }

  init() {
    // 1. Initialize Web Audio Context for game sound effects
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // 2. Initialize YouTube Player Iframe API if not loaded
    if (!window.YT) {
      // Create global callback for YT player initialization
      window.onYouTubeIframeAPIReady = () => {
        this.ytPlayer = new window.YT.Player('yt-player-iframe', {
          height: '1',
          width: '1',
          videoId: this.videoId,
          playerVars: {
            'playsinline': 1,
            'controls': 0,
            'autoplay': 0,
            'loop': 1,
            'playlist': this.videoId // Required for looping single video
          },
          events: {
            'onReady': () => {
              this.ytReady = true;
              this.ytPlayer.setVolume(50); // Set volume to a soft 50%
              if (this.ytTargetState) {
                this.ytPlayer.playVideo();
              }
            }
          }
        });
      };

      // Create hidden iframe wrapper if not in DOM
      let ytDiv = document.getElementById('yt-player-iframe');
      if (!ytDiv) {
        ytDiv = document.createElement('div');
        ytDiv.id = 'yt-player-iframe';
        // Position off-screen, opacity 0, pointer-events none
        ytDiv.style.position = 'fixed';
        ytDiv.style.top = '-100px';
        ytDiv.style.left = '-100px';
        ytDiv.style.width = '1px';
        ytDiv.style.height = '1px';
        ytDiv.style.opacity = '0';
        ytDiv.style.pointerEvents = 'none';
        document.body.appendChild(ytDiv);
      }

      // Inject YouTube Player script
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }

  // Pop chime sound effect (clicks / game taps)
  playPop() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // Pitch sweep up

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Success arpeggio chime (matching games / wins)
  playSuccess() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const now = this.ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.1, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  }

  // Play background song
  start() {
    this.init();
    this.isPlaying = true;
    this.ytTargetState = true;

    if (this.ytReady && this.ytPlayer) {
      this.ytPlayer.playVideo();
    }
  }

  // Pause background song
  stop() {
    this.isPlaying = false;
    this.ytTargetState = false;

    if (this.ytReady && this.ytPlayer) {
      this.ytPlayer.pauseVideo();
    }
  }
}

export const romanticMusic = new RomanticMusicController();

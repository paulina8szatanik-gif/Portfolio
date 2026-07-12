/* Small enhancements shared by all pages:
   1. Live Berlin clock in the navigation
   2. Halftone dot spiral in the hero (homepage only)
*/

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- 1. Berlin clock ----------------------------------------------------- */

function updateClock() {
  const el = document.querySelector('[data-clock]');
  if (!el) return;
  el.textContent = new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Berlin',
  }).format(new Date());
}
updateClock();
setInterval(updateClock, 15000);

/* --- Hide nav on scroll down, show on scroll up --------------------------- */

const nav = document.querySelector('.site-nav');
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('is-hidden', y > lastScrollY && y > 100);
  lastScrollY = y;
}, { passive: true });

/* --- 2. Dot spiral (phyllotaxis, like the original Framer component) ------ */

const spiral = document.querySelector('[data-spiral]');
if (spiral) {
  const ctx = spiral.getContext('2d');
  const SIZE = 302;
  const DOTS = 600;
  const DOT_RADIUS = 2;
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
  const dpr = window.devicePixelRatio || 1;
  spiral.width = SIZE * dpr;
  spiral.height = SIZE * dpr;
  ctx.scale(dpr, dpr);

  function draw(t) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    const maxR = SIZE / 2 - 4;
    for (let i = 0; i < DOTS; i++) {
      const frac = i / DOTS;
      const r = maxR * Math.sqrt(frac);
      const angle = i * GOLDEN_ANGLE;
      const x = SIZE / 2 + r * Math.cos(angle);
      const y = SIZE / 2 + r * Math.sin(angle);
      // Pulse opacity and scale outward over a 3s cycle
      const wave = 0.5 + 0.5 * Math.sin(t / 480 - frac * 6);
      ctx.globalAlpha = 0.3 + 0.7 * wave;
      ctx.beginPath();
      ctx.arc(x, y, DOT_RADIUS * (0.5 + wave), 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
    }
  }

  if (reducedMotion) {
    draw(0);
  } else {
    (function loop(t) {
      draw(t || 0);
      requestAnimationFrame(loop);
    })();
  }
}


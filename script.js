/* ── Cursor ───────────────────────────────────────────────────────────────── */
const cursorEl = document.createElement('div');
cursorEl.className = 'cursor';
document.body.appendChild(cursorEl);

let mx = 0, my = 0, cx = 0, cy = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

function animCursor() {
  cx += (mx - cx) * 0.14;
  cy += (my - cy) * 0.14;
  cursorEl.style.left = cx + 'px';
  cursorEl.style.top  = cy + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();

document.querySelectorAll('a,button,.build-card,.pillar').forEach(el => {
  el.addEventListener('mouseenter', () => cursorEl.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursorEl.classList.remove('hover'));
});

/* ── Reveal on Scroll ─────────────────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObs.observe(el));

/* ── Nav scroll state ─────────────────────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.background = window.scrollY > 20
    ? 'rgba(0,0,0,0.88)' : 'rgba(0,0,0,0.72)';
}, { passive: true });

/* ── Mobile menu ──────────────────────────────────────────────────────────── */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  const spans = burger.querySelectorAll('span');
  if (mobileMenu.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
    spans[1].style.transform = 'rotate(-45deg) translate(4px, -4px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  }
});
function closeMobile() {
  mobileMenu.classList.remove('open');
  burger.querySelectorAll('span').forEach(s => s.style.transform = '');
}
window.closeMobile = closeMobile;

/* ── HERO CANVAS — Particle constellation ─────────────────────────────────── */
(function() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], frame = 0;
  const COUNT = 90;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.28;
      this.vy = (Math.random() - 0.5) * 0.28;
      this.r  = Math.random() * 1.6 + 0.4;
      this.a  = Math.random() * 0.6 + 0.1;
    }
    step() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  const LINK_DIST = 130;

  function tick() {
    ctx.clearRect(0, 0, W, H);
    frame++;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.step(); p.draw();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < LINK_DIST) {
          const a = (1 - d / LINK_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,113,227,${a})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    // Subtle large circle rings
    const cx2 = W / 2, cy2 = H / 2;
    for (let ring = 0; ring < 3; ring++) {
      const r = 180 + ring * 140 + Math.sin(frame * 0.004 + ring) * 10;
      ctx.beginPath();
      ctx.arc(cx2, cy2, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,113,227,${0.04 - ring * 0.01})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    requestAnimationFrame(tick);
  }
  tick();
})();

/* ── ORB CANVAS — Central glowing orb ───────────────────────────────────── */
(function() {
  const canvas = document.getElementById('orbCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, frame = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function tick() {
    ctx.clearRect(0, 0, W, H);
    frame++;

    const cx = W / 2, cy = H / 2;
    const t = frame * 0.008;

    // Outer rings that slowly rotate and pulse
    for (let ring = 0; ring < 5; ring++) {
      const radius   = 60 + ring * 52 + Math.sin(t + ring * 0.7) * 8;
      const segments = 6 + ring * 2;
      const rotation = t * (ring % 2 === 0 ? 1 : -1) * 0.3 + ring;
      const alpha    = 0.08 - ring * 0.012;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);

      for (let s = 0; s < segments; s++) {
        const a0 = (s / segments) * Math.PI * 2;
        const a1 = a0 + (Math.PI * 2 / segments) * 0.55;
        ctx.beginPath();
        ctx.arc(0, 0, radius, a0, a1);
        ctx.strokeStyle = `rgba(0,113,227,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Central orb glow layers
    const orbR = 52 + Math.sin(t * 1.4) * 6;
    for (let g = 4; g >= 0; g--) {
      const r = orbR + g * 28;
      const a = 0.07 - g * 0.013;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,113,227,${a})`;
      ctx.fill();
    }

    // Core bright dot
    ctx.beginPath();
    ctx.arc(cx, cy, orbR * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,113,227,0.22)`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, orbR * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(100,180,255,0.6)`;
    ctx.fill();

    // Floating dots around the orb
    for (let d = 0; d < 8; d++) {
      const angle = (d / 8) * Math.PI * 2 + t * 0.4;
      const dist  = orbR + 70 + Math.sin(t * 1.2 + d) * 14;
      const dx    = cx + Math.cos(angle) * dist;
      const dy    = cy + Math.sin(angle) * dist;
      const da    = 0.35 + Math.sin(t * 2 + d) * 0.2;
      ctx.beginPath();
      ctx.arc(dx, dy, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,113,227,${da})`;
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }
  tick();
})();

/* ── CTA CANVAS — Subtle gradient waves ──────────────────────────────────── */
(function() {
  const canvas = document.getElementById('ctaCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, frame = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function tick() {
    ctx.clearRect(0, 0, W, H);
    frame++;
    const t = frame * 0.006;

    // Wave lines across the background
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      const yBase = H * (0.2 + i * 0.14);
      const amp   = 18 + i * 6;
      const speed = 0.7 + i * 0.15;
      const alpha = 0.03 + i * 0.005;

      for (let x = 0; x <= W; x += 4) {
        const y = yBase + Math.sin(x * 0.01 + t * speed + i) * amp
                        + Math.sin(x * 0.006 + t * 0.5 + i * 2) * amp * 0.5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(0,113,227,${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Large central radial glow
    const gx = document.getElementById('ctaCanvas');
    const cxC = W / 2, cyC = H * 0.5;
    for (let g = 0; g < 3; g++) {
      const r   = 200 + g * 120 + Math.sin(t + g) * 20;
      const alp = 0.05 - g * 0.014;
      ctx.beginPath();
      ctx.arc(cxC, cyC, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,113,227,${alp})`;
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }
  tick();
})();

/* ── Optional API health check (works on Vercel and vercel dev) ─────────── */
(async function checkApiHealth() {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
    const data = await response.json();
    console.info('[Qenovra] API health:', data);
  } catch (error) {
    // Direct file previews (file://) or static-only servers may not expose /api.
    console.info('[Qenovra] API endpoint not available in this runtime.');
  }
})();

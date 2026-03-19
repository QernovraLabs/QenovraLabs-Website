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

/* Chatbot widget */
(function initChatbot() {
  const chatToggle = document.getElementById('chatToggle');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');

  if (!chatToggle || !chatPanel || !chatClose || !chatMessages || !chatForm || !chatInput) {
    return;
  }

  function setChatOpen(isOpen) {
    chatPanel.classList.toggle('open', isOpen);
    chatPanel.setAttribute('aria-hidden', String(!isOpen));
    chatToggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      chatInput.focus();
    }
  }

  function pushMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msg;
  }

  function buildLocalReply(question) {
    const text = question.toLowerCase().trim();

    if (/(hello|hi|hey|namaste)/.test(text)) {
      return 'Hi! Welcome to Qenovra Labs. Ask me about our vision, products, contact, or location.';
    }
    if (/(what.*build|services|product|offer|tool|automation|platform)/.test(text)) {
      return 'We build AI tools, automation systems, intelligent platforms, and developer infrastructure focused on autonomous intelligence.';
    }
    if (/(vision|mission|goal|future)/.test(text)) {
      return 'Our vision is to build autonomous AI systems that can think, create, and operate at scale with minimal human intervention.';
    }
    if (/(contact|email|reach|connect)/.test(text)) {
      return 'You can contact us at hello.qenovra@gmail.com or use the Get in Touch section on this page.';
    }
    if (/(where|location|india|based)/.test(text)) {
      return 'Qenovra Labs is based in India and building products for global users.';
    }
    if (/(price|pricing|cost)/.test(text)) {
      return 'Pricing is project and product specific. Share your requirement via email and our team will get back to you.';
    }
    if (/(thank|thanks)/.test(text)) {
      return 'Happy to help. If you want, I can also tell you the fastest way to get in touch with the team.';
    }

    return 'Great question. I can help with Qenovra Labs vision, products, contact details, and company information.';
  }

  async function fetchApiReply(question) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ message: question })
    });

    if (!response.ok) {
      throw new Error(`Chat API failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data || typeof data.reply !== 'string' || !data.reply.trim()) {
      throw new Error('Chat API returned an invalid reply.');
    }
    return data.reply;
  }

  chatToggle.addEventListener('click', () => {
    const isOpen = chatPanel.classList.contains('open');
    setChatOpen(!isOpen);
  });

  chatClose.addEventListener('click', () => setChatOpen(false));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && chatPanel.classList.contains('open')) {
      setChatOpen(false);
    }
  });

  chatForm.addEventListener('submit', async event => {
    event.preventDefault();
    const question = chatInput.value.trim();
    if (!question) return;

    pushMessage('user', question);
    chatInput.value = '';
    const typingMsg = pushMessage('bot', 'Thinking...');

    let reply = '';
    try {
      reply = await fetchApiReply(question);
    } catch (error) {
      reply = buildLocalReply(question);
    }

    typingMsg.remove();
    pushMessage('bot', reply);
  });
})();

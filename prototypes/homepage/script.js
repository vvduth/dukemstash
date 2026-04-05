/* ============================================================
   DukemStash Homepage - Script
   ============================================================ */

(function () {
  'use strict';

  // ---------- Footer year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Navbar scroll ----------
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ---------- Hamburger ----------
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const navActions = document.querySelector('.nav-actions');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    navActions.classList.toggle('open');
  });
  // Close on link click
  navLinks.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      navActions.classList.remove('open');
    });
  });

  // ---------- Scroll fade-in ----------
  const faders = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          fadeObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  faders.forEach((el) => fadeObserver.observe(el));

  // ---------- Billing toggle ----------
  const toggle = document.getElementById('billing-toggle');
  const proPrice = document.getElementById('pro-price');
  const proPeriod = document.getElementById('pro-period');
  const proDesc = document.getElementById('pro-desc');
  const labelMonthly = document.getElementById('toggle-monthly');
  const labelYearly = document.getElementById('toggle-yearly');
  let isYearly = false;

  toggle.addEventListener('click', () => {
    isYearly = !isYearly;
    toggle.classList.toggle('yearly', isYearly);
    labelMonthly.classList.toggle('active', !isYearly);
    labelYearly.classList.toggle('active', isYearly);
    if (isYearly) {
      proPrice.textContent = '$72';
      proPeriod.textContent = '/year';
      proDesc.textContent = 'Save 25% with annual billing';
    } else {
      proPrice.textContent = '$8';
      proPeriod.textContent = '/month';
      proDesc.textContent = 'For power users and teams';
    }
  });
  // Init state
  labelMonthly.classList.add('active');

  // ==========================================================================
  // CHAOS CANVAS - Floating bouncing icons with mouse repulsion
  // ==========================================================================
  const canvas = document.getElementById('chaos-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Icon definitions (emoji-based for simplicity in standalone prototype)
  const iconDefs = [
    { label: 'Notion', text: 'N', bg: '#fff', fg: '#000' },
    { label: 'GitHub', text: '', bg: '#333', fg: '#fff' },
    { label: 'Slack', text: '#', bg: '#4A154B', fg: '#fff' },
    { label: 'VS Code', text: '{}', bg: '#007ACC', fg: '#fff' },
    { label: 'Browser', text: '', bg: '#4285F4', fg: '#fff' },
    { label: 'Terminal', text: '>_', bg: '#22c55e', fg: '#000' },
    { label: '.txt', text: 'T', bg: '#94a3b8', fg: '#000' },
    { label: 'Bookmark', text: '', bg: '#f59e0b', fg: '#000' },
    { label: 'ChatGPT', text: 'AI', bg: '#10a37f', fg: '#fff' },
    { label: 'Discord', text: 'D', bg: '#5865F2', fg: '#fff' },
    { label: 'Jira', text: 'J', bg: '#0052CC', fg: '#fff' },
    { label: 'Sticky', text: '', bg: '#fde047', fg: '#000' },
    { label: 'SO', text: 'SO', bg: '#F48024', fg: '#fff' },
    { label: 'Docs', text: '', bg: '#3b82f6', fg: '#fff' },
  ];

  const particles = [];
  let mouseX = -1000;
  let mouseY = -1000;
  const REPULSE_RADIUS = 90;
  const REPULSE_FORCE = 3;

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  function initParticles() {
    particles.length = 0;
    const count = Math.min(iconDefs.length, Math.floor((canvas.width * canvas.height) / 6000));
    const size = 36;

    for (let i = 0; i < count; i++) {
      const def = iconDefs[i % iconDefs.length];
      particles.push({
        x: Math.random() * (canvas.width - size) + size / 2,
        y: Math.random() * (canvas.height - size) + size / 2,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        size: size,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        scale: 0.9 + Math.random() * 0.2,
        scaleDir: Math.random() > 0.5 ? 1 : -1,
        def: def,
      });
    }
  }

  function drawParticle(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.scale(p.scale, p.scale);

    const s = p.size;
    const half = s / 2;

    // Background rounded rect
    ctx.beginPath();
    const r = 8;
    ctx.moveTo(-half + r, -half);
    ctx.lineTo(half - r, -half);
    ctx.quadraticCurveTo(half, -half, half, -half + r);
    ctx.lineTo(half, half - r);
    ctx.quadraticCurveTo(half, half, half - r, half);
    ctx.lineTo(-half + r, half);
    ctx.quadraticCurveTo(-half, half, -half, half - r);
    ctx.lineTo(-half, -half + r);
    ctx.quadraticCurveTo(-half, -half, -half + r, -half);
    ctx.closePath();

    ctx.fillStyle = p.def.bg;
    ctx.globalAlpha = 0.85;
    ctx.fill();

    // Text
    ctx.globalAlpha = 1;
    ctx.fillStyle = p.def.fg;
    ctx.font = `bold ${s * 0.38}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.def.text, 0, 1);

    ctx.restore();
  }

  function updateParticle(p) {
    // Bounce off walls
    const half = p.size / 2;
    if (p.x - half < 0 || p.x + half > canvas.width) p.vx *= -1;
    if (p.y - half < 0 || p.y + half > canvas.height) p.vy *= -1;

    // Mouse repulsion
    const dx = p.x - mouseX;
    const dy = p.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < REPULSE_RADIUS && dist > 0) {
      const force = (REPULSE_RADIUS - dist) / REPULSE_RADIUS * REPULSE_FORCE;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }

    // Damping
    p.vx *= 0.98;
    p.vy *= 0.98;

    // Min speed
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed < 0.3) {
      p.vx += (Math.random() - 0.5) * 0.3;
      p.vy += (Math.random() - 0.5) * 0.3;
    }

    p.x += p.vx;
    p.y += p.vy;

    // Clamp
    p.x = Math.max(half, Math.min(canvas.width - half, p.x));
    p.y = Math.max(half, Math.min(canvas.height - half, p.y));

    // Rotation
    p.rotation += p.rotSpeed;

    // Scale pulse
    p.scale += p.scaleDir * 0.001;
    if (p.scale > 1.1 || p.scale < 0.85) p.scaleDir *= -1;
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      updateParticle(p);
      drawParticle(p);
    });
    requestAnimationFrame(animate);
  }

  // Mouse tracking relative to canvas
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
  });

  // Init
  resizeCanvas();
  initParticles();
  animate();

  // Resize handler
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      initParticles();
    }, 200);
  });
})();

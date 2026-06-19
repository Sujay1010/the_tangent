// PARTICLE BACKGROUND
const canvas = document.getElementById('bg');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.5 + 0.1
    });
  }

  // SCROLL PROGRESS (0 to 1, top to bottom of page)
  let scrollProgress = 0;
  let smoothProgress = 0;
  function updateScrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? window.scrollY / max : 0;
  }
  window.addEventListener('scroll', updateScrollProgress);
  updateScrollProgress();

  // TANGENT LINE + QUADRANT ARC (logo motif, driven by scroll)
  function drawTangent() {
    smoothProgress += (scrollProgress - smoothProgress) * 0.08;

    const R = Math.min(W, H) * 0.38;
    const cx = W * 0.78;
    const cy = H * 0.18;

    const startAngle = Math.PI / 2; // pointing down
    const endAngle = 0;             // pointing right

    // static quadrant arc
    ctx.beginPath();
    ctx.arc(cx, cy, R, startAngle, endAngle, true);
    ctx.strokeStyle = 'rgba(123,92,240,0.35)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    // current angle along the arc, based on scroll
    const theta = startAngle + (endAngle - startAngle) * smoothProgress;
    const px = cx + R * Math.cos(theta);
    const py = cy + R * Math.sin(theta);

    // tangent direction = perpendicular to the radius at (px, py)
    const dx = -Math.sin(theta);
    const dy = Math.cos(theta);
    const len = Math.max(W, H) * 1.2;

    ctx.beginPath();
    ctx.moveTo(px - dx * len, py - dy * len);
    ctx.lineTo(px + dx * len, py + dy * len);
    const grad = ctx.createLinearGradient(px - dx * len, py - dy * len, px + dx * len, py + dy * len);
    grad.addColorStop(0,   'rgba(155,140,245,0)');
    grad.addColorStop(0.5, 'rgba(123,92,240,0.85)');
    grad.addColorStop(1,   'rgba(155,140,245,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // white flash at the point of contact
    const pulse = 4 + Math.sin(Date.now() / 300) * 1.5;
    ctx.beginPath();
    ctx.arc(px, py, pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(px, py, pulse + 3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(123,92,240,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(123,92,240,${p.o})`;
      ctx.fill();
    });
    particles.forEach((a, i) => {
      particles.slice(i + 1).forEach(b => {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(123,92,240,${0.09 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
    drawTangent();
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

// SCROLL REVEAL
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, parseInt(delay));
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-left').forEach((el, i) => observer.observe(el));

// Staggered cards
document.querySelectorAll('.card').forEach((el, i) => {
  el.classList.add('reveal');
  el.dataset.delay = i * 90;
  observer.observe(el);
});

// Staggered blips
document.querySelectorAll('.blip').forEach((el, i) => {
  el.classList.add('reveal-left');
  el.dataset.delay = i * 70;
  observer.observe(el);
});

// Trigger hero immediately
setTimeout(() => {
  document.querySelectorAll('.reveal, .reveal-left').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) el.classList.add('visible');
  });
}, 120);
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

  // === SCROLL-DRIVEN TANGENT BEAM ===
  // Quarter-circle arc fixed at the bottom-right corner of the screen.
  // As you scroll, a glowing point travels along a fixed tangent line —
  // starting near that corner — and sparkles right as it crosses the arc.
  // Size is capped so this stays a contained corner accent on any screen
  // (it used to stretch into the page content on wide/laptop screens).

  let scrollProgress = 0;
  let smoothProgress = 0;
  function updateScrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const raw = max > 0 ? window.scrollY / max : 0;
    scrollProgress = Math.min(1, Math.max(0, raw));
  }
  window.addEventListener('scroll', updateScrollProgress);
  updateScrollProgress();

  let beamGeo = null; // recomputed on resize
  function computeBeamGeometry() {
    const center = { x: W, y: H }; // circle pinned to the bottom-right corner

    // capped radius — never lets the motif grow past a sensible corner accent
    const R = Math.min(280, Math.min(W, H) * 0.34);

    // fixed visual angle (NOT derived from W/H fractions — that's what
    // caused it to stretch and warp on wide laptop screens)
    const angle = (217 * Math.PI) / 180;
    const dir = { x: Math.cos(angle), y: Math.sin(angle) }; // points up-left

    const beamLength = R * 2.6;
    const lineStart = { x: center.x - R * 0.15, y: center.y - R * 0.15 }; // launch point, near the corner
    const lineEnd = { x: lineStart.x + dir.x * beamLength, y: lineStart.y + dir.y * beamLength };
    const len = beamLength;

    // find where this fixed line actually crosses the fixed circle
    const ox = lineStart.x - center.x;
    const oy = lineStart.y - center.y;
    const a = dir.x * dir.x + dir.y * dir.y;
    const b = 2 * (ox * dir.x + oy * dir.y);
    const c = ox * ox + oy * oy - R * R;
    const disc = b * b - 4 * a * c;

    let contactT = 0.3; // fallback in case geometry doesn't intersect
    if (disc >= 0) {
      const sq = Math.sqrt(disc);
      [(-b - sq) / (2 * a), (-b + sq) / (2 * a)].forEach(t => {
        if (t > 0 && t < len) contactT = t / len;
      });
    }

    beamGeo = { center, R, lineStart, lineEnd, dir, len, contactT };
  }
  computeBeamGeometry();
  window.addEventListener('resize', computeBeamGeometry);

  function drawBeam() {
    const { center, R, lineStart, dir, len, contactT } = beamGeo;

    // fixed quadrant arc, pinned bottom-right
    ctx.beginPath();
    ctx.arc(center.x, center.y, R, Math.PI, Math.PI * 1.5);
    ctx.strokeStyle = 'rgba(155,140,245,0.85)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#7B5CF0';
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // faint persistent guide line
    const lineEndX = lineStart.x + dir.x * len;
    const lineEndY = lineStart.y + dir.y * len;
   ctx.beginPath();
   ctx.moveTo(lineStart.x, lineStart.y);
   ctx.lineTo(lineEndX, lineEndY);
   ctx.strokeStyle = 'rgba(155,140,245,0.35)';
   ctx.lineWidth = 1.5;
   ctx.shadowColor = '#7B5CF0';
   ctx.shadowBlur = 8;
   ctx.stroke();
   ctx.shadowBlur = 0;

    // ease toward the actual scroll position
    smoothProgress += (scrollProgress - smoothProgress) * 0.08;
    const t = smoothProgress;

    const headX = lineStart.x + dir.x * len * t;
    const headY = lineStart.y + dir.y * len * t;
    const tailT = Math.max(0, t - 0.14);
    const tailX = lineStart.x + dir.x * len * tailT;
    const tailY = lineStart.y + dir.y * len * tailT;

    const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
    grad.addColorStop(0, 'rgba(155,140,245,0)');
    grad.addColorStop(1, 'rgba(190,170,255,1)');
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(headX, headY);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#9B8CF5';
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // glowing head, following scroll
   // glowing head, following scroll — comet style (soft halo + bright core)
    ctx.beginPath();
    ctx.arc(headX, headY, 9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(190,170,255,0.3)';
    ctx.shadowColor = '#9B8CF5';
    ctx.shadowBlur = 26;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.beginPath();
    ctx.arc(headX, headY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 22;
    ctx.fill();
    ctx.shadowBlur = 0;

    // sparkle flash — strongest exactly as the head crosses the arc,
    // fades smoothly the further you scroll from that point
    const contactX = lineStart.x + dir.x * len * contactT;
    const contactY = lineStart.y + dir.y * len * contactT;
    const proximity = Math.max(0, 1 - Math.abs(t - contactT) / 0.05);

    if (proximity > 0) {
      ctx.beginPath();
      ctx.arc(contactX, contactY, 4 + proximity * 14, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${proximity * 0.95})`;
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 10 + proximity * 22;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // quiet resting marker, always present
    ctx.beginPath();
    ctx.arc(contactX, contactY, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();
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
    drawBeam();
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

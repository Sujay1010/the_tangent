// PARTICLE + BEAM BACKGROUND
const canvas = document.getElementById('bg');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    computeBeamGeometry();
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

  let progress = 0;
  let traveling = false;
  window.addEventListener('wheel', () => { traveling = true; });
  window.addEventListener('scroll', () => { traveling = true; });
  // also trigger on touch for mobile
  window.addEventListener('touchmove', () => { traveling = true; });

  let beamGeo = null;
  function computeBeamGeometry() {
    const center = { x: W, y: H };
    const R = Math.min(280, Math.min(W, H) * 0.34);
    const angle = (217 * Math.PI) / 180;
    const dir = { x: Math.cos(angle), y: Math.sin(angle) };
    const beamLength = R * 2.6;
    const lineStart = { x: center.x - R * 0.15, y: center.y - R * 0.15 };
    const len = beamLength;

    const ox = lineStart.x - center.x;
    const oy = lineStart.y - center.y;
    const a = dir.x * dir.x + dir.y * dir.y;
    const b = 2 * (ox * dir.x + oy * dir.y);
    const c = ox * ox + oy * oy - R * R;
    const disc = b * b - 4 * a * c;

    let contactT = 0.3;
    if (disc >= 0) {
      const sq = Math.sqrt(disc);
      [(-b - sq) / (2 * a), (-b + sq) / (2 * a)].forEach(t => {
        if (t > 0 && t < len) contactT = t / len;
      });
    }

    beamGeo = { center, R, lineStart, dir, len, contactT };
  }
  computeBeamGeometry();

  function drawBeam() {
    const { center, R, lineStart, dir, len, contactT } = beamGeo;

    // neon arc (quadrant: bottom-left corner = 180deg to 270deg)
    ctx.beginPath();
    ctx.arc(center.x, center.y, R, Math.PI, Math.PI * 1.5);
    ctx.strokeStyle = 'rgba(155,140,245,0.85)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#7B5CF0';
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // advance travel
    if (traveling) {
      progress += 0.012;
      if (progress >= 1) {
        progress = 1;
        traveling = false;
        setTimeout(() => { progress = 0; }, 400);
      }
    }
    const t = progress;

    const headX = lineStart.x + dir.x * len * t;
    const headY = lineStart.y + dir.y * len * t;
    const tailT = Math.max(0, t - 0.14);
    const tailX = lineStart.x + dir.x * len * tailT;
    const tailY = lineStart.y + dir.y * len * tailT;

    // beam trail
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

    // comet tip glow
    ctx.beginPath();
    ctx.arc(headX, headY, 9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(190,170,255,0.3)';
    ctx.shadowColor = '#9B8CF5';
    ctx.shadowBlur = 26;
    ctx.fill();
    ctx.shadowBlur = 0;

    // comet tip dot
    ctx.beginPath();
    ctx.arc(headX, headY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 22;
    ctx.fill();
    ctx.shadowBlur = 0;

    // sparkle flash at contact point
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

    // permanent contact dot
    ctx.beginPath();
    ctx.arc(contactX, contactY, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);

    // draw particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(123,92,240,${p.o})`;
      ctx.fill();
    });

    // draw particle connections
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

    // draw beam + arc
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
}, { threshold: 0 });

document.querySelectorAll('.reveal, .reveal-left').forEach((el) => observer.observe(el));

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
}, 0);

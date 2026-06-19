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

  // === NEON TANGENT BEAM ===
  // Quarter-circle arc fixed at the bottom-right corner of the screen.
  // A glowing "spark" travels from near that corner up along a fixed
  // tangent line, sparkles when it crosses the arc, then keeps going
  // off-screen and loops back to fire again.

  let beamGeo = null;     // recomputed on resize
  let sparkT = -0.25;     // 0..1 progress along the beam (negative = pause before firing)
  let flashTimer = 0;     // counts down while the contact flash is active

  function computeBeamGeometry() {
    const center = { x: W, y: H };              // circle pinned to bottom-right corner
    const R = Math.min(W, H) * 0.62;

    const lineStart = { x: W * 0.97, y: H * 0.95 }; // beam fires from near this corner
    const lineEnd   = { x: W * 0.36, y: H * 0.04 }; // exits near the top-left

    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const len = Math.hypot(dx, dy);
    const dir = { x: dx / len, y: dy / len };

    // find where this fixed line actually crosses the fixed circle
    const ox = lineStart.x - center.x;
    const oy = lineStart.y - center.y;
    const a = dir.x * dir.x + dir.y * dir.y;
    const b = 2 * (ox * dir.x + oy * dir.y);
    const c = ox * ox + oy * oy - R * R;
    const disc = b * b - 4 * a * c;

    let contactT = 0.55; // fallback in case geometry doesn't intersect
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
    const { center, R, lineStart, lineEnd, dir, len, contactT } = beamGeo;

    // fixed quadrant arc, pinned bottom-right
    ctx.beginPath();
    ctx.arc(center.x, center.y, R, Math.PI, Math.PI * 1.5);
    ctx.strokeStyle = 'rgba(123,92,240,0.45)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // faint persistent guide line
    ctx.beginPath();
    ctx.moveTo(lineStart.x, lineStart.y);
    ctx.lineTo(lineEnd.x, lineEnd.y);
    ctx.strokeStyle = 'rgba(123,92,240,0.18)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // advance the traveling spark
    sparkT += 0.0035;
    if (sparkT > 1.15) sparkT = -0.25; // brief pause before it fires again

    if (sparkT >= 0 && sparkT <= 1) {
      const headX = lineStart.x + dir.x * len * sparkT;
      const headY = lineStart.y + dir.y * len * sparkT;

      // comet trail behind the head
      const tailT = Math.max(0, sparkT - 0.16);
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
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // glowing head
      ctx.beginPath();
      ctx.arc(headX, headY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      // trigger the flash right as the head crosses the arc
      if (Math.abs(sparkT - contactT) < 0.012) {
        flashTimer = 14;
      }
    }

    // point of contact between the line and the arc
    const contactX = lineStart.x + dir.x * len * contactT;
    const contactY = lineStart.y + dir.y * len * contactT;

    if (flashTimer > 0) {
      const p = flashTimer / 14; // 1 -> 0
      ctx.beginPath();
      ctx.arc(contactX, contactY, 4 + (1 - p) * 18, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p * 0.9})`;
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 30;
      ctx.fill();
      ctx.shadowBlur = 0;
      flashTimer--;
    } else {
      // quiet resting dot marking where the line meets the arc
      ctx.beginPath();
      ctx.arc(contactX, contactY, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fill();
    }
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

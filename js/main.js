// ============================================
// 1. TYPING EFFECT ON HERO TITLE
// ============================================
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
  const html = heroTitle.innerHTML;
  heroTitle.innerHTML = '';
  heroTitle.style.opacity = '1';

  // Extract text nodes and em tags
  const temp = document.createElement('div');
  temp.innerHTML = html;

  let fullText = '';
  let emStart = -1;
  let emEnd = -1;
  let plainBefore = '';
  let emText = '';
  let plainAfter = '';

  // Parse: text before em, em content, text after em
  temp.childNodes.forEach(node => {
    if (node.nodeType === 3) {
      if (emText === '') plainBefore += node.textContent;
      else plainAfter += node.textContent;
    } else if (node.nodeName === 'EM' || node.nodeName === 'BR') {
      if (node.nodeName === 'EM') emText = node.textContent;
      else {
        if (emText === '') plainBefore += '\n';
        else plainAfter += '\n';
      }
    }
  });

  // Rebuild as char array with em markers
  const chars = [];
  for (let c of plainBefore) chars.push({ char: c, em: false });
  for (let c of emText) chars.push({ char: c, em: true });
  for (let c of plainAfter) chars.push({ char: c, em: false });

  let i = 0;
  function typeNext() {
    if (i >= chars.length) return;
    const { char, em } = chars[i];

    // Rebuild innerHTML each time
    let result = '';
    let inEm = false;
    for (let j = 0; j <= i; j++) {
      const c = chars[j];
      if (c.em && !inEm) { result += '<em>'; inEm = true; }
      if (!c.em && inEm) { result += '</em>'; inEm = false; }
      result += c.char === '\n' ? '<br>' : c.char;
    }
    if (inEm) result += '</em>';
    heroTitle.innerHTML = result;

    i++;
    setTimeout(typeNext, 38);
  }
  setTimeout(typeNext, 300);
}

(function() {
  const canvas = document.getElementById('bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const STAR_COUNT = 90;
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.3 + 0.6,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.5,
      baseAlpha: 0.35 + Math.random() * 0.5
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const t = Date.now() / 1000;

    stars.forEach(s => {
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
    });

    ctx.lineWidth = 0.6;
    stars.forEach((a, i) => {
      let nearest = null, nd = Infinity;
      stars.forEach((b, j) => {
        if (i === j) return;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < nd && d < 110) { nd = d; nearest = b; }
      });
      if (nearest) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(nearest.x, nearest.y);
        ctx.strokeStyle = `rgba(123,92,240,${0.22 * (1 - nd / 110)})`;
        ctx.stroke();
      }
    });

    stars.forEach(s => {
      const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
      const alpha = s.baseAlpha * 0.5 + s.baseAlpha * 0.5 * twinkle;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(235,230,255,${alpha})`;
      ctx.shadowColor = 'rgba(155,140,245,0.8)';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();
 
// ============================================
// 2. HOVER GLOW ON CARDS
// ============================================
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = '0 0 28px rgba(123,92,240,0.25), inset 0 0 0 1px rgba(123,92,240,0.3)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = 'none';
  });
});

// ============================================
// 3. READING PROGRESS BAR (article pages only)
// ============================================
const articleBody = document.querySelector('.article-body');
if (articleBody) {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, #7B5CF0, #9B8CF5);
    z-index: 9999;
    transition: width 0.1s linear;
    box-shadow: 0 0 10px rgba(123,92,240,0.6);
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    bar.style.width = Math.min(progress, 100) + '%';
  });
}

// ============================================
// 4. COUNT-UP ON ABOUT PAGE STATS
// ============================================
document.querySelectorAll('.about-stat-num').forEach(el => {
  const target = el.textContent.trim();
  if (target === '∞') return; // skip infinity

  const end = parseInt(target);
  if (isNaN(end)) return;

  el.textContent = '0';

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      countObserver.unobserve(entry.target);

      let start = 0;
      const duration = 1200;
      const step = 16;
      const increment = end / (duration / step);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          el.textContent = end;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(start);
        }
      }, step);
    });
  }, { threshold: 0.5 });

  countObserver.observe(el);
});

// ============================================
// 5. AUTO-SORT CARDS/BLIPS BY DATE (newest first)
// ============================================
function sortByDate(containerSelector, itemSelector) {
  document.querySelectorAll(containerSelector).forEach(container => {
    const items = Array.from(container.querySelectorAll(itemSelector));
    items.sort((a, b) => new Date(b.dataset.date) - new Date(a.dataset.date));
    items.forEach(item => container.appendChild(item));
  });
}
sortByDate('.cards', '.card');
sortByDate('.blips', '.blip');

// ============================================
// SCROLL REVEAL
// ============================================
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

document.querySelectorAll('.reveal, .reveal-left').forEach(el => observer.observe(el));

document.querySelectorAll('.card').forEach((el, i) => {
  el.classList.add('reveal');
  el.dataset.delay = i * 90;
  observer.observe(el);
});

document.querySelectorAll('.blip').forEach((el, i) => {
  el.classList.add('reveal-left');
  el.dataset.delay = i * 70;
  observer.observe(el);
});

setTimeout(() => {
  document.querySelectorAll('.reveal, .reveal-left').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) el.classList.add('visible');
  });
}, 0);

(function() {
  const intro = document.getElementById('introScreen');
  if (!intro) return;

  function update() {
    const fadeDistance = window.innerHeight * 0.8;
    const progress = Math.min(1, window.scrollY / fadeDistance);
    intro.style.opacity = 1 - progress;
    intro.style.transform = `translateY(${-progress * 50}px) scale(${1 - progress * 0.06})`;
    intro.style.pointerEvents = progress >= 1 ? 'none' : 'auto';
  }
  window.addEventListener('scroll', update);
  update();
})();
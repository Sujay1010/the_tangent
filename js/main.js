// ============================================
// 0. CENTRAL ARTICLE DATA + RENDER ENGINE
// ============================================
// Single source of truth for every article. Add/edit/remove an entry here
// and it propagates to the homepage, the full listing pages, and every
// "More" section automatically — no more hunting through 17 files.
const ARTICLES = [
  { slug: 'why-nobody-teaches-good-stuff',     type: 'rabbit-hole', title: 'Why nobody actually teaches you the good stuff',                  category: 'CS Theory',   readTime: '12 min', date: '2026-06-15' },
  { slug: 'entropy-and-codebases',             type: 'rabbit-hole', title: 'How entropy explains everything wrong with your codebase',          category: 'CS Theory',   readTime: '10 min', date: '2026-05-20' },
  { slug: 'nash-equilibrium-group-project',    type: 'rabbit-hole', title: 'The Nash equilibrium hiding in your group project',                 category: 'Game Theory', readTime: '9 min',  date: '2026-05-10' },
  { slug: 'bayes-theorem-wrong',                type: 'rabbit-hole', title: "Bayes' theorem and why you're always wrong about being right",      category: 'Statistics',  readTime: '11 min', date: '2026-04-18' },
  { slug: 'thermodynamics-deadlines',           type: 'rabbit-hole', title: 'What thermodynamics actually has to say about deadlines',           category: 'Physics',     readTime: '8 min',  date: '2026-04-05' },
  { slug: 'gradient-descent-vibes',             type: 'brain-fart',  title: "Gradient descent is just vibes and we're all pretending",           category: 'ML',          readTime: '2 min',  date: '2026-06-18' },
  { slug: 'p-vs-np-society',                    type: 'brain-fart',  title: "P vs NP is honestly society's problem",                              category: 'Math',        readTime: '3 min',  date: '2026-06-08' },
  { slug: 'fourier-eavesdropping',               type: 'brain-fart',  title: 'The Fourier transform is just eavesdropping on signals',             category: 'Math',        readTime: '4 min',  date: '2026-05-22' },
  { slug: 'recursion-cheating',                 type: 'brain-fart',  title: "Why recursion feels like cheating but actually isn't",               category: 'CS',          readTime: '3 min',  date: '2026-05-12' },
  { slug: 'big-o-anxiety',                      type: 'brain-fart',  title: 'Big O notation is just anxiety with math notation',                  category: 'CS',          readTime: '2 min',  date: '2026-04-20' },
  { slug: 'sorting-trust-issues',                type: 'brain-fart',  title: 'Every sorting algorithm is just trust issues in code form',          category: 'CS',          readTime: '3 min',  date: '2026-04-08' },
  { slug: 'central-limit-theorem',              type: 'brain-fart',  title: 'The Central Limit Theorem is the universe saying calm down',         category: 'Statistics',  readTime: '4 min',  date: '2026-03-15' },
  { slug: 'overfitting-exam',                   type: 'brain-fart',  title: 'Overfitting is just memorising the exam and failing life',           category: 'ML',          readTime: '2 min',  date: '2026-03-05' },
  { slug: 'newtons-third-law-petty',             type: 'brain-fart',  title: "Newton's third law is just the universe being petty",               category: 'Physics',     readTime: '3 min',  date: '2026-02-10' }
];

// The single featured article shown in the homepage hero. Change this to
// feature a different post — the homepage "Rabbit Holes" row automatically
// excludes whichever slug is featured here.
const FEATURED_SLUG = 'why-nobody-teaches-good-stuff';

const TYPE_LABEL = { 'rabbit-hole': 'Rabbit Hole', 'brain-fart': 'Brain Fart' };

function articleHref(slug) {
  const inArticles = location.pathname.includes('/articles/');
  return (inArticles ? '../' : '') + 'articles/' + slug + '.html';
}

function monthYear(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function byNewest(a, b) {
  return new Date(b.date) - new Date(a.date);
}

function cardHTML(a, withDate) {
  const meta = withDate ? `${a.readTime} · ${a.category} · ${monthYear(a.date)}` : `${a.readTime} · ${a.category}`;
  return `<a href="${articleHref(a.slug)}" class="card" data-date="${a.date}">
    <div class="card-tag">${TYPE_LABEL[a.type]}</div>
    <div class="card-title">${a.title}</div>
    <div class="card-meta">${meta}</div>
  </a>`;
}

function blipHTML(a, withDate) {
  const meta = withDate ? `${a.readTime} · ${a.category} · ${monthYear(a.date)}` : `${a.readTime} · ${a.category}`;
  return `<a href="${articleHref(a.slug)}" class="blip" data-date="${a.date}">
    <div class="blip-tag">${TYPE_LABEL[a.type]}</div>
    <div class="blip-title">${a.title}</div>
    <div class="blip-meta">${meta}</div>
  </a>`;
}

function currentSlug() {
  return location.pathname.split('/').pop().replace('.html', '');
}

document.querySelectorAll('[data-render]').forEach(container => {
  const mode = container.dataset.render;
  let list = [];
  let html = '';

  if (mode === 'home-rabbit-holes') {
    list = ARTICLES.filter(a => a.type === 'rabbit-hole' && a.slug !== FEATURED_SLUG).sort(byNewest).slice(0, 3);
    html = list.map(a => cardHTML(a, false)).join('');
  } else if (mode === 'home-brain-farts') {
    list = ARTICLES.filter(a => a.type === 'brain-fart').sort(byNewest).slice(0, 4);
    html = list.map(a => blipHTML(a, false)).join('');
  } else if (mode === 'all-rabbit-holes') {
    list = ARTICLES.filter(a => a.type === 'rabbit-hole').sort(byNewest);
    html = list.map(a => cardHTML(a, true)).join('');
  } else if (mode === 'all-brain-farts') {
    list = ARTICLES.filter(a => a.type === 'brain-fart').sort(byNewest);
    html = list.map(a => blipHTML(a, false)).join('');
  } else if (mode === 'more') {
    const self = ARTICLES.find(a => a.slug === currentSlug());
    const type = self ? self.type : 'brain-fart';
    list = ARTICLES.filter(a => a.type === type && a.slug !== currentSlug()).sort(byNewest).slice(0, 3);
    html = type === 'rabbit-hole' ? list.map(a => cardHTML(a, false)).join('') : list.map(a => blipHTML(a, false)).join('');
  }

  if (list.length === 0) {
    container.innerHTML = '<div class="empty">Nothing here yet.</div>';
  } else {
    container.innerHTML = html;
  }
});

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
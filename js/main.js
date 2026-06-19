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

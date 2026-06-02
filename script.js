/* ════════════════════════════════════════════
   GIRO DA BOLSA ITINERANTE — interactions
   ════════════════════════════════════════════ */

// ── Nav shrink on scroll ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Mobile menu toggle ──
const menuBtn = document.getElementById('menuBtn');
menuBtn?.addEventListener('click', () => {
  const links = document.querySelector('.nav-links');
  const navCta = document.querySelector('.btn-nav');
  if (links) {
    const open = links.style.display === 'flex';
    links.style.display = open ? '' : 'flex';
    links.style.flexDirection = open ? '' : 'column';
    links.style.position = open ? '' : 'absolute';
    links.style.top = open ? '' : '100%';
    links.style.left = open ? '' : '0';
    links.style.right = open ? '' : '0';
    links.style.background = open ? '' : 'var(--nav-bg)';
    links.style.padding = open ? '' : '1rem 2rem';
    links.style.borderBottom = open ? '' : '1px solid var(--border)';
    links.style.backdropFilter = open ? '' : 'blur(12px)';
  }
  if (navCta) navCta.style.display = navCta.style.display === 'inline-flex' ? '' : 'inline-flex';
});

// ── Scroll Reveal with IntersectionObserver ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings
      const siblings = entry.target.parentElement?.querySelectorAll('.reveal');
      let delay = 0;
      if (siblings) {
        Array.from(siblings).forEach((el, idx) => {
          if (el === entry.target) delay = idx * 80;
        });
      }
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Counter animation ──
function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  const isLarge = target > 100;

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = isLarge
      ? current.toLocaleString('pt-BR')
      : current;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = isLarge ? target.toLocaleString('pt-BR') : target;
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// ── Brazil map path animation ──
const mapSection = document.getElementById('roteiro');
const pathDone = document.getElementById('pathDone');

if (pathDone && mapSection) {
  // Use pathLength="1" trick: normalize dasharray to total length
  const totalLength = pathDone.getTotalLength();
  pathDone.style.strokeDasharray = `8 5`;
  pathDone.style.strokeDashoffset = String(totalLength + 50);

  const mapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate dash offset to 0
        pathDone.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(0.4, 0, 0.2, 1)';
        pathDone.style.strokeDashoffset = '0';
        mapObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  mapObserver.observe(mapSection);
}

// ── Smooth anchor scrolling (for older browsers) ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Polaroid hover tilt (mouse parallax) ──
document.querySelectorAll('.polaroid').forEach(card => {
  const baseRot = parseFloat(getComputedStyle(card).getPropertyValue('--rot') || '0');

  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    card.style.transform = `rotate(0deg) scale(1.04) translateY(-4px) rotateY(${dx * 8}deg) rotateX(${-dy * 5}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `rotate(${baseRot}deg)`;
  });
});

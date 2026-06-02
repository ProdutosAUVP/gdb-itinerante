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

// ── GeoChart Brasil ──
let mapInstance = null;

const VISITED_STATES = ['BR-GO', 'BR-MG', 'BR-SP', 'BR-RJ'];
const NEXT_STATE     = 'BR-BA';
const ALL_STATES     = [
  'BR-AC','BR-AL','BR-AM','BR-AP','BR-BA','BR-CE','BR-DF','BR-ES',
  'BR-GO','BR-MA','BR-MG','BR-MS','BR-MT','BR-PA','BR-PB','BR-PE',
  'BR-PI','BR-PR','BR-RJ','BR-RN','BR-RO','BR-RR','BR-RS','BR-SC',
  'BR-SE','BR-SP','BR-TO'
];
const STATE_LABELS = {
  GO: 'Goiânia · GO', MG: 'Belo Horizonte · MG',
  SP: 'São Paulo · SP', RJ: 'Rio de Janeiro · RJ',
  BA: 'Salvador · BA'
};

window.renderMap = () => {
  if (!window.isGeoChartLoaded || typeof google === 'undefined') return;
  const container = document.getElementById('brazil-map-chart');
  if (!container) return;

  const loadingEl = document.getElementById('map-loading');
  if (loadingEl) loadingEl.style.display = 'none';

  const rows = ALL_STATES.map(state => {
    const val = VISITED_STATES.includes(state) ? 1 : (state === NEXT_STATE ? 2 : 0);
    return [{ v: state, f: state.replace('BR-', '') }, val, ''];
  });
  const data = google.visualization.arrayToDataTable(
    [['State', 'Valor', { role: 'tooltip', p: { html: true } }], ...rows]
  );

  const isLight = document.documentElement.classList.contains('light');
  const options = {
    region: 'BR',
    resolution: 'provinces',
    backgroundColor: 'transparent',
    datalessRegionColor: 'transparent',
    defaultColor: isLight ? '#d0d0d0' : '#1e1e1e',
    legend: 'none',
    keepAspectRatio: true,
    tooltip: { trigger: 'none' },
    colorAxis: {
      colors: isLight
        ? ['#d0d0d0', '#a04040', '#cc1a22']
        : ['#1e1e1e', '#5a1010', '#e8202a'],
      minValue: 0, maxValue: 2
    }
  };

  if (!mapInstance) {
    mapInstance = new google.visualization.GeoChart(container);
    google.visualization.events.addListener(mapInstance, 'select', () => mapInstance.setSelection([]));

    google.visualization.events.addListener(mapInstance, 'onmouseover', (evt) => {
      const stateCode = ALL_STATES[evt.row]?.replace('BR-', '');
      if (!stateCode || !(stateCode in STATE_LABELS)) return;
      const tooltip = document.getElementById('custom-map-tooltip');
      const isNext = `BR-${stateCode}` === NEXT_STATE;
      tooltip.innerHTML = isNext
        ? `<strong style="color:var(--accent)">${STATE_LABELS[stateCode]}</strong><br><span style="font-size:0.7rem;color:var(--accent);text-transform:uppercase;letter-spacing:0.1em">Próxima parada</span>`
        : `<strong>${STATE_LABELS[stateCode]}</strong><br><span style="font-size:0.7rem;color:var(--text-muted)">Edição realizada ✓</span>`;
      tooltip.classList.remove('hidden');
    });

    google.visualization.events.addListener(mapInstance, 'onmouseout', () => {
      document.getElementById('custom-map-tooltip').classList.add('hidden');
    });
  }

  mapInstance.draw(data, options);
};

// Track mouse for floating tooltip
document.addEventListener('mousemove', (e) => {
  const tooltip = document.getElementById('custom-map-tooltip');
  if (tooltip && !tooltip.classList.contains('hidden')) {
    tooltip.style.left = `${e.clientX}px`;
    tooltip.style.top  = `${e.clientY - 12}px`;
  }
});

// Trigger renderMap when roteiro section enters view
const mapSection = document.getElementById('roteiro');
if (mapSection) {
  const mapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (window.isGeoChartLoaded) window.renderMap();
        mapObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  mapObserver.observe(mapSection);
}

// Re-draw on resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.isGeoChartLoaded && mapInstance) window.renderMap();
  }, 250);
});

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

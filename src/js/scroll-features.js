import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initFeaturesScroll() {
  const section = document.querySelector('.features-section');
  const pin = document.querySelector('.features-pin');
  const track = document.getElementById('features-track');
  const spacer = document.querySelector('.features-spacer');
  const counter = document.getElementById('feature-counter');
  const dotsContainer = document.getElementById('progress-dots');
  const cards = document.querySelectorAll('.feature-card');

  if (!section || !track || !spacer) return;

  const totalCards = cards.length;

  // Build progress dots
  if (dotsContainer) {
    for (let i = 0; i < totalCards; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dotsContainer.appendChild(dot);
    }
  }

  const dots = dotsContainer?.querySelectorAll('.dot');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || window.innerWidth <= 768) {
    if (counter) counter.textContent = `${String(totalCards).padStart(2, '0')} / ${String(totalCards).padStart(2, '0')}`;
    initCardTilt(cards);
    return;
  }

  const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + 64);

  gsap.to(track, {
    x: getScrollAmount,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${spacer.offsetHeight}`,
      pin: pin,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const idx = Math.min(
          Math.floor(self.progress * totalCards),
          totalCards - 1
        );
        if (counter) {
          counter.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(totalCards).padStart(2, '0')}`;
        }
        dots?.forEach((dot, i) => {
          dot.classList.toggle('active', i === idx);
        });
      },
    },
  });

  initCardTilt(cards);

  gsap.from('.features-header', {
    scrollTrigger: { trigger: section, start: 'top 85%' },
    opacity: 0,
    y: 40,
    duration: 0.8,
    ease: 'power3.out',
  });
}

function initCardTilt(cards) {
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

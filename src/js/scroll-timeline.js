import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initTimelineScroll() {
  const section = document.querySelector('.timeline-section');
  const pin = document.querySelector('.timeline-pin');
  const spacer = document.querySelector('.timeline-spacer');
  const fill = document.querySelector('.timeline-line-fill');
  const nodes = document.querySelectorAll('.timeline-node');

  if (!section || !pin || !fill) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || window.innerWidth <= 768) {
    nodes.forEach((node) => node.classList.add('active'));
    fill.style.height = '100%';
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${spacer.offsetHeight}`,
      pin: pin,
      scrub: 1,
      anticipatePin: 1,
    },
  });

  tl.to(fill, { height: '100%', ease: 'none' }, 0);

  nodes.forEach((node, i) => {
    const progress = (i + 1) / nodes.length;
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${spacer.offsetHeight}`,
      scrub: 1,
      onUpdate: (self) => {
        if (self.progress >= progress - 0.15) {
          node.classList.add('active');
        } else {
          node.classList.remove('active');
        }
      },
    });
  });

  gsap.from('.timeline-header', {
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
    },
    opacity: 0,
    y: 40,
    duration: 0.8,
    ease: 'power3.out',
  });
}

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initCtaForm() {
  const form = document.getElementById('cta-form');
  const success = document.getElementById('cta-success');
  const chips = document.querySelectorAll('.chip');
  const selectedFeatures = new Set();

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const val = chip.dataset.value;
      if (selectedFeatures.has(val)) {
        selectedFeatures.delete(val);
        chip.classList.remove('selected');
      } else {
        selectedFeatures.add(val);
        chip.classList.add('selected');
      }
    });
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const experience = document.getElementById('experience');

    let valid = true;

    [name, email, experience].forEach((field) => {
      field?.classList.remove('error');
      if (!field?.value.trim()) {
        field?.classList.add('error');
        valid = false;
      }
    });

    if (email?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('error');
      valid = false;
    }

    if (!valid) {
      gsap.fromTo('.form-group input.error, .form-group select.error',
        { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)' }
      );
      return;
    }

    const entry = {
      name: name.value.trim(),
      email: email.value.trim(),
      experience: experience.value,
      features: [...selectedFeatures],
      timestamp: new Date().toISOString(),
    };

    const queue = JSON.parse(localStorage.getItem('investover_waitlist') || '[]');
    queue.push(entry);
    localStorage.setItem('investover_waitlist', JSON.stringify(queue));
    console.log('Waitlist signup:', entry);

    gsap.to(form, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      onComplete: () => {
        form.classList.add('hidden');
        success?.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
        gsap.from('.cta-success > *', {
          opacity: 0,
          y: 20,
          duration: 0.5,
          stagger: 0.15,
          ease: 'power3.out',
        });
        spawnConfetti();
      },
    });
  });

  gsap.from('.cta-card', {
    scrollTrigger: { trigger: '#early-access', start: 'top 80%' },
    opacity: 0,
    y: 50,
    duration: 1,
    ease: 'power3.out',
  });
}

function spawnConfetti() {
  const section = document.querySelector('.cta-section');
  if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const colors = ['#22c55e', '#8b5cf6', '#f59e0b', '#ef4444'];

  for (let i = 0; i < 40; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${colors[i % colors.length]};
      left: 50%;
      top: 40%;
      pointer-events: none;
      z-index: 10;
    `;
    section.style.position = 'relative';
    section.appendChild(dot);

    gsap.to(dot, {
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 300 - 100,
      opacity: 0,
      scale: Math.random() * 0.5 + 0.5,
      duration: 1 + Math.random(),
      ease: 'power2.out',
      onComplete: () => dot.remove(),
    });
  }
}

import '../styles/main.css';
import '../styles/hero.css';
import '../styles/timeline.css';
import '../styles/market.css';
import '../styles/features.css';
import '../styles/cta.css';

import { initHero3D } from './hero-3d.js';
import { initTimelineScroll } from './scroll-timeline.js';
import { initFeaturesScroll } from './scroll-features.js';
import { initMarketLive } from './market-live.js';
import { initCtaForm } from './cta-form.js';
import { initNav } from './nav.js';

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  initNav();
  initHero3D();
  initTimelineScroll();
  initFeaturesScroll();
  initMarketLive();
  initCtaForm();
});

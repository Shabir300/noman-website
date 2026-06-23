# InvestOver Landing Page

High-fidelity animated landing page for **InvestOver** — an AI-powered investing platform with psychology-aware agents, live market analysis, and portfolio intelligence.

## Features

- **Hero** — Three.js 3D torus knot with mouse coordinate mapping + CSS 3D floating chips
- **About** — Sticky vertical scroll timeline with filling progress line
- **Live Market** — Real bullish/bearish sentiment from Finnhub API (SPY, QQQ, VIX)
- **Features** — Horizontal sticky scroll showcasing 7 platform capabilities
- **Early Access** — Waitlist form with localStorage demo storage

## Tech Stack

- Vite (vanilla JS)
- GSAP + ScrollTrigger
- Three.js
- Finnhub API

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure Finnhub API key**

   Copy `.env.example` to `.env` and add your free API key from [finnhub.io](https://finnhub.io):

   ```
   VITE_FINNHUB_API_KEY=your_key_here
   ```

3. **Run dev server**

   ```bash
   npm run dev
   ```

4. **Build for production**

   ```bash
   npm run build
   npm run preview
   ```

## Project Structure

```
investover-landing/
├── index.html
├── vite.config.js       # Finnhub proxy for dev
├── src/
│   ├── styles/          # Modular CSS
│   └── js/
│       ├── main.js
│       ├── hero-3d.js
│       ├── scroll-timeline.js
│       ├── scroll-features.js
│       ├── market-live.js
│       └── cta-form.js
└── public/
    └── favicon.svg
```

## Live Market Section

The market panel fetches real-time quotes for **SPY**, **QQQ**, and **VIX**, computes a weighted sentiment score, and generates human-readable reasons. Data refreshes every 60 seconds.

In development, requests are proxied through Vite to avoid CORS issues.

## Notes

- Waitlist signups are stored in `localStorage` under `investover_waitlist` (demo only).
- Animations respect `prefers-reduced-motion`.
- Mobile layout simplifies sticky scroll sections to vertical stacks.

## Disclaimer

Not financial advice. For informational purposes only.
# noman-website
# noman-website

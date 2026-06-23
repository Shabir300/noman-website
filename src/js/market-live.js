import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SYMBOLS = [
  { symbol: 'SPY', id: 'stat-spy', label: 'S&P 500 (SPY)', weight: 0.4, invert: false },
  { symbol: 'QQQ', id: 'stat-qqq', label: 'NASDAQ (QQQ)', weight: 0.4, invert: false },
  { symbol: 'VIX', id: 'stat-vix', label: 'Volatility (VIX)', weight: 0.2, invert: true },
];

let refreshInterval = null;

export function initMarketLive() {
  const retryBtn = document.getElementById('market-retry');
  retryBtn?.addEventListener('click', fetchMarketData);

  fetchMarketData();
  refreshInterval = setInterval(fetchMarketData, 60000);

  gsap.from('.market-header', {
    scrollTrigger: { trigger: '#market', start: 'top 80%' },
    opacity: 0,
    y: 40,
    duration: 0.8,
    ease: 'power3.out',
  });

  gsap.from('.market-grid > *', {
    scrollTrigger: { trigger: '#market', start: 'top 70%' },
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.12,
    ease: 'power3.out',
  });
}

async function fetchMarketData() {
  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
  const errorEl = document.getElementById('market-error');
  const reasonsList = document.getElementById('reasons-list');

  if (!apiKey || apiKey === 'your_finnhub_api_key_here') {
    showError(errorEl, reasonsList, 'Add VITE_FINNHUB_API_KEY to your .env file');
    return;
  }

  try {
    errorEl?.classList.add('hidden');

    const quoteResults = await Promise.allSettled(
      SYMBOLS.map((s) => fetchQuote(s.symbol, apiKey))
    );

    const quotes = quoteResults
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value);

    if (quotes.length === 0) {
      throw new Error('No quote data returned. Check your API key.');
    }

    let news = [];
    try {
      news = await fetchNews(apiKey);
    } catch {
      news = [];
    }

    const sentiment = computeSentiment(quotes);
    const reasons = buildReasons(quotes, news, sentiment);

    renderSentiment(sentiment);
    renderStats(quotes);
    renderReasons(reasonsList, reasons);

    document.getElementById('market-updated').textContent =
      `Updated ${new Date().toLocaleTimeString()}`;

    const panel = document.querySelector('.market-sentiment');
    panel?.classList.remove('pulse');
    void panel?.offsetWidth;
    panel?.classList.add('pulse');
  } catch (err) {
    console.error('Market fetch error:', err);
    showError(errorEl, reasonsList, err.message || 'Failed to fetch market data');
  }
}

async function fetchQuote(symbol, apiKey) {
  const isDev = import.meta.env.DEV;
  const url = isDev
    ? `/api/finnhub/quote?symbol=${encodeURIComponent(symbol)}`
    : `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Quote fetch failed for ${symbol}`);
  const data = await res.json();
  if (!data || (data.c === 0 && data.pc === 0)) {
    throw new Error(`No quote data for ${symbol}`);
  }
  return { symbol, ...data };
}

async function fetchNews(apiKey) {
  const isDev = import.meta.env.DEV;
  const url = isDev
    ? `/api/finnhub/news?category=general`
    : `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

function computeSentiment(quotes) {
  let score = 0;
  let totalWeight = 0;

  quotes.forEach((q) => {
    const config = SYMBOLS.find((s) => s.symbol === q.symbol);
    if (!config) return;

    const changePct = q.dp ?? 0;
    let point = 0;
    if (changePct > 0.3) point = 1;
    else if (changePct < -0.3) point = -1;

    if (config.invert) point = -point;

    score += point * config.weight;
    totalWeight += config.weight;
  });

  if (totalWeight === 0) totalWeight = 1;

  const normalized = score / totalWeight;
  let label, confidence, type;

  if (normalized > 0.2) {
    label = 'Bullish';
    type = 'bullish';
    confidence = Math.min(95, Math.round(55 + normalized * 40));
  } else if (normalized < -0.2) {
    label = 'Bearish';
    type = 'bearish';
    confidence = Math.min(95, Math.round(55 + Math.abs(normalized) * 40));
  } else {
    label = 'Neutral';
    type = 'neutral';
    confidence = Math.round(50 + (0.2 - Math.abs(normalized)) * 25);
  }

  return { label, confidence, type, score: normalized };
}

function buildReasons(quotes, news, sentiment) {
  const reasons = [];

  quotes.forEach((q) => {
    const config = SYMBOLS.find((s) => s.symbol === q.symbol);
    if (!config) return;

    const change = q.dp ?? 0;
    const sign = change >= 0 ? 'up' : 'down';
    const absChange = Math.abs(change).toFixed(2);

    if (config.symbol === 'SPY') {
      reasons.push({
        text: `Broad market (SPY) ${sign} ${absChange}% — ${change >= 0 ? 'equities gaining ground' : 'broad selling pressure'}`,
        type: change >= 0 ? 'bullish' : 'bearish',
      });
    } else if (config.symbol === 'QQQ') {
      reasons.push({
        text: `Tech-heavy NASDAQ (QQQ) ${sign} ${absChange}% — ${change >= 0 ? 'risk appetite rising in growth stocks' : 'tech sector under pressure'}`,
        type: change >= 0 ? 'bullish' : 'bearish',
      });
    } else if (config.symbol === 'VIX') {
      const vixBullish = change < 0;
      reasons.push({
        text: `VIX ${sign} ${absChange}% — ${vixBullish ? 'fear subsiding, volatility compressing' : 'uncertainty rising, hedging demand up'}`,
        type: vixBullish ? 'bullish' : 'bearish',
      });
    }
  });

  if (news?.length > 0) {
    const headline = news[0].headline || news[0].summary;
    if (headline) {
      reasons.push({
        text: `Latest headline: "${headline.slice(0, 120)}${headline.length > 120 ? '…' : ''}"`,
        type: 'neutral',
      });
    }
  }

  reasons.push({
    text: `Composite signal: ${sentiment.label} with ${sentiment.confidence}% confidence based on index weighting`,
    type: sentiment.type,
  });

  return reasons.slice(0, 4);
}

function renderSentiment({ label, confidence, type }) {
  const labelEl = document.getElementById('sentiment-label');
  const confEl = document.getElementById('sentiment-confidence');
  const iconEl = document.getElementById('sentiment-icon');
  const gaugeFill = document.getElementById('gauge-fill');

  if (labelEl) labelEl.textContent = label;
  if (confEl) confEl.textContent = `${confidence}% confidence`;

  iconEl?.classList.remove('bullish', 'bearish', 'neutral');
  iconEl?.classList.add(type);

  const iconName = type === 'bullish' ? 'trending-up' : type === 'bearish' ? 'trending-down' : 'minus';
  if (iconEl) {
    iconEl.innerHTML = `<i data-lucide="${iconName}"></i>`;
    if (window.lucide) lucide.createIcons({ nodes: iconEl.querySelectorAll('[data-lucide]') });
  }

  gaugeFill?.classList.remove('bullish', 'bearish', 'neutral');
  gaugeFill?.classList.add(type);

  const offset = 251 - (confidence / 100) * 251;
  if (gaugeFill) gaugeFill.style.strokeDashoffset = String(offset);
}

function renderStats(quotes) {
  quotes.forEach((q) => {
    const config = SYMBOLS.find((s) => s.symbol === q.symbol);
    if (!config) return;
    const card = document.getElementById(config.id);
    if (!card) return;

    const valueEl = card.querySelector('.stat-value');
    const changeEl = card.querySelector('.stat-change');
    const change = q.dp ?? 0;
    const price = q.c ?? 0;

    if (valueEl) {
      animateNumber(valueEl, price, price >= 100 ? 0 : 2);
    }

    if (changeEl) {
      const sign = change >= 0 ? '+' : '';
      changeEl.textContent = `${sign}${change.toFixed(2)}%`;
      changeEl.classList.remove('up', 'down', 'flat');
      if (change > 0.05) changeEl.classList.add('up');
      else if (change < -0.05) changeEl.classList.add('down');
      else changeEl.classList.add('flat');
    }
  });
}

function animateNumber(el, target, decimals) {
  const start = parseFloat(el.textContent) || 0;
  if (isNaN(start) || el.textContent === '—') {
    el.textContent = target.toFixed(decimals);
    return;
  }
  gsap.to({ val: start }, {
    val: target,
    duration: 1,
    ease: 'power2.out',
    onUpdate: function () {
      el.textContent = this.targets()[0].val.toFixed(decimals);
    },
  });
}

function renderReasons(listEl, reasons) {
  if (!listEl) return;
  listEl.innerHTML = '';
  reasons.forEach((r) => {
    const li = document.createElement('li');
    li.textContent = r.text;
    if (r.type === 'bearish') li.classList.add('bearish-reason');
    else if (r.type === 'neutral') li.classList.add('neutral-reason');
    listEl.appendChild(li);
  });
}

function showError(errorEl, reasonsList, message) {
  errorEl?.classList.remove('hidden');
  const p = errorEl?.querySelector('p');
  if (p) p.innerHTML = `${message}. Add your key to <code>.env</code> as <code>VITE_FINNHUB_API_KEY</code>`;
  if (reasonsList) reasonsList.innerHTML = '';
}

export function destroyMarketLive() {
  if (refreshInterval) clearInterval(refreshInterval);
}

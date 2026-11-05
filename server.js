/**
 * صيّاد الأسعار — Price Hunter Egypt
 * Server: real-time price aggregation from Egyptian electronics stores.
 *
 * Live sources (server-side fetch, real prices + real product pages):
 *   - Dream 2000  (Shopify predictive-search API)
 *   - Vontx/فونكس (storefront search page parsing)
 *   - Etisal Store (public search API)
 *   - Miami Centers (WooCommerce Store API)
 *   - Dubai Phone  (WooCommerce Store API @ dubaiphone.net — retried each search)
 *
 * Deep-link sources (stores that block datacenter IPs — Jumia, Noon, Amazon EG,
 * 2B, B.TECH, Raneen): we never fabricate results for them. The API returns an
 * honest `storeLinks` list with a direct URL to that store's own search page.
 *
 * © Tarek Abozaid — 2026
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const FETCH_TIMEOUT = 9000;
const CACHE_TTL = 5 * 60 * 1000;
const SUGG_TTL = 10 * 60 * 1000;
const STORE_BUDGET_MS = 14000; // hard cap per store so /api/search always answers fast

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function enc(s) { return encodeURIComponent(s); }

const STORES = {
  dream2000: { id: 'dream2000', ar: 'دريم 2000', en: 'Dream 2000', color: '#EF4444', domain: 'dream2000.com', live: true },
  vontx:     { id: 'vontx',     ar: 'فونكس',     en: 'Vontx',      color: '#2DD4BF', domain: 'vontx.com', live: true },
  etisal:    { id: 'etisal',    ar: 'اتصال ستور', en: 'Etisal Store', color: '#10B981', domain: 'etisalstore.com', live: true },
  miami:     { id: 'miami',     ar: 'ميامي سنترز', en: 'Miami Centers', color: '#FB923C', domain: 'miamicenters.com', live: true },
  dubai:     { id: 'dubai',     ar: 'دبي فون',   en: 'Dubai Phone', color: '#06B6D4', domain: 'dubaiphone.net', live: true },
  jumia:  { id: 'jumia',  ar: 'جوميا',     en: 'Jumia',         color: '#FF6B00', domain: 'jumia.com.eg', live: false, searchUrl: q => `https://www.jumia.com.eg/catalog/?q=${enc(q)}` },
  noon:   { id: 'noon',   ar: 'نون',       en: 'Noon',          color: '#FDE047', domain: 'noon.com', live: false, searchUrl: q => `https://www.noon.com/egypt-ar/search/?q=${enc(q)}` },
  amazon: { id: 'amazon', ar: 'أمازون مصر', en: 'Amazon Egypt',  color: '#F59E0B', domain: 'amazon.eg', live: false, searchUrl: q => `https://www.amazon.eg/s?k=${enc(q)}` },
  b2:     { id: 'b2',     ar: '2B',        en: '2B',            color: '#FACC15', domain: '2b.com.eg', live: false, searchUrl: q => `https://2b.com.eg/en/catalogsearch/result/?q=${enc(q)}` },
  btech:  { id: 'btech',  ar: 'بي تك',     en: 'B.TECH',        color: '#DC2626', domain: 'btech.com', live: false, searchUrl: q => `https://btech.com/ar/s?q=${enc(q)}` },
  raneen: { id: 'raneen', ar: 'رنين',      en: 'Raneen',        color: '#A78BFA', domain: 'raneen.com', live: false, searchUrl: q => `https://www.raneen.com/en/catalogsearch/result/?q=${enc(q)}` },
};
STORES.dubai.searchUrl = q => `https://www.dubaiphone.net/?s=${enc(q)}&post_type=product`;

const AR2EN = {
  'سماعات': 'earbuds', 'سماعة': 'earbuds', 'سماع': 'earbuds', 'ايربودز': 'earbuds', 'إيربودز': 'earbuds', 'ايربود': 'earbuds',
  'ايرپودز': 'earbuds', 'هيدفون': 'headphones', 'هدسيت': 'headset',
  'هواوي': 'huawei', 'هواوى': 'huawei', 'سامسونج': 'samsung', 'ايفون': 'iphone', 'آيفون': 'iphone', 'إيفون': 'iphone',
  'أيفون': 'iphone', 'شاومي': 'xiaomi', 'ريلمي': 'realme', 'اوبو': 'oppo', 'أوبو': 'oppo', 'فيفو': 'vivo',
  'انفينكس': 'infinix', 'إنفينكس': 'infinix', 'تكنو': 'tecno', 'هونر': 'honor', 'نوكيا': 'nokia',
  'موتورولا': 'motorola', 'بكسل': 'pixel', 'جوجل بكسل': 'google pixel',
  'لابتوب': 'laptop', 'لاب': 'laptop', 'لاب توب': 'laptop', 'نوت بوك': 'laptop', 'نوتبوك': 'laptop',
  'تلفزيون': 'tv', 'تلفزيونات': 'tv', 'شاشة': 'monitor', 'شاشات': 'monitor',
  'ساعة': 'smart watch', 'ساعات': 'smart watch', 'ساعة ذكية': 'smart watch',
  'تابلت': 'tablet', 'تاب': 'tablet', 'تابلتات': 'tablet',
  'بلايستيشن': 'playstation', 'اكس بوكس': 'xbox', 'جيمينج': 'gaming',
  'ماوس': 'mouse', 'كيبورد': 'keyboard', 'كيبوردات': 'keyboard',
  'شاحن': 'charger', 'شواحن': 'charger', 'باور بانك': 'power bank', 'باوربانك': 'power bank',
  'ساوندكور': 'soundcore', 'انكر': 'anker',
  'غسالة': 'washing machine', 'ثلاجة': 'refrigerator', 'تلاجة': 'refrigerator',
  'ميكروويف': 'microwave', 'مكواة': 'iron', 'مروحة': 'fan', 'مراوح': 'fan',
  'مكيف': 'air conditioner', 'تكييف': 'air conditioner',
  'سبيكر': 'speaker', 'سبيكرات': 'speaker', 'مكبر صوت': 'speaker',
  'موبايل': 'mobile', 'موبايلات': 'mobile', 'تليفون': 'mobile', 'تلفون': 'mobile', 'جوال': 'mobile',
  'كاميرا': 'camera', 'طابعة': 'printer', 'طابعات': 'printer',
  'فري بودز': 'freebuds', 'فريبودز': 'freebuds', 'بادز': 'buds',
};
function translateQuery(q) {
  let out = [];
  for (const token of q.split(/\s+/)) {
    const t = token.trim();
    if (!t) continue;
    const bare = t.replace(/[ًٌٍَُِّْ]/g, '');
    const mapped = AR2EN[t] ?? AR2EN[bare] ?? null;
    if (/[\u0600-\u06FF]/.test(t)) {
      if (mapped === undefined || mapped === null) continue;
      if (mapped !== '') out.push(...mapped.split(' '));
    } else {
      out.push(t);
    }
  }
  const en = [...new Set(out)].join(' ').trim();
  return en;
}

async function fetchWithTimeout(url, opts = {}, timeout = FETCH_TIMEOUT) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': UA,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ar-EG,ar;q=0.9,en;q=0.8',
        ...(opts.headers || {}),
      },
      redirect: 'follow',
      ...opts,
    });
    return res;
  } finally { clearTimeout(t); }
}

function normalizeProduct(p) {
  const discount = (p.originalPrice && p.originalPrice > p.price)
    ? Math.round((1 - p.price / p.originalPrice) * 100) : null;
  return {
    id: p.id,
    title: p.title,
    titleAr: p.titleAr || null,
    store: p.store,
    price: Math.round(p.price),
    originalPrice: p.originalPrice ? Math.round(p.originalPrice) : null,
    discount,
    url: p.url,
    image: p.image || null,
    availability: p.availability !== false,
    status: 'live',
    lastUpdated: new Date().toISOString(),
  };
}

async function searchDream2000(q) {
  const url = `https://dream2000.com/en/search/suggest.json?q=${enc(q)}&resources%5Btype%5D=product&resources%5Blimit%5D=8&resources%5Boptions%5D%5Bfields%5D=title,product_type,vendor`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`dream2000 HTTP ${res.status}`);
  const data = await res.json();
  const products = (data?.resources?.results?.products) || [];
  return products.map(p => normalizeProduct({
    id: `dream2000_${p.id}`,
    title: p.title,
    titleAr: p.title,
    store: 'dream2000',
    price: parseFloat(p.price || p.price_min || 0),
    originalPrice: parseFloat(p.compare_at_price_max || 0) || null,
    url: 'https://dream2000.com' + String(p.url || `/en/products/${p.handle}`).split('?')[0],
    image: p.image || p.featured_image?.url || null,
    availability: p.available !== false,
  })).filter(p => p.price > 0 && p.url);
}

async function searchVontx(q) {
  const res = await fetchWithTimeout(`https://vontx.com/search?q=${enc(q)}`, { headers: { 'Accept': 'text/html' } });
  if (!res.ok) throw new Error(`vontx HTTP ${res.status}`);
  const html = await res.text();
  const out = [];
  const re = /data-product-options='((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const raw = m[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/\\"/g, '"');
      const j = JSON.parse(raw);
      const price = (Number(j.price) || 0) / 100;
      if (!price || !j.handle) continue;
      let img = String(j.image2 || '').replace(/\\u0026/g, '&').replace(/\\\//g, '/');
      img = img.replace(/[?&]width=\d+$/, '');
      const title = (j.alt && String(j.alt).trim()) || String(j.handle).replace(/-/g, ' ').trim();
      out.push(normalizeProduct({
        id: `vontx_${j.id || j.handle}`,
        title,
        titleAr: j.alt || title,
        store: 'vontx',
        price,
        originalPrice: (Number(j.compare_at_price) || 0) / 100 || null,
        url: `https://vontx.com/products/${j.handle}`,
        image: img || null,
        availability: j.available !== false,
      }));
    } catch (e) { /* skip malformed card */ }
  }
  if (!out.length) throw new Error('vontx: no products parsed');
  return out.slice(0, 8);
}

async function searchEtisal(q) {
  const res = await fetchWithTimeout(`https://etisalstore.com/api/customer/products/search?q=${enc(q)}`);
  if (!res.ok) throw new Error(`etisal HTTP ${res.status}`);
  const data = await res.json();
  const products = (data?.data?.products) || [];
  return products.map(p => {
    const price = Number(p.discount_price || p.price) || 0;
    return normalizeProduct({
      id: `etisal_${p.id}`,
      title: p.name_en || p.name,
      titleAr: p.name_ar || p.name,
      store: 'etisal',
      price,
      originalPrice: (Number(p.price) > price) ? Number(p.price) : null,
      url: p.share_link || `https://etisalstore.com/en/${p.slug}`,
      image: p.image || null,
      availability: p.in_stock !== false && p.active !== false,
    });
  }).filter(p => p.price > 0 && p.url);
}

async function searchMiami(q) {
  const res = await fetchWithTimeout(`https://miamicenters.com/wp-json/wc/store/v1/products?search=${enc(q)}&perPage=8`);
  if (!res.ok) throw new Error(`miami HTTP ${res.status}`);
  const products = await res.json();
  return products.map(p => {
    const price = parseInt(p.prices?.price) || 0;
    const reg = parseInt(p.prices?.regular_price) || 0;
    return normalizeProduct({
      id: `miami_${p.id}`,
      title: p.name,
      titleAr: p.name,
      store: 'miami',
      price,
      originalPrice: reg > price ? reg : null,
      url: p.permalink,
      image: p.images?.[0]?.src || null,
      availability: p.is_in_stock !== false,
    });
  }).filter(p => p.price > 0 && p.url);
}

async function searchDubai(q) {
  const res = await fetchWithTimeout(`https://www.dubaiphone.net/wp-json/wc/store/v1/products?search=${enc(q)}&perPage=6`);
  if (!res.ok) throw new Error(`dubai HTTP ${res.status}`);
  const products = await res.json();
  if (!Array.isArray(products)) throw new Error('dubai: challenge');
  return products.map(p => {
    const price = parseInt(p.prices?.price) || 0;
    const reg = parseInt(p.prices?.regular_price) || 0;
    return normalizeProduct({
      id: `dubai_${p.id}`,
      title: p.name,
      titleAr: p.name,
      store: 'dubai',
      price,
      originalPrice: reg > price ? reg : null,
      url: p.permalink,
      image: p.images?.[0]?.src || null,
      availability: p.is_in_stock !== false,
    });
  }).filter(p => p.price > 0 && p.url);
}

const LIVE_ADAPTERS = {
  dream2000: { fn: searchDream2000, prefer: 'original' },
  vontx:     { fn: searchVontx,     prefer: 'original' },
  etisal:    { fn: searchEtisal,    prefer: 'original' },
  miami:     { fn: searchMiami,     prefer: 'translated' },
  dubai:     { fn: searchDubai,     prefer: 'translated' },
};

function relevanceFilter(products, qOriginal, qTranslated) {
  const tokenSource = [...new Set([...qOriginal.split(/\s+/), ...qTranslated.split(/\s+/)])];
  const tokens = tokenSource.map(t => t.trim().toLowerCase()).filter(t => t.length >= (/\d/.test(t) ? 2 : 3));
  if (!tokens.length) return products;
  return products.filter(p => {
    const hay = `${p.title} ${p.titleAr || ''} ${p.url}`.toLowerCase();
    return tokens.some(t => hay.includes(t));
  });
}

const searchCache = new Map();

async function searchStore(storeId, qOriginal, qTranslated) {
  const adapter = LIVE_ADAPTERS[storeId];
  const first = adapter.prefer === 'translated' ? qTranslated : qOriginal;
  const second = first === qTranslated ? qOriginal : qTranslated;
  const latinTokens = [...new Set([...qOriginal.split(/\s+/), ...qTranslated.split(/\s+/)]
    .filter(t => /^[\w\d.-]{3,}$/.test(t)))]
    .sort((a, b) => b.length - a.length);
  const latinPhrase = latinTokens.join(' ').trim();
  const attempts = [...new Set([first, second, latinPhrase, ...latinTokens].filter(Boolean))].slice(0, 5);
  let lastErr = null;
  const deadline = Date.now() + STORE_BUDGET_MS;
  for (const q of attempts) {
    if (Date.now() > deadline) { lastErr = lastErr || new Error('store budget exceeded'); break; }
    try {
      const products = await adapter.fn(q);
      if (products.length) return products;
      lastErr = new Error('empty');
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('no results');
}

async function aggregateSearch(query) {
  const qOriginal = (query || '').trim();
  if (!qOriginal) return { query: qOriginal, results: [], storeLinks: [], storeStatus: [] };
  const qTranslated = translateQuery(qOriginal) || qOriginal;

  const liveIds = Object.keys(LIVE_ADAPTERS);
  const withDeadline = (p, id) => {
    let t;
    return Promise.race([
      p,
      new Promise((_, rej) => { t = setTimeout(() => rej(new Error(`${id}: deadline ${STORE_BUDGET_MS}ms`)), STORE_BUDGET_MS); }),
    ]).finally(() => clearTimeout(t));
  };
  const settled = await Promise.allSettled(liveIds.map(id => withDeadline(searchStore(id, qOriginal, qTranslated), id)));

  const results = [];
  const storeStatus = [];
  settled.forEach((s, i) => {
    const id = liveIds[i];
    if (s.status === 'fulfilled' && s.value.length) {
      const relevant = relevanceFilter(s.value, qOriginal, qTranslated);
      const kept = relevant.length ? relevant : s.value;
      results.push(...kept);
      storeStatus.push({ id, mode: 'live', count: kept.length });
    } else {
      const err = s.status === 'rejected' ? String(s.reason?.message || s.reason) : 'empty';
      storeStatus.push({ id, mode: 'link', count: 0, error: err.slice(0, 80) });
    }
  });

  const storeLinks = Object.values(STORES)
    .filter(s => !s.live || storeStatus.find(x => x.id === s.id && x.mode === 'link'))
    .map(s => ({
      id: s.id, ar: s.ar, en: s.en, color: s.color, domain: s.domain,
      url: s.searchUrl ? s.searchUrl(qOriginal) : null,
      live: !!s.live,
    }));

  results.sort((a, b) => (a.availability === b.availability) ? a.price - b.price : (a.availability ? -1 : 1));

  return { query: qOriginal, results, storeLinks, storeStatus };
}

const suggCache = new Map();

async function buildSuggestions(q) {
  const qOriginal = (q || '').trim();
  if (!qOriginal) return [];
  const qTranslated = translateQuery(qOriginal) || qOriginal;

  let lists = [[], []];
  try {
    const r = await Promise.race([
      Promise.all([searchDream2000(qTranslated).catch(() => []), searchEtisal(qOriginal).catch(() => [])]),
      new Promise(res => setTimeout(() => res([[], []]), 3500)),
    ]);
    lists = r;
  } catch (e) { /* defaults */ }

  const [dream, etisal] = lists;
  const suggestions = [];
  const seen = new Set();
  for (const p of [...(dream || []).slice(0, 3), ...(etisal || []).slice(0, 3)]) {
    const key = (p.title || '').toLowerCase().slice(0, 40);
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push({
      type: 'product',
      title: p.title,
      titleAr: p.titleAr || p.title,
      store: p.store,
      storeName: STORES[p.store]?.ar || p.store,
      price: p.price,
      image: p.image,
      url: p.url,
      query: p.title,
    });
  }
  suggestions.unshift({
    type: 'search',
    title: `ابحث عن "${qOriginal}" في كل المتاجر`,
    query: qOriginal,
    icon: '🔍',
  });
  return suggestions.slice(0, 6);
}

const DATA_DIR = path.join(__dirname, 'data');
function loadJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8')); }
  catch (e) { return fallback; }
}
function saveJson(file, obj) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(obj, null, 2));
  } catch (e) { console.error('persist error', e.message); }
}

app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 2) return res.status(400).json({ ok: false, error: 'query too short' });
  const cacheKey = q.toLowerCase();
  const started = Date.now();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return res.json({ ...cached.data, cached: true, tookSeconds: ((Date.now() - started) / 1000).toFixed(1) });
  }
  try {
    const data = await aggregateSearch(q);
    const available = data.results.filter(p => p.availability);
    const payload = {
      ok: true,
      query: q,
      live: true,
      count: data.results.length,
      storesWithHits: new Set(data.results.map(p => p.store)).size,
      avgPrice: available.length ? Math.round(available.reduce((a, b) => a + b.price, 0) / available.length) : 0,
      minPrice: available.length ? Math.min(...available.map(p => p.price)) : 0,
      results: data.results,
      storeLinks: data.storeLinks,
      storeStatus: data.storeStatus,
      tookSeconds: ((Date.now() - started) / 1000).toFixed(1),
      timestamp: new Date().toISOString(),
    };
    searchCache.set(cacheKey, { at: Date.now(), data: payload });
    if (searchCache.size > 60) {
      const oldest = [...searchCache.entries()].sort((a, b) => a[1].at - b[1].at)[0];
      if (oldest) searchCache.delete(oldest[0]);
    }
    res.json(payload);
  } catch (e) {
    console.error('search error', e);
    res.status(500).json({ ok: false, error: 'search failed', results: [], storeLinks: [] });
  }
});

app.get('/api/suggestions', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  const key = q.toLowerCase();
  const cached = suggCache.get(key);
  if (cached && Date.now() - cached.at < SUGG_TTL) return res.json(cached.data);
  const data = await buildSuggestions(q);
  suggCache.set(key, { at: Date.now(), data });
  res.json(data);
});

app.get('/api/stores', (req, res) => res.json(Object.values(STORES)));

app.get('/api/health', (req, res) => res.json({
  ok: true,
  live: true,
  liveStores: Object.keys(LIVE_ADAPTERS),
  subscribers: loadJson('subscribers.json', []).length,
  alerts: loadJson('alerts.json', []).length,
  uptime: process.uptime(),
  time: new Date().toISOString(),
}));

app.post('/api/subscribe', (req, res) => {
  const { contact, type, query, source } = req.body || {};
  if (!contact || !type) return res.status(400).json({ ok: false, error: 'missing fields' });
  const clean = String(contact).trim();
  const isEmail = type === 'email';
  if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return res.status(400).json({ ok: false, error: 'invalid email' });
  if (!isEmail && !/^(\+?2?01[0-9]{9})$/.test(clean.replace(/[\s-]/g, ''))) {
    return res.status(400).json({ ok: false, error: 'invalid whatsapp number' });
  }
  const list = loadJson('subscribers.json', []);
  const exists = list.some(s => s.contact.toLowerCase() === clean.toLowerCase() && s.type === type);
  if (exists) return res.json({ ok: true, already: true, message: 'الإيميل/الرقم مسجل عندنا بالفعل ✅' });
  const sub = {
    id: list.length + 1, contact: clean, type,
    query: query || null, source: source || 'site',
    createdAt: new Date().toISOString(),
  };
  list.push(sub);
  saveJson('subscribers.json', list);
  console.log(`🔔 New subscriber [${type}]: ${clean} (query: ${query || '-'})`);
  res.json({
    ok: true,
    message: isEmail
      ? 'تم تسجيل إيميلك ✅ هنبعتلك الأسعار الجديدة أول بأول'
      : 'تم تسجيل رقمك ✅ هنبعتلك الأسعار الجديدة على الواتساب',
  });
});
app.get('/api/subscribers', (req, res) => res.json(loadJson('subscribers.json', [])));

app.post('/api/alerts', (req, res) => {
  const { productId, productTitle, store, price, contact, type, targetPrice } = req.body || {};
  if (!contact || !productId) return res.status(400).json({ ok: false, error: 'Missing fields' });
  const list = loadJson('alerts.json', []);
  const alert = {
    id: list.length + 1, productId, productTitle, store, price,
    contact, type, targetPrice: targetPrice || price,
    createdAt: new Date().toISOString(),
  };
  list.push(alert);
  saveJson('alerts.json', list);
  console.log(`🔔 Price alert: ${type} ${contact} for ${productTitle} @ ${price}`);
  res.json({
    ok: true, alert,
    message: type === 'email' ? 'تم تفعيل التنبيه عبر الإيميل' : 'تم تفعيل التنبيه عبر الواتساب',
  });
});
app.get('/api/alerts', (req, res) => res.json(loadJson('alerts.json', [])));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Price Hunter Egypt (LIVE aggregation) running on http://0.0.0.0:${PORT}`);
});

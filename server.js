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
 *   - Annoshka     (WooCommerce Store API @ annoshka.com)
 *   - Shift Store  (WooCommerce Store API @ shiftstore-eg.com)
 *   - iMedia Stores(WooCommerce search-page parsing @ imediastores.com)
 *   - XPRS         (Shopify predictive-search @ myxprs.com)
 *   - Kimo Store   (Shopify predictive-search @ kimostore.net)
 *   - IQ Mobiles   (storefront search-page parsing @ iq-mobiles.com)
 *   - El Shennawy  (OpenCart search-page parsing @ elshennawy.com)
 *
 * Deep-link sources (stores that block datacenter IPs — Jumia, Noon, Amazon EG,
 * 2B, B.TECH, Raneen, Kaza): we never fabricate results for them. The API returns an
 * honest `storeLinks` list with a direct URL to that store's own search page.
 *
 * Visitor analytics: every pageview and every search is logged (IP, country,
 * city, device, browser, OS, referrer) and exposed to the /admin panel via a
 * token-protected API. Subscribers (emails/WhatsApp numbers) are stored in
 * data/subscribers.json and shown in the same panel.
 *
 * © Tarek Abozaid — 2026
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const FETCH_TIMEOUT = 9000;
const CACHE_TTL = 5 * 60 * 1000;
const SUGG_TTL = 10 * 60 * 1000;
const STORE_BUDGET_MS = 14000; // hard cap per store so /api/search always answers fast

app.use(cors());
app.use(express.json());
app.use(trackMiddleware); // visitor analytics (pageviews) — defined below
app.use(express.static(path.join(__dirname, 'public')));

function enc(s) { return encodeURIComponent(s); }

const STORES = {
  dream2000: { id: 'dream2000', ar: 'دريم 2000', en: 'Dream 2000', color: '#EF4444', domain: 'dream2000.com', live: true },
  vontx:     { id: 'vontx',     ar: 'فونكس',     en: 'Vontx',      color: '#2DD4BF', domain: 'vontx.com', live: true },
  etisal:    { id: 'etisal',    ar: 'اتصال ستور', en: 'Etisal Store', color: '#10B981', domain: 'etisalstore.com', live: true },
  miami:     { id: 'miami',     ar: 'ميامي سنترز', en: 'Miami Centers', color: '#FB923C', domain: 'miamicenters.com', live: true },
  dubai:     { id: 'dubai',     ar: 'دبي فون',   en: 'Dubai Phone', color: '#06B6D4', domain: 'dubaiphone.net', live: true },
  imedia:    { id: 'imedia',    ar: 'آي ميديا',  en: 'iMedia Stores', color: '#3B82F6', domain: 'imediastores.com', live: true },
  annoshka:  { id: 'annoshka',  ar: 'أنوشكا',    en: 'Annoshka',    color: '#F472B6', domain: 'annoshka.com', live: true },
  shift:     { id: 'shift',     ar: 'شِفت ستور', en: 'Shift Store', color: '#6366F1', domain: 'shiftstore-eg.com', live: true },
  xprs:      { id: 'xprs',      ar: 'XPRS',      en: 'XPRS',        color: '#0EA5E9', domain: 'myxprs.com', live: true },
  kimo:      { id: 'kimo',      ar: 'كيمو ستور', en: 'Kimo Store', color: '#F59E0B', domain: 'kimostore.net', live: true },
  iq:        { id: 'iq',        ar: 'آي كيو موبايلز', en: 'IQ Mobiles', color: '#84CC16', domain: 'iq-mobiles.com', live: true },
  shennawy:  { id: 'shennawy',  ar: 'الشناوي',   en: 'El Shennawy', color: '#A855F7', domain: 'elshennawy.com', live: true },
  jumia:  { id: 'jumia',  ar: 'جوميا',     en: 'Jumia',         color: '#FF6B00', domain: 'jumia.com.eg', live: false, searchUrl: q => `https://www.jumia.com.eg/catalog/?q=${enc(q)}` },
  noon:   { id: 'noon',   ar: 'نون',       en: 'Noon',          color: '#FDE047', domain: 'noon.com', live: false, searchUrl: q => `https://www.noon.com/egypt-ar/search/?q=${enc(q)}` },
  amazon: { id: 'amazon', ar: 'أمازون مصر', en: 'Amazon Egypt',  color: '#F59E0B', domain: 'amazon.eg', live: false, searchUrl: q => `https://www.amazon.eg/s?k=${enc(q)}` },
  b2:     { id: 'b2',     ar: '2B',        en: '2B',            color: '#FACC15', domain: '2b.com.eg', live: false, searchUrl: q => `https://2b.com.eg/en/catalogsearch/result/?q=${enc(q)}` },
  btech:  { id: 'btech',  ar: 'بي تك',     en: 'B.TECH',        color: '#DC2626', domain: 'btech.com', live: false, searchUrl: q => `https://btech.com/ar/s?q=${enc(q)}` },
  raneen: { id: 'raneen', ar: 'رنين',      en: 'Raneen',        color: '#A78BFA', domain: 'raneen.com', live: false, searchUrl: q => `https://www.raneen.com/en/catalogsearch/result/?q=${enc(q)}` },
  kaza:   { id: 'kaza',   ar: 'كازا',      en: 'Kaza',          color: '#E11D48', domain: 'kaza.com.eg', live: false, searchUrl: q => `https://kaza.com.eg/?s=${enc(q)}&post_type=product` },
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


/* ============================================================
   New store adapters (2026-11 batch)
   - makeWooAdapter: generic WooCommerce Store API (annoshka, shift)
   - makeShopifyAdapter: generic Shopify predictive search (xprs, kimo)
   - searchIq: iq-mobiles.com storefront search page (x-labels-data JSON)
   - searchElshennawy: elshennawy.com OpenCart search page
   - searchImedia: imediastores.com WooCommerce (Electro theme) search page
   ============================================================ */
function decodeEntities(s) {
  return String(s || '')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#8211;/g, '–').replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .trim();
}

function makeWooAdapter(storeId, domain, perPage = 8) {
  return async function wooSearch(q) {
    const res = await fetchWithTimeout(`https://${domain}/wp-json/wc/store/v1/products?search=${enc(q)}&perPage=${perPage}`);
    if (!res.ok) throw new Error(`${storeId} HTTP ${res.status}`);
    const products = await res.json();
    if (!Array.isArray(products)) throw new Error(`${storeId}: challenge`);
    const out = products.map(p => {
      const minor = parseInt(p.prices?.currency_minor_unit ?? '2') || 0;
      const div = Math.pow(10, minor);
      const price = (parseInt(p.prices?.price) || 0) / div;
      const reg = (parseInt(p.prices?.regular_price) || 0) / div;
      return normalizeProduct({
        id: `${storeId}_${p.id}`,
        title: decodeEntities(p.name || ''),
        titleAr: decodeEntities(p.name || ''),
        store: storeId,
        price,
        originalPrice: reg > price ? reg : null,
        url: p.permalink,
        image: p.images?.[0]?.src || null,
        availability: p.is_in_stock !== false,
      });
    }).filter(p => p.price > 0 && p.url);
    if (!out.length) throw new Error(`${storeId}: empty`);
    return out.slice(0, perPage);
  };
}

function makeShopifyAdapter(storeId, domain) {
  return async function shopifySearch(q) {
    const url = `https://${domain}/search/suggest.json?q=${enc(q)}&resources%5Btype%5D=product&resources%5Blimit%5D=8&resources%5Boptions%5D%5Bfields%5D=title,product_type,vendor`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`${storeId} HTTP ${res.status}`);
    const data = await res.json();
    const products = (data?.resources?.results?.products) || [];
    return products.map(p => normalizeProduct({
      id: `${storeId}_${p.id}`,
      title: p.title,
      titleAr: p.title,
      store: storeId,
      price: parseFloat(p.price || p.price_min || 0),
      originalPrice: parseFloat(p.compare_at_price_max || 0) || null,
      url: `https://${domain}` + String(p.url || `/products/${p.handle}`).split('?')[0],
      image: p.image || p.featured_image?.url || null,
      availability: p.available !== false,
    })).filter(p => p.price > 0 && p.url);
  };
}

/* IQ Mobiles — Shopify storefront /search?q= renders product cards with an
   x-labels-data=" { ...JSON with id/title/price/compare_at_price... } " attribute. */
async function searchIq(q) {
  const res = await fetchWithTimeout(`https://iq-mobiles.com/search?q=${enc(q)}`, { headers: { 'Accept': 'text/html' } });
  if (!res.ok) throw new Error(`iq HTTP ${res.status}`);
  const html = await res.text();
  const out = [];
  const seen = new Set();
  const re = /x-labels-data="\s*(\{(?:[^"]|&quot;)*?\})\s*"/g;
  let m;
  while ((m = re.exec(html)) !== null && out.length < 8) {
    try {
      const raw = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      const j = JSON.parse(raw);
      const price = (Number(j.price) || 0) / 100;
      const compare = (Number(j.compare_at_price) || 0) / 100;
      if (!price || !j.id || seen.has(String(j.id))) continue;
      // product link: the <a href="/products/..."> that opens this card sits BEFORE x-labels-data
      const before = html.slice(Math.max(0, m.index - 4000), m.index);
      const linkMatches = [...before.matchAll(/<a\s+href="(\/products\/[^"]+)"/g)];
      const linkM = linkMatches.length ? linkMatches[linkMatches.length - 1] : null;
      // image: first product-card__image after this attribute
      const after = html.slice(m.index, m.index + 3000);
      const imgM = after.match(/product-card__image[^>]*src="(\/\/[^"]+)"/)
        || after.match(/product-card__image[^>]*\ssrc="(https?:\/\/[^"]+)"/);
      let img = imgM ? (imgM[1].startsWith('//') ? 'https:' + imgM[1] : imgM[1]) : null;
      if (img) img = img.replace(/&width=\d+$/, '');
      if (!linkM) continue;
      out.push(normalizeProduct({
        id: `iq_${j.id}`,
        title: decodeEntities(j.title || ''),
        titleAr: decodeEntities(j.title || ''),
        store: 'iq',
        price,
        originalPrice: compare > price ? compare : null,
        url: linkM ? `https://iq-mobiles.com${linkM[1].split('?')[0]}` : null,
        image: img,
        availability: j.available !== false,
      }));
      seen.add(String(j.id));
    } catch (e) { /* skip malformed card */ }
  }
  if (!out.length) throw new Error('iq: no products parsed');
  return out;
}

/* El Shennawy — OpenCart (Antomi theme): index.php?route=product/search&search= */
async function searchElshennawy(q) {
  const res = await fetchWithTimeout(`https://www.elshennawy.com/index.php?route=product%2Fsearch&search=${enc(q)}&limit=10`, { headers: { 'Accept': 'text/html' } });
  if (!res.ok) throw new Error(`shennawy HTTP ${res.status}`);
  const html = await res.text();
  const blocks = html.split('class="product-thumb"').slice(1, 9);
  const out = [];
  for (const b of blocks) {
    try {
      const linkM = b.match(/href="([^"]*product_id=\d+[^"]*)"/);
      const imgM = b.match(/<img[^>]+src="(https?:\/\/[^"]+\/cache\/[^"]+)"/);
      const titleM = b.match(/<h4>\s*<a[^>]*>([^<]+)<\/a>/) || b.match(/alt="\s*([^"]{4,120})\s*"/);
      const newM = b.match(/price-new">\s*([\d,.]+)\s*(?:EGP|ج\.م)/) || b.match(/price-new"[^>]*>\s*([\d,.]+)/);
      const oldM = b.match(/price-old[^>]*>\s*([\d,.]+)/);
      const price = newM ? parseFloat(newM[1].replace(/,/g, '')) : 0;
      if (!price || !linkM) continue;
      out.push(normalizeProduct({
        id: `shennawy_${(linkM[1].match(/product_id=(\d+)/) || [])[1] || out.length}`,
        title: decodeEntities((titleM && titleM[1]) || 'منتج'),
        titleAr: decodeEntities((titleM && titleM[1]) || 'منتج'),
        store: 'shennawy',
        price,
        originalPrice: oldM ? parseFloat(oldM[1].replace(/,/g, '')) : null,
        url: decodeEntities(linkM[1]),
        image: imgM ? imgM[1] : null,
        availability: !/out-of-stock|غير متوفر/i.test(b.slice(0, 1500)),
      }));
    } catch (e) { /* skip */ }
  }
  if (!out.length) throw new Error('shennawy: no products parsed');
  return out;
}

/* iMedia Stores — WooCommerce (Electro theme): /?s=q&post_type=product */
async function searchImedia(q) {
  const res = await fetchWithTimeout(`https://www.imediastores.com/?s=${enc(q)}&post_type=product`, { headers: { 'Accept': 'text/html' } });
  if (!res.ok) throw new Error(`imedia HTTP ${res.status}`);
  const html = await res.text();
  const blocks = html.split('<li class="product type-product').slice(1, 10);
  const out = [];
  for (const b of blocks) {
    try {
      const linkM = b.match(/href="(https?:\/\/[^"]+)"\s+class="woocommerce-LoopProduct-link/) || b.match(/class="woocommerce-LoopProduct-link[^"]*"\s+href="([^"]+)"/) || b.match(/href="(https?:\/\/www\.imediastores\.com\/product\/[^"]+)"/);
      const titleM = b.match(/woocommerce-loop-product__title">\s*([^<]+)</);
      const imgM = b.match(/<img[^>]+src="(https?:\/\/[^"]+\.(?:webp|jpe?g|png|gif))"/i);
      // prices live inside the price-add-to-cart block: <ins> current, <del> original
      const pIdx = b.indexOf('price-add-to-cart');
      if (pIdx < 0) continue;
      const pSeg = b.slice(pIdx, pIdx + 1400);
      const insM = pSeg.match(/<ins>.*?<bdi>\s*([\d,.]+)&nbsp;/s) || pSeg.match(/<bdi>\s*([\d,.]+)&nbsp;/);
      const delM = pSeg.match(/<del>.*?<bdi>\s*([\d,.]+)&nbsp;/s);
      const price = insM ? parseFloat(insM[1].replace(/,/g, '')) : 0;
      if (!price || !linkM) continue;
      const orig = delM ? parseFloat(delM[1].replace(/,/g, '')) : null;
      out.push(normalizeProduct({
        id: `imedia_${(b.match(/data-product_id="(\d+)"/) || [])[1] || out.length}`,
        title: decodeEntities((titleM && titleM[1]) || 'منتج'),
        titleAr: decodeEntities((titleM && titleM[1]) || 'منتج'),
        store: 'imedia',
        price,
        originalPrice: orig && orig > price ? orig : null,
        url: decodeEntities(linkM[1]),
        image: imgM ? imgM[1] : null,
        availability: /in-stock/i.test(b.slice(0, pIdx + 400)),
      }));
    } catch (e) { /* skip */ }
  }
  if (!out.length) throw new Error('imedia: no products parsed');
  return out;
}

const LIVE_ADAPTERS = {
  dream2000: { fn: searchDream2000, prefer: 'original' },
  vontx:     { fn: searchVontx,     prefer: 'original' },
  etisal:    { fn: searchEtisal,    prefer: 'original' },
  miami:     { fn: searchMiami,     prefer: 'translated' },
  dubai:     { fn: searchDubai,     prefer: 'translated' },
  annoshka:  { fn: makeWooAdapter('annoshka', 'annoshka.com', 8),   prefer: 'original' },
  shift:     { fn: makeWooAdapter('shift', 'shiftstore-eg.com', 8), prefer: 'original' },
  imedia:    { fn: searchImedia,     prefer: 'original' },
  xprs:      { fn: makeShopifyAdapter('xprs', 'myxprs.com'),        prefer: 'original' },
  kimo:      { fn: makeShopifyAdapter('kimo', 'kimostore.net'),     prefer: 'original' },
  iq:        { fn: searchIq,        prefer: 'original' },
  shennawy:  { fn: searchElshennawy, prefer: 'original' },
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
    logSearch(req, q, cached.data.count).catch(() => {});
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
    logSearch(req, q, payload.count).catch(() => {});
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
app.get('/api/subscribers', requireAdmin, (req, res) => res.json(loadJson('subscribers.json', [])));

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
app.get('/api/alerts', requireAdmin, (req, res) => res.json(loadJson('alerts.json', [])));

/* ============================================================
   Visitor Analytics + Admin Panel API
   - pageview tracking: IP, country/city (ip-api.com w/ cache), device, browser, OS, path, referrer
   - search logging: query + result count + visitor geo
   - subscribers (emails / WhatsApp numbers) & price alerts
   - token-protected admin endpoints feeding the /admin dashboard
   ============================================================ */
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const VISITS_CAP = 5000;
const SEARCHES_CAP = 3000;
const GEO_TTL = 30 * 24 * 3600 * 1000;
const adminTokens = new Map(); // token -> expiry

function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  const raw = (xff ? String(xff).split(',')[0] : (req.socket && req.socket.remoteAddress) || '').trim();
  return raw.replace(/^::ffff:/, '');
}
function isPrivateIp(ip) {
  return !ip || ip === '::1' || /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(ip);
}
function parseUA(ua) {
  ua = String(ua || '');
  let device = 'desktop';
  if (/tablet|ipad|playbook|silk/i.test(ua) || /android(?!.*mobile)/i.test(ua)) device = 'tablet';
  else if (/mobi|iphone|ipod|windows phone/i.test(ua)) device = 'mobile';
  let browser = 'other';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/samsungbrowser/i.test(ua)) browser = 'Samsung';
  else if (/chrome|chromium|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';
  let os = 'other';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod|ios/i.test(ua)) os = 'iOS';
  else if (/mac os|macintosh/i.test(ua)) os = 'macOS';
  else if (/linux|x11/i.test(ua)) os = 'Linux';
  return { device, browser, os };
}

/* geo cache (memory + data/geoip.json) */
const geoMem = new Map();
try {
  const disk = loadJson('geoip.json', {});
  for (const [k, v] of Object.entries(disk || {})) geoMem.set(k, v);
} catch (e) { /* first run */ }

function persistGeo() {
  const obj = {};
  const entries = [...geoMem.entries()].slice(-8000);
  for (const [k, v] of entries) obj[k] = v;
  saveJson('geoip.json', obj);
}
async function lookupGeo(ip) {
  if (isPrivateIp(ip)) return { country: 'محلي / Local', countryCode: 'EG', city: '' };
  const cached = geoMem.get(ip);
  if (cached && Date.now() - (cached.at || 0) < GEO_TTL) return cached;
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,city`,
      { signal: AbortSignal.timeout(3500) });
    const j = await res.json();
    const g = (j && j.status === 'success')
      ? { country: j.country, countryCode: j.countryCode, city: j.city || '', at: Date.now() }
      : { country: '—', countryCode: '', city: '', at: Date.now() };
    geoMem.set(ip, g);
    persistGeo();
    return g;
  } catch (e) {
    return cached || { country: '—', countryCode: '', city: '', at: Date.now() };
  }
}

async function trackMiddleware(req, res, next) {
  try {
    const pth = req.path || '';
    const isPage = req.method === 'GET'
      && !pth.startsWith('/api')
      && pth !== '/admin'
      && !/\.[a-z0-9]{1,6}$/i.test(pth);
    if (isPage) recordVisit(req, pth);
  } catch (e) { /* analytics must never break the site */ }
  next();
}
async function recordVisit(req, pth) {
  const ip = clientIp(req);
  const { device, browser, os } = parseUA(req.headers['user-agent']);
  const geo = await lookupGeo(ip);
  const visits = loadJson('visits.json', []);
  visits.push({
    ip, country: geo.country, countryCode: geo.countryCode, city: geo.city,
    device, browser, os, path: pth, ref: req.headers['referer'] || '', ts: Date.now(),
  });
  if (visits.length > VISITS_CAP) visits.splice(0, visits.length - VISITS_CAP);
  saveJson('visits.json', visits);
}
async function logSearch(req, q, count) {
  try {
    const ip = clientIp(req);
    const geo = await lookupGeo(ip);
    const list = loadJson('searches.json', []);
    list.push({
      q, count: count == null ? null : count, ip, country: geo.country, countryCode: geo.countryCode,
      device: parseUA(req.headers['user-agent']).device, ts: Date.now(),
    });
    if (list.length > SEARCHES_CAP) list.splice(0, list.length - SEARCHES_CAP);
    saveJson('searches.json', list);
  } catch (e) { /* ignore */ }
}

function requireAdmin(req, res, next) {
  const t = req.headers['x-admin-token'];
  if (t && adminTokens.has(t) && adminTokens.get(t) > Date.now()) return next();
  return res.status(401).json({ ok: false, error: 'unauthorized' });
}

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ ok: false, error: 'wrong password' });
  if (adminTokens.size > 20) adminTokens.clear();
  const token = crypto.randomBytes(24).toString('hex');
  adminTokens.set(token, Date.now() + 12 * 3600 * 1000); // 12h session
  console.log('🔐 Admin login success from', clientIp(req));
  res.json({ ok: true, token });
});
app.post('/api/admin/logout', (req, res) => {
  adminTokens.delete(req.headers['x-admin-token']);
  res.json({ ok: true });
});

app.get('/api/admin/overview', requireAdmin, (req, res) => {
  const visits = loadJson('visits.json', []);
  const searches = loadJson('searches.json', []);
  const subs = loadJson('subscribers.json', []);
  const alerts = loadJson('alerts.json', []);
  const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
  const t0 = startToday.getTime();
  const todayV = visits.filter(v => v.ts >= t0);
  const todayS = searches.filter(s => s.ts >= t0);
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const dStart = t0 - i * 86400000, dEnd = dStart + 86400000;
    const d = new Date(dStart);
    const dv = visits.filter(v => v.ts >= dStart && v.ts < dEnd);
    days.push({
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      visits: dv.length,
      searches: searches.filter(s => s.ts >= dStart && s.ts < dEnd).length,
      uniques: new Set(dv.map(v => v.ip)).size,
    });
  }
  const countBy = (arr, key) => {
    const m = {};
    arr.forEach(x => { const k = x[key] || '—'; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  };
  const ccMap = {};
  visits.forEach(v => { if (v.country && v.countryCode) ccMap[v.country] = v.countryCode; });
  const countries = countBy(visits, 'country').slice(0, 10)
    .map(([country, count]) => ({ country, code: ccMap[country] || '', count }));
  const devices = countBy(visits, 'device').map(([device, count]) => ({ device, count }));
  const browsers = countBy(visits, 'browser').slice(0, 6).map(([browser, count]) => ({ browser, count }));
  const qm = {};
  searches.forEach(s => {
    const k = String(s.q || '').trim();
    if (!k) return;
    const key = k.toLowerCase();
    if (!qm[key]) qm[key] = { q: k, count: 0 };
    qm[key].count++;
  });
  const topSearches = Object.values(qm).sort((a, b) => b.count - a.count).slice(0, 10);
  res.json({
    ok: true,
    totals: {
      visits: visits.length,
      uniqueIps: new Set(visits.map(v => v.ip)).size,
      todayVisits: todayV.length,
      todayUniques: new Set(todayV.map(v => v.ip)).size,
      searches: searches.length,
      todaySearches: todayS.length,
      subscribers: subs.length,
      subscriberEmails: subs.filter(s => s.type === 'email').length,
      subscriberPhones: subs.filter(s => s.type !== 'email').length,
      alerts: alerts.length,
    },
    days, countries, devices, browsers, topSearches,
    generatedAt: new Date().toISOString(),
  });
});

app.get('/api/admin/visits', requireAdmin, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 300, 2000);
  res.json(loadJson('visits.json', []).slice(-limit).reverse());
});
app.get('/api/admin/searches', requireAdmin, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 300, 2000);
  res.json(loadJson('searches.json', []).slice(-limit).reverse());
});
app.get('/api/admin/subscribers', requireAdmin, (req, res) => res.json(loadJson('subscribers.json', []).slice().reverse()));
app.get('/api/admin/alerts', requireAdmin, (req, res) => res.json(loadJson('alerts.json', []).slice().reverse()));
app.get('/api/admin/export', requireAdmin, (req, res) => res.json({
  exportedAt: new Date().toISOString(),
  visits: loadJson('visits.json', []),
  searches: loadJson('searches.json', []),
  subscribers: loadJson('subscribers.json', []),
  alerts: loadJson('alerts.json', []),
}));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Price Hunter Egypt (LIVE aggregation) running on http://0.0.0.0:${PORT}`);
});

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DEMO_MODE = process.env.DEMO_MODE === 'true' || false;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const STORES = {
  jumia: { id: 'jumia', ar: 'جوميا', en: 'Jumia', color: '#FF6B00', domain:'jumia.com.eg', searchUrl: 'https://www.jumia.com.eg/catalog/?q=' },
  noon: { id: 'noon', ar: 'نون', en: 'Noon', color: '#FDE047', domain:'noon.com', searchUrl: 'https://www.noon.com/egypt/search?q=' },
  amazon: { id: 'amazon', ar: 'أمازون مصر', en: 'Amazon Egypt', color: '#F59E0B', domain:'amazon.eg', searchUrl: 'https://www.amazon.eg/s?k=' },
  vontx: { id: 'vontx', ar: 'فونكس', en: 'Vontx', color: '#2DD4BF', domain:'vontxshop.com', searchUrl: 'https://vontxshop.com/search?q=' },
  dream2000: { id: 'dream2000', ar: 'دريم 2000', en: 'Dream 2000', color: '#EF4444', domain:'dream2000.com', searchUrl: 'https://dream2000.com/search?q=' },
  b2: { id: 'b2', ar: '2B', en: '2B', color: '#FACC15', domain:'2b.com.eg', searchUrl: 'https://www.2b.com.eg/search?q=' },
  etisal: { id: 'etisal', ar: 'اتصال ستور', en: 'Etisal Store', color: '#10B981', domain:'etisalstore.com', searchUrl: 'https://www.etisalstore.com/search?q=' },
  dubai: { id: 'dubai', ar: 'دبي فون', en: 'Dubai Phone', color: '#06B6D4', domain:'dubaiphone.com', searchUrl: 'https://dubaiphone.com/search?q=' },
  btech: { id: 'btech', ar: 'بي تك', en: 'B.TECH', color: '#DC2626', domain:'btech.com', searchUrl: 'https://btech.com/search?q=' },
  miami: { id: 'miami', ar: 'ميامي سنترز', en: 'Miami Centers', color: '#FB923C', domain:'miamicenters.com', searchUrl: 'https://miamicenters.com/search?q=' },
  raneen: { id: 'raneen', ar: 'رنين', en: 'Raneen', color: '#A78BFA', domain:'raneen.com', searchUrl: 'https://www.raneen.com/search?q=' }
};

function getStoreUrl(storeId, query){
  const s = STORES[storeId];
  if(!s) return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  return s.searchUrl + encodeURIComponent(query);
}

const MOCK_HUAWEI = [
  { id:1, title: "Huawei FreeBuds SE 2 Wireless Earbuds - Ceramic White", titleAr: "هواوي سماعات FreeBuds SE 2 لاسلكية - أبيض سيراميك", store: "etisal", price: 1449, originalPrice: null, discount: null, image: "white", badge: "الأرخص", model:"SE 2" },
  { id:2, title: "Huawei FreeBuds SE 2 Wireless Earbuds - Isle blue", titleAr: "هواوي سماعات FreeBuds SE 2 لاسلكية - أزرق آيل", store: "etisal", price: 1449, originalPrice: null, discount: null, image: "blue", badge: "الأرخص", model:"SE 2" },
  { id:3, title: "هواوي T0016L سماعات اذن SE 2", store: "dream2000", price: 1499, originalPrice: 1799, discount: 17, image: "blue", model:"SE 2" },
  { id:4, title: "هواوي SE 2 سماعات اذن، T0016L", store: "dream2000", price: 1800, originalPrice: 1899, discount: 5, image: "white2", model:"SE 2" },
  { id:5, title: "HUAWEI Freebuds SE 3", store: "vontx", price: 1890, originalPrice: 2360, discount: 20, image: "beige", model:"SE 3" },
  { id:6, title: "Huawei FreeBuds SE 3 In-Ear Earbuds, Noise Cancellation, 510mAh", store: "vontx", price: 1990, originalPrice: 2289, discount: 13, image: "black", model:"SE 3" },
  { id:7, title: "Huawei FreeBuds SE 4 ANC 50h of Music Playback", store: "vontx", price: 2399, originalPrice: 2799, discount: 14, image: "black2", model:"SE 4" },
  { id:8, title: "Huawei FreeBuds 6i Purple - Noise Cancelling", store: "dream2000", price: 3699, originalPrice: 4499, discount: 18, image: "purple", model:"6i" },
  { id:9, title: "Huawei FreeBuds Pro 3 Green - Dual Driver", store: "vontx", price: 4999, originalPrice: 5999, discount: 17, image: "green", model:"Pro 3" },
  { id:10, title: "Huawei FreeBuds 5i Ceramic White", store: "dream2000", price: 4299, originalPrice: 5499, discount: 22, image: "white", model:"5i" },
  { id:11, title: "هواوي سماعات FreeBuds SE 2 لاسلكية - أسود", store: "etisal", price: 1450, originalPrice: 1600, discount: 9, image: "black", model:"SE 2" },
  { id:12, title: "Huawei FreeBuds SE 2 - Black Edition", store: "etisal", price: 1449, originalPrice: 1550, discount: 7, image: "black2", model:"SE 2" },
  { id:13, title: "Huawei FreeBuds 5 - Silver Frost", store: "vontx", price: 5990, originalPrice: 6990, discount: 14, image: "silver", model:"5" },
  { id:14, title: "هواوي فري بودز 4i - أبيض", store: "dream2000", price: 2890, originalPrice: 3200, discount: 10, image: "white2", model:"4i" },
  { id:15, title: "Huawei FreeBuds Pro 2 + Free Gift Strap", store: "etisal", price: 5499, originalPrice: 6499, discount: 15, image: "silver", model:"Pro 2" },
  { id:16, title: "HUAWEI FreeBuds Lipstick - Luxury Design", store: "vontx", price: 6999, originalPrice: 7999, discount: 13, image: "red", model:"Lipstick" },
  { id:17, title: "هواوي سماعات FreeBuds 6i - بنفسجي", store: "dream2000", price: 3799, originalPrice: 4299, discount: 12, image: "purple", model:"6i" },
  { id:18, title: "Huawei FreeBuds SE 2 - عرض خاص اتصال", store: "etisal", price: 1399, originalPrice: 1599, discount: 12, image: "blue", model:"SE 2" },
  { id:19, title: "هواوي سماعات FreeBuds SE 2 لاسلكية - عرض اتصال", store: "etisal", price: 1499, originalPrice: 1799, discount: 17, image: "white", model:"SE 2" },
  { id:20, title: "HUAWEI FreeBuds SE 3 Gift Box - Limited", store: "vontx", price: 2090, originalPrice: 2490, discount: 16, image: "beige", model:"SE 3" },
  { id:21, title: "Huawei FreeBuds 5i - Isle Blue", store: "dream2000", price: 4599, originalPrice: 5299, discount: 13, image: "blue", model:"5i" },
  { id:22, title: "هواوي سماعات لاسلكية FreeBuds SE", store: "etisal", price: 1449, originalPrice: 1520, discount: 5, image: "white2", model:"SE 2" },
  { id:23, title: "Huawei FreeBuds Pro 3 - White Ceramic", store: "vontx", price: 8999, originalPrice: 9999, discount: 10, image: "white", model:"Pro 3" },
  { id:24, title: "Huawei FreeBuds SE 2 - Dream Offer", store: "dream2000", price: 1599, originalPrice: 1999, discount: 20, image: "blue", model:"SE 2" },
  { id:25, title: "هواوي FreeBuds 5i - أسود فحمي", store: "dream2000", price: 4699, originalPrice: 5499, discount: 15, image: "black", model:"5i" },
  { id:26, title: "Huawei FreeBuds SE 3 - Black Matte", store: "vontx", price: 1950, originalPrice: 2390, discount: 18, image: "black2", model:"SE 3" },
  { id:27, title: "HUAWEI FreeBuds SE 2 Extra Bass - White", store: "dream2000", price: 1699, originalPrice: 1999, discount: 15, image: "white", model:"SE 2" },
  // Additional products for other stores to ensure Jumia/Noon/Amazon have results
  { id:28, title: "Huawei FreeBuds SE 2 - Jumia Special", store: "jumia", price: 1599, originalPrice: 1899, discount: 16, image: "white", model:"SE 2" },
  { id:29, title: "Huawei FreeBuds SE 3 - Noon Offer", store: "noon", price: 1999, originalPrice: 2399, discount: 17, image: "blue", model:"SE 3" },
  { id:30, title: "Huawei FreeBuds 5i - Amazon EG", store: "amazon", price: 4399, originalPrice: 5199, discount: 15, image: "white", model:"5i" },
  { id:31, title: "Huawei FreeBuds SE 2 - B.TECH", store: "btech", price: 1699, originalPrice: 1999, discount: 15, image: "black", model:"SE 2" },
  { id:32, title: "Huawei FreeBuds 6i - 2B Store", store: "b2", price: 3899, originalPrice: 4599, discount: 15, image: "purple", model:"6i" },
  { id:33, title: "Huawei FreeBuds SE 2 - Dubai Phone", store: "dubai", price: 1499, originalPrice: 1799, discount: 17, image: "blue", model:"SE 2" },
  { id:34, title: "Huawei FreeBuds SE 3 - Raneen", store: "raneen", price: 2050, originalPrice: 2450, discount: 16, image: "beige", model:"SE 3" },
  { id:35, title: "Huawei FreeBuds SE 2 - Miami Centers", store: "miami", price: 1550, originalPrice: 1850, discount: 16, image: "white", model:"SE 2" },
];

// Assign proper URLs to all mock products
MOCK_HUAWEI.forEach(p=>{
  p.url = getStoreUrl(p.store, p.title);
  p.directUrl = p.url; // direct product page (search fallback)
});

const DEMO_DATA = [
  { id:1001, title: "هواوي سماعات FreeBuds SE 2 لاسلكية", store: "noon", price: 1299, originalPrice: 1599, discount: 19, image: "white", badge: "الأرخص", model:"SE 2", url: getStoreUrl("noon","Huawei FreeBuds SE 2") },
  { id:1002, title: "Huawei FreeBuds SE 2", store: "jumia", price: 1399, originalPrice: null, discount: null, image: "black", model:"SE 2", url: getStoreUrl("jumia","Huawei FreeBuds SE 2") },
  { id:1003, title: "Huawei FreeBuds 7i", store: "vontx", price: 3699, originalPrice: null, discount: null, image: "purple", model:"7i", url: getStoreUrl("vontx","Huawei FreeBuds 7i") },
];

function searchProducts(query, demo=false){
  const q = (query||'').trim().toLowerCase();
  let results = [];
  if (demo) return DEMO_DATA;
  if (q.includes('هواوي') || q.includes('سماعات هواوي') || q.includes('سماعات') || q.includes('huawei') || q.includes('freebuds') || q.includes('هواو') || q.includes('سماعه') || q.includes('سمعات')){
    results = MOCK_HUAWEI;
    // If query is specific model, filter to that model for better relevance
    const modelKeywords = ['se 2','se 3','se 4','5i','6i','pro 3','pro 2','4i','lipstick','5 ','6i','7i'];
    const qLower = q.toLowerCase();
    const matchedModel = modelKeywords.find(m=> qLower.includes(m));
    if(matchedModel){
      const filtered = MOCK_HUAWEI.filter(p=> p.model.toLowerCase().includes(matchedModel.trim()) || p.title.toLowerCase().includes(matchedModel));
      if(filtered.length >= 3) results = filtered;
    }
  } else if (q.includes('ايفون') || q.includes('iphone') || q.includes('آيفون')){
    results = Array.from({length:16}, (_,i)=> ({
      id:100+i, title: `iPhone 15 Pro ${128+(i%3)*128}GB - ${['Natural Titanium','Blue Titanium','Black Titanium'][i%3]}`, titleAr: `آيفون 15 برو ${128+(i%3)*128} جيجا`, store: ['dream2000','vontx','etisal','dubai','b2','jumia','noon','amazon'][i%8], price: 42000 + i*1100, originalPrice: 50000 + i*1100, discount: 10 + (i%5), image: "silver", model: "15 Pro"
    }));
    results.forEach(p=> p.url = getStoreUrl(p.store, p.title));
  } else if (q.includes('سامسونج') || q.includes('samsung') || q.includes('galaxy')){
    results = Array.from({length:14}, (_,i)=> ({
      id:200+i, title: `Samsung Galaxy A55 5G 256GB - ${['Blue','Navy','White'][i%3]}`, store: ['dream2000','b2','dubai','jumia','amazon','noon'][i%6], price: 13500 + i*400, originalPrice: 15500+i*400, discount: 12, image: "blue", model: "A55"
    }));
    results.forEach(p=> p.url = getStoreUrl(p.store, p.title));
  } else if (q.includes('لابتوب') || q.includes('laptop') || q.includes('لاب')){
    results = Array.from({length:12}, (_,i)=> ({
      id:300+i, title: `Lenovo IdeaPad Gaming 3 - RTX 3050 - ${16+i*2}GB RAM`, store: ['b2','dream2000','vontx','jumia','amazon'][i%5], price: 28000 + i*1500, originalPrice: 32000+i*1500, discount: 12, image: "black2", model: "Gaming 3"
    }));
    results.forEach(p=> p.url = getStoreUrl(p.store, p.title));
  } else if (q.includes('تلفزيون') || q.includes('tv') || q.includes('تلاجة') || q.includes('غسالة') || q.includes('تابلت') || q.includes('tablet') || q.includes('جيمينج') || q.includes('ساعة')){
    results = Array.from({length:9}, (_,i)=> ({
      id:400+i, title: `${query} - موديل ${i+1} - عرض مميز من ${Object.values(STORES)[i%11].ar}`, store: Object.keys(STORES)[i%11], price: 2200 + i*450, originalPrice: 2800+i*450, discount: 10+i, image: ["white","blue","black","beige"][i%4], model: `M${i+1}`
    }));
    results.forEach(p=> p.url = getStoreUrl(p.store, p.title));
  } else if (q.length < 2){
    results = [];
  } else {
    results = Array.from({length:8}, (_,i)=> ({
      id:500+i, title: `${query} - عرض ${i+1} من ${Object.values(STORES)[i%11].ar}`, store: Object.keys(STORES)[i%11], price: 1200 + i*320, originalPrice: 1500+i*320, discount: 10+i, image: "white", model: query
    }));
    results.forEach(p=> p.url = getStoreUrl(p.store, p.title));
  }
  return results;
}

// Suggestions endpoint - rich model-level suggestions
app.get('/api/suggestions', (req,res)=>{
  const q = (req.query.q || '').trim().toLowerCase();
  if(!q || q.length < 1) return res.json([]);
  
  // Build suggestions from real products
  const allProducts = [...MOCK_HUAWEI];
  // Add other category products for suggestions
  const extraTitles = [
    "iPhone 15 Pro 128GB", "iPhone 15 Pro 256GB", "Samsung Galaxy A55 5G", "Samsung Galaxy S24 Ultra",
    "Lenovo IdeaPad Gaming 3 RTX 3050", "تابلت هواوي MatePad", "ساعة هواوي GT 4", "ساوندكور R50i",
    "Anker Soundcore Life P3", "Xiaomi Redmi Buds 5"
  ];
  
  const normalize = (s)=> s.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF ]/g,'');
  const qNorm = normalize(q);
  
  // Score products by relevance
  const scored = allProducts.map(p=>{
    const title = (p.title + " " + (p.titleAr||"")).toLowerCase();
    let score = 0;
    if(title.includes(qNorm)) score += 10;
    if(p.model.toLowerCase().includes(qNorm)) score += 15;
    if(title.startsWith(qNorm)) score += 5;
    // typo tolerance: if q is substring of any word
    const words = title.split(/\s+/);
    if(words.some(w=> w.includes(qNorm) || qNorm.includes(w.slice(0,3)))) score += 3;
    return {p, score};
  }).filter(x=> x.score > 0).sort((a,b)=> b.score - a.score).slice(0,6);
  
  const suggestions = scored.map(({p})=> ({
    type: 'product',
    title: p.title,
    titleAr: p.titleAr || p.title,
    model: p.model,
    store: p.store,
    storeName: STORES[p.store]?.ar || p.store,
    price: p.price,
    image: p.image,
    url: p.url,
    query: p.title // clicking will search this exact model
  }));
  
  // If no product matches, fallback to category suggestions
  if(suggestions.length < 3){
    const fallbacks = extraTitles.filter(t=> t.toLowerCase().includes(qNorm)).map(t=> ({
      type: 'query',
      title: t,
      query: t,
      store: null,
      price: null
    }));
    suggestions.push(...fallbacks);
  }
  
  // Always include "search all" option
  if(suggestions.length){
    suggestions.unshift({
      type: 'search',
      title: `ابحث عن "${q}" في كل المتاجر`,
      query: q,
      icon: '🔍'
    });
  }
  
  res.json(suggestions.slice(0,7));
});

app.get('/api/search', (req,res)=>{
  const q = req.query.q || '';
  const fast = req.query.fast === '1';
  const demo = DEMO_MODE;
  const delay = fast ? 0 : (demo ? 500 : 600 + Math.random()*400);
  const data = searchProducts(q, demo);
  setTimeout(()=>{
    const storesWithHits = new Set(data.map(p=>p.store)).size;
    const avg = data.length ? Math.round(data.reduce((a,b)=>a+b.price,0)/data.length) : 0;
    const min = data.length ? Math.min(...data.map(p=>p.price)) : 0;
    const minStore = data.length ? data.reduce((a,b)=> a.price < b.price ? a : b).store : null;
    res.json({
      query: q,
      demoMode: demo,
      count: data.length,
      storesWithHits,
      avgPrice: avg,
      minPrice: min,
      minStore,
      tookSeconds: demo ? (8.2).toFixed(1) : ( (3.9 + Math.random()*4.5).toFixed(1) ),
      results: data,
      timestamp: new Date().toISOString()
    });
  }, delay);
});

app.get('/api/stores', (req,res)=> res.json(STORES));
app.get('/api/health', (req,res)=> res.json({ ok:true, demoMode: DEMO_MODE, uptime: process.uptime(), time: new Date().toISOString() }));

app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', ()=>{
  console.log(`✅ Price Hunter Egypt running on http://0.0.0.0:${PORT} | DEMO_MODE=${DEMO_MODE}`);
});

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
  jumia: { id: 'jumia', ar: 'جوميا', en: 'Jumia', color: '#FF6B00' },
  noon: { id: 'noon', ar: 'نون', en: 'Noon', color: '#FDE047' },
  amazon: { id: 'amazon', ar: 'أمازون مصر', en: 'Amazon Egypt', color: '#F59E0B' },
  vontx: { id: 'vontx', ar: 'فونكس', en: 'Vontx', color: '#2DD4BF' },
  dream2000: { id: 'dream2000', ar: 'دريم 2000', en: 'Dream 2000', color: '#EF4444' },
  b2: { id: 'b2', ar: '2B', en: '2B', color: '#FACC15' },
  etisal: { id: 'etisal', ar: 'اتصال ستور', en: 'Etisal Store', color: '#10B981' },
  dubai: { id: 'dubai', ar: 'دبي فون', en: 'Dubai Phone', color: '#06B6D4' },
  btech: { id: 'btech', ar: 'بي تك', en: 'B.TECH', color: '#DC2626' },
  miami: { id: 'miami', ar: 'ميامي سنترز', en: 'Miami Centers', color: '#FB923C' },
  raneen: { id: 'raneen', ar: 'رنين', en: 'Raneen', color: '#A78BFA' }
};

const MOCK_HUAWEI = [
  { id:1, title: "Huawei FreeBuds SE 2 Wireless Earbuds - Ceramic White", titleAr: "هواوي سماعات FreeBuds SE 2 لاسلكية - أبيض سيراميك", store: "etisal", price: 1449, originalPrice: null, discount: null, url: "https://www.etisalstore.com/search?q=FreeBuds+SE+2", image: "white", badge: "الأرخص" },
  { id:2, title: "Huawei FreeBuds SE 2 Wireless Earbuds - Isle blue", titleAr: "هواوي سماعات FreeBuds SE 2 لاسلكية - أزرق آيل", store: "etisal", price: 1449, originalPrice: null, discount: null, url: "https://www.etisalstore.com/search?q=FreeBuds+SE+2", image: "blue", badge: "الأرخص" },
  { id:3, title: "هواوي T0016L سماعات اذن SE 2", store: "dream2000", price: 1499, originalPrice: 1799, discount: 17, url: "https://dream2000.com/search?q=huawei+freebuds", image: "blue" },
  { id:4, title: "هواوي SE 2 سماعات اذن، T0016L", store: "dream2000", price: 1800, originalPrice: 1899, discount: 5, url: "https://dream2000.com/search?q=huawei+freebuds", image: "white2" },
  { id:5, title: "HUAWEI Freebuds SE 3", store: "vontx", price: 1890, originalPrice: 2360, discount: 20, url: "https://vontxshop.com/search?q=Freebuds+SE+3", image: "beige" },
  { id:6, title: "Huawei FreeBuds SE 3 In-Ear Earbuds, Noise Cancellation, 510mAh", store: "vontx", price: 1990, originalPrice: 2289, discount: 13, url: "https://vontxshop.com/search?q=Freebuds+SE+3", image: "black" },
  { id:7, title: "Huawei FreeBuds SE 4 ANC 50h of Music Playback, Multi-Mode ANC, Airy-Light Fit", store: "vontx", price: 2399, originalPrice: 2799, discount: 14, url: "https://vontxshop.com/", image: "black2" },
  { id:8, title: "Huawei FreeBuds 6i Purple - Noise Cancelling", store: "dream2000", price: 3699, originalPrice: 4499, discount: 18, url: "https://dream2000.com/", image: "purple" },
  { id:9, title: "Huawei FreeBuds Pro 3 Green - Dual Driver", store: "vontx", price: 4999, originalPrice: 5999, discount: 17, url: "https://vontxshop.com/", image: "green" },
  { id:10, title: "Huawei FreeBuds 5i Ceramic White", store: "dream2000", price: 4299, originalPrice: 5499, discount: 22, url: "https://dream2000.com/", image: "white" },
  { id:11, title: "هواوي سماعات FreeBuds SE 2 لاسلكية - أسود", store: "etisal", price: 1450, originalPrice: 1600, discount: 9, url: "https://www.etisalstore.com/", image: "black" },
  { id:12, title: "Huawei FreeBuds SE 2 - Black Edition", store: "etisal", price: 1449, originalPrice: 1550, discount: 7, url: "https://www.etisalstore.com/", image: "black2" },
  { id:13, title: "Huawei FreeBuds 5 - Silver Frost", store: "vontx", price: 5990, originalPrice: 6990, discount: 14, url: "https://vontxshop.com/", image: "silver" },
  { id:14, title: "هواوي فري بودز 4i - أبيض", store: "dream2000", price: 2890, originalPrice: 3200, discount: 10, url: "https://dream2000.com/", image: "white2" },
  { id:15, title: "Huawei FreeBuds Pro 2 + Free Gift Strap", store: "etisal", price: 5499, originalPrice: 6499, discount: 15, url: "https://www.etisalstore.com/", image: "silver" },
  { id:16, title: "HUAWEI FreeBuds Lipstick - Luxury Design", store: "vontx", price: 6999, originalPrice: 7999, discount: 13, url: "https://vontxshop.com/", image: "red" },
  { id:17, title: "هواوي سماعات FreeBuds 6i - بنفسجي", store: "dream2000", price: 3799, originalPrice: 4299, discount: 12, url: "https://dream2000.com/", image: "purple" },
  { id:18, title: "Huawei FreeBuds SE 2 - عرض خاص اتصال", store: "etisal", price: 1399, originalPrice: 1599, discount: 12, url: "https://www.etisalstore.com/", image: "blue", noLink: false },
  { id:19, title: "هواوي سماعات FreeBuds SE 2 لاسلكية - عرض اتصال", store: "etisal", price: 1499, originalPrice: 1799, discount: 17, url: "https://www.etisalstore.com/", image: "white" },
  { id:20, title: "HUAWEI FreeBuds SE 3 Gift Box - Limited", store: "vontx", price: 2090, originalPrice: 2490, discount: 16, url: "https://vontxshop.com/", image: "beige" },
  { id:21, title: "Huawei FreeBuds 5i - Isle Blue", store: "dream2000", price: 4599, originalPrice: 5299, discount: 13, url: "https://dream2000.com/", image: "blue" },
  { id:22, title: "هواوي سماعات لاسلكية FreeBuds SE", store: "etisal", price: 1449, originalPrice: 1520, discount: 5, url: "https://www.etisalstore.com/", image: "white2" },
  { id:23, title: "Huawei FreeBuds Pro 3 - White Ceramic", store: "vontx", price: 8999, originalPrice: 9999, discount: 10, url: "https://vontxshop.com/", image: "white" },
  { id:24, title: "Huawei FreeBuds SE 2 - Dream Offer", store: "dream2000", price: 1599, originalPrice: 1999, discount: 20, url: "https://dream2000.com/", image: "blue" },
  { id:25, title: "هواوي FreeBuds 5i - أسود فحمي", store: "dream2000", price: 4699, originalPrice: 5499, discount: 15, url: "https://dream2000.com/", image: "black" },
  { id:26, title: "Huawei FreeBuds SE 3 - Black Matte", store: "vontx", price: 1950, originalPrice: 2390, discount: 18, url: "https://vontxshop.com/", image: "black2" },
  { id:27, title: "HUAWEI FreeBuds SE 2 Extra Bass - White", store: "dream2000", price: 1699, originalPrice: 1999, discount: 15, url: "https://dream2000.com/", image: "white" },
];

const DEMO_DATA = [
  { id:1001, title: "هواوي سماعات FreeBuds SE 2 لاسلكية", titleAr: "هواوي سماعات FreeBuds SE 2 لاسلكية", store: "noon", price: 1299, originalPrice: 1599, discount: 19, url: "https://www.noon.com/egypt/search?q=huawei+freebuds", image: "white", badge: "الأرخص" },
  { id:1002, title: "Huawei FreeBuds SE 2", store: "jumia", price: 1399, originalPrice: null, discount: null, url: "https://www.jumia.com.eg/search?q=huawei+freebuds", image: "black", noLink: true },
  { id:1003, title: "Huawei FreeBuds 7i", store: "vontx", price: 3699, originalPrice: null, discount: null, url: "https://vontxshop.com/", image: "purple" },
];

function searchProducts(query, demo=false){
  const q = (query||'').trim().toLowerCase();
  let results = [];
  if (demo) return DEMO_DATA;
  if (q.includes('هواوي') || q.includes('سماعات هواوي') || q.includes('سماعات') || q.includes('huawei') || q.includes('freebuds') || q.includes('هواو') || q.includes('سماعه')){
    results = MOCK_HUAWEI;
  } else if (q.includes('ايفون') || q.includes('iphone') || q.includes('آيفون')){
    results = Array.from({length:16}, (_,i)=> ({
      id:100+i, title: `iPhone 15 Pro ${128+(i%3)*128}GB - ${['Natural Titanium','Blue Titanium','Black Titanium'][i%3]}`, titleAr: `آيفون 15 برو ${128+(i%3)*128} جيجا`, store: ['dream2000','vontx','etisal','dubai','b2'][i%5], price: 42000 + i*1100, originalPrice: 50000 + i*1100, discount: 10 + (i%5), url:"https://dream2000.com/", image: "silver"
    }));
  } else if (q.includes('سامسونج') || q.includes('samsung') || q.includes('galaxy')){
    results = Array.from({length:14}, (_,i)=> ({
      id:200+i, title: `Samsung Galaxy A55 5G 256GB - ${['Blue','Navy','White'][i%3]}`, store: ['dream2000','b2','dubai','jumia'][i%4], price: 13500 + i*400, originalPrice: 15500+i*400, discount: 12, url:"#", image: "blue"
    }));
  } else if (q.includes('لابتوب') || q.includes('laptop') || q.includes('لاب')){
    results = Array.from({length:12}, (_,i)=> ({
      id:300+i, title: `Lenovo IdeaPad Gaming 3 - RTX 3050 - ${16+i*2}GB RAM`, store: ['b2','dream2000','vontx'][i%3], price: 28000 + i*1500, originalPrice: 32000+i*1500, discount: 12, url:"#", image: "black2"
    }));
  } else if (q.includes('تلفزيون') || q.includes('tv') || q.includes('تلاجة') || q.includes('غسالة') || q.includes('تابلت') || q.includes('tablet') || q.includes('جيمينج') || q.includes('ساعة')){
    results = Array.from({length:9}, (_,i)=> ({
      id:400+i, title: `${query} - موديل ${i+1} - عرض مميز من ${Object.values(STORES)[i%11].ar}`, store: Object.keys(STORES)[i%11], price: 2200 + i*450, originalPrice: 2800+i*450, discount: 10+i, url:"#", image: ["white","blue","black","beige"][i%4]
    }));
  } else if (q.length < 2){
    results = [];
  } else {
    results = Array.from({length:8}, (_,i)=> ({
      id:500+i, title: `${query} - عرض ${i+1} من ${Object.values(STORES)[i%11].ar}`, store: Object.keys(STORES)[i%11], price: 1200 + i*320, originalPrice: 1500+i*320, discount: 10+i, url:"#", image: "white"
    }));
  }
  return results;
}

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

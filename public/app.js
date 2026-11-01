const STORES = [
  {id:'jumia', ar:'جوميا', en:'Jumia', color:'#FF6B00'},
  {id:'noon', ar:'نون', en:'Noon', color:'#FDE047'},
  {id:'amazon', ar:'أمازون مصر', en:'Amazon Egypt', color:'#F59E0B'},
  {id:'vontx', ar:'فونكس', en:'Vontx', color:'#2DD4BF'},
  {id:'dream2000', ar:'دريم 2000', en:'Dream 2000', color:'#EF4444'},
  {id:'b2', ar:'2B', en:'2B', color:'#FACC15'},
  {id:'etisal', ar:'اتصال ستور', en:'Etisal Store', color:'#10B981'},
  {id:'dubai', ar:'دبي فون', en:'Dubai Phone', color:'#06B6D4'},
  {id:'btech', ar:'بي تك', en:'B.TECH', color:'#DC2626'},
  {id:'miami', ar:'ميامي سنترز', en:'Miami Centers', color:'#FB923C'},
  {id:'raneen', ar:'رنين', en:'Raneen', color:'#A78BFA'},
];

const CATS = [
  {id:'all', ar:'جميع', en:'All', icon:'🎮'},
  {id:'tablet', ar:'تابلت', en:'Tablets', icon:'📱'},
  {id:'home', ar:'أجهزة منزلية', en:'Home appliances', icon:'🏠'},
  {id:'tv', ar:'تلفزيونات', en:'TVs', icon:'📺'},
  {id:'laptop', ar:'لابتوبات', en:'Laptops', icon:'💻'},
  {id:'phone', ar:'موبايلات', en:'Phones', icon:'📱'},
  {id:'earbuds', ar:'سماعات', en:'Earbuds', icon:'🎧'},
  {id:'watch', ar:'ساعات ذكية', en:'Smart watches', icon:'⌚'},
  {id:'gaming', ar:'جيمينج', en:'Gaming', icon:'🎮'},
];

const i18n = {
  ar: {
    brand_ar: 'صيّاد الأسعار',
    brand_en: 'Price Hunter Egypt',
    hero_title: 'صيّاد الأسعار',
    hero_sub: 'ابحث عن أي منتج — نقارنلك الأسعار في 11 متجر مصري ونطلعلك تقرير مرتب بأرخص عرض',
    search_btn: 'ابحث',
    placeholder: 'اكتب اسم المنتج ... مثال: سماعات ساوندكور R50i',
    best_price: 'أقل سعر',
    avg_price: 'متوسط السعر',
    offers: 'عدد العروض',
    stores_hit: 'متاجر فيها نتائج',
    cheapest_first: 'الأرخص أولاً',
    biggest_discount: 'أعلى خصم',
    alpha: 'أبجدي',
    copy_report: 'نسخ التقرير',
    print_pdf: 'طباعة / PDF',
    store_status: 'حالة المتاجر (اضغط للتفاصيل)',
    ai_title: 'اسأل أدوات الذكاء الاصطناعي',
    ai_desc: 'انسخ نفس السؤال في Gemini أو ChatGPT أو Claude لمقارنة الآراء مع رأينا',
    copy_q: 'نسخ السؤال',
    footer_1: 'الأسعار لحظة البحث وقد تتغير — تأكد من السعر النهائي في صفحة المتجر قبل الشراء',
    footer_2: 'دوس على أي عرض في النتائج وهتفتحلك صفحة المنتج نفسها على المتجر مباشرة.',
    loading: 'جاري البحث في 11 متجر ... ⏳',
    open_product: 'افتح المنتج',
    no_link: 'الرابط غير متاح',
    cheapest: 'الأرخص',
    copied: 'تم النسخ ✅',
    no_results: 'لا توجد نتائج، جرب كلمة أخرى',
  },
  en: {
    brand_ar: 'Price Hunter Egypt',
    brand_en: 'Price Hunter Egypt',
    hero_title: 'Price Hunter',
    hero_sub: 'Search any product — we compare prices across 11 Egyptian stores and build you a sorted report',
    search_btn: 'Search',
    placeholder: 'Type product name ... e.g. Huawei FreeBuds',
    best_price: 'Best price',
    avg_price: 'Average',
    offers: 'Offers',
    stores_hit: 'Stores with hits',
    cheapest_first: 'Cheapest first',
    biggest_discount: 'Biggest discount',
    alpha: 'A-Z',
    copy_report: 'Copy report',
    print_pdf: 'Print / PDF',
    store_status: 'Store status (click for details)',
    ai_title: 'Ask AI tools',
    ai_desc: 'Copy the same question to Gemini, ChatGPT or Claude to compare opinions',
    copy_q: 'Copy question',
    footer_1: 'Prices are at search time and may change — check final price on store page before buying.',
    footer_2: 'Click any offer to open the product page on the store directly.',
    loading: 'Searching 11 stores ... ⏳',
    open_product: 'Open product',
    no_link: 'No link',
    cheapest: 'Cheapest',
    copied: 'Copied ✅',
    no_results: 'No results, try another keyword',
  }
};

let lang = localStorage.getItem('ph_lang') || 'ar';
let currentData = null;
let filteredData = null;
let currentFilter = 'all';
let currentSort = 'cheapest';

const els = {
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  langToggle: document.getElementById('langToggle'),
  storesRow: document.getElementById('storesRow'),
  catsRow: document.getElementById('catsRow'),
  reportSection: document.getElementById('reportSection'),
  reportTitle: document.getElementById('reportTitle'),
  reportQueryText: document.getElementById('reportQueryText'),
  reportMeta: document.getElementById('reportMeta'),
  banner: document.getElementById('banner'),
  bannerText: document.getElementById('bannerText'),
  demoBanner: document.getElementById('demoBanner'),
  statBest: document.getElementById('statBest'),
  statBestStore: document.getElementById('statBestStore'),
  statAvg: document.getElementById('statAvg'),
  statCount: document.getElementById('statCount'),
  statStores: document.getElementById('statStores'),
  filters: document.getElementById('filters'),
  productList: document.getElementById('productList'),
  loading: document.getElementById('loading'),
  storeStatus: document.getElementById('storeStatus'),
  statusGrid: document.getElementById('statusGrid'),
  collapseBtn: document.getElementById('collapseBtn'),
  toast: document.getElementById('toast'),
};

function init(){
  renderStores();
  renderCats();
  bindEvents();
  applyLang();
  // auto search if query param
  const urlQ = new URLSearchParams(location.search).get('q');
  if(urlQ){
    els.searchInput.value = urlQ;
    doSearch(urlQ);
  }
}

function renderStores(){
  els.storesRow.innerHTML = STORES.map(s=> `
    <span class="store-pill"><i style="background:${s.color}"></i>${lang==='ar'?s.ar:s.en}</span>
  `).join('');
}

function renderCats(){
  els.catsRow.innerHTML = CATS.map(c=> `
    <button class="cat-pill" data-cat="${c.id}" data-query="${c.ar}">
      <span>${c.icon}</span> ${lang==='ar'?c.ar:c.en}
    </button>
  `).join('');
  // add "جميع" already includes, but keep click handling
  els.catsRow.querySelectorAll('.cat-pill').forEach(b=>{
    b.addEventListener('click', ()=>{
      const q = b.dataset.query;
      if(q==='جميع' || q==='All'){
        els.searchInput.value='';
        els.reportSection.classList.add('hidden');
        return;
      }
      els.searchInput.value = q;
      doSearch(q);
    });
  });
}

function bindEvents(){
  els.searchBtn.addEventListener('click', ()=> doSearch(els.searchInput.value.trim()));
  els.searchInput.addEventListener('keydown', e=>{
    if(e.key==='Enter') doSearch(els.searchInput.value.trim());
  });
  els.langToggle.addEventListener('click', toggleLang);
  document.getElementById('btnCheapest').addEventListener('click', ()=> sortBy('cheapest'));
  document.getElementById('btnDiscount').addEventListener('click', ()=> sortBy('discount'));
  document.getElementById('btnAlpha').addEventListener('click', ()=> sortBy('alpha'));
  document.getElementById('btnCopy').addEventListener('click', copyReport);
  document.getElementById('btnPrint').addEventListener('click', ()=> window.print());
  document.getElementById('btnCopyAI').addEventListener('click', copyAIQuestion);
  document.querySelectorAll('.ai-btn[data-ai]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const ai = b.dataset.ai;
      const q = currentData?.query || els.searchInput.value || 'سماعات هواوي';
      const prompt = `قارن لي أسعار "${q}" في المتاجر المصرية: جوميا، نون، أمازون مصر، دريم 2000، بي تك، رنين، إلخ. ما هو أرخص سعر حالياً؟`;
      copyText(prompt);
      const urls = {
        gemini: 'https://gemini.google.com/',
        chatgpt: 'https://chat.openai.com/',
        claude: 'https://claude.ai/'
      };
      window.open(urls[ai], '_blank');
    });
  });
  els.collapseBtn.addEventListener('click', ()=>{
    els.statusGrid.classList.toggle('hidden');
  });
}

function toggleLang(){
  lang = lang==='ar' ? 'en' : 'ar';
  localStorage.setItem('ph_lang', lang);
  applyLang();
  if(currentData) renderReport(currentData);
}

function applyLang(){
  document.documentElement.lang = lang;
  document.documentElement.dir = lang==='ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.dataset.i18n;
    if(i18n[lang][key]) el.textContent = i18n[lang][key];
  });
  els.searchInput.placeholder = i18n[lang].placeholder;
  els.langToggle.querySelectorAll('.lang-opt').forEach(o=>{
    o.classList.toggle('active', o.dataset.lang===lang);
  });
  renderStores();
  renderCats();
}

async function doSearch(query){
  if(!query || query.trim().length<2){
    toast(lang==='ar' ? 'اكتب كلمة بحث أولاً' : 'Type a search term first');
    return;
  }
  els.loading.classList.remove('hidden');
  els.reportSection.classList.add('hidden');
  try{
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    currentData = data;
    filteredData = [...data.results];
    renderReport(data);
    history.replaceState(null,'', `?q=${encodeURIComponent(query)}`);
  } catch(e){
    toast('خطأ في البحث');
  } finally {
    els.loading.classList.add('hidden');
  }
}

function renderReport(data){
  els.reportSection.classList.remove('hidden');
  els.reportQueryText.textContent = data.query;
  const date = new Date().toLocaleDateString(lang==='ar' ? 'ar-EG' : 'en-EG');
  els.reportMeta.textContent = `Price Hunter — ${date}`;
  
  // Banner handling
  if(data.demoMode){
    els.banner.classList.add('hidden');
    els.demoBanner.classList.remove('hidden');
  } else {
    els.demoBanner.classList.add('hidden');
    els.banner.classList.remove('hidden');
    els.bannerText.textContent = lang==='ar' 
      ? `✅ نتائج حية من ${data.storesWithHits} متجر — استغرق البحث ${data.tookSeconds} ثانية`
      : `✅ Live results from ${data.storesWithHits} stores — search took ${data.tookSeconds}s`;
  }

  // Stats
  const storeName = getStoreName(data.minStore);
  els.statBest.textContent = formatPrice(data.minPrice);
  els.statBestStore.textContent = storeName;
  els.statAvg.textContent = formatPrice(data.avgPrice);
  els.statCount.textContent = data.count;
  els.statStores.textContent = data.storesWithHits;

  // Filters
  renderFilters(data);

  // Products
  renderProducts(filteredData);

  // Status grid
  renderStatusGrid(data);

  // scroll
  els.reportSection.scrollIntoView({behavior:'smooth', block:'start'});
}

function getStoreName(id){
  const s = STORES.find(x=>x.id===id);
  if(!s) return '-';
  return lang==='ar' ? s.ar : s.en;
}

function getStoreColor(id){
  return STORES.find(x=>x.id===id)?.color || '#6B7280';
}

function renderFilters(data){
  const counts = {};
  data.results.forEach(r=> counts[r.store]=(counts[r.store]||0)+1);
  const allCount = data.count;
  const pills = [
    {id:'all', label: lang==='ar'?'الكل':'All', count: allCount, color: '#3B82F6'},
    ...STORES.map(s=> ({id:s.id, label: lang==='ar'?s.ar:s.en, count: counts[s.id]||0, color: s.color}))
  ];
  els.filters.innerHTML = pills.map(p=> `
    <button class="filter-pill ${currentFilter===p.id?'active':''}" data-filter="${p.id}">
      <i style="background:${p.color}"></i> ${p.label} <span style="opacity:.7">(${p.count})</span>
    </button>
  `).join('');
  els.filters.querySelectorAll('.filter-pill').forEach(b=>{
    b.addEventListener('click', ()=>{
      currentFilter = b.dataset.filter;
      els.filters.querySelectorAll('.filter-pill').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      applyFilter();
    });
  });
}

function applyFilter(){
  if(!currentData) return;
  if(currentFilter==='all'){
    filteredData = [...currentData.results];
  } else {
    filteredData = currentData.results.filter(r=> r.store===currentFilter);
  }
  sortBy(currentSort, false);
}

function sortBy(type, updateUI=true){
  currentSort = type;
  if(!filteredData) return;
  if(type==='cheapest'){
    filteredData.sort((a,b)=> a.price - b.price);
  } else if(type==='discount'){
    filteredData.sort((a,b)=> (b.discount||0) - (a.discount||0));
  } else if(type==='alpha'){
    filteredData.sort((a,b)=> a.title.localeCompare(b.title));
  }
  renderProducts(filteredData);
  if(updateUI){
    document.querySelectorAll('.action-btn').forEach(b=>b.classList.remove('primary'));
    const map = {cheapest:'btnCheapest', discount:'btnDiscount', alpha:'btnAlpha'};
    const id = map[type];
    if(id) document.getElementById(id).classList.add('primary');
  }
}

function renderProducts(list){
  if(!list.length){
    els.productList.innerHTML = `<div style="text-align:center;padding:24px;color:var(--muted)">${i18n[lang].no_results}</div>`;
    return;
  }
  const minPrice = Math.min(...list.map(p=>p.price));
  els.productList.innerHTML = list.map(p=>{
    const isBest = p.price===minPrice;
    const store = STORES.find(s=>s.id===p.store);
    const storeLabel = store ? (lang==='ar'?store.ar:store.en) : p.store;
    const hasLink = !p.noLink;
    const img = getProductImage(p.image);
    return `
      <div class="product-row ${isBest?'best':''}">
        <div class="product-img">${img}</div>
        <div class="product-info">
          <div class="product-title">${escapeHtml(p.title)}</div>
          <div class="product-meta">
            <span class="store-badge ${p.store}"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${store?.color};margin-left:6px"></span>${storeLabel}</span>
            ${isBest?`<span class="cheapest-tag">🏆 ${i18n[lang].cheapest}</span>`:''}
          </div>
        </div>
        <div class="price-box">
          <div class="price ${isBest?'best':''}">${formatPrice(p.price)}</div>
          ${p.originalPrice?`<div class="orig">${formatPrice(p.originalPrice)}</div>`:''}
        </div>
        ${p.discount?`<span class="discount">-${p.discount}%</span>`:`<span class="sep">—</span>`}
        <div class="product-action">
          ${hasLink
            ? `<a href="${p.url}" target="_blank" rel="noopener" class="btn-open">↗ ${i18n[lang].open_product}</a>`
            : `<span class="btn-open disabled">${i18n[lang].no_link}</span>`
          }
        </div>
      </div>
    `;
  }).join('');
}

function getProductImage(type){
  const map = {
    white: '🎧',
    white2: '🎧',
    blue: '🎧',
    black: '🎧',
    black2: '🎧',
    beige: '🎧',
    purple: '🎧',
    green: '🎧',
    red: '🎧',
    silver: '🎧',
  };
  // Use emoji with styled bg, but we can return colored box
  const colors = {
    white: '#fff', blue: '#DBEAFE', black: '#1F2937', beige: '#F5E6C8', purple: '#E9D5FF', green: '#DCFCE7', red: '#FECACA', silver: '#E5E7EB', white2: '#F3F4F6', black2: '#111827'
  };
  const bg = colors[type] || '#fff';
  const emoji = map[type] || '🎧';
  return `<div style="width:100%;height:100%;background:${bg};display:grid;place-items:center;font-size:22px">${emoji}</div>`;
}

function renderStatusGrid(data){
  const counts = {};
  data.results.forEach(r=> counts[r.store]=(counts[r.store]||0)+1);
  els.statusGrid.innerHTML = STORES.map(s=>{
    const c = counts[s.id]||0;
    const dot = c>0 ? '#10B981' : (s.id==='miami'?'#9CA3AF':'#EF4444');
    return `
      <div class="status-item">
        <span style="display:flex;align-items:center;gap:8px"><span class="status-dot" style="background:${dot}"></span> ${lang==='ar'?s.ar:s.en}</span>
        <span style="color:var(--muted)">(${c}) ${c>0? 'نتائج' : 'لا يوجد'}</span>
      </div>
    `;
  }).join('');
}

function formatPrice(n){
  if(!n) return '-';
  return new Intl.NumberFormat(lang==='ar'?'ar-EG':'en-EG').format(n) + ' ' + (lang==='ar'?'ج.م':'EGP');
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, m=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function toast(msg){
  els.toast.textContent = msg;
  els.toast.classList.remove('hidden');
  setTimeout(()=> els.toast.classList.add('hidden'), 2200);
}

function copyReport(){
  if(!currentData) return;
  const lines = [
    `تقرير أسعار: ${currentData.query} — Price Hunter`,
    `أقل سعر: ${formatPrice(currentData.minPrice)} (${getStoreName(currentData.minStore)})`,
    `متوسط السعر: ${formatPrice(currentData.avgPrice)}`,
    `عدد العروض: ${currentData.count}`,
    `---`,
    ...filteredData.map(p=> `${p.title} — ${formatPrice(p.price)} — ${getStoreName(p.store)} — ${p.url}`),
  ];
  copyText(lines.join('\n'));
}

function copyAIQuestion(){
  const q = currentData?.query || els.searchInput.value || 'سماعات هواوي';
  const prompt = `هل سعر "${q}" بـ ${formatPrice(currentData?.minPrice||1449)} هو أرخص سعر في مصر؟ قارن بين جوميا، نون، أمازون مصر، دريم 2000، بي تك، رنين، دبي فون، 2B، فونكس، ميامي سنترز، واتصال ستور.`;
  copyText(prompt);
}

function copyText(text){
  navigator.clipboard.writeText(text).then(()=> toast(i18n[lang].copied));
}

init();

// Demo: auto show example if no interaction after 2s on first load without q
if(!new URLSearchParams(location.search).get('q')){
  // keep hero only, but we can show hint
}


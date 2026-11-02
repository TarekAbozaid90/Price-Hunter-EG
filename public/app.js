const STORES = [
  {id:'jumia', ar:'جوميا', en:'Jumia', color:'#FF6B00', domain:'jumia.com.eg'},
  {id:'noon', ar:'نون', en:'Noon', color:'#FDE047', domain:'noon.com'},
  {id:'amazon', ar:'أمازون مصر', en:'Amazon Egypt', color:'#F59E0B', domain:'amazon.eg'},
  {id:'vontx', ar:'فونكس', en:'Vontx', color:'#2DD4BF', domain:'vontx.com'},
  {id:'dream2000', ar:'دريم 2000', en:'Dream 2000', color:'#EF4444', domain:'dream2000.com'},
  {id:'b2', ar:'2B', en:'2B', color:'#FACC15', domain:'2b.com.eg'},
  {id:'etisal', ar:'اتصال ستور', en:'Etisal Store', color:'#10B981', domain:'etisalstore.com'},
  {id:'dubai', ar:'دبي فون', en:'Dubai Phone', color:'#06B6D4', domain:'dubaiphone.com'},
  {id:'btech', ar:'بي تك', en:'B.TECH', color:'#DC2626', domain:'btech.com'},
  {id:'miami', ar:'ميامي سنترز', en:'Miami Centers', color:'#FB923C', domain:'miamicenters.com'},
  {id:'raneen', ar:'رنين', en:'Raneen', color:'#A78BFA', domain:'raneen.com'},
];
const CATS = [
  {id:'all', ar:'جميع', en:'All', icon:'🎮', q:''},
  {id:'tablet', ar:'تابلت', en:'Tablets', icon:'📱', q:'تابلت'},
  {id:'home', ar:'أجهزة منزلية', en:'Home appliances', icon:'🏠', q:'أجهزة منزلية'},
  {id:'tv', ar:'تلفزيونات', en:'TVs', icon:'📺', q:'تلفزيونات'},
  {id:'laptop', ar:'لابتوبات', en:'Laptops', icon:'💻', q:'لابتوب'},
  {id:'phone', ar:'موبايلات', en:'Phones', icon:'📱', q:'موبايلات'},
  {id:'earbuds', ar:'سماعات', en:'Earbuds', icon:'🎧', q:'سماعات'},
  {id:'watch', ar:'ساعات ذكية', en:'Smart watches', icon:'⌚', q:'ساعات ذكية'},
  {id:'gaming', ar:'جيمينج', en:'Gaming', icon:'🎮', q:'جيمينج'},
];
const SYNONYMS = {
  'سماعة': 'سماعات', 'سمعات': 'سماعات', 'airpods': 'سماعات', 'ايربودز': 'سماعات',
  'موبايل': 'موبايلات', 'جوال': 'موبايلات', 'تلفون': 'موبايلات', 'iphone': 'ايفون',
  'هواوي': 'هواوي', 'huawei': 'هواوي', 'سامسونج': 'سامسونج', 'samsung': 'سامسونج'
};
const i18n = {
  ar: {brand_ar:'صيّاد الأسعار',brand_en:'Price Hunter Egypt',hero_title:'صيّاد الأسعار',hero_sub:'ابحث عن أي منتج — نقارنلك الأسعار في 11 متجر مصري ونطلعلك تقرير مرتب بأرخص عرض',search_btn:'ابحث',placeholder:'اكتب اسم المنتج ... مثال: سماعات ساوندكور R50i',best_price:'أقل سعر',avg_price:'متوسط السعر',offers:'عدد العروض',stores_hit:'متاجر فيها نتائج',cheapest_first:'الأرخص أولاً',biggest_discount:'أعلى خصم',alpha:'أبجدي',copy_report:'نسخ التقرير',print_pdf:'طباعة / PDF',store_status:'حالة المتاجر (اضغط للتفاصيل)',ai_title:'اسأل أدوات الذكاء الاصطناعي',ai_desc:'انسخ نفس السؤال في Gemini أو ChatGPT أو Claude لمقارنة الآراء مع رأينا',copy_q:'نسخ السؤال',footer_1:'الأسعار لحظة البحث وقد تتغير — تأكد من السعر النهائي في صفحة المتجر قبل الشراء',footer_2:'دوس على أي عرض في النتائج وهتفتحلك صفحة المنتج نفسها على المتجر مباشرة.',loading:'جاري البحث في 11 متجر ... ⏳',open_product:'افتح المنتج',no_link:'الرابط غير متاح',cheapest:'الأرخص',copied:'تم النسخ ✅',no_results:'لا توجد نتائج، جرب كلمة أخرى',clear:'مسح', suggestion:'اقتراحات', price_history:'سجل الأسعار', unavailable:'غير متوفر'},
  en: {brand_ar:'Price Hunter Egypt',brand_en:'Price Hunter Egypt',hero_title:'Price Hunter',hero_sub:'Search any product — we compare prices across 11 Egyptian stores and build you a sorted report',search_btn:'Search',placeholder:'Type product name ... e.g. Huawei FreeBuds',best_price:'Best price',avg_price:'Average',offers:'Offers',stores_hit:'Stores with hits',cheapest_first:'Cheapest first',biggest_discount:'Biggest discount',alpha:'A-Z',copy_report:'Copy report',print_pdf:'Print / PDF',store_status:'Store status (click for details)',ai_title:'Ask AI tools',ai_desc:'Copy the same question to Gemini, ChatGPT or Claude to compare opinions',copy_q:'Copy question',footer_1:'Prices are at search time and may change — check final price on store page before buying.',footer_2:'Click any offer to open the product page on the store directly.',loading:'Searching 11 stores ... ⏳',open_product:'Open product',no_link:'No link',cheapest:'Cheapest',copied:'Copied ✅',no_results:'No results, try another keyword',clear:'Clear',suggestion:'Suggestions', price_history:'Price history', unavailable:'Unavailable'}
};
let lang = localStorage.getItem('ph_lang') || 'ar';
let currentData=null, filteredData=null, currentFilter='all', currentSort='cheapest';
const els = {
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  clearBtn: document.getElementById('clearBtn'),
  suggestions: document.getElementById('suggestions'),
  langToggle: document.getElementById('langToggle'),
  storesRow: document.getElementById('storesRow'),
  catsRow: document.getElementById('catsRow'),
  reportSection: document.getElementById('reportSection'),
  reportQueryText: document.getElementById('reportQueryText'),
  bcQuery: document.getElementById('bcQuery'),
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
  noResults: document.getElementById('noResults'),
  loading: document.getElementById('loading'),
  statusGrid: document.getElementById('statusGrid'),
  collapseBtn: document.getElementById('collapseBtn'),
  toast: document.getElementById('toast'),
};
function init(){
  renderStores(); renderCats(); bindEvents(); applyLang();
  const urlQ = new URLSearchParams(location.search).get('q');
  if(urlQ){ els.searchInput.value=urlQ; toggleClear(); doSearch(urlQ); }
}
function renderStores(){
  els.storesRow.innerHTML = STORES.map(s=> `<span class="store-pill" role="listitem"><i style="background:${s.color}" aria-hidden="true"></i>${lang==='ar'?s.ar:s.en}</span>`).join('');
}
function renderCats(){
  els.catsRow.innerHTML = CATS.map(c=> `<button class="cat-pill" data-q="${c.q}" aria-label="${lang==='ar'?c.ar:c.en}">${c.icon} ${lang==='ar'?c.ar:c.en}</button>`).join('');
  els.catsRow.querySelectorAll('.cat-pill').forEach(b=>{
    b.addEventListener('click', ()=>{
      const q=b.dataset.q;
      if(!q){ els.searchInput.value=''; els.reportSection.classList.add('hidden'); history.replaceState(null,'','/'); return; }
      els.searchInput.value=q; toggleClear(); doSearch(q);
    });
  });
}
function bindEvents(){
  els.searchBtn.addEventListener('click', ()=> doSearch(els.searchInput.value.trim()));
  els.searchInput.addEventListener('keydown', e=>{
    if(e.key==='Enter'){ e.preventDefault(); doSearch(els.searchInput.value.trim()); }
    if(e.key==='Escape'){ els.suggestions.classList.add('hidden'); }
    if(e.key==='ArrowDown'){ const first=els.suggestions.querySelector('.sugg-item'); if(first) first.focus(); }
  });
  els.searchInput.addEventListener('input', ()=>{
    toggleClear();
    debounceSuggest(els.searchInput.value);
  });
  els.searchInput.addEventListener('focus', ()=>{
    if(els.searchInput.value.length>=1) debounceSuggest(els.searchInput.value);
  });
  document.addEventListener('click', e=>{
    if(!e.target.closest('.search-wrap')) els.suggestions.classList.add('hidden');
  });
  els.clearBtn.addEventListener('click', ()=>{ els.searchInput.value=''; toggleClear(); els.suggestions.classList.add('hidden'); els.searchInput.focus(); });
  document.querySelectorAll('.hint-btn').forEach(b=> b.addEventListener('click', ()=>{ els.searchInput.value=b.dataset.hint; toggleClear(); doSearch(b.dataset.hint); }));
  els.langToggle.addEventListener('click', toggleLang);
  document.getElementById('btnCheapest').addEventListener('click', ()=> sortBy('cheapest'));
  document.getElementById('btnDiscount').addEventListener('click', ()=> sortBy('discount'));
  document.getElementById('btnAlpha').addEventListener('click', ()=> sortBy('alpha'));
  document.getElementById('btnCopy').addEventListener('click', copyReport);
  document.getElementById('btnPrint').addEventListener('click', ()=> window.print());
  document.getElementById('btnCopyAI').addEventListener('click', copyAIQuestion);
  document.querySelectorAll('.ai-btn[data-ai]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const q=currentData?.query||els.searchInput.value||'سماعات هواوي';
      const prompt= lang==='ar' ? `قارن لي أسعار "${q}" في المتاجر المصرية: جوميا، نون، أمازون مصر، دريم 2000، بي تك، رنين، إلخ. ما هو أرخص سعر حالياً؟` : `Compare prices for "${q}" across Egyptian stores: Jumia, Noon, Amazon EG, Dream 2000, etc. What is the cheapest price now?`;
      copyText(prompt); const urls={gemini:'https://gemini.google.com/',chatgpt:'https://chat.openai.com/',claude:'https://claude.ai/'}; window.open(urls[b.dataset.ai],'_blank');
    });
  });
  els.collapseBtn.addEventListener('click', ()=>{
    const hidden=els.statusGrid.classList.toggle('hidden');
    els.collapseBtn.setAttribute('aria-expanded', !hidden);
  });
  document.getElementById('btnClearFilter')?.addEventListener('click', ()=>{ currentFilter='all'; applyFilter(); });
}
function toggleClear(){ els.clearBtn.classList.toggle('hidden', !els.searchInput.value); }
function toggleLang(){ lang=lang==='ar'?'en':'ar'; localStorage.setItem('ph_lang',lang); applyLang(); if(currentData) renderReport(currentData); }
function applyLang(){
  document.documentElement.lang=lang; document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el=>{ const k=el.dataset.i18n; if(i18n[lang][k]) el.textContent=i18n[lang][k]; });
  els.searchInput.placeholder=i18n[lang].placeholder;
  els.langToggle.querySelectorAll('.lang-opt').forEach(o=>{ o.classList.toggle('active', o.dataset.lang===lang); o.setAttribute('aria-pressed', o.dataset.lang===lang); });
  renderStores(); renderCats();
}
let suggestTimer;
function debounceSuggest(v){
  clearTimeout(suggestTimer);
  suggestTimer=setTimeout(()=> showSuggestions(v), 180);
}
async function showSuggestions(q){
  if(!q || q.length<1){ els.suggestions.classList.add('hidden'); return; }
  try{
    const res = await fetch(`/api/suggestions?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if(!data.length){ els.suggestions.classList.add('hidden'); return; }
    els.suggestions.innerHTML = data.map(item=>{
      if(item.type==='search'){
        return `<button role="option" class="sugg-item sugg-search" data-q="${escapeHtml(item.query)}"><span class="sugg-icon">🔍</span><span class="sugg-text">${escapeHtml(item.title)}</span><span class="sugg-action">بحث</span></button>`;
      } else if(item.type==='product'){
        const store = STORES.find(s=>s.id===item.store);
        const storeName = store ? (lang==='ar'?store.ar:store.en) : item.storeName;
        return `<button role="option" class="sugg-item sugg-product" data-q="${escapeHtml(item.query)}" data-model="${escapeHtml(item.model)}">
          <span class="sugg-img" style="background:${getImgColor(item.image)}">🎧</span>
          <span class="sugg-text">
            <span class="sugg-title">${escapeHtml(item.title)}</span>
            <span class="sugg-meta">${storeName} • ${formatPrice(item.price)} • ${item.model}</span>
          </span>
          <span class="sugg-action">↗</span>
        </button>`;
      } else {
        return `<button role="option" class="sugg-item" data-q="${escapeHtml(item.query)}"><span class="sugg-icon">💡</span><span class="sugg-text">${escapeHtml(item.title)}</span></button>`;
      }
    }).join('');
    els.suggestions.classList.remove('hidden');
    els.searchInput.setAttribute('aria-expanded','true');
    els.suggestions.querySelectorAll('.sugg-item').forEach(b=>{
      b.addEventListener('click', ()=>{
        const q = b.dataset.q;
        const model = b.dataset.model;
        els.searchInput.value = q;
        toggleClear();
        els.suggestions.classList.add('hidden');
        doSearch(q, model);
      });
    });
  } catch(e){
    els.suggestions.classList.add('hidden');
  }
}
function getImgColor(type){
  const colors={white:'#fff',blue:'#DBEAFE',black:'#1F2937',beige:'#F5E6C8',purple:'#E9D5FF',green:'#DCFCE7',red:'#FECACA',silver:'#E5E7EB',white2:'#F3F4F6',black2:'#111827'};
  return colors[type]||'#fff';
}
function normalizeQuery(q){
  let n=q.trim().toLowerCase();
  Object.entries(SYNONYMS).forEach(([k,v])=>{ if(n.includes(k)) n=n.replace(k,v); });
  return n;
}
async function doSearch(raw, modelFilter=null){
  const query=normalizeQuery(raw);
  if(!query || query.length<2){ toast(lang==='ar'?'اكتب كلمة بحث أولاً':'Type a search term'); return; }
  els.loading.classList.remove('hidden'); els.reportSection.classList.add('hidden'); els.suggestions.classList.add('hidden');
  saveHistory(query);
  try{
    const res=await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data=await res.json();
    document.title=`${query} — ${data.minPrice? formatPrice(data.minPrice)+' | ':''}صيّاد الأسعار`;
    history.replaceState(null,'', `?q=${encodeURIComponent(query)}`);
    injectProductLD(data);
    currentData=data; filteredData=[...data.results];
    if(modelFilter){
      filteredData = data.results.filter(p=> p.model.toLowerCase()===modelFilter.toLowerCase() || p.title.toLowerCase().includes(modelFilter.toLowerCase()));
      if(filteredData.length===0) filteredData=[...data.results];
    }
    currentFilter='all'; renderReportWithFiltered(data, filteredData);
  }catch(e){ toast('خطأ في البحث'); } finally { els.loading.classList.add('hidden'); }
}
function saveHistory(q){
  let h=JSON.parse(localStorage.getItem('ph_history')||'[]');
  h=h.filter(x=>x!==q); h.unshift(q); h=h.slice(0,5); localStorage.setItem('ph_history', JSON.stringify(h));
}
function injectProductLD(data){
  let old=document.getElementById('ld-products'); if(old) old.remove();
  const ld={
    "@context":"https://schema.org",
    "@type":"ItemList",
    "name":`نتائج البحث عن ${data.query}`,
    "numberOfItems": data.count,
    "itemListElement": data.results.slice(0,10).map((p,i)=>({
      "@type":"ListItem",
      "position": i+1,
      "item": {
        "@type":"Product",
        "name": p.title,
        "offers": {"@type":"Offer", "price": p.price, "priceCurrency":"EGP", "availability": p.availability ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", "seller": {"@type":"Organization","name": getStoreName(p.store)}}
      }
    }))
  };
  const s=document.createElement('script'); s.type='application/ld+json'; s.id='ld-products'; s.textContent=JSON.stringify(ld); document.head.appendChild(s);
}
function renderReportWithFiltered(data, filtered){
  els.reportSection.classList.remove('hidden');
  els.reportQueryText.textContent=data.query; els.bcQuery.textContent=data.query;
  const date=new Date().toLocaleDateString(lang==='ar'?'ar-EG':'en-EG', {year:'numeric', month:'long', day:'numeric'});
  const time=new Date().toLocaleTimeString(lang==='ar'?'ar-EG':'en-EG', {hour:'2-digit', minute:'2-digit'});
  els.reportMeta.textContent=`Price Hunter — ${date} • ${time}`;
  if(data.demoMode){ els.banner.classList.add('hidden'); els.demoBanner.classList.remove('hidden'); } else { els.demoBanner.classList.add('hidden'); els.banner.classList.remove('hidden'); els.bannerText.textContent= lang==='ar' ? `✅ نتائج حية من ${data.storesWithHits} متجر — استغرق البحث ${data.tookSeconds} ثانية` : `✅ Live results from ${data.storesWithHits} stores — ${data.tookSeconds}s`; }
  // Best price should exclude unavailable
  const available = data.results.filter(p=> p.availability);
  const minP = available.length ? Math.min(...available.map(p=>p.price)) : 0;
  const minStore = available.length ? available.reduce((a,b)=> a.price < b.price ? a : b).store : null;
  els.statBest.textContent=formatPrice(minP); els.statBestStore.textContent=getStoreName(minStore); els.statAvg.textContent=formatPrice(data.avgPrice); els.statCount.textContent=data.count; els.statStores.textContent=data.storesWithHits;
  renderFilters(data);
  filteredData=filtered;
  renderProducts(filteredData);
  renderStatusGrid(data);
  els.reportSection.scrollIntoView({behavior:'smooth'});
}
function renderReport(data){
  renderReportWithFiltered(data, [...data.results]);
}
function getStoreName(id){ const s=STORES.find(x=>x.id===id); return s? (lang==='ar'?s.ar:s.en) : '-'; }
// Format last update: منذ 15 دقيقة etc.
function formatLastUpdate(minutes){
  if(minutes < 60) return `منذ ${minutes} دقيقة`;
  if(minutes < 1440) return `منذ ${Math.floor(minutes/60)} ساعات`;
  return `منذ ${Math.floor(minutes/1440)} أيام`;
}
function formatLastUpdateEn(minutes){
  if(minutes < 60) return `${minutes}m ago`;
  if(minutes < 1440) return `${Math.floor(minutes/60)}h ago`;
  return `${Math.floor(minutes/1440)}d ago`;
}
function statusBadge(status){
  const map = {
    verified: {ar:'سعر تم التحقق منه حديثًا', en:'Verified', color:'#10B981', bg:'rgba(16,185,129,.12)', border:'rgba(16,185,129,.35)', icon:'✅'},
    last_known: {ar:'سعر آخر رصد مسجل', en:'Last recorded', color:'#F59E0B', bg:'rgba(245,158,11,.12)', border:'rgba(245,158,11,.35)', icon:'🕒'},
    needs_check: {ar:'السعر يحتاج إلى إعادة تحقق', en:'Needs re-check', color:'#EF4444', bg:'rgba(239,68,68,.12)', border:'rgba(239,68,68,.35)', icon:'⚠️'},
    unavailable: {ar:'تعذر التأكد من التوفر', en:'Unavailable', color:'#6B7280', bg:'rgba(107,114,128,.12)', border:'rgba(107,114,128,.35)', icon:'🚫'}
  };
  const m = map[status] || map['last_known'];
  const label = lang==='ar' ? m.ar : m.en;
  return `<span class="status-badge" style="background:${m.bg};border-color:${m.border};color:${m.color}">${m.icon} ${label}</span>`;
}
function renderFilters(data){
  const counts={}; data.results.forEach(r=> counts[r.store]=(counts[r.store]||0)+1);
  const pills=[{id:'all', label: lang==='ar'?'الكل':'All', count:data.count, color:'#3B82F6'}, ...STORES.map(s=> ({id:s.id, label: lang==='ar'?s.ar:s.en, count: counts[s.id]||0, color:s.color}))];
  els.filters.innerHTML=pills.map(p=> `<button class="filter-pill ${currentFilter===p.id?'active':''}" data-filter="${p.id}" aria-pressed="${currentFilter===p.id}"><i style="background:${p.color}" aria-hidden="true"></i> ${p.label} <span style="opacity:.7">(${p.count})</span></button>`).join('');
  els.filters.querySelectorAll('.filter-pill').forEach(b=> b.addEventListener('click', ()=>{ currentFilter=b.dataset.filter; els.filters.querySelectorAll('.filter-pill').forEach(x=>{x.classList.remove('active'); x.setAttribute('aria-pressed','false')}); b.classList.add('active'); b.setAttribute('aria-pressed','true'); applyFilter(); }));
}
function applyFilter(){
  if(!currentData) return;
  filteredData= currentFilter==='all' ? [...currentData.results] : currentData.results.filter(r=> r.store===currentFilter);
  sortBy(currentSort,false);
}
function sortBy(type, updateUI=true){
  currentSort=type;
  if(!filteredData) return;
  if(type==='cheapest') filteredData.sort((a,b)=> {
    if(a.availability!==b.availability) return a.availability ? -1 : 1;
    return a.price-b.price;
  });
  else if(type==='discount') filteredData.sort((a,b)=> (b.discount||0)-(a.discount||0));
  else if(type==='alpha') filteredData.sort((a,b)=> a.title.localeCompare(b.title));
  renderProducts(filteredData);
  if(updateUI){ document.querySelectorAll('.action-btn').forEach(b=>{b.classList.remove('primary'); b.setAttribute('aria-pressed','false')}); const map={cheapest:'btnCheapest',discount:'btnDiscount',alpha:'btnAlpha'}; const el=document.getElementById(map[type]); if(el){el.classList.add('primary'); el.setAttribute('aria-pressed','true')} }
}
function renderProducts(list){
  if(!list.length){ els.productList.innerHTML=''; els.noResults.classList.remove('hidden'); return; }
  els.noResults.classList.add('hidden');
  const available = list.filter(p=> p.availability);
  const minPrice = available.length ? Math.min(...available.map(p=>p.price)) : Infinity;
  els.productList.innerHTML=list.map(p=>{
    const isBest = p.availability && p.price===minPrice;
    const isUnavailable = !p.availability;
    const store=STORES.find(s=>s.id===p.store);
    const storeLabel=store? (lang==='ar'?store.ar:store.en) : p.store;
    const lastUpdateText = lang==='ar' ? formatLastUpdate(p.lastUpdatedMinutes) : formatLastUpdateEn(p.lastUpdatedMinutes);
    const historyHtml = renderPriceHistory(p);
    // Price trend: compare current vs previous
    let trend = '';
    if(p.previousPrice){
      if(p.price < p.previousPrice) trend = `<span class="trend down">▼ ${Math.round((1 - p.price/p.previousPrice)*100)}%</span>`;
      else if(p.price > p.previousPrice) trend = `<span class="trend up">▲ ${Math.round((p.price/p.previousPrice-1)*100)}%</span>`;
      else trend = `<span class="trend stable">— مستقر</span>`;
    }
    return `<div class="product-card ${isBest?'best':''} ${isUnavailable?'unavailable':''}" itemscope itemtype="https://schema.org/Product" data-model="${p.model}">
      <article class="product-row ${isBest?'best':''} ${isUnavailable?'unavailable':''}" onclick="if(event.target.tagName!=='A' && !event.target.closest('button')) window.open('${p.url}','_blank')" style="${isUnavailable?'cursor:default':''}">
        <div class="product-img" aria-hidden="true"><div style="width:100%;height:100%;background:${getImgColor(p.image)};display:grid;place-items:center;font-size:22px;opacity:${isUnavailable?0.5:1}">🎧</div></div>
        <div class="product-info">
          <h3 class="product-title" itemprop="name">${escapeHtml(p.title)} ${isUnavailable?`<span class="unavail-tag">— ${lang==='ar'?'غير متوفر':i18n[lang].unavailable}</span>`:''}</h3>
          <div class="product-meta">
            <span class="store-badge ${p.store}" itemprop="seller"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${store?.color};margin-left:6px"></span>${storeLabel}</span>
            ${isBest?`<span class="cheapest-tag">🏆 ${i18n[lang].cheapest}</span>`:''}
            <span class="model-tag">${p.model}</span>
            ${isUnavailable?`<span class="unavail-badge">🚫 ${lang==='ar'?'غير متوفر حاليًا':i18n[lang].unavailable}</span>`:''}
          </div>
          <div class="update-row">
            <span class="last-update">🕒 آخر تحديث: ${lastUpdateText}</span>
            ${statusBadge(p.status)}
          </div>
          <div class="link-verify">
            ${p.url.includes('/products/') || p.url.includes('.html') || p.url.includes('/dp/') || p.url.includes('/p/') ? `<span class="verify ok">✅ رابط مباشر للمنتج</span>` : `<span class="verify warn">⚠️ رابط بحث المتجر</span>`}
            <span class="store-domain">${store?.domain || p.store}</span>
          </div>
          <meta itemprop="price" content="${p.price}"><meta itemprop="priceCurrency" content="EGP">
        </div>
        <div class="price-box">
          <div class="price ${isBest?'best':''} ${isUnavailable?'strikethrough':''}">${formatPrice(p.price)}</div>
          ${p.originalPrice && !isUnavailable?`<div class="orig">${formatPrice(p.originalPrice)}</div>`:''}
          ${trend}
        </div>
        ${p.discount && !isUnavailable?`<span class="discount" aria-label="خصم ${p.discount} بالمئة">-${p.discount}%</span>`:`<span class="sep" aria-hidden="true">—</span>`}
        <div class="product-action" onclick="event.stopPropagation()">
          ${isUnavailable ? `<span class="btn-open disabled">🚫 غير متوفر</span>` : `<a href="${p.url}" target="_blank" rel="noopener noreferrer" class="btn-open" itemprop="url" aria-label="افتح ${p.title} في ${storeLabel}">↗ ${i18n[lang].open_product}</a>`}
          <button class="btn-history" onclick="toggleHistory(${p.id})" aria-expanded="false">📈 السجل</button>
        </div>
      </article>
      <div id="history-${p.id}" class="price-history hidden">
        <div class="history-header">
          <strong>📊 ${lang==='ar'?'سجل تغير الأسعار — هل السعر الحالي مناسب؟':i18n[lang].price_history}</strong>
          <span class="history-note">السعر الحالي ${formatPrice(p.price)} ${p.previousPrice ? (p.price < p.previousPrice ? `— أقل من السابق ${formatPrice(p.previousPrice)} ✅` : `— أعلى من السابق ${formatPrice(p.previousPrice)}`) : ''}</span>
        </div>
        ${historyHtml}
        <div class="history-footer">الخلفيّة: نمط الأسواق — أسعار حية من المتجر</div>
      </div>
    </div>`;
  }).join('');
  // Add event listeners for history toggles after render
  window.toggleHistory = function(id){
    const el = document.getElementById(`history-${id}`);
    if(el) el.classList.toggle('hidden');
  };
}
function renderPriceHistory(p){
  if(!p.priceHistory || !p.priceHistory.length) return '';
  const max = Math.max(...p.priceHistory.map(h=>h.price));
  const min = Math.min(...p.priceHistory.map(h=>h.price));
  const range = max - min || 1;
  const bars = p.priceHistory.map(h=>{
    const hPercent = ((h.price - min)/range)*60 + 20;
    const isCurrent = h.price===p.price;
    return `<div class="hist-bar-wrap">
      <div class="hist-bar ${isCurrent?'current':''}" style="height:${hPercent}%">
        <span class="hist-price">${h.price}</span>
      </div>
      <span class="hist-date">${h.date.slice(5)}</span>
    </div>`;
  }).join('');
  const tableRows = p.priceHistory.map(h=> `<tr><td>${h.date}</td><td>${formatPrice(h.price)}</td><td>${h.price===p.price?'← الحالي':''}</td></tr>`).join('');
  return `<div class="history-chart-wrap">
    <div class="history-chart">${bars}</div>
    <table class="history-table"><thead><tr><th>التاريخ</th><th>السعر</th><th></th></tr></thead><tbody>${tableRows}</tbody></table>
  </div>`;
}
function renderStatusGrid(data){
  const counts={}; data.results.forEach(r=> counts[r.store]=(counts[r.store]||0)+1);
  els.statusGrid.innerHTML=STORES.map(s=>{
    const c=counts[s.id]||0; const dot=c>0?'#10B981':'#EF4444';
    return `<div class="status-item"><span style="display:flex;align-items:center;gap:8px"><span class="status-dot" style="background:${dot}"></span> ${lang==='ar'?s.ar:s.en}</span><span style="color:var(--muted)">(${c}) ${c>0?'نتائج':'—'}</span></div>`;
  }).join('');
}
function formatPrice(n){ if(!n && n!==0) return '-'; return new Intl.NumberFormat(lang==='ar'?'ar-EG':'en-EG').format(n)+' '+(lang==='ar'?'ج.م':'EGP'); }
function escapeHtml(s){ return s.replace(/[&<>"']/g, m=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function toast(msg){ els.toast.textContent=msg; els.toast.classList.remove('hidden'); setTimeout(()=> els.toast.classList.add('hidden'), 2200); }
function copyReport(){
  if(!currentData) return;
  const lines=[`تقرير أسعار: ${currentData.query} — Price Hunter`, `أقل سعر: ${formatPrice(Math.min(...currentData.results.filter(p=>p.availability).map(p=>p.price)))}`, `متوسط السعر: ${formatPrice(currentData.avgPrice)}`, `عدد العروض: ${currentData.count}`, `---`, ...filteredData.map(p=> `${p.title} — ${formatPrice(p.price)} — ${getStoreName(p.store)} — ${p.url} — ${formatLastUpdate(p.lastUpdatedMinutes)} — ${p.status}`)];
  copyText(lines.join('\n'));
}
function copyAIQuestion(){
  const q=currentData?.query||els.searchInput.value||'سماعات هواوي';
  const prompt= lang==='ar' ? `هل سعر "${q}" بـ ${formatPrice(currentData?.minPrice||1449)} هو أرخص سعر في مصر؟ قارن بين جوميا، نون، أمازون مصر، دريم 2000، بي تك، رنين، دبي فون، 2B، فونكس، ميامي سنترز، واتصال ستور.` : `Is the price "${q}" at ${formatPrice(currentData?.minPrice||1449)} the cheapest in Egypt? Compare Jumia, Noon, Amazon EG, Dream2000, etc.`;
  copyText(prompt);
}
function copyText(text){ navigator.clipboard.writeText(text).then(()=> toast(i18n[lang].copied)); }
init();

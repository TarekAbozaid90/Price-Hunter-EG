/* ============================================================
   صيّاد الأسعار — Price Hunter Egypt · Frontend
   Real products · real prices · real product-page links
   Watermark: Tarek Abozaid © 2026
   ============================================================ */
const STORES = [
  {id:'dream2000', ar:'دريم 2000', en:'Dream 2000', color:'#EF4444', domain:'dream2000.com', live:true},
  {id:'vontx',     ar:'فونكس',     en:'Vontx',       color:'#2DD4BF', domain:'vontx.com', live:true},
  {id:'etisal',    ar:'اتصال ستور', en:'Etisal Store', color:'#10B981', domain:'etisalstore.com', live:true},
  {id:'miami',     ar:'ميامي سنترز', en:'Miami Centers', color:'#FB923C', domain:'miamicenters.com', live:true},
  {id:'dubai',     ar:'دبي فون',   en:'Dubai Phone',  color:'#06B6D4', domain:'dubaiphone.net', live:true},
  {id:'imedia',    ar:'آي ميديا',  en:'iMedia Stores', color:'#3B82F6', domain:'imediastores.com', live:true},
  {id:'annoshka',  ar:'أنوشكا',    en:'Annoshka',      color:'#F472B6', domain:'annoshka.com', live:true},
  {id:'shift',     ar:'شِفت ستور', en:'Shift Store',    color:'#6366F1', domain:'shiftstore-eg.com', live:true},
  {id:'xprs',      ar:'XPRS',      en:'XPRS',          color:'#0EA5E9', domain:'myxprs.com', live:true},
  {id:'kimo',      ar:'كيمو ستور', en:'Kimo Store',    color:'#F59E0B', domain:'kimostore.net', live:true},
  {id:'iq',        ar:'آي كيو موبايلز', en:'IQ Mobiles', color:'#84CC16', domain:'iq-mobiles.com', live:true},
  {id:'shennawy',  ar:'الشناوي',   en:'El Shennawy',   color:'#A855F7', domain:'elshennawy.com', live:true},
  {id:'jumia',     ar:'جوميا',     en:'Jumia',        color:'#FF6B00', domain:'jumia.com.eg', live:false},
  {id:'noon',      ar:'نون',       en:'Noon',         color:'#FDE047', domain:'noon.com', live:false},
  {id:'amazon',    ar:'أمازون مصر', en:'Amazon Egypt', color:'#F59E0B', domain:'amazon.eg', live:false},
  {id:'b2',        ar:'2B',        en:'2B',           color:'#FACC15', domain:'2b.com.eg', live:false},
  {id:'btech',     ar:'بي تك',     en:'B.TECH',       color:'#DC2626', domain:'btech.com', live:false},
  {id:'raneen',    ar:'رنين',      en:'Raneen',       color:'#A78BFA', domain:'raneen.com', live:false},
  {id:'kaza',      ar:'كازا',      en:'Kaza',          color:'#E11D48', domain:'kaza.com.eg', live:false},
];
const CATS = [
  {id:'all',    ar:'جميع',          en:'All',             icon:'✨', q:''},
  {id:'phone',  ar:'موبايلات',      en:'Phones',          icon:'📱', q:'samsung galaxy'},
  {id:'earbuds',ar:'سماعات',        en:'Earbuds',         icon:'🎧', q:'huawei freebuds'},
  {id:'laptop', ar:'لابتوبات',      en:'Laptops',         icon:'💻', q:'laptop'},
  {id:'tablet', ar:'تابلت',         en:'Tablets',         icon:'📲', q:'tablet'},
  {id:'tv',     ar:'تلفزيونات',     en:'TVs',             icon:'📺', q:'tv'},
  {id:'watch',  ar:'ساعات ذكية',    en:'Smart watches',   icon:'⌚', q:'smart watch'},
  {id:'gaming', ar:'جيمينج',        en:'Gaming',          icon:'🎮', q:'playstation'},
];
const i18n = {
  ar: {
    brand_ar:'صيّاد الأسعار', brand_en:'Price Hunter Egypt',
    hero_title:'صيّاد الأسعار',
    hero_sub:'ابحث عن أي منتج — نجيبلك السعر الحقيقي لحظتها من المتاجر، وكل نتيجة تفتح صفحة المنتج نفسها مباشرة',
    search_btn:'ابحث', placeholder:'اكتب اسم المنتج ... مثال: Huawei FreeBuds SE 2',
    try:'جرّب:',
    subscribe:'تنبيهات الأسعار',
    subscribe_cta:'عايز الأسعار الجديدة توصلك؟',
    subscribe_sub:'سجّل إيميلك أو رقم الواتساب — وهنبعتلك أحدث الأسعار والعروض',
    subscribe_footer:'اطلب الأسعار الجديدة على إيميلك أو واتسابك',
    float_label:'الأسعار الجديدة',
    sub_title:'ابعتولي الأسعار الجديدة',
    sub_desc:'سجّل بياناتك وهنبعتلك الأسعار والعروض الجديدة أول بأول — إيميل أو واتساب، اللي يريحك.',
    email:'إيميل', whatsapp:'واتساب',
    sub_submit:'سجّلني وسابعتلي الأسعار',
    sub_privacy:'بياناتك محفوظة عندنا ومش بنشاركها مع حد — تقدر تلغي الاشتراك في أي وقت.',
    best_price:'أقل سعر', avg_price:'متوسط السعر', offers:'عروض حقيقية', stores_hit:'متاجر فيها نتائج',
    cheapest_first:'الأرخص أولاً', biggest_discount:'أعلى خصم', alpha:'أبجدي',
    copy_report:'نسخ التقرير', print_pdf:'طباعة / PDF',
    more_stores:'كمان: افتح بحث المتاجر التانية بنفس الكلمة',
    links_note:'المتاجر دي بتمنع السحب المباشر للأسعار من السيرفرات — بس زرار واحد يفتحلك نتائج البحث عن نفس المنتج عندهم فورًا.',
    open_search:'افتح البحث عندهم',
    report_of:'تقرير أسعار:',
    live_from:'أسعار حقيقية لحظية من', stores_word:'متجر — استغرق البحث', seconds_word:'ثانية',
    open_product:'افتح صفحة المنتج', direct_link:'✅ صفحة المنتج مباشرة على المتجر',
    cheapest:'الأرخص', copied:'تم النسخ ✅',
    no_results:'لا توجد نتائج حقيقية لهذا البحث — جرب كلمة تانية أو افتح بحث المتاجر تحت',
    loading:'جاري السؤال في المتاجر الحقيقية ... ⏳',
    alert_title:'تنبيه السعر للمنتج', alert_submit:'تفعيل التنبيه',
    alert_btn:'🔔 نبهني عند نزول السعر',
    history_btn:'📈 أسعاري المتتبعة',
    last_seen:'آخر سعر شفته', on:'في',
    footer_1:'الأسعار لحظة البحث وممكن تتغير — تأكد من السعر النهائي في صفحة المتجر قبل الشراء.',
    footer_2:'كل نتيجة عندنا بتربطك بصفحة المنتج نفسها على المتجر مباشرة — مفيش لينكات عشوائية.',
    type_first:'اكتب كلمة بحث أولاً (حرفين على الأقل)',
    sub_saved:'تم التسجيل ✅ هتبعتلك الأسعار الجديدة قريبًا',
    sub_error:'حصل خطأ — جرب تاني',
    live_badge:'سعر حي',
    grid_view:'عرض شبكي', list_view:'عرض قائمة',
  },
  en: {
    brand_ar:'Price Hunter Egypt', brand_en:'Price Hunter Egypt',
    hero_title:'Price Hunter',
    hero_sub:'Search any product — we pull the real price from stores right now, and every result opens the actual product page',
    search_btn:'Search', placeholder:'Type a product ... e.g. Huawei FreeBuds SE 2',
    try:'Try:',
    subscribe:'Price alerts',
    subscribe_cta:'Want the new prices delivered to you?',
    subscribe_sub:'Register your email or WhatsApp — we send you the latest prices & offers',
    subscribe_footer:'Get the new prices on your email or WhatsApp',
    float_label:'New prices',
    sub_title:'Send me the new prices',
    sub_desc:'Register below and we will send you the newest prices and offers — email or WhatsApp, your choice.',
    email:'Email', whatsapp:'WhatsApp',
    sub_submit:'Register me for prices',
    sub_privacy:'Your data stays with us, never shared — unsubscribe anytime.',
    best_price:'Best price', avg_price:'Average', offers:'Real offers', stores_hit:'Stores with hits',
    cheapest_first:'Cheapest first', biggest_discount:'Biggest discount', alpha:'A-Z',
    copy_report:'Copy report', print_pdf:'Print / PDF',
    more_stores:'Also: open the same search on other stores',
    links_note:'These stores block server-side price scraping — one click opens their own search results for the same product.',
    open_search:'Open their search',
    report_of:'Price report:',
    live_from:'Real live prices from', stores_word:'stores — took', seconds_word:'s',
    open_product:'Open product page', direct_link:'✅ Direct product page on the store',
    cheapest:'Cheapest', copied:'Copied ✅',
    no_results:'No real results for this search — try another keyword or use the store links below',
    loading:'Asking the real stores ... ⏳',
    alert_title:'Product price alert', alert_submit:'Activate alert',
    alert_btn:'🔔 Alert me on price drop',
    history_btn:'📈 My tracked prices',
    last_seen:'Last seen price', on:'on',
    footer_1:'Prices are at search time and may change — check the final price on the store page before buying.',
    footer_2:'Every result links to the actual product page on the store — no random links.',
    type_first:'Type at least 2 characters first',
    sub_saved:'Registered ✅ you will receive the new prices soon',
    sub_error:'Something went wrong — try again',
    live_badge:'Live price',
    grid_view:'Grid view', list_view:'List view',
  }
};
let lang = localStorage.getItem('ph_lang') || 'ar';
let currentData = null, filteredData = null, currentFilter = 'all', currentSort = 'cheapest';
let viewMode = localStorage.getItem('ph_view') || 'grid'; // grid | list
const els = {
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  clearBtn: document.getElementById('clearBtn'),
  suggestions: document.getElementById('suggestions'),
  langToggle: document.getElementById('langToggle'),
  storesRow: document.getElementById('storesRow'),
  catsRow: document.getElementById('catsRow'),
  reportSection: document.getElementById('main-content'),
  reportQueryText: document.getElementById('reportQueryText'),
  bcQuery: document.getElementById('bcQuery'),
  reportMeta: document.getElementById('reportMeta'),
  bannerText: document.getElementById('bannerText'),
  statBest: document.getElementById('statBest'),
  statBestStore: document.getElementById('statBestStore'),
  statAvg: document.getElementById('statAvg'),
  statCount: document.getElementById('statCount'),
  statStores: document.getElementById('statStores'),
  filters: document.getElementById('filters'),
  productList: document.getElementById('productList'),
  noResults: document.getElementById('noResults'),
  loading: document.getElementById('loading'),
  toast: document.getElementById('toast'),
  storeLinksSection: document.getElementById('storeLinksSection'),
  storeLinks: document.getElementById('storeLinks'),
};

/* ================= Watermark (Tarek Abozaid) ================= */
function buildWatermark(){
  const layer = document.getElementById('watermarkLayer');
  if(!layer) return;
  layer.innerHTML = '';
  const w = window.innerWidth, h = window.innerHeight;
  const big = document.createElement('div');
  big.className = 'wm-hero'; big.textContent = 'Tarek Abozaid';
  layer.appendChild(big);
  const stepX = 300, stepY = 190;
  const cols = Math.ceil(w / stepX) + 2, rows = Math.ceil(h / stepY) + 2;
  for(let r=0; r<rows; r++){
    for(let c=0; c<cols; c++){
      const t = document.createElement('div');
      t.className = 'wm-tile';
      t.textContent = 'Tarek Abozaid';
      t.style.fontSize = (12 + ((r + c) % 3) * 4) + 'px';
      t.style.left = (c * stepX + (r % 2 ? stepX / 2 : 0)) + 'px';
      t.style.top = (r * stepY) + 'px';
      layer.appendChild(t);
    }
  }
}
let wmResizeTimer;
window.addEventListener('resize', ()=>{ clearTimeout(wmResizeTimer); wmResizeTimer = setTimeout(buildWatermark, 300); });

/* ================= Helpers ================= */
function getStore(id){ return STORES.find(s=>s.id===id); }
function getStoreName(id){ const s=getStore(id); return s ? (lang==='ar'?s.ar:s.en) : id; }
function formatPrice(n){ if(!n && n!==0) return '-'; return new Intl.NumberFormat(lang==='ar'?'ar-EG':'en-EG').format(n)+' '+(lang==='ar'?'ج.م':'EGP'); }
function escapeHtml(s){ return String(s??'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function toast(msg){ els.toast.textContent=msg; els.toast.classList.remove('hidden'); setTimeout(()=> els.toast.classList.add('hidden'), 2600); }

/* ================= Price tracking (real, client-side) ================= */
const TRACK_KEY = 'ph_seen_v2';
function loadTracking(){ try{ return JSON.parse(localStorage.getItem(TRACK_KEY)||'{}'); }catch(e){ return {}; } }
function saveTrackingPoint(url, price){
  if(!url || !price) return null;
  const all = loadTracking();
  const key = url.split('?')[0];
  const list = all[key] || [];
  const last = list[list.length-1];
  if(!last || last.p !== price){ list.push({ d: new Date().toISOString().slice(0,10), p: price }); if(list.length>12) list.shift(); }
  all[key] = list;
  try{ localStorage.setItem(TRACK_KEY, JSON.stringify(all)); }catch(e){}
  return { history: list, previous: last && last.p !== price ? last.p : (list.length>1 ? list[list.length-2].p : null) };
}
function getTracking(url){ const all = loadTracking(); return all[url.split('?')[0]] || []; }

/* ================= Subscribe modal ================= */
let subType = 'email';
function openSubscribeModal(prefillQuery){
  const q = document.getElementById('subQuery');
  if(prefillQuery && !q.value) q.value = prefillQuery;
  document.getElementById('subSuccess').classList.add('hidden');
  const saved = localStorage.getItem('ph_sub_contact');
  if(saved) document.getElementById('subContact').value = saved;
  document.getElementById('subscribeModal').classList.add('open');
}
function closeSubscribeModal(){ document.getElementById('subscribeModal').classList.remove('open'); }
function switchSubType(type){
  subType = type;
  document.querySelectorAll('#subscribeModal .sub-tab').forEach(b=>{
    const on = b.dataset.type===type;
    b.classList.toggle('active', on); b.setAttribute('aria-selected', on);
  });
  const input = document.getElementById('subContact');
  if(type==='email'){ input.type='email'; input.placeholder='example@mail.com'; }
  else { input.type='tel'; input.placeholder='01xxxxxxxxx'; input.style.direction='ltr'; }
}
async function submitSubscribe(){
  const contact = document.getElementById('subContact').value.trim();
  const query = document.getElementById('subQuery').value.trim();
  if(!contact){ toast(lang==='ar'?'أدخل الإيميل أو رقم الواتساب':'Enter your contact'); return; }
  if(subType==='email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)){ toast(lang==='ar'?'أدخل إيميل صحيح':'Enter a valid email'); return; }
  if(subType==='whatsapp' && !/^(\+?2?01[0-9]{9})$/.test(contact.replace(/[\s-]/g,''))){ toast(lang==='ar'?'أدخل رقم واتساب صحيح 01xxxxxxxxx':'Enter a valid Egyptian WhatsApp number'); return; }
  const btn = document.getElementById('subSubmit');
  btn.disabled = true; btn.style.opacity = .7;
  try{
    const res = await fetch('/api/subscribe', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ contact, type: subType, query: query || null, source:'modal' })
    });
    const data = await res.json();
    if(data.ok){
      localStorage.setItem('ph_sub_contact', contact);
      const ok = document.getElementById('subSuccess');
      ok.textContent = data.message; ok.classList.remove('hidden');
      toast(i18n[lang].sub_saved);
      setTimeout(closeSubscribeModal, 2000);
    } else toast(data.error || i18n[lang].sub_error);
  }catch(e){ toast(i18n[lang].sub_error); }
  finally{ btn.disabled = false; btn.style.opacity = 1; }
}

/* ================= Product alert modal ================= */
let currentAlertProduct = null, alertType = 'email';
function openAlertModal(prod){
  currentAlertProduct = prod;
  document.getElementById('alertDesc').textContent = `"${(prod.title||'').slice(0,50)}" — ${lang==='ar'?'السعر الحالي':'current price'} ${formatPrice(prod.price)}`;
  document.getElementById('alertSuccess').classList.add('hidden');
  document.getElementById('alertContact').value = localStorage.getItem('ph_sub_contact') || '';
  document.getElementById('alertPrice').value = '';
  document.getElementById('alertModal').classList.add('open');
}
function closeAlertModal(){ document.getElementById('alertModal').classList.remove('open'); }
function switchAlertType(type){
  alertType = type;
  document.querySelectorAll('#alertModal .sub-tab').forEach(b=> b.classList.toggle('active', b.dataset.atype===type));
  const input = document.getElementById('alertContact');
  if(type==='email'){ input.type='email'; input.placeholder='example@mail.com'; }
  else { input.type='tel'; input.placeholder='01xxxxxxxxx'; }
}
async function submitAlert(){
  const contact = document.getElementById('alertContact').value.trim();
  const targetPrice = document.getElementById('alertPrice').value.trim();
  if(!contact){ toast(lang==='ar'?'أدخل الإيميل أو رقم الواتساب':'Enter contact'); return; }
  try{
    const res = await fetch('/api/alerts', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        productId: currentAlertProduct.id, productTitle: currentAlertProduct.title,
        store: currentAlertProduct.store, price: currentAlertProduct.price,
        contact, type: alertType, targetPrice: targetPrice ? parseInt(targetPrice) : null
      })
    });
    const data = await res.json();
    if(data.ok){
      const ok = document.getElementById('alertSuccess');
      ok.textContent = data.message + ' 🎉'; ok.classList.remove('hidden');
      toast(lang==='ar'?'تم تفعيل التنبيه ✅':'Alert activated ✅');
      setTimeout(closeAlertModal, 1800);
    }
  }catch(e){ toast(i18n[lang].sub_error); }
}

/* ================= View mode (grid / list) ================= */
function applyViewMode(){
  if(!els.productList) return;
  els.productList.classList.toggle('grid-view', viewMode==='grid');
  const bg = document.getElementById('btnViewGrid'), bl = document.getElementById('btnViewList');
  if(bg){ bg.classList.toggle('primary', viewMode==='grid'); bg.setAttribute('aria-pressed', viewMode==='grid'); }
  if(bl){ bl.classList.toggle('primary', viewMode==='list'); bl.setAttribute('aria-pressed', viewMode==='list'); }
}
function setViewMode(mode){
  if(viewMode===mode) return;
  viewMode = mode;
  try{ localStorage.setItem('ph_view', mode); }catch(e){}
  applyViewMode();
}

/* ================= Init & rendering ================= */
function init(){
  buildWatermark();
  const pw = document.createElement('div'); pw.className='print-wm'; pw.textContent='© Tarek Abozaid — Price Hunter Egypt';
  document.body.appendChild(pw);
  renderStores(); renderCats(); bindEvents(); applyLang();
  document.getElementById('btnViewGrid')?.addEventListener('click', ()=> setViewMode('grid'));
  document.getElementById('btnViewList')?.addEventListener('click', ()=> setViewMode('list'));
  applyViewMode();
  ['subscribeTopBtn','subscribeHeroBtn','subscribeFooterBtn','subscribeFloat'].forEach(id=>{
    document.getElementById(id)?.addEventListener('click', ()=> openSubscribeModal(currentData?.query));
  });
  document.getElementById('subSubmit')?.addEventListener('click', submitSubscribe);
  document.querySelectorAll('#subscribeModal .sub-tab').forEach(b=> b.addEventListener('click', ()=> switchSubType(b.dataset.type)));
  document.querySelectorAll('#alertModal .sub-tab').forEach(b=> b.addEventListener('click', ()=> switchAlertType(b.dataset.atype)));
  const urlQ = new URLSearchParams(location.search).get('q');
  if(urlQ){ els.searchInput.value=urlQ; toggleClear(); doSearch(urlQ); }
}
function renderStores(){
  els.storesRow.innerHTML = STORES.map(s=> `<span class="store-pill" role="listitem" title="${lang==='ar'?'أسعار مباشرة من الموقع':'Direct live prices'}">
    <i style="background:${s.color}"></i>${lang==='ar'?s.ar:s.en}
    <span class="pill-mode ${s.live?'live':'link'}">${s.live ? (lang==='ar'?'حي':'live') : (lang==='ar'?'بحث':'search')}</span>
  </span>`).join('');
}
function renderCats(){
  els.catsRow.innerHTML = CATS.map(c=> `<button class="cat-pill" data-q="${escapeHtml(c.q)}" aria-label="${lang==='ar'?c.ar:c.en}">${c.icon} ${lang==='ar'?c.ar:c.en}</button>`).join('');
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
  els.searchInput.addEventListener('input', ()=>{ toggleClear(); debounceSuggest(els.searchInput.value); });
  els.searchInput.addEventListener('focus', ()=>{ if(els.searchInput.value.length>=2) debounceSuggest(els.searchInput.value); });
  document.addEventListener('click', e=>{
    if(!e.target.closest('.search-wrap')) els.suggestions.classList.add('hidden');
    if(e.target.id==='subscribeModal') closeSubscribeModal();
    if(e.target.id==='alertModal') closeAlertModal();
  });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeSubscribeModal(); closeAlertModal(); } });
  els.clearBtn.addEventListener('click', ()=>{ els.searchInput.value=''; toggleClear(); els.suggestions.classList.add('hidden'); els.searchInput.focus(); });
  document.querySelectorAll('.hint-btn').forEach(b=> b.addEventListener('click', ()=>{ els.searchInput.value=b.dataset.hint; toggleClear(); doSearch(b.dataset.hint); }));
  els.langToggle.addEventListener('click', toggleLang);
  document.getElementById('btnCheapest').addEventListener('click', ()=> sortBy('cheapest'));
  document.getElementById('btnDiscount').addEventListener('click', ()=> sortBy('discount'));
  document.getElementById('btnAlpha').addEventListener('click', ()=> sortBy('alpha'));
  document.getElementById('btnCopy').addEventListener('click', copyReport);
  document.getElementById('btnPrint').addEventListener('click', ()=> window.print());
  document.getElementById('btnClearFilter')?.addEventListener('click', ()=>{ currentFilter='all'; applyFilter(); });
  els.productList.addEventListener('click', e=>{
    const alertBtn = e.target.closest('.btn-alert');
    if(alertBtn){
      const p = filteredData.find(x=> String(x.id)===alertBtn.dataset.pid);
      if(p) openAlertModal(p);
      return;
    }
    const histBtn = e.target.closest('.btn-history');
    if(histBtn){
      const el = document.getElementById('history-'+histBtn.dataset.pid);
      if(el) el.classList.toggle('hidden');
      return;
    }
    const card = e.target.closest('.product-row');
    if(card && !e.target.closest('a') && !e.target.closest('button')){
      const url = card.dataset.url;
      if(url) window.open(url, '_blank', 'noopener');
    }
  });
}
function toggleClear(){ els.clearBtn.classList.toggle('hidden', !els.searchInput.value); }
function toggleLang(){
  lang = lang==='ar'?'en':'ar'; localStorage.setItem('ph_lang', lang); applyLang();
  if(currentData) renderReport(currentData);
}
function applyLang(){
  document.documentElement.lang=lang; document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el=>{ const k=el.dataset.i18n; if(i18n[lang][k]) el.textContent=i18n[lang][k]; });
  els.searchInput.placeholder=i18n[lang].placeholder;
  els.langToggle.querySelectorAll('.lang-opt').forEach(o=>{ o.classList.toggle('active', o.dataset.lang===lang); o.setAttribute('aria-selected', o.dataset.lang===lang); });
  renderStores(); renderCats();
}

/* ================= Suggestions ================= */
let suggestTimer;
function debounceSuggest(v){ clearTimeout(suggestTimer); suggestTimer=setTimeout(()=> showSuggestions(v), 200); }
async function showSuggestions(q){
  if(!q || q.length<2){ els.suggestions.classList.add('hidden'); return; }
  try{
    const res = await fetch(`/api/suggestions?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if(!data.length){ els.suggestions.classList.add('hidden'); return; }
    els.suggestions.innerHTML = data.map(item=>{
      if(item.type==='search'){
        return `<button role="option" class="sugg-item sugg-search" data-q="${escapeHtml(item.query)}"><span class="sugg-icon">🔍</span><span class="sugg-text">${escapeHtml(item.title)}</span><span class="sugg-action">${lang==='ar'?'بحث':'go'}</span></button>`;
      }
      const storeName = getStoreName(item.store);
      const img = item.image ? `<img class="sugg-img" src="${escapeHtml(item.image)}" alt="" loading="lazy" onerror="this.style.display='none'">` : `<span class="sugg-icon">🎧</span>`;
      return `<button role="option" class="sugg-item" data-q="${escapeHtml(item.query)}">
        ${img}
        <span class="sugg-text">
          <span class="sugg-title">${escapeHtml(item.title)}</span>
          <span class="sugg-meta">${storeName} • ${formatPrice(item.price)}</span>
        </span>
        <span class="sugg-action">↗</span>
      </button>`;
    }).join('');
    els.suggestions.classList.remove('hidden');
    els.searchInput.setAttribute('aria-expanded','true');
    els.suggestions.querySelectorAll('.sugg-item').forEach(b=>{
      b.addEventListener('click', ()=>{
        els.searchInput.value = b.dataset.q;
        toggleClear(); els.suggestions.classList.add('hidden');
        doSearch(b.dataset.q);
      });
    });
  }catch(e){ els.suggestions.classList.add('hidden'); }
}

/* ================= Search ================= */
async function doSearch(raw){
  const query=(raw||'').trim();
  if(!query || query.length<2){ toast(i18n[lang].type_first); return; }
  els.loading.classList.remove('hidden'); els.reportSection.classList.add('hidden'); els.suggestions.classList.add('hidden');
  els.loading.scrollIntoView({behavior:'smooth'});
  try{
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if(!res.ok || data.ok===false){ throw new Error(data.error || `HTTP ${res.status}`); }
    document.title = `${query} — ${lang==='ar'?'صيّاد الأسعار':'Price Hunter'}`;
    history.replaceState(null,'', `?q=${encodeURIComponent(query)}`);
    currentData = data; filteredData = [...(data.results||[])];
    currentFilter='all';
    renderReport(data);
  }catch(e){
    console.error('Search error', e);
    toast((lang==='ar'?'خطأ في البحث: ':'Search error: ') + e.message);
  } finally { els.loading.classList.add('hidden'); }
}
function renderReport(data){
  els.reportSection.classList.remove('hidden');
  els.reportQueryText.textContent = data.query;
  els.bcQuery.textContent = data.query;
  const date=new Date().toLocaleDateString(lang==='ar'?'ar-EG':'en-GB', {year:'numeric', month:'long', day:'numeric'});
  const time=new Date().toLocaleTimeString(lang==='ar'?'ar-EG':'en-GB', {hour:'2-digit', minute:'2-digit'});
  els.reportMeta.textContent = `Price Hunter — ${date} • ${time} • ${lang==='ar'?'أسعار حقيقية لحظية':'real live prices'}`;
  const available = (data.results||[]).filter(p=> p.availability);
  const minP = available.length ? Math.min(...available.map(p=>p.price)) : 0;
  const minStore = available.length ? available.reduce((a,b)=> a.price<b.price?a:b).store : null;
  els.statBest.textContent = minP ? formatPrice(minP) : '—';
  els.statBestStore.textContent = minStore ? getStoreName(minStore) : '—';
  els.statAvg.textContent = data.avgPrice ? formatPrice(data.avgPrice) : '—';
  els.statCount.textContent = data.count;
  els.statStores.textContent = data.storesWithHits;
  els.bannerText.textContent = lang==='ar'
    ? `✅ ${i18n.ar.live_from} ${data.storesWithHits} ${i18n.ar.stores_word} ${data.tookSeconds} ${i18n.ar.seconds_word}`
    : `✅ ${i18n.en.live_from} ${data.storesWithHits} ${i18n.en.stores_word} ${data.tookSeconds}${i18n.en.seconds_word}`;
  renderFilters(data);
  filteredData = [...(data.results||[])];
  sortBy(currentSort, false);
  renderStoreLinks(data);
  els.reportSection.scrollIntoView({behavior:'smooth'});
}
function renderFilters(data){
  const counts={}; (data.results||[]).forEach(r=> counts[r.store]=(counts[r.store]||0)+1);
  const pills=[{id:'all', label: lang==='ar'?'الكل':'All', count:data.count, color:'#3B82F6'},
    ...STORES.filter(s=>counts[s.id]).map(s=> ({id:s.id, label: lang==='ar'?s.ar:s.en, count: counts[s.id], color:s.color}))];
  els.filters.innerHTML=pills.map(p=> `<button class="filter-pill ${currentFilter===p.id?'active':''}" data-filter="${p.id}" aria-pressed="${currentFilter===p.id}"><i style="background:${p.color}"></i> ${p.label} <span style="opacity:.7">(${p.count})</span></button>`).join('');
  els.filters.querySelectorAll('.filter-pill').forEach(b=> b.addEventListener('click', ()=>{
    currentFilter=b.dataset.filter;
    els.filters.querySelectorAll('.filter-pill').forEach(x=>{x.classList.remove('active'); x.setAttribute('aria-pressed','false')});
    b.classList.add('active'); b.setAttribute('aria-pressed','true');
    applyFilter();
  }));
}
function applyFilter(){
  if(!currentData) return;
  filteredData = currentFilter==='all' ? [...(currentData.results||[])] : (currentData.results||[]).filter(r=> r.store===currentFilter);
  sortBy(currentSort, false);
}
function sortBy(type, updateUI=true){
  currentSort=type;
  if(!filteredData) return;
  if(type==='cheapest') filteredData.sort((a,b)=> (a.availability===b.availability)? a.price-b.price : (a.availability? -1 : 1));
  else if(type==='discount') filteredData.sort((a,b)=> (b.discount||0)-(a.discount||0));
  else if(type==='alpha') filteredData.sort((a,b)=> a.title.localeCompare(b.title));
  renderProducts(filteredData);
  if(updateUI){
    document.querySelectorAll('.action-btn').forEach(b=>{b.classList.remove('primary'); b.setAttribute('aria-pressed','false')});
    const map={cheapest:'btnCheapest',discount:'btnDiscount',alpha:'btnAlpha'};
    const el=document.getElementById(map[type]); if(el){el.classList.add('primary'); el.setAttribute('aria-pressed','true')}
  }
}
function renderProducts(list){
  if(!list.length){ els.productList.innerHTML=''; els.noResults.classList.remove('hidden'); return; }
  els.noResults.classList.add('hidden');
  const available = list.filter(p=> p.availability);
  const minPrice = available.length ? Math.min(...available.map(p=>p.price)) : Infinity;
  els.productList.innerHTML = list.map(p=>{
    const isBest = p.availability && p.price===minPrice;
    const store = getStore(p.store);
    const storeLabel = store ? (lang==='ar'?store.ar:store.en) : p.store;
    const title = (lang==='ar' && p.titleAr) ? p.titleAr : p.title;
    // real client-side tracking (prices we actually saw)
    const track = saveTrackingPoint(p.url, p.price);
    const previous = track ? track.previous : null;
    let trend = '';
    if(previous){
      if(p.price < previous) trend = `<span class="trend down">▼ ${Math.round((1 - p.price/previous)*100)}%</span>`;
      else if(p.price > previous) trend = `<span class="trend up">▲ ${Math.round((p.price/previous-1)*100)}%</span>`;
      else trend = `<span class="trend stable">— ${lang==='ar'?'مستقر':'stable'}</span>`;
    }
    const img = p.image
      ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'fallback',textContent:'🎧'}))">`
      : `<span class="fallback">🎧</span>`;
    const histRows = (track && track.history && track.history.length>1)
      ? track.history.map(h=> `<tr><td>${h.d}</td><td>${formatPrice(h.p)}</td><td>${h.p===p.price?(lang==='ar'?'← الحالي':'← current'):''}</td></tr>`).join('')
      : null;
    const pid = escapeHtml(String(p.id));
    return `<div class="product-card ${isBest?'best':''}">
      <article class="product-row" data-url="${escapeHtml(p.url)}">
        <div class="product-img" aria-hidden="true">${img}</div>
        <div class="product-info">
          <h3 class="product-title"><a href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a>${!p.availability?` <span class="unavail-tag">— ${lang==='ar'?'غير متوفر':'unavailable'}</span>`:''}</h3>
          <div class="product-meta">
            <span class="store-badge"><i style="background:${store?store.color:'#888'}"></i>${storeLabel}</span>
            ${isBest?`<span class="cheapest-tag">🏆 ${i18n[lang].cheapest}</span>`:''}
            <span class="live-tag"><span class="dot"></span>${i18n[lang].live_badge}</span>
          </div>
          <div class="link-verify">
            <span class="verify ok">${i18n[lang].direct_link}</span>
            <span class="store-domain">${store?store.domain:''}</span>
          </div>
          <div class="product-action">
            ${p.availability
              ? `<a href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer" class="btn-open">↗ ${i18n[lang].open_product}</a>`
              : `<span class="btn-open" style="background:#4B5563;cursor:default">🚫 ${lang==='ar'?'غير متوفر':'unavailable'}</span>`}
            <button class="btn-ghost btn-alert" data-pid="${pid}">🔔 ${lang==='ar'?'نبهني':'alert me'}</button>
            ${histRows?`<button class="btn-ghost btn-history" data-pid="${pid}" aria-expanded="false">${i18n[lang].history_btn}</button>`:''}
          </div>
          ${histRows?`<div id="history-${pid}" class="hidden" style="margin-top:8px;overflow-x:auto">
            <table class="history-table" style="width:100%;font-size:11px;border-collapse:collapse">
              <thead><tr><th style="padding:4px">${lang==='ar'?'التاريخ':'Date'}</th><th style="padding:4px">${lang==='ar'?'السعر اللي شفته':'Seen price'}</th><th></th></tr></thead>
              <tbody>${histRows}</tbody>
            </table>
          </div>`:''}
        </div>
        <div class="price-box">
          <div class="price ${isBest?'best':''} ${p.availability?'':'strikethrough'}">${formatPrice(p.price)}</div>
          ${p.originalPrice && p.originalPrice>p.price?`<div class="orig">${formatPrice(p.originalPrice)}</div>`:''}
          ${trend}
        </div>
        ${p.discount?`<span class="discount" aria-label="${lang==='ar'?'خصم':'discount'} ${p.discount}%">-${p.discount}%</span>`:''}
      </article>
    </div>`;
  }).join('');
}
function renderStoreLinks(data){
  const links = (data.storeLinks||[]).filter(l=> l.url);
  if(!links.length){ els.storeLinksSection.classList.add('hidden'); return; }
  els.storeLinksSection.classList.remove('hidden');
  els.storeLinks.innerHTML = links.map(l=> `
    <a class="store-link-btn" href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">
      <i style="background:${l.color}"></i>${lang==='ar'?l.ar:l.en}
      <small>${l.domain}</small>
      <span>↗</span>
    </a>`).join('');
}
function copyReport(){
  if(!currentData) return;
  const lines=[
    `تقرير أسعار: ${currentData.query} — Price Hunter Egypt`,
    `أقل سعر: ${formatPrice(currentData.minPrice)}`,
    `متوسط السعر: ${formatPrice(currentData.avgPrice)}`,
    `عدد العروض الحقيقية: ${currentData.count}`,
    `---`,
    ...filteredData.map(p=> `${p.title} — ${formatPrice(p.price)} — ${getStoreName(p.store)} — ${p.url}`)
  ];
  copyText(lines.join('\n'));
}
function copyText(text){ navigator.clipboard.writeText(text).then(()=> toast(i18n[lang].copied)); }
window.addEventListener('error', e=>{ console.error('Global error', e.error); els.loading.classList.add('hidden'); });
init();

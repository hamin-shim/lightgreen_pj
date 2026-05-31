(() => {
  const STORAGE_KEY = 'plantAppData_v1';

  const defaultData = {
    plant: { name: '초록이', startDate: new Date().toISOString(), lastCareTime: null },
    careLogs: [],
    messages: []
  };

  function load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){console.error(e)}
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return JSON.parse(JSON.stringify(defaultData));
  }

  function save(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

  let state = load();

  const q = sel => document.querySelector(sel);
  const qAll = sel => document.querySelectorAll(sel);

  const growTimeEl = q('#growTime');
  const lastCareEl = q('#lastCare');
  const todayCountEl = q('#todayCount');
  const logsList = q('#logsList');
  const messagesEl = q('#messages');
  const msgInput = q('#msgInput');
  const loaderEl = q('.loader-screen');
  const mainEl = q('main.container');

  function formatDuration(ms){
    const s = Math.floor(ms/1000), h = Math.floor(s/3600), d = Math.floor(h/24);
    const hh = h%24; return `${d}일 ${hh}시간`;
  }

  function updateStats(){
    const start = new Date(state.plant.startDate);
    const now = new Date();
    growTimeEl.textContent = `함께 자란 지 ${formatDuration(now - start)}`;

    const last = state.plant.lastCareTime ? new Date(state.plant.lastCareTime) : null;
    lastCareEl.textContent = last ? `마지막 돌봄 이후 ${formatDuration(now - last)}` : '아직 돌봄 기록이 없습니다.';

    // today count: count logs from today
    const today = new Date(); today.setHours(0,0,0,0);
    const todayCount = state.careLogs.filter(c=> new Date(c.createdAt) >= today).length + state.messages.filter(m=> new Date(m.createdAt) >= today).length;
    todayCountEl.textContent = todayCount;
  }

  function renderLogs(){
    logsList.innerHTML = '';
    const today = new Date(); today.setHours(0,0,0,0);
    const todays = state.careLogs.filter(c=> new Date(c.createdAt) >= today).slice().reverse();
    if(todays.length===0){ logsList.innerHTML = '<li>오늘은 아직 돌봄 흔적이 없습니다.</li>'; return }
    todays.forEach(c=>{
      const li = document.createElement('li');
      const t = new Date(c.createdAt).toLocaleTimeString();
      li.textContent = `[${t}] ${c.label}`;
      logsList.appendChild(li);
    })
  }

  function renderMessages(){
    messagesEl.innerHTML='';
    state.messages.slice().reverse().forEach(m=>{
      const d = document.createElement('div'); d.className='msg-card';
      const t = document.createElement('div'); t.textContent = m.text;
      const meta = document.createElement('small'); meta.style.color='#6b6b6b'; meta.textContent = new Date(m.createdAt).toLocaleString();
      d.appendChild(t); d.appendChild(meta);
      messagesEl.appendChild(d);
    })
  }

  function addCare(type){
    const labels = {soil:'흙 확인했어요', sunlight:'햇빛 확인했어요', leaf:'잎을 관찰했어요', new:'새 변화를 발견했어요'};
    const entry = {type, label: labels[type]||type, createdAt: new Date().toISOString()};
    state.careLogs.push(entry);
    state.plant.lastCareTime = entry.createdAt;
    save(state); updateAll(); triggerEffect(type);
  }

  function addMessage(text){
    const m = {text, createdAt: new Date().toISOString()};
    state.messages.push(m); save(state); updateAll(); }

  function updateAll(){ updateStats(); renderLogs(); renderMessages(); }

  function triggerEffect(type){
    const layer = q('#effectLayer');
    const el = document.createElement('div'); el.className='sparkle';
    const x = window.innerWidth/2 + (Math.random()*120-60); const y = window.innerHeight/2 + (Math.random()*40-20);
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    layer.appendChild(el);
    setTimeout(()=> el.remove(), 1000);
  }

  function createEmojiBackground(){
    const container = q('.emoji-background');
    if(!container) return;
    const emojis = ['🌱','🌿','🌵','🌳'];
    for(let i=0; i<30; i++){
      const span = document.createElement('span');
      const emoji = emojis[Math.floor(Math.random()*emojis.length)];
      const size = Math.floor(15 + Math.random()*26);
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      span.textContent = emoji;
      span.style.fontSize = `${size}px`;
      span.style.left = `${left}%`;
      span.style.top = `${top}%`;
      span.style.animationDuration = `${12 + Math.random()*8}s`;
      span.style.animationDelay = `${-Math.random()*18}s`;
      span.className = Math.random() > 0.5 ? 'float' : 'drift';
      container.appendChild(span);
    }
  }

  // bind buttons
  qAll('.care-btn').forEach(b=> b.addEventListener('click', e=>{
    const type = b.getAttribute('data-type'); addCare(type);
  }));

  q('#sendMsg').addEventListener('click', ()=>{
    const text = msgInput.value.trim(); if(!text) return; if(text.length>30) return alert('30자 이내로 입력하세요');
    addMessage(text); msgInput.value='';
  });

  function hideLoader(){
    if(loaderEl) loaderEl.classList.add('hidden');
    if(mainEl) mainEl.classList.remove('hidden');
  }

  // initial render and tick
  createEmojiBackground();
  updateAll();
  setTimeout(hideLoader, 2000);
  setInterval(updateAll, 1000*60);

  // expose for debugging
  window._plantApp = {state, save, load};

})();

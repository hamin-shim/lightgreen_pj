// Lightweight script for Plantagotchi demo
document.addEventListener('DOMContentLoaded', ()=>{
  // Loading overlay: hide after 2s with smooth fade
  const loading = document.getElementById('loading');
  setTimeout(()=>{
    loading.style.transition = 'opacity 500ms ease';
    loading.style.opacity = 0;
    setTimeout(()=>{ loading.remove(); }, 600);
  }, 2000);

  // ---------- Plant state and features (Home / Care / Memory / Growth) ----------
  const plantState = {
    name: '초록이',
    startDate: localStorage.getItem('plantStart') || new Date().toISOString(),
    lastCareTime: localStorage.getItem('lastCareTime') || new Date().toISOString(),
    messages: JSON.parse(localStorage.getItem('messages') || '[]'),
    careLogs: JSON.parse(localStorage.getItem('careLogs') || '[]')
  };

  const grownTimeEl = document.getElementById('grownTime');
  const lastCareEl = document.getElementById('lastCare');
  const todayCountEl = document.getElementById('todayCount');
  const totalMessagesEl = document.getElementById('totalMessages');
  const statusText = document.getElementById('statusText');
  const careButtons = document.querySelectorAll('.care-button');
  const careLogEl = document.getElementById('careLog');
  const messageForm = document.getElementById('messageForm');
  const messageInput = document.getElementById('messageInput');
  const messageListEl = document.getElementById('messageList');
  const messageCountEl = document.getElementById('messageCount');
  const growthFeedEl = document.getElementById('growthFeed');

  function saveState(){
    localStorage.setItem('plantStart', plantState.startDate);
    localStorage.setItem('lastCareTime', plantState.lastCareTime);
    localStorage.setItem('messages', JSON.stringify(plantState.messages));
    localStorage.setItem('careLogs', JSON.stringify(plantState.careLogs));
  }

  function formatTime(ms){
    const days = Math.floor(ms/86400000);
    const hours = Math.floor((ms%86400000)/3600000);
    const minutes = Math.floor((ms%3600000)/60000);
    if(days>0) return `${days}일 ${hours}시간`;
    if(hours>0) return `${hours}시간 ${minutes}분`;
    return `${minutes}분`;
  }

  function updateCounters(){
    const now = new Date();
    const start = new Date(plantState.startDate);
    const last = new Date(plantState.lastCareTime);
    grownTimeEl.textContent = formatTime(now - start);
    lastCareEl.textContent = formatTime(now - last);
    const todayCount = plantState.careLogs.filter(l => new Date(l.createdAt).toDateString() === now.toDateString()).length;
    todayCountEl.textContent = `${todayCount}개`;
    totalMessagesEl.textContent = `${plantState.messages.length}개`;
    messageCountEl.textContent = plantState.messages.length;
  }

  function updateStatus(){
    if(plantState.messages.length===0){ statusText.textContent = '오늘은 누군가의 시선을 기다리는 중이에요.'; return; }
    const last = plantState.careLogs.slice(-1)[0];
    if(!last){ statusText.textContent = '작은 관심이 잎사귀로 남았어요.'; return; }
    const map = { soil:'흙을 살핀 뒤 땅이 더욱 포근해졌어요.', sunlight:'따뜻한 빛이 식물에게 닿았어요.', observe:'잎사귀가 더 반짝이는 것 같아요.', sparkle:'새로운 변화를 발견했어요.' };
    statusText.textContent = map[last.type] || '오늘도 천천히 자라고 있어요.';
  }

  function renderMessages(){
    messageListEl.innerHTML = '';
    if(plantState.messages.length===0){ messageListEl.innerHTML = '<div class="message-card">아직 응원 메시지가 없습니다.</div>'; return; }
    plantState.messages.slice().reverse().forEach(m=>{
      const el = document.createElement('div'); el.className='message-card';
      el.innerHTML = `<div>${m.text}</div><small style="color:#567">${new Date(m.createdAt).toLocaleString()}</small>`;
      messageListEl.appendChild(el);
    });
  }

  function renderGrowth(){
    growthFeedEl.innerHTML = '';
    const merged = [...plantState.careLogs.map(c=>({kind:'care',...c})), ...plantState.messages.map(m=>({kind:'message',...m}))];
    merged.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    if(merged.length===0){ growthFeedEl.innerHTML = '<div class="growth-entry">아직 기록이 없습니다.</div>'; return; }
    merged.forEach(item=>{
      const el = document.createElement('div'); el.className='growth-entry';
      if(item.kind==='message') el.innerHTML = `<strong>응원</strong><p>${item.text}</p><small>${new Date(item.createdAt).toLocaleString()}</small>`;
      else el.innerHTML = `<strong>돌봄</strong><p>${item.label}</p><small>${new Date(item.createdAt).toLocaleString()}</small>`;
      growthFeedEl.appendChild(el);
    });
  }

  function addCare(type){
    const labels = { soil:'흙 확인했어요', sunlight:'햇빛 확인했어요', observe:'잎을 관찰했어요', sparkle:'새 변화를 발견했어요' };
    const entry = { type, label: labels[type]||'돌봄', createdAt: new Date().toISOString() };
    plantState.careLogs.push(entry);
    plantState.lastCareTime = entry.createdAt;
    saveState(); updateCounters(); updateStatus(); renderGrowth();
    // brief log
    careLogEl.textContent = `${entry.label} 기록했어요.`; setTimeout(()=>{ careLogEl.textContent=''; },2600);
    // trigger small visual: quick glitch on mini
    const g = document.getElementById('glitchMini'); if(g){ g.classList.add('glitch--active'); setTimeout(()=>g.classList.remove('glitch--active'),420); }
  }

  careButtons.forEach(b=>b.addEventListener('click', ()=> addCare(b.dataset.type)));

  messageForm.addEventListener('submit', e=>{
    e.preventDefault(); const text = messageInput.value.trim(); if(!text) return; if(text.length>30) return alert('30자 이내로 작성해주세요.');
    const entry = { text, createdAt: new Date().toISOString() };
    plantState.messages.push(entry); saveState(); renderMessages(); renderGrowth(); updateCounters(); messageInput.value='';
  });

  // init
  updateCounters(); updateStatus(); renderMessages(); renderGrowth();

  // Custom cursor element follows mouse; uses assets/ref5.jpg if present
  const cursor = document.getElementById('customCursor');
  window.addEventListener('mousemove', (e)=>{
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  // hide cursor on touch devices
  window.addEventListener('touchstart', ()=>{ cursor.style.display = 'none'; document.body.style.cursor = 'auto'; });

  // If reference image for pet isn't present, use a lightweight fallback (colored sprite)
  const petImg = document.getElementById('petImage');
  petImg.addEventListener('error', ()=>{
    petImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="280"><rect width="100%" height="100%" fill="#072a2a"/><text x="50%" y="50%" font-size="20" fill="#9ff" font-family="sans-serif" dominant-baseline="middle" text-anchor="middle">ref6.jpg not found</text></svg>');
    petImg.style.imageRendering = 'auto';
  });

});

const plantState = {
  name: '초록이',
  startDate: localStorage.getItem('plantStart') || new Date().toISOString(),
  lastCareTime: localStorage.getItem('lastCareTime') || new Date().toISOString(),
  todayCount: 0,
  totalMessages: 0,
  messages: JSON.parse(localStorage.getItem('messages') || '[]'),
  careLogs: JSON.parse(localStorage.getItem('careLogs') || '[]'),
};

const grownTimeEl = document.getElementById('grownTime');
const lastCareEl = document.getElementById('lastCare');
const todayCountEl = document.getElementById('todayCount');
const totalMessagesEl = document.getElementById('totalMessages');
const plantStatusEl = document.getElementById('plantStatus');
const actionLogEl = document.getElementById('actionLog');
const messageListEl = document.getElementById('messageList');
const messageCountEl = document.getElementById('messageCount');
const growthFeedEl = document.getElementById('growthFeed');
const plantFaceEl = document.getElementById('plantFace');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const careButtons = document.querySelectorAll('.care-button');

function saveState() {
  localStorage.setItem('plantStart', plantState.startDate);
  localStorage.setItem('lastCareTime', plantState.lastCareTime);
  localStorage.setItem('messages', JSON.stringify(plantState.messages));
  localStorage.setItem('careLogs', JSON.stringify(plantState.careLogs));
}

function formatTime(duration) {
  const days = Math.floor(duration / 86400000);
  const hours = Math.floor((duration % 86400000) / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);
  if (days > 0) return `${days}일 ${hours}시간`;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}

function updateCounters() {
  const now = new Date();
  const start = new Date(plantState.startDate);
  const lastCare = new Date(plantState.lastCareTime);
  grownTimeEl.textContent = formatTime(now - start);
  lastCareEl.textContent = formatTime(now - lastCare);
  const todayCount = plantState.careLogs.filter(log => {
    const date = new Date(log.createdAt);
    return date.toDateString() === now.toDateString();
  }).length;
  plantState.todayCount = todayCount;
  todayCountEl.textContent = `${todayCount}개`;
  totalMessagesEl.textContent = `${plantState.messages.length}개`;
}

function updatePlantStatus() {
  if (plantState.messages.length === 0) {
    plantStatusEl.textContent = '오늘은 누군가의 시선을 기다리는 중이에요.';
    plantFaceEl.textContent = '😊';
    return;
  }
  const lastAction = plantState.careLogs.slice(-1)[0];
  if (!lastAction) {
    plantStatusEl.textContent = '작은 관심이 잎사귀로 남았어요.';
    plantFaceEl.textContent = '🌿';
    return;
  }
  const textMap = {
    soil: '흙을 살핀 뒤 땅이 더욱 포근해졌어요.',
    sunlight: '따뜻한 빛이 식물에게 닿았어요.',
    observe: '잎사귀가 더 반짝이는 것 같아요.',
    sparkle: '새로운 변화를 발견했어요.'
  };
  plantStatusEl.textContent = textMap[lastAction.type] || '오늘도 천천히 자라고 있어요.';
  const moodMap = {
    soil: '🙂',
    sunlight: '😊',
    observe: '😌',
    sparkle: '✨'
  };
  plantFaceEl.textContent = moodMap[lastAction.type] || '😊';
}

function renderMessages() {
  messageListEl.innerHTML = '';
  if (plantState.messages.length === 0) {
    messageListEl.innerHTML = '<p class="empty-message">아직 남겨진 응원 메시지가 없어요.</p>';
    return;
  }
  plantState.messages.slice().reverse().forEach(entry => {
    const card = document.createElement('article');
    card.className = 'message-card';
    const text = document.createElement('p');
    text.textContent = entry.text;
    const time = document.createElement('time');
    time.textContent = new Date(entry.createdAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    card.append(text, time);
    messageListEl.append(card);
  });
}

function renderGrowthFeed() {
  growthFeedEl.innerHTML = '';
  const merged = [...plantState.careLogs, ...plantState.messages.map(msg => ({ type: 'message', ...msg }))];
  merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (merged.length === 0) {
    growthFeedEl.innerHTML = '<p class="empty-message">돌봄 기록과 메시지가 이곳에 쌓입니다.</p>';
    return;
  }
  merged.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'growth-entry';
    const createdAt = new Date(entry.createdAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    if (entry.type === 'message') {
      item.innerHTML = `<strong>응원 메시지</strong><p>${entry.text}</p><p><small>${createdAt}</small></p>`;
    } else {
      const labelMap = {
        soil: '흙 확인',
        sunlight: '햇빛 확인',
        observe: '잎 관찰',
        sparkle: '새 변화 발견'
      };
      item.innerHTML = `<strong>${labelMap[entry.type] || '돌봄 행동'}</strong><p>${entry.label}</p><p><small>${createdAt}</small></p>`;
    }
    growthFeedEl.append(item);
  });
}

function showActionLog(message) {
  actionLogEl.textContent = message;
  setTimeout(() => {
    if (actionLogEl.textContent === message) {
      actionLogEl.textContent = '';
    }
  }, 3000);
}

function addCareAction(type) {
  const labelMap = {
    soil: '흙 확인했어요',
    sunlight: '햇빛 확인했어요',
    observe: '잎을 관찰했어요',
    sparkle: '새 변화를 발견했어요'
  };
  const entry = {
    type,
    label: labelMap[type],
    createdAt: new Date().toISOString()
  };
  plantState.careLogs.push(entry);
  plantState.lastCareTime = entry.createdAt;
  saveState();
  updateCounters();
  updatePlantStatus();
  renderGrowthFeed();
  showActionLog(`${labelMap[type]} 기록했어요.`);
}

careButtons.forEach(button => {
  button.addEventListener('click', () => addCareAction(button.dataset.type));
});

messageForm.addEventListener('submit', event => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  const entry = {
    text,
    createdAt: new Date().toISOString()
  };
  plantState.messages.push(entry);
  plantState.totalMessages = plantState.messages.length;
  saveState();
  renderMessages();
  renderGrowthFeed();
  updateCounters();
  messageInput.value = '';
  showActionLog('응원 메시지가 잎사귀 카드로 저장되었어요.');
});

function initialize() {
  saveState();
  setInterval(updateCounters, 5000);
  updateCounters();
  updatePlantStatus();
  renderMessages();
  renderGrowthFeed();
  messageCountEl.textContent = plantState.messages.length;
}

initialize();

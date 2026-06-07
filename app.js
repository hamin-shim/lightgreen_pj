(() => {
  const SUPABASE_URL = 'https://vvjzbjbdtxnbyvffjdnf.supabase.co';
  const SUPABASE_ANON_KEY = 'xxx';
  const CARE_EVENTS_TABLE = 'care_events';

  const eventLabels = {
    soil: '흙 확인',
    sunlight: '햇빛 확인',
    leaf: '잎 관찰',
    new: '변화 발견',
    message: '메시지'
  };

  const q = selector => document.querySelector(selector);
  const qAll = selector => document.querySelectorAll(selector);

  const growTimeEl = q('#growTime');
  const lastCareEl = q('#lastCare');
  const totalCountEl = q('#todayCount');
  const recentMessagesEl = q('#recentMessages');
  const msgInput = q('#msgInput');
  const sendBtn = q('#sendMsg');
  const loaderEl = q('.loader-screen');
  const mainEl = q('main.container');

  const startDate = new Date('2026-06-07T00:00:00+09:00');
  const isConfigured = SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 20;
  const supabaseClient = isConfigured && window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  let lastCareTime = null;

  function formatDuration(ms) {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);
    return `${days}일 ${hours % 24}시간`;
  }

  function updateGrowTime() {
    const now = new Date();
    if (growTimeEl) growTimeEl.textContent = `함께 자란 지 ${formatDuration(now - startDate)}`;
    if (!lastCareEl) return;

    lastCareEl.textContent = lastCareTime
      ? `마지막 돌봄 이후 ${formatDuration(now - lastCareTime)}`
      : '아직 돌봄 기록이 없습니다.';
  }

  function setRecentMessages(messages) {
    if (!recentMessagesEl) return;
    recentMessagesEl.innerHTML = '';

    if (messages.length === 0) {
      const empty = document.createElement('li');
      empty.textContent = '아직 남겨진 메시지가 없습니다.';
      recentMessagesEl.appendChild(empty);
      return;
    }

    messages.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.message;
      recentMessagesEl.appendChild(li);
    });
  }

  function triggerEffect() {
    const layer = q('#effectLayer');
    if (!layer) return;

    const el = document.createElement('div');
    el.className = 'sparkle';
    el.style.left = `${window.innerWidth / 2 + (Math.random() * 120 - 60)}px`;
    el.style.top = `${window.innerHeight / 2 + (Math.random() * 40 - 20)}px`;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  function hideLoader() {
    if (loaderEl) loaderEl.classList.add('hidden');
    if (mainEl) mainEl.classList.remove('hidden');
  }

  function ensureSupabase() {
    if (supabaseClient) return true;
    console.warn('Supabase URL/Anon Key가 설정되지 않아 저장과 Realtime을 사용할 수 없습니다.');
    return false;
  }

  async function refreshCareEvents() {
    updateGrowTime();
    if (!ensureSupabase()) return;

    const [{ count, error: countError }, { data: latestCare, error: careError }, { data: messages, error: messageError }] = await Promise.all([
      supabaseClient
        .from(CARE_EVENTS_TABLE)
        .select('*', { count: 'exact', head: true }),
      supabaseClient
        .from(CARE_EVENTS_TABLE)
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1),
      supabaseClient
        .from(CARE_EVENTS_TABLE)
        .select('message, created_at')
        .not('message', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    if (countError || careError || messageError) {
      console.error('care_events 조회 실패:', countError || careError || messageError);
      return;
    }

    if (totalCountEl) totalCountEl.textContent = count ?? 0;
    lastCareTime = latestCare?.[0]?.created_at ? new Date(latestCare[0].created_at) : null;
    setRecentMessages(messages ?? []);
    updateGrowTime();
  }

  async function saveCareEvent(type, message = null) {
    if (!ensureSupabase()) return;

    const cleanMessage = message ? message.trim() : null;
    const payload = {
      type,
      label: eventLabels[type] ?? type,
      message: cleanMessage || null
    };

    const { error } = await supabaseClient
      .from(CARE_EVENTS_TABLE)
      .insert(payload);

    if (error) {
      console.error('care_events 저장 실패:', error);
      alert('저장에 실패했습니다. Supabase 테이블 컬럼과 RLS 정책을 확인해주세요.');
      return;
    }

    triggerEffect();
    await refreshCareEvents();
  }

  function subscribeRealtime() {
    if (!ensureSupabase()) return;

    supabaseClient
      .channel('care-events-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: CARE_EVENTS_TABLE },
        () => refreshCareEvents()
      )
      .subscribe(status => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('Realtime 연결에 실패했습니다. Supabase Realtime publication 설정을 확인해주세요.');
        }
      });
  }

  qAll('.care-btn, .care-btn-hero').forEach(button => {
    button.addEventListener('click', () => {
      const type = button.getAttribute('data-type');
      saveCareEvent(type);
    });
  });

  if (msgInput) {
    msgInput.addEventListener('keypress', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendBtn?.click();
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const text = msgInput?.value.trim() ?? '';
      if (!text) return;
      if (text.length > 30) {
        alert('30자 이내로 입력해주세요.');
        return;
      }

      saveCareEvent('message', text);
      msgInput.value = '';
    });
  }

  updateGrowTime();
  refreshCareEvents();
  subscribeRealtime();
  setTimeout(hideLoader, 500);
  setInterval(updateGrowTime, 1000 * 60);

  window._plantApp = {
    refreshCareEvents,
    saveCareEvent,
    supabaseClient
  };
})();

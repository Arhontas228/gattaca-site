/* ========== 1. ГЕНЕТИЧЕСКИЙ СТАТУС ========== */
(function initGeneticStatus() {
  const valueEl = document.getElementById('statusValue');
  const isValid = Math.random() > 0.5; // 50/50
  const percent = isValid
    ? (95 + Math.random() * 5).toFixed(1)
    : (40 + Math.random() * 30).toFixed(1);

  if (isValid) {
    valueEl.textContent = `VALID · ${percent}%`;
    valueEl.classList.add('valid');
  } else {
    valueEl.textContent = `IN-VALID · ${percent}%`;
    valueEl.classList.add('invalid');
  }
})();

/* ========== 2. ИГРА «ПОДДЕЛАЙ КОД» ========== */
(function initGame() {
  const area = document.getElementById('gameArea');
  const overlay = document.getElementById('gameOverlay');
  const startBtn = document.getElementById('startGameBtn');
  const timeEl = document.getElementById('gameTime');
  const scoreEl = document.getElementById('gameScore');
  const failsEl = document.getElementById('gameFails');

  let score = 0;
  let fails = 0;
  let timeLeft = 30;
  let running = false;
  let spawnInterval, timerInterval;

  function resetHUD() {
    score = 0; fails = 0; timeLeft = 30;
    scoreEl.textContent = '0';
    failsEl.textContent = '0';
    timeEl.textContent = '30';
  }

  function spawnItem() {
    if (!running) return;
    const item = document.createElement('div');
    const isBad = Math.random() < 0.35;
    item.classList.add('time-item', isBad ? 'bad' : 'good');
    item.textContent = isBad ? 'X' : 'DNA';

    const size = 44;
    const maxX = area.clientWidth - size;
    const maxY = area.clientHeight - size;
    item.style.left = Math.random() * maxX + 'px';
    item.style.top = Math.random() * maxY + 'px';

    item.addEventListener('click', () => {
      if (!running) return;
      if (isBad) {
        fails++;
        failsEl.textContent = fails;
      } else {
        score++;
        scoreEl.textContent = score;
      }
      item.remove();
    });

    area.appendChild(item);
    setTimeout(() => item.remove(), 2200);
  }

  function endGame() {
    running = false;
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    overlay.classList.remove('hidden');
    overlay.innerHTML = `
      <div style="text-align:center">
        <p style="font-family:var(--mono);margin-bottom:16px">
          Сканирование завершено.<br>
          Образцов собрано: <b>${score}</b><br>
          Разоблачений: <b>${fails}</b><br>
          ${fails === 0 ? 'Ты прошёл проверку. Пока что.' : 'Тебя раскрыли. Система не прощает ошибок.'}
        </p>
        <button id="restartBtn" class="btn">Ещё раз</button>
      </div>`;
    document.getElementById('restartBtn').addEventListener('click', startGame);
  }

  function startGame() {
    resetHUD();
    overlay.classList.add('hidden');
    running = true;
    spawnInterval = setInterval(spawnItem, 550);
    timerInterval = setInterval(() => {
      timeLeft--;
      timeEl.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  startBtn.addEventListener('click', startGame);
})();

/* ========== 3. КОММЕНТАРИИ (LocalStorage) ========== */
(function initComments() {
  const form = document.getElementById('commentForm');
  const nameInput = document.getElementById('commentName');
  const textInput = document.getElementById('commentText');
  const list = document.getElementById('commentsList');
  const STORAGE_KEY = 'gattaca_comments';

  function loadComments() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  function saveComments(comments) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  }

  function renderComments() {
    const comments = loadComments();
    list.innerHTML = '';
    if (comments.length === 0) {
      list.innerHTML = '<p style="text-align:center;color:var(--muted);font-family:var(--mono);font-size:0.85rem">Пока никто не оставил мнение. Будь первым.</p>';
      return;
    }
    comments.forEach(c => {
      const div = document.createElement('div');
      div.classList.add('comment-item');
      div.innerHTML = `
        <div class="c-name">${escapeHtml(c.name)} · ${c.date}</div>
        <div class="c-text">${escapeHtml(c.text)}</div>`;
      list.appendChild(div);
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const text = textInput.value.trim();
    if (!name || !text) return;

    const comments = loadComments();
    comments.unshift({
      name,
      text,
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
    });
    saveComments(comments);
    form.reset();
    renderComments();
  });

  renderComments();
})();

/* ========== 4. МЕДИА: ВСТАВКА ССЫЛОК ========== */
(function initMedia() {
  const STORAGE_KEY = 'gattaca_media';

  // Значения по умолчанию — пустые, ты заполнишь сам
  const defaults = {
    vincent: '',
    irene: '',
    anton: '',
    jerome: '',
    detective: '',
    media1: '',
    media2: '',
    media3: '',
    media4: '',
    video: ''
  };

  function loadMedia() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  }

  function saveMedia(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function applyMedia() {
    const data = loadMedia();

    // Картинки героев и медиа-сетки
    document.querySelectorAll('img[data-img]').forEach(img => {
      const key = img.getAttribute('data-img');
      const url = data[key];
      if (url) {
        img.src = url;
        img.style.display = 'block';
      } else {
        img.removeAttribute('src');
        img.style.display = 'none';
      }
    });

    // Видео
    const iframe = document.getElementById('videoFrame');
    const videoPlaceholder = document.querySelector('.video-placeholder');
    if (data.video) {
      iframe.src = data.video;
      iframe.style.display = 'block';
      if (videoPlaceholder) videoPlaceholder.style.display = 'none';
    } else {
      iframe.removeAttribute('src');
      iframe.style.display = 'none';
      if (videoPlaceholder) videoPlaceholder.style.display = 'flex';
    }
  }

  // Панель управления ссылками (появляется по кнопке)
  function createAdminPanel() {
    if (document.getElementById('mediaAdmin')) return;

    const panel = document.createElement('div');
    panel.id = 'mediaAdmin';
    panel.className = 'media-admin';
    panel.innerHTML = `
      <button id="mediaToggle" class="btn" style="position:fixed;bottom:20px;right:20px;z-index:200">⚙ Ссылки на медиа</button>
      <div id="mediaPanel" class="media-panel hidden">
        <h4>Вставь ссылки</h4>
        <label>Винсент <input data-key="vincent" placeholder="https://..." /></label>
        <label>Айрин <input data-key="irene" placeholder="https://..." /></label>
        <label>Антон <input data-key="anton" placeholder="https://..." /></label>
        <label>Джером <input data-key="jerome" placeholder="https://..." /></label>
        <label>Детектив <input data-key="detective" placeholder="https://..." /></label>
        <label>Фото 1 <input data-key="media1" placeholder="https://..." /></label>
        <label>Фото 2 <input data-key="media2" placeholder="https://..." /></label>
        <label>Фото 3 <input data-key="media3" placeholder="https://..." /></label>
        <label>Фото 4 <input data-key="media4" placeholder="https://..." /></label>
        <label>Видео (embed) <input data-key="video" placeholder="https://www.youtube.com/embed/..." /></label>
        <button id="mediaSave" class="btn" style="margin-top:12px">Сохранить</button>
      </div>`;

    document.body.appendChild(panel);

    const toggle = document.getElementById('mediaToggle');
    const panelBox = document.getElementById('mediaPanel');
    toggle.addEventListener('click', () => panelBox.classList.toggle('hidden'));

    // Заполняем поля текущими значениями
    const data = loadMedia();
    panelBox.querySelectorAll('input[data-key]').forEach(input => {
      input.value = data[input.getAttribute('data-key')] || '';
    });

    document.getElementById('mediaSave').addEventListener('click', () => {
      const newData = { ...defaults };
      panelBox.querySelectorAll('input[data-key]').forEach(input => {
        newData[input.getAttribute('data-key')] = input.value.trim();
      });
      saveMedia(newData);
      applyMedia();
      panelBox.classList.add('hidden');
    });
  }

  applyMedia();
  createAdminPanel();
})();
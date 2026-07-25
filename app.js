// App logic for Saber 11 Evaluador de Respuestas
document.addEventListener('DOMContentLoaded', () => {
  const data = window.CUADERNILLOS_DATA || {};
  
  // State
  let currentBookletId = 'lectura_critica';
  let currentBooklet = data[currentBookletId] || Object.values(data)[0];
  let userAnswers = {}; // { qNum: 'A' }
  let flaggedQuestions = {}; // { qNum: true }
  let activeFocusQ = 1;
  let activeGridFilter = 'all';
  let activeResFilter = 'all';

  // Timer State
  let timerInterval = null;
  let timerSeconds = 0;
  let isTimerRunning = false;

  // DOM Elements
  const bookletSelect = document.getElementById('cuadernillo-select');
  const openPdfLink = document.getElementById('open-pdf-link');
  const activeBookletName = document.getElementById('active-booklet-name');
  const activeBookletCount = document.getElementById('active-booklet-count');
  const answeredCountEl = document.getElementById('answered-count');
  const totalCountEl = document.getElementById('total-count');
  const flaggedCountEl = document.getElementById('flagged-count');
  const progressFill = document.getElementById('progress-fill');

  const tabGrid = document.getElementById('tab-grid');
  const tabFocus = document.getElementById('tab-focus');
  const filterGroup = document.getElementById('filter-group');
  const viewGrid = document.getElementById('view-grid');
  const viewFocus = document.getElementById('view-focus');
  const viewResults = document.getElementById('view-results');

  const timerDisplay = document.getElementById('timer-display');
  const timerToggleBtn = document.getElementById('timer-toggle-btn');
  const timerResetBtn = document.getElementById('timer-reset-btn');

  const gradeBtn = document.getElementById('grade-btn');
  const resetAnswersBtn = document.getElementById('reset-answers-btn');
  const retryBtn = document.getElementById('retry-btn');

  // Populate Booklet Select
  function initBookletSelect() {
    bookletSelect.innerHTML = '';
    Object.values(data).forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${item.icon} ${item.name}`;
      if (item.id === currentBookletId) opt.selected = true;
      bookletSelect.appendChild(opt);
    });
  }

  // Load Selected Booklet State
  function loadBooklet(id) {
    if (!data[id]) return;
    currentBookletId = id;
    currentBooklet = data[id];
    
    // Restore from localStorage if exists
    const savedState = localStorage.getItem(`saber11_state_${currentBookletId}`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        userAnswers = parsed.userAnswers || {};
        flaggedQuestions = parsed.flaggedQuestions || {};
      } catch (e) {
        userAnswers = {};
        flaggedQuestions = {};
      }
    } else {
      userAnswers = {};
      flaggedQuestions = {};
    }

    activeFocusQ = 1;
    updateHeaderInfo();
    renderGrid();
    renderFocus();
    updateProgress();
    viewResults.classList.add('hidden');
  }

  function saveState() {
    localStorage.setItem(`saber11_state_${currentBookletId}`, JSON.stringify({
      userAnswers,
      flaggedQuestions
    }));
  }

  function updateHeaderInfo() {
    activeBookletName.textContent = currentBooklet.name;
    activeBookletCount.textContent = `(${currentBooklet.total_questions} preguntas)`;
    openPdfLink.href = encodeURI(currentBooklet.file);
  }

  function updateProgress() {
    const answeredCount = Object.keys(userAnswers).length;
    const total = currentBooklet.total_questions;
    const flaggedCount = Object.keys(flaggedQuestions).filter(k => flaggedQuestions[k]).length;

    answeredCountEl.textContent = answeredCount;
    totalCountEl.textContent = total;
    flaggedCountEl.textContent = flaggedCount;

    const percent = total > 0 ? (answeredCount / total) * 100 : 0;
    progressFill.style.width = `${percent}%`;
  }

  // Render Grid View
  function renderGrid() {
    viewGrid.innerHTML = '';
    const total = currentBooklet.total_questions;
    const options = ['A', 'B', 'C', 'D'];

    for (let q = 1; q <= total; q++) {
      const isAnswered = !!userAnswers[q];
      const isFlagged = !!flaggedQuestions[q];

      // Filter check
      if (activeGridFilter === 'answered' && !isAnswered) continue;
      if (activeGridFilter === 'pending' && isAnswered) continue;
      if (activeGridFilter === 'flagged' && !isFlagged) continue;

      const card = document.createElement('div');
      card.className = `q-card ${isAnswered ? 'answered' : ''} ${isFlagged ? 'flagged' : ''}`;
      card.dataset.q = q;

      const header = document.createElement('div');
      header.className = 'q-card-header';
      header.innerHTML = `
        <span class="q-num">Pregunta ${q}</span>
        <button class="flag-btn" title="Marcar para revisar">${isFlagged ? '🚩' : '🏳️'}</button>
      `;

      const flagBtn = header.querySelector('.flag-btn');
      flagBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        flaggedQuestions[q] = !flaggedQuestions[q];
        saveState();
        updateProgress();
        renderGrid();
        renderFocus();
      });

      const optionsRow = document.createElement('div');
      optionsRow.className = 'options-row';

      options.forEach(opt => {
        const bubble = document.createElement('div');
        bubble.className = `opt-bubble ${userAnswers[q] === opt ? 'selected' : ''}`;
        bubble.textContent = opt;
        bubble.addEventListener('click', () => {
          if (userAnswers[q] === opt) {
            delete userAnswers[q];
          } else {
            userAnswers[q] = opt;
          }
          saveState();
          updateProgress();
          renderGrid();
          renderFocus();
        });
        optionsRow.appendChild(bubble);
      });

      card.appendChild(header);
      card.appendChild(optionsRow);
      viewGrid.appendChild(card);
    }
  }

  // Render Focus View
  function renderFocus() {
    const total = currentBooklet.total_questions;
    if (activeFocusQ < 1) activeFocusQ = 1;
    if (activeFocusQ > total) activeFocusQ = total;

    const focusQNum = document.getElementById('focus-q-num');
    const focusQStatus = document.getElementById('focus-q-status');
    const focusFlagBtn = document.getElementById('focus-flag-btn');
    const focusOptionsContainer = document.getElementById('focus-options-container');
    const focusMinimap = document.getElementById('focus-minimap');

    focusQNum.textContent = `Pregunta ${activeFocusQ} de ${total}`;
    
    const isAnswered = !!userAnswers[activeFocusQ];
    const isFlagged = !!flaggedQuestions[activeFocusQ];

    focusQStatus.textContent = isAnswered ? `Respondida (${userAnswers[activeFocusQ]})` : 'Pendiente';
    focusQStatus.style.color = isAnswered ? 'var(--accent-primary)' : 'var(--text-muted)';

    focusFlagBtn.textContent = isFlagged ? '🚩 Marcada' : '🏳️ Marcar para revisar';

    // Options
    focusOptionsContainer.innerHTML = '';
    const options = ['A', 'B', 'C', 'D'];

    options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = `focus-opt-btn ${userAnswers[activeFocusQ] === opt ? 'selected' : ''}`;
      btn.innerHTML = `
        <span>Opción ${opt}</span>
        <span class="kbd-badge">Tecla ${idx + 1} / ${opt}</span>
      `;

      btn.addEventListener('click', () => {
        if (userAnswers[activeFocusQ] === opt) {
          delete userAnswers[activeFocusQ];
        } else {
          userAnswers[activeFocusQ] = opt;
        }
        saveState();
        updateProgress();
        renderFocus();
        renderGrid();
      });

      focusOptionsContainer.appendChild(btn);
    });

    // Minimap
    focusMinimap.innerHTML = '';
    for (let q = 1; q <= total; q++) {
      const item = document.createElement('div');
      const itemAns = !!userAnswers[q];
      const itemFlag = !!flaggedQuestions[q];
      item.className = `mini-map-item ${q === activeFocusQ ? 'active' : ''} ${itemAns ? 'answered' : ''} ${itemFlag ? 'flagged' : ''}`;
      item.textContent = q;
      item.addEventListener('click', () => {
        activeFocusQ = q;
        renderFocus();
      });
      focusMinimap.appendChild(item);
    }
  }

  // Keyboard Shortcuts for Focus Mode
  document.addEventListener('keydown', (e) => {
    if (!viewFocus.classList.contains('hidden')) {
      const key = e.key.toUpperCase();
      if (['1', 'A'].includes(key)) selectFocusOpt('A');
      else if (['2', 'B'].includes(key)) selectFocusOpt('B');
      else if (['3', 'C'].includes(key)) selectFocusOpt('C');
      else if (['4', 'D'].includes(key)) selectFocusOpt('D');
      else if (e.key === 'ArrowLeft') {
        if (activeFocusQ > 1) { activeFocusQ--; renderFocus(); }
      } else if (e.key === 'ArrowRight') {
        if (activeFocusQ < currentBooklet.total_questions) { activeFocusQ++; renderFocus(); }
      }
    }
  });

  function selectFocusOpt(opt) {
    if (userAnswers[activeFocusQ] === opt) {
      delete userAnswers[activeFocusQ];
    } else {
      userAnswers[activeFocusQ] = opt;
    }
    saveState();
    updateProgress();
    renderFocus();
    renderGrid();
  }

  // Focus Nav Buttons
  document.getElementById('focus-prev-btn').addEventListener('click', () => {
    if (activeFocusQ > 1) { activeFocusQ--; renderFocus(); }
  });
  document.getElementById('focus-next-btn').addEventListener('click', () => {
    if (activeFocusQ < currentBooklet.total_questions) { activeFocusQ++; renderFocus(); }
  });
  document.getElementById('focus-flag-btn').addEventListener('click', () => {
    flaggedQuestions[activeFocusQ] = !flaggedQuestions[activeFocusQ];
    saveState();
    updateProgress();
    renderFocus();
    renderGrid();
  });

  // Timer Logic
  function formatTime(totalSecs) {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return [hrs, mins, secs].map(v => String(v).padStart(2, '0')).join(':');
  }

  function toggleTimer() {
    if (isTimerRunning) {
      clearInterval(timerInterval);
      isTimerRunning = false;
      timerToggleBtn.textContent = '▶️';
    } else {
      timerInterval = setInterval(() => {
        timerSeconds++;
        timerDisplay.textContent = formatTime(timerSeconds);
      }, 1000);
      isTimerRunning = true;
      timerToggleBtn.textContent = '⏸️';
    }
  }

  timerToggleBtn.addEventListener('click', toggleTimer);
  timerResetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerSeconds = 0;
    timerDisplay.textContent = '00:00:00';
    timerToggleBtn.textContent = '▶️';
  });

  // Tab Switch (Grid vs Focus)
  tabGrid.addEventListener('click', () => {
    tabGrid.classList.add('active');
    tabFocus.classList.remove('active');
    filterGroup.classList.remove('hidden');
    viewGrid.classList.remove('hidden');
    viewFocus.classList.add('hidden');
  });

  tabFocus.addEventListener('click', () => {
    tabFocus.classList.add('active');
    tabGrid.classList.remove('active');
    filterGroup.classList.add('hidden');
    viewFocus.classList.remove('hidden');
    viewGrid.classList.add('hidden');
  });

  // Grid Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeGridFilter = btn.dataset.filter;
      renderGrid();
    });
  });

  // Reset Answers
  resetAnswersBtn.addEventListener('click', () => {
    if (confirm('¿Estás seguro de reiniciar todas tus respuestas de este cuadernillo?')) {
      userAnswers = {};
      flaggedQuestions = {};
      saveState();
      updateProgress();
      renderGrid();
      renderFocus();
      viewResults.classList.add('hidden');
    }
  });

  // GRADING LOGIC & RESULTS VIEW
  gradeBtn.addEventListener('click', gradeTest);

  function gradeTest() {
    const total = currentBooklet.total_questions;
    const officialAnswers = currentBooklet.answers || {};
    const competenciasMap = currentBooklet.competencias || {};

    let correctCount = 0;
    let wrongCount = 0;
    let omittedCount = 0;

    const resultsData = [];

    for (let q = 1; q <= total; q++) {
      const userAns = userAnswers[q] || null;
      const correctAns = officialAnswers[q] || '-';
      const competencia = competenciasMap[q] || 'Comprensión global / Análisis crítico';

      let status = 'omitted';
      if (userAns) {
        if (userAns === correctAns) {
          status = 'correct';
          correctCount++;
        } else {
          status = 'wrong';
          wrongCount++;
        }
      } else {
        omittedCount++;
      }

      resultsData.push({
        q,
        userAns,
        correctAns,
        status,
        competencia
      });
    }

    const percent = Math.round((correctCount / total) * 100);

    // Update Banner
    document.getElementById('score-percent').textContent = `${percent}%`;
    document.getElementById('score-fraction').textContent = `${correctCount} de ${total} correctas`;
    
    // Circular gradient fill
    const circleGraph = document.getElementById('score-circle-graph');
    circleGraph.style.background = `conic-gradient(var(--accent-primary) ${percent}%, var(--bg-card) ${percent}%)`;

    const badgeEl = document.getElementById('score-badge');
    const feedbackEl = document.getElementById('score-feedback');

    if (percent >= 88) {
      badgeEl.className = 'score-title-badge badge-excellent';
      badgeEl.textContent = '🌟 Nivel Sobresaliente';
      feedbackEl.textContent = '¡Excelente dominio del cuadernillo! Demuestras una gran capacidad de análisis crítico y lectura profunda.';
    } else if (percent >= 70) {
      badgeEl.className = 'score-title-badge badge-good';
      badgeEl.textContent = '🚀 Alto Desempeño';
      feedbackEl.textContent = '¡Muy buen resultado! Tienes bases sólidas. Revisa las respuestas incorrectas para perfeccionar tus puntos débiles.';
    } else if (percent >= 50) {
      badgeEl.className = 'score-title-badge badge-warning';
      badgeEl.textContent = '👍 Desempeño Medio';
      feedbackEl.textContent = 'Buen avance. Identifica los patrones en las preguntas falladas para reforzar la competencia de lectura crítica.';
    } else {
      badgeEl.className = 'score-title-badge badge-danger';
      badgeEl.textContent = '📚 Necesita Refuerzo';
      feedbackEl.textContent = 'No te preocupes, este cuadernillo es para aprender. Revisa detalladamente la clave oficial en la tabla inferior.';
    }

    document.getElementById('res-stat-correct').textContent = correctCount;
    document.getElementById('res-stat-wrong').textContent = wrongCount;
    document.getElementById('res-stat-omitted').textContent = omittedCount;
    document.getElementById('res-stat-time').textContent = formatTime(timerSeconds);

    // Render Results Table
    renderResultsTable(resultsData);

    // Show Results Section
    viewResults.classList.remove('hidden');
    viewResults.scrollIntoView({ behavior: 'smooth' });
  }

  function renderResultsTable(resultsData) {
    const tbody = document.getElementById('results-table-body');
    tbody.innerHTML = '';

    resultsData.forEach(item => {
      if (activeResFilter === 'wrong' && item.status !== 'wrong') return;
      if (activeResFilter === 'correct' && item.status !== 'correct') return;

      const tr = document.createElement('tr');

      let badgeHtml = '';
      let statusHtml = '';

      if (item.status === 'correct') {
        badgeHtml = `<span class="answer-badge ans-correct">${item.userAns}</span>`;
        statusHtml = `<span class="status-badge badge-excellent">✅ Correcto</span>`;
      } else if (item.status === 'wrong') {
        badgeHtml = `<span class="answer-badge ans-wrong">${item.userAns}</span>`;
        statusHtml = `<span class="status-badge badge-danger">❌ Incorrecto</span>`;
      } else {
        badgeHtml = `<span class="answer-badge ans-omitted">-</span>`;
        statusHtml = `<span class="status-badge badge-warning">⚠️ Omitida</span>`;
      }

      const correctBadgeHtml = `<span class="answer-badge ans-correct">${item.correctAns}</span>`;

      tr.innerHTML = `
        <td><strong>Pregunta ${item.q}</strong></td>
        <td>${badgeHtml}</td>
        <td>${correctBadgeHtml}</td>
        <td>${statusHtml}</td>
        <td style="color: var(--text-muted); max-width: 400px;">${item.competencia}</td>
      `;

      tbody.appendChild(tr);
    });
  }

  // Results Filter Buttons
  document.querySelectorAll('.res-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.res-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeResFilter = btn.dataset.resFilter;
      gradeTest();
    });
  });

  retryBtn.addEventListener('click', () => {
    viewResults.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Select booklet change
  bookletSelect.addEventListener('change', (e) => {
    loadBooklet(e.target.value);
  });

  // Init
  initBookletSelect();
  loadBooklet(currentBookletId);
});

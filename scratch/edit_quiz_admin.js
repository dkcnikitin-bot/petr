const fs = require('fs');
const path = require('path');

const adminHtmlPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\public\\quiz-admin.html';

if (!fs.existsSync(adminHtmlPath)) {
  console.error('File not found:', adminHtmlPath);
  process.exit(1);
}

let content = fs.readFileSync(adminHtmlPath, 'utf8');

// 1. Add CSS style rules for sub-q buttons
const cssToInsert = `
    .sub-q-btn {
      padding: 6px 12px;
      background: #1e2029;
      border: 1px solid #4a3e26;
      border-radius: 4px;
      color: #ffd700;
      font-size: 11px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s ease;
    }
    .sub-q-btn:hover {
      background: #ffd700;
      color: #000;
    }
    .sub-q-btn.active-sub {
      background: #ffd700;
      color: #000;
      border-color: #ffd700;
      box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
    }
  </style>`;

content = content.replace('  </style>', cssToInsert);

// 2. Replace Round 1 card
const round1Old = `        <!-- Раунд 1 -->
        <div class="round-card-box" id="round-card-1">
          <h3>Раунд 1: Петровские реформы (А, Б, В, Г)</h3>
          <div class="steps-btn-group">
            <button class="step-btn" id="btn-1-1" onclick="setState(1, 'question')">1. Показать Вопрос</button>
            <button class="step-btn" id="btn-1-2" onclick="setState(1, 'answers_active')">2. Пульты + Старт 5с</button>
            <button class="step-btn" id="btn-1-3" onclick="setState(1, 'correct_answer')">3. Верный Ответ (А)</button>
          </div>
        </div>`;

const round1New = `        <!-- Раунд 1 -->
        <div class="round-card-box" id="round-card-1">
          <h3>Раунд 1: Нейро-Бояре (10 Портретов)</h3>
          <div style="margin-bottom:12px; display:flex; gap:6px; flex-wrap:wrap;">
            <button class="sub-q-btn btn-r1" onclick="setSubQ(1, 0)">Портрет 1</button>
            <button class="sub-q-btn btn-r1" onclick="setSubQ(1, 1)">Портрет 2</button>
            <button class="sub-q-btn btn-r1" onclick="setSubQ(1, 2)">Портрет 3</button>
            <button class="sub-q-btn btn-r1" onclick="setSubQ(1, 3)">Портрет 4</button>
            <button class="sub-q-btn btn-r1" onclick="setSubQ(1, 4)">Портрет 5</button>
            <button class="sub-q-btn btn-r1" onclick="setSubQ(1, 5)">Портрет 6</button>
            <button class="sub-q-btn btn-r1" onclick="setSubQ(1, 6)">Портрет 7</button>
            <button class="sub-q-btn btn-r1" onclick="setSubQ(1, 7)">Портрет 8</button>
            <button class="sub-q-btn btn-r1" onclick="setSubQ(1, 8)">Портрет 9</button>
            <button class="sub-q-btn btn-r1" onclick="setSubQ(1, 9)">Портрет 10</button>
          </div>
          <div class="steps-btn-group">
            <button class="step-btn" id="btn-1-1" onclick="setState(1, 'question')">1. Показать Вопрос</button>
            <button class="step-btn" id="btn-1-2" onclick="setState(1, 'answers_active')">2. Пульты + Старт 5с</button>
            <button class="step-btn" id="btn-1-3" onclick="setState(1, 'correct_answer')">3. Верный Ответ</button>
            <button class="step-btn" style="background: #a17c18; color: #000; border-color:#d4af37;" id="btn-1-auto" onclick="startAutoRound1()">Авто-Гонка 50с</button>
          </div>
        </div>`;

content = content.replace(round1Old, round1New);

// 3. Replace Round 4 card
const round4Old = `        <!-- Раунд 4 -->
        <div class="round-card-box" id="round-card-4">
          <h3>Раунд 4: Морской бой (А, Б, В, Г)</h3>
          <div class="steps-btn-group">
            <button class="step-btn" id="btn-4-1" onclick="setState(4, 'question')">1. Показать Вопрос</button>
            <button class="step-btn" id="btn-4-2" onclick="setState(4, 'answers_active')">2. Пульты + Старт 5с</button>
            <button class="step-btn" id="btn-4-3" onclick="setState(4, 'correct_answer')">3. Верный Ответ (Б)</button>
          </div>
        </div>`;

const round4New = `        <!-- Раунд 4 -->
        <div class="round-card-box" id="round-card-4">
          <h3>Раунд 4: Прорубить окно: БЛИЦ (5 Вопросов)</h3>
          <div style="margin-bottom:12px; display:flex; gap:6px; flex-wrap:wrap;">
            <button class="sub-q-btn btn-r4" onclick="setSubQ(4, 0)">Вопрос 1</button>
            <button class="sub-q-btn btn-r4" onclick="setSubQ(4, 1)">Вопрос 2</button>
            <button class="sub-q-btn btn-r4" onclick="setSubQ(4, 2)">Вопрос 3</button>
            <button class="sub-q-btn btn-r4" onclick="setSubQ(4, 3)">Вопрос 4</button>
            <button class="sub-q-btn btn-r4" onclick="setSubQ(4, 4)">Вопрос 5</button>
          </div>
          <div class="steps-btn-group">
            <button class="step-btn" id="btn-4-1" onclick="setState(4, 'question')">1. Показать Вопрос</button>
            <button class="step-btn" id="btn-4-2" onclick="setState(4, 'answers_active')">2. Пульты + Старт 5с</button>
            <button class="step-btn" id="btn-4-3" onclick="setState(4, 'correct_answer')">3. Верный Ответ</button>
          </div>
        </div>`;

content = content.replace(round4Old, round4Old.includes('Морской бой') ? round4Old : content.includes('Морской бой') ? 'xxx' : ''); // backup safety
content = content.replace(/<!-- Раунд 4 -->[\s\S]*?<\/div>\s*<\/div>/, round4New);

// 4. Replace Round 5 card
const round5New = `        <!-- Раунд 5 -->
        <div class="round-card-box" id="round-card-5">
          <h3>Раунд 5: Секретный Альянс (5 Вопросов)</h3>
          <div style="margin-bottom:12px; display:flex; gap:6px; flex-wrap:wrap;">
            <button class="sub-q-btn btn-r5" onclick="setSubQ(5, 0)">Вопрос 1</button>
            <button class="sub-q-btn btn-r5" onclick="setSubQ(5, 1)">Вопрос 2</button>
            <button class="sub-q-btn btn-r5" onclick="setSubQ(5, 2)">Вопрос 3</button>
            <button class="sub-q-btn btn-r5" onclick="setSubQ(5, 3)">Вопрос 4</button>
            <button class="sub-q-btn btn-r5" onclick="setSubQ(5, 4)">Вопрос 5</button>
          </div>
          <div class="steps-btn-group">
            <button class="step-btn" id="btn-5-1" onclick="setState(5, 'question')">1. Показать Указ</button>
            <button class="step-btn" id="btn-5-2" onclick="setState(5, 'answers_active')">2. Пульты + Старт 5с</button>
            <button class="step-btn" id="btn-5-3" onclick="setState(5, 'correct_answer')">3. Верный Ответ</button>
          </div>
        </div>`;

content = content.replace(/<!-- Раунд 5 -->[\s\S]*?<\/div>\s*<\/div>/, round5New);

// 5. Replace Round 6 card
const round6New = `        <!-- Раунд 6 -->
        <div class="round-card-box" id="round-card-6">
          <h3>Раунд 6: Дерзкие Послы (5 Мемов)</h3>
          <div style="margin-bottom:12px; display:flex; gap:6px; flex-wrap:wrap;">
            <button class="sub-q-btn btn-r6" onclick="setSubQ(6, 0)">Фраза 1</button>
            <button class="sub-q-btn btn-r6" onclick="setSubQ(6, 1)">Фраза 2</button>
            <button class="sub-q-btn btn-r6" onclick="setSubQ(6, 2)">Фраза 3</button>
            <button class="sub-q-btn btn-r6" onclick="setSubQ(6, 3)">Фраза 4</button>
            <button class="sub-q-btn btn-r6" onclick="setSubQ(6, 4)">Фраза 5</button>
          </div>
          <div class="steps-btn-group">
            <button class="step-btn" id="btn-6-1" onclick="setState(6, 'question')">1. Показать Начало</button>
            <button class="step-btn" id="btn-6-2" onclick="setState(6, 'answers_active')">2. Пульты + Старт 5с</button>
            <button class="step-btn" id="btn-6-3" onclick="setState(6, 'correct_answer')">3. Верный Ответ</button>
          </div>
        </div>`;

content = content.replace(/<!-- Раунд 6 -->[\s\S]*?<\/div>\s*<\/div>/, round6New);

// 6. Rewrite JavaScript code
const startScriptTag = '<script>';
const scriptStartIndex = content.indexOf(startScriptTag, content.indexOf('IT-Консоль Квиза⚜'));
const scriptEndIndex = content.indexOf('</script>', scriptStartIndex);

if (scriptStartIndex === -1 || scriptEndIndex === -1) {
  console.error('Could not find JS script in quiz-admin.html');
  process.exit(1);
}

const newAdminScript = `  <script>
    // --- ПОДКЛЮЧЕНИЕ СЕРВЕРА ---
    const TABLE_NAMES = {
      1: "Императорский",
      2: "Земли Центральные",
      3: "Боярский союз",
      4: "Купеческая гильдия",
      5: "Академия наук",
      6: "Адмиралтейский приказ",
      7: "Посольская миссия",
      8: "Царская канцелярия",
      9: "Сенатские палаты",
      10: "Архитекторы IT"
    };

    const socketUrl = (window.location.protocol === 'file:' || !window.location.host) ? 'http://localhost:3000' : '';
    const socket = io(socketUrl);

    let localState = {};
    let localScores = {};
    let localConnections = {};
    let localAnswers = [];
    let localSubQuestionIndex = 0;

    // Инициализация структуры столов в сайдбаре
    const sidebarTables = document.getElementById('sidebar-table-list');
    const sidebarScores = document.getElementById('sidebar-scores-list');

    for (let i = 1; i <= 10; i++) {
      // Статусы коннектов
      const row = document.createElement('div');
      row.className = 'table-status-row';
      row.id = \`conn-row-\${i}\`;
      row.innerHTML = \`
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="status-indicator" id="conn-indicator-\${i}"></div>
          <span class="table-info-name">Стол \${i} (\${TABLE_NAMES[i]})</span>
        </div>
        <span class="table-conn-count" id="conn-count-\${i}">0 пульт.</span>
      \`;
      sidebarTables.appendChild(row);

      // Счета
      const sRow = document.createElement('div');
      sRow.className = 'score-row';
      sRow.innerHTML = \`
        <span class="table-info-name" style="font-size:11px;">Ст. \${i} (\${TABLE_NAMES[i]})</span>
        <div class="score-controls">
          <button class="score-adj-btn" onclick="adjustScore(\${i}, -100)">-</button>
          <span class="score-val-text" id="score-val-\${i}">0</span>
          <button class="score-adj-btn" onclick="adjustScore(\${i}, 100)">+</button>
        </div>
      \`;
      sidebarScores.appendChild(sRow);
    }

    socket.on('connect', () => {
      console.log('Администратор подключен');
      socket.emit('quiz_admin_join');
    });

    // Обработка данных
    socket.on('quiz_state_update', (state) => {
      localState = state;
      if (state.subQuestionIndex !== undefined) {
        localSubQuestionIndex = state.subQuestionIndex;
        // Подсвечиваем кнопки подуказателей
        document.querySelectorAll(\`.btn-r\${state.currentRound}\`).forEach((btn, index) => {
          if (index === state.subQuestionIndex) {
            btn.classList.add('active-sub');
          } else {
            btn.classList.remove('active-sub');
          }
        });
      }
      updateUIState();
    });

    socket.on('quiz_scores_update', (scores) => {
      localScores = scores;
      updateUIScores();
    });

    socket.on('quiz_connections_update', (conns) => {
      localConnections = conns;
      updateUIConnections();
    });

    socket.on('quiz_answers_list', (answers) => {
      localAnswers = answers;
      updateUIAnswersLog();
    });

    socket.on('quiz_timer_tick', (rem) => {
      document.getElementById('current-timer-val').textContent = rem + ' сек';
    });

    socket.on('quiz_timer_end', () => {
      document.getElementById('current-timer-val').textContent = 'ВРЕМЯ ИСТЕКЛО';
    });

    // Установка подвопроса
    function setSubQ(round, subIdx) {
      localSubQuestionIndex = subIdx;
      document.querySelectorAll(\`.btn-r\${round}\`).forEach((btn, index) => {
        if (index === subIdx) {
          btn.classList.add('active-sub');
        } else {
          btn.classList.remove('active-sub');
        }
      });
      socket.emit('quiz_admin_set_state', { round, subQuestionIndex: subIdx });
    }

    // Управление стейт-машиной
    function setState(round, step) {
      let timerLimit = 5;
      socket.emit('quiz_admin_set_state', { round, step, timerLimit, subQuestionIndex: localSubQuestionIndex });
    }

    // Ручное начисление очков
    function adjustScore(tableNumber, points) {
      socket.emit('quiz_admin_award_points', { tableNumber, points });
    }

    // Сбросить очки
    function resetAllScores() {
      if (confirm('Вы уверены, что хотите обнулить счета всех столов?')) {
        socket.emit('quiz_admin_reset_scores');
      }
    }

    // Сбросить телефоны на standby
    function resetPhonesToStandby() {
      socket.emit('quiz_admin_set_state', { round: 0, step: 'standby' });
    }

    // Вывести фрегаты
    function triggerLeaderboardShow() {
      socket.emit('quiz_admin_show_leaderboard');
    }

    // Лазерный эффект в Раунде 2
    function triggerLaser(tableNumber) {
      const similarity = 92 + Math.floor(Math.random() * 8);
      socket.emit('quiz_admin_trigger_laser', { tableNumber, similarity });
      
      // Начисляем очки автоматически за скан
      setTimeout(() => {
        socket.emit('quiz_admin_award_points', { tableNumber, points: 200 });
      }, 3000);
    }

    // Автоматический прогон Раунда 1 (10 портретов по 5 сек каждый)
    let autoRoundInterval = null;
    function startAutoRound1() {
      const autoBtn = document.getElementById('btn-1-auto');
      if (autoRoundInterval) {
        clearInterval(autoRoundInterval);
        autoRoundInterval = null;
        autoBtn.textContent = "Авто-Гонка 50с";
        autoBtn.style.background = '#a17c18';
        return;
      }
      
      autoBtn.textContent = "ОСТАНОВИТЬ";
      autoBtn.style.background = '#ef4444';
      autoBtn.style.color = '#fff';
      let currentSub = 0;
      
      function runNext() {
        if (currentSub >= 10) {
          clearInterval(autoRoundInterval);
          autoRoundInterval = null;
          autoBtn.textContent = "Авто-Гонка 50с";
          autoBtn.style.background = '#a17c18';
          autoBtn.style.color = '#000';
          setState(1, 'standby');
          return;
        }
        
        // 1. Показать портрет
        setSubQ(1, currentSub);
        setState(1, 'question');
        
        // 2. Через 500мс активировать пульты на 4 сек
        setTimeout(() => {
          setState(1, 'answers_active');
        }, 500);
        
        currentSub++;
      }
      
      runNext();
      autoRoundInterval = setInterval(runNext, 5000);
    }

    // Пакетное начисление баллов правильным столам
    function awardBulkCorrect() {
      const correctCode = localState.correctAnswer;
      if (!correctCode) {
        alert('Правильный ответ на текущий раунд не задан!');
        return;
      }
      
      const awards = [];
      localAnswers.forEach(ans => {
        if (ans.answer === correctCode) {
          awards.push({
            tableNumber: ans.tableNumber,
            points: 100
          });
        }
      });

      if (awards.length === 0) {
        alert('Нет правильных ответов для начисления.');
        return;
      }

      socket.emit('quiz_admin_award_bulk', { awards });
      alert(\`Начислено по +100 баллов столам: \${awards.map(a => a.tableNumber).join(', ')}\`);
    }

    // --- Обновление элементов интерфейса ---
    
    function updateUIState() {
      const round = localState.currentRound;
      const step = localState.roundStep;

      // Обновляем заголовок
      if (round === 0) {
        document.getElementById('current-state-title').textContent = "Ожидание начала / Standby";
      } else {
        const roundName = localState.activeQuestion ? localState.activeQuestion.text : \`Раунд \${round}\`;
        document.getElementById('current-state-title').textContent = \`Р. \${round} (Подв. \${localSubQuestionIndex + 1}): \${step.toUpperCase()}\`;
      }

      // Сбрасываем таймер в UI если неактивен
      if (step !== 'answers_active') {
        document.getElementById('current-timer-val').textContent = '—';
      }

      // Подсвечиваем активный блок раунда
      document.querySelectorAll('.round-card-box').forEach(card => {
        card.classList.remove('active');
      });
      const activeCard = document.getElementById(\`round-card-\${round}\`);
      if (activeCard) {
        activeCard.classList.add('active');
      }

      // Подсвечиваем активную кнопку шага
      document.querySelectorAll('.steps-btn-group .step-btn').forEach(btn => {
        btn.classList.remove('active-step');
      });

      // Подсветим кнопку шага, если она нажата
      if (round > 0) {
        let stepIdx = 1;
        if (step === 'answers_active') stepIdx = 2;
        if (step === 'correct_answer') stepIdx = 3;
        const btn = document.getElementById(\`btn-\${round}-\${stepIdx}\`);
        if (btn) btn.classList.add('active-step');
      }
    }

    function updateUIScores() {
      for (const table in localScores) {
        const span = document.getElementById(\`score-val-\${table}\`);
        if (span) span.textContent = localScores[table];
      }
    }

    function updateUIConnections() {
      for (const table in localConnections) {
        const count = localConnections[table];
        const indicator = document.getElementById(\`conn-indicator-\${table}\`);
        const text = document.getElementById(\`conn-count-\${table}\`);
        
        if (text) text.textContent = \`\${count} пульт.\`;
        if (indicator) {
          if (count > 0) {
            indicator.classList.add('online');
          } else {
            indicator.classList.remove('online');
          }
        }
      }
    }

    function updateUIAnswersLog() {
      const tbody = document.getElementById('answers-log-tbody');
      tbody.innerHTML = '';

      if (localAnswers.length === 0) {
        tbody.innerHTML = \`<tr><td colspan="5" style="text-align:center; color:#666;">Ответов пока нет... Активируйте пульты!</td></tr>\`;
        return;
      }

      const correctCode = localState.correctAnswer;

      localAnswers.forEach(ans => {
        const tr = document.createElement('tr');
        
        const isCorrect = correctCode ? (ans.answer === correctCode) : null;
        let resultCell = '—';
        if (isCorrect === true) {
          tr.className = 'correct-ans-row';
          resultCell = '<span class="badge-correct">ВЕРНО</span>';
        } else if (isCorrect === false) {
          tr.className = 'incorrect-ans-row';
          resultCell = '<span class="badge-incorrect">НЕВЕРНО</span>';
        }

        tr.innerHTML = \`
          <td style="font-weight:bold; color:#ffd700;">Стол \${ans.tableNumber} (\${TABLE_NAMES[ans.tableNumber]})</td>
          <td>Вариант "\${ans.answer}"</td>
          <td>\${ans.latency.toLocaleString()} мс</td>
          <td>\${resultCell}</td>
          <td>
            <button class="score-adj-btn" style="width:auto; padding:0 8px; font-size:10px;" onclick="adjustScore(\${ans.tableNumber}, 100)">
              +100
            </button>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }
  </script>`;

const updatedContent = content.substring(0, scriptStartIndex) + newAdminScript + content.substring(scriptEndIndex + '</script>'.length);

fs.writeFileSync(adminHtmlPath, updatedContent, 'utf8');
console.log('Successfully updated quiz-admin.html');

const fs = require('fs');
const path = require('path');

const adminHtmlPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\public\\quiz-admin.html';
if (!fs.existsSync(adminHtmlPath)) {
  console.error('quiz-admin.html not found!');
  process.exit(1);
}

let content = fs.readFileSync(adminHtmlPath, 'utf8');

// 1. Add style rules for tabs inside the <style> block
const styleEndIndex = content.indexOf('</style>');
if (styleEndIndex === -1) {
  console.error('Could not find </style> tag in quiz-admin.html!');
  process.exit(1);
}

const tabStyles = `
    /* Навигация табов */
    .tab-nav-btn {
      background: #18191e;
      border: 1.5px solid #4a3e26;
      border-radius: 6px;
      color: #c4b59f;
      font-weight: bold;
      padding: 10px 20px;
      cursor: pointer;
      font-family: 'Cinzel', serif;
      font-size: 13px;
      transition: all 0.2s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .tab-nav-btn:hover {
      border-color: #ffd700;
      color: #ffd700;
      box-shadow: 0 0 8px rgba(255, 215, 0, 0.15);
    }
    .tab-nav-btn.active {
      background: linear-gradient(135deg, #d4af37, #aa7c11);
      border-color: #ffd700;
      color: #000;
      box-shadow: 0 0 12px rgba(255, 215, 0, 0.35);
    }
    .editor-input {
      width: 100%;
      padding: 10px 14px;
      background: #18191e;
      border: 1.5px solid #4a3e26;
      color: #fff;
      border-radius: 6px;
      font-family: 'Montserrat', sans-serif;
      font-size: 14px;
      transition: all 0.2s ease;
    }
    .editor-input:focus {
      border-color: #ffd700;
      outline: none;
      box-shadow: 0 0 8px rgba(255, 215, 0, 0.2);
    }
`;

content = content.substring(0, styleEndIndex) + tabStyles + content.substring(styleEndIndex);

// 2. Replace the main-panel content (lines 383 to 543 approximately)
const mainPanelStart = content.indexOf('<div class="main-panel">');
const mainPanelEnd = content.indexOf('<!-- ================= ПРАВАЯ КОЛОНКА: СЧЕТА ================= -->');

if (mainPanelStart === -1 || mainPanelEnd === -1) {
  console.error('Could not find main-panel tags in quiz-admin.html!');
  process.exit(1);
}

const newMainPanelHtml = `<div class="main-panel">
      
      <!-- Вкладки навигации панели модератора -->
      <div class="admin-nav-tabs" style="display:flex; gap:12px; margin-bottom:15px; border-bottom:2px solid #2d2618; padding-bottom:12px; flex-shrink:0;">
        <button class="tab-nav-btn active" id="tab-btn-game" onclick="switchTab('game')">Панель Игры</button>
        <button class="tab-nav-btn" id="tab-btn-questions" onclick="switchTab('questions')">Редактор Вопросов</button>
        <button class="tab-nav-btn" id="tab-btn-tables" onclick="switchTab('tables')">Управление Столами</button>
      </div>

      <!-- ================= ВКЛАДКА 1: УПРАВЛЕНИЕ ИГРОЙ ================= -->
      <div id="panel-game" class="tab-panel" style="display:flex; flex-direction:column; gap:25px; flex-grow:1;">
        
        <!-- Индикатор стейта -->
        <div class="state-info-bar">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 1px;">Текущий этап</div>
            <h2 id="current-state-title" style="margin: 5px 0 0 0; font-size: 22px;">Ожидание / Запуск</h2>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 1px;">Таймер</div>
            <h2 id="current-timer-val" style="margin: 5px 0 0 0; font-size: 26px; color: #ffd700;">—</h2>
          </div>
        </div>

        <!-- Контейнер для динамических карточек раундов -->
        <div id="rounds-control-container" style="display:flex; flex-direction:column; gap:20px;">
          <!-- Карточки раундов генерируются через JS -->
        </div>

        <!-- ЛОГ ОТВЕТОВ -->
        <div class="answers-log-section" style="flex-grow:1;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #2d2618; padding-bottom:10px;">
            <h3>ЛОГ ОТВЕТОВ КЛИЕНТОВ (В РЕАЛЬНОМ ВРЕМЕНИ)</h3>
            <button class="step-btn" style="padding: 5px 12px; font-size:10px;" onclick="awardBulkCorrect()">
              Начислить +100 верным
            </button>
          </div>
          
          <table class="answers-table">
            <thead>
              <tr>
                <th>Стол</th>
                <th>Выбранный вариант</th>
                <th>Скорость клика (мс)</th>
                <th>Результат</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody id="answers-log-tbody">
              <!-- Заполняется JS -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- ================= ВКЛАДКА 2: РЕДАКТОР ВОПРОСОВ ================= -->
      <div id="panel-questions" class="tab-panel" style="display:none; flex-direction:column; gap:20px;">
        <div class="round-card-box">
          <h3>Редактор Вопросов Квиза</h3>
          <p style="font-size:12px; color:#888; margin-bottom:15px;">Здесь вы можете изменить формулировки вопросов, варианты ответов и указать верные варианты.</p>
          
          <div style="display:flex; gap:15px; margin-bottom:20px;">
            <div style="width:230px; display:flex; flex-direction:column; gap:8px;">
              <span style="font-size:12px; font-weight:bold; color:#d4af37;">Выбрать Раунд:</span>
              <select id="editor-round-select" onchange="loadRoundQuestionsInEditor()" class="editor-input">
                <option value="1">Раунд 1 (Нейро-Бояре)</option>
                <option value="2">Раунд 2 (Ожившие Полотна)</option>
                <option value="3">Раунд 3 (Разбитые Зеркала)</option>
                <option value="4">Раунд 4 (Блиц)</option>
                <option value="5">Раунд 5 (Секретный Альянс)</option>
                <option value="6">Раунд 6 (Дерзкие Послы)</option>
                <option value="7">Раунд 7 (Гранд-Финал)</option>
              </select>
            </div>
            
            <div style="flex-grow:1; display:flex; flex-direction:column; gap:8px;">
              <span style="font-size:12px; font-weight:bold; color:#d4af37;">Вопросы Раунда:</span>
              <div style="display:flex; gap:10px;">
                <select id="editor-question-select" onchange="loadQuestionDetailsInEditor()" class="editor-input">
                  <!-- Loaded questions list -->
                </select>
                <button class="step-btn" style="width:auto; padding:0 15px;" onclick="addNewQuestionToEditor()">+ Новый Вопрос</button>
                <button class="action-btn-danger" style="width:auto; padding:0 15px;" onclick="deleteQuestionFromEditor()">Удалить</button>
              </div>
            </div>
          </div>
          
          <div id="editor-question-details-box" style="border-top:1.5px solid #2d2618; padding-top:20px; display:none; flex-direction:column; gap:15px;">
            <div>
              <span style="font-size:12px; font-weight:bold; color:#ffd700;">Текст Вопроса:</span>
              <textarea id="editor-q-text" rows="3" class="editor-input" style="margin-top:5px; resize:vertical;"></textarea>
            </div>
            
            <div id="editor-options-block" style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
              <div>
                <span style="font-size:12px; font-weight:bold; color:#c4b59f;">Вариант А:</span>
                <input type="text" id="editor-opt-a" class="editor-input" style="margin-top:5px;">
              </div>
              <div>
                <span style="font-size:12px; font-weight:bold; color:#c4b59f;">Вариант Б:</span>
                <input type="text" id="editor-opt-b" class="editor-input" style="margin-top:5px;">
              </div>
              <div>
                <span style="font-size:12px; font-weight:bold; color:#c4b59f;">Вариант В:</span>
                <input type="text" id="editor-opt-c" class="editor-input" style="margin-top:5px;">
              </div>
              <div>
                <span style="font-size:12px; font-weight:bold; color:#c4b59f;">Вариант Г:</span>
                <input type="text" id="editor-opt-d" class="editor-input" style="margin-top:5px;">
              </div>
            </div>
            
            <div style="width:250px;">
              <span style="font-size:12px; font-weight:bold; color:#ffd700;">Верный Ответ:</span>
              <select id="editor-q-correct" class="editor-input" style="margin-top:5px;">
                <option value="">Без выбора (Открытый вопрос)</option>
                <option value="A">Вариант А</option>
                <option value="B">Вариант Б</option>
                <option value="C">Вариант В</option>
                <option value="D">Вариант Г</option>
              </select>
            </div>
            
            <div style="margin-top:10px;">
              <button class="action-btn-royal" style="padding:10px 20px; font-size:11px;" onclick="applyQuestionChangeInEditor()">Применить изменения к вопросу</button>
            </div>
          </div>
          
          <div style="margin-top:30px; border-top:2px solid #2d2618; padding-top:20px; display:flex; gap:15px;">
            <button class="action-btn-royal" style="background:linear-gradient(135deg, #10b981, #059669); border-color:#10b981;" onclick="saveQuestionsEditor()">Сохранить все изменения вопросов</button>
            <button class="step-btn" style="width:auto;" onclick="resetQuestionsEditor()">Сбросить изменения</button>
          </div>
        </div>
      </div>

      <!-- ================= ВКЛАДКА 3: УПРАВЛЕНИЕ СТОЛАМИ ================= -->
      <div id="panel-tables" class="tab-panel" style="display:none; flex-direction:column; gap:20px;">
        <div class="round-card-box">
          <h3>Управление Столами Ассамблеи</h3>
          <p style="font-size:12px; color:#888; margin-bottom:15px;">Изменения вступят в силу для всех пультов гостей, экрана сцены и пульта модератора после сохранения.</p>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;" id="tables-editor-list">
            <!-- Сюда динамически рендерятся поля ввода столов -->
          </div>
          
          <div style="border-top:1.5px solid #2d2618; padding-top:15px; margin-top:15px;">
            <h4>Добавить Новый Стол</h4>
            <div style="display:flex; gap:10px; align-items:center; margin-top:10px;">
              <input type="number" id="new-table-id" placeholder="№ Стола (например, 11)" class="editor-input" style="width:180px;">
              <input type="text" id="new-table-name" placeholder="Название стола (например, IT-Опричники)" class="editor-input">
              <button class="step-btn" style="width:auto; padding:0 25px; height:42px;" onclick="addNewTableToEditor()">Добавить</button>
            </div>
          </div>
          
          <div style="margin-top:30px; border-top:2px solid #2d2618; padding-top:20px; display:flex; gap:15px;">
            <button class="action-btn-royal" style="background:linear-gradient(135deg, #10b981, #059669); border-color:#10b981;" onclick="saveTablesEditor()">Сохранить Конфигурацию Столов</button>
            <button class="step-btn" style="width:auto;" onclick="resetTablesEditor()">Сбросить изменения</button>
          </div>
        </div>
      </div>

    </div>\n\n`;

content = content.substring(0, mainPanelStart) + newMainPanelHtml + content.substring(mainPanelEnd);

// 3. Replace the entire bottom <script> tag with the updated logic
const scriptStart = content.lastIndexOf('<script>');
const scriptEnd = content.lastIndexOf('</script>');

if (scriptStart === -1 || scriptEnd === -1 || scriptEnd <= scriptStart) {
  console.error('Could not find script tag in quiz-admin.html!');
  process.exit(1);
}

const newScriptBody = `
  <script>
    // --- ПОДКЛЮЧЕНИЕ СЕРВЕРА ---
    let TABLE_NAMES = {}; // Loaded dynamically
    let QUIZ_QUESTIONS = {}; // Loaded dynamically

    const socketUrl = (window.location.protocol === 'file:' || !window.location.host) ? 'http://localhost:3000' : '';
    const socket = io(socketUrl);

    let localState = {};
    let localScores = {};
    let localConnections = {};
    let localAnswers = [];
    let localSubQuestionIndex = 0;

    // Состояния локальных редакторов
    let editorTablesCopy = {};
    let editorQuestionsCopy = {};

    socket.on('connect', () => {
      console.log('Администратор подключен');
      socket.emit('quiz_admin_join');
    });

    // Обработка dynamic tables update
    socket.on('quiz_tables_update', (tables) => {
      TABLE_NAMES = tables;
      editorTablesCopy = JSON.parse(JSON.stringify(tables));
      
      renderSidebarTablesAndScores();
      renderTablesEditor();
      renderRoundControlCards();
      
      updateUIScores();
      updateUIConnections();
    });

    // Обработка dynamic questions update
    socket.on('quiz_questions_update', (questions) => {
      QUIZ_QUESTIONS = questions;
      editorQuestionsCopy = JSON.parse(JSON.stringify(questions));
      
      renderRoundControlCards();
      loadRoundQuestionsInEditor();
    });

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

    // --- НАВИГАЦИЯ ТАБОВ ---
    function switchTab(tabName) {
      document.querySelectorAll('.tab-panel').forEach(panel => panel.style.display = 'none');
      document.querySelectorAll('.tab-nav-btn').forEach(btn => btn.classList.remove('active'));
      
      if (tabName === 'game') {
        document.getElementById('panel-game').style.display = 'flex';
        document.getElementById('tab-btn-game').classList.add('active');
        renderRoundControlCards(); // Refresh control cards
      } else if (tabName === 'questions') {
        document.getElementById('panel-questions').style.display = 'flex';
        document.getElementById('tab-btn-questions').classList.add('active');
        loadRoundQuestionsInEditor();
      } else if (tabName === 'tables') {
        document.getElementById('panel-tables').style.display = 'flex';
        document.getElementById('tab-btn-tables').classList.add('active');
        renderTablesEditor();
      }
    }

    // --- РЕНДЕРИНГ БОКОВОЙ ПАНЕЛИ СТОЛОВ И СЧЕТОВ ---
    function renderSidebarTablesAndScores() {
      const sidebarTables = document.getElementById('sidebar-table-list');
      const sidebarScores = document.getElementById('sidebar-scores-list');
      if (!sidebarTables || !sidebarScores) return;
      
      sidebarTables.innerHTML = '';
      sidebarScores.innerHTML = '';
      
      const sortedKeys = Object.keys(TABLE_NAMES).sort((a, b) => parseInt(a) - parseInt(b));
      sortedKeys.forEach(key => {
        // Status Row
        const row = document.createElement('div');
        row.className = 'table-status-row';
        row.id = \`conn-row-\${key}\`;
        row.innerHTML = \`
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="status-indicator" id="conn-indicator-\${key}"></div>
            <span class="table-info-name">Стол \${key} (\${TABLE_NAMES[key]})</span>
          </div>
          <span class="table-conn-count" id="conn-count-\${key}">0 пульт.</span>
        \`;
        sidebarTables.appendChild(row);

        // Score Row
        const sRow = document.createElement('div');
        sRow.className = 'score-row';
        sRow.innerHTML = \`
          <span class="table-info-name" style="font-size:11px;">Ст. \${key} (\${TABLE_NAMES[key]})</span>
          <div class="score-controls">
            <button class="score-adj-btn" onclick="adjustScore(\${key}, -100)">-</button>
            <span class="score-val-text" id="score-val-\${key}">0</span>
            <button class="score-adj-btn" onclick="adjustScore(\${key}, 100)">+</button>
          </div>
        \`;
        sidebarScores.appendChild(sRow);
      });
    }

    // --- ДИНАМИЧЕСКИЙ РЕНДЕРИНГ КАРТОЧЕК УПРАВЛЕНИЯ РАУНДАМИ ---
    function renderRoundControlCards() {
      const container = document.getElementById('rounds-control-container');
      if (!container) return;
      container.innerHTML = '';

      const roundsMeta = {
        1: { title: 'Раунд 1: Нейро-Бояре (Авто-раунд или пошаговый)', step1: 'Показать Вопрос', step2: 'Пульты + Старт 5с', step3: 'Верный Ответ', hasAuto: true },
        2: { title: 'Раунд 2: Нейро-сканирование живописи (Скан + Баллы)', step1: 'Показать заставку', step2: 'Включить картины на пультах', hasLaser: true },
        3: { title: 'Раунд 3: Ускользающий фрагмент (Фрагмент + А, Б, В, Г)', step1: 'Показать фрагмент', step2: 'Пульты + Старт 5с', step3: 'Верный Ответ (А)' },
        4: { title: 'Раунд 4: Прорубить окно: БЛИЦ', step1: 'Показать Вопрос', step2: 'Пульты + Старт 5с', step3: 'Верный Ответ' },
        5: { title: 'Раунд 5: Секретный Альянс', step1: 'Показать Указ', step2: 'Пульты + Старт 5с', step3: 'Верный Ответ' },
        6: { title: 'Раунд 6: Дерзкие Послы', step1: 'Показать Начало', step2: 'Пульты + Старт 5с', step3: 'Верный Ответ' },
        7: { title: 'Раунд 7: Гранд-Финал (Финальный супер-вопрос)', step1: 'Показать Вопрос', step2: 'Пульты + Старт 5с', step3: 'Финал: Открыть ворота победителя' }
      };

      for (let r = 1; r <= 7; r++) {
        const card = document.createElement('div');
        card.className = 'round-card-box';
        card.id = \`round-card-\${r}\`;
        
        let subQuestionsHtml = '';
        const qList = QUIZ_QUESTIONS[r] || [];
        
        // Рендерим кнопки подуказателей, если вопросов больше одного
        if (qList.length > 1 || r === 1 || r === 4 || r === 5 || r === 6) {
          subQuestionsHtml += \`<div style="margin-bottom:12px; display:flex; gap:6px; flex-wrap:wrap;">\`;
          qList.forEach((q, idx) => {
            const label = (r === 1) ? \`Портрет \${idx + 1}\` : (r === 6 ? \`Фраза \${idx + 1}\` : \`Вопрос \${idx + 1}\`);
            subQuestionsHtml += \`<button class="sub-q-btn btn-r\${r}" onclick="setSubQ(\${r}, \${idx})">\${label}</button>\`;
          });
          subQuestionsHtml += \`</div>\`;
        }

        let stepsHtml = \`<div class="steps-btn-group">\`;
        stepsHtml += \`<button class="step-btn" id="btn-\${r}-1" onclick="setState(\${r}, 'question')">1. \${roundsMeta[r].step1}</button>\`;
        stepsHtml += \`<button class="step-btn" id="btn-\${r}-2" onclick="setState(\${r}, 'answers_active')">2. \${roundsMeta[r].step2}</button>\`;
        if (roundsMeta[r].step3) {
          stepsHtml += \`<button class="step-btn" id="btn-\${r}-3" onclick="setState(\${r}, 'correct_answer')">3. \${roundsMeta[r].step3}</button>\`;
        }
        
        if (roundsMeta[r].hasAuto) {
          stepsHtml += \`<button class="step-btn" style="background: #a17c18; color: #000; border-color:#d4af37;" id="btn-\${r}-auto" onclick="startAutoRound1()">Авто-Гонка 50с</button>\`;
        }
        stepsHtml += \`</div>\`;

        let laserHtml = '';
        if (roundsMeta[r].hasLaser) {
          laserHtml += \`<div class="laser-control-panel">\`;
          const sortedKeys = Object.keys(TABLE_NAMES).sort((a, b) => parseInt(a) - parseInt(b));
          sortedKeys.forEach(key => {
            laserHtml += \`<button class="laser-btn" onclick="triggerLaser(\${key})">Лазер: Стол \${key} (\${TABLE_NAMES[key]})</button>\`;
          });
          laserHtml += \`</div>\`;
        }

        card.innerHTML = \`
          <h3>\${roundsMeta[r].title}</h3>
          \${subQuestionsHtml}
          \${stepsHtml}
          \${laserHtml}
        \`;
        container.appendChild(card);
      }
    }

    // --- УПРАВЛЕНИЕ СТЕЙТ-МАШИНОЙ ---
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

    function setState(round, step) {
      let timerLimit = 5;
      socket.emit('quiz_admin_set_state', { round, step, timerLimit, subQuestionIndex: localSubQuestionIndex });
    }

    function adjustScore(tableNumber, points) {
      socket.emit('quiz_admin_award_points', { tableNumber, points });
    }

    function resetAllScores() {
      if (confirm('Вы уверены, что хотите обнулить счета всех столов?')) {
        socket.emit('quiz_admin_reset_scores');
      }
    }

    function resetPhonesToStandby() {
      socket.emit('quiz_admin_set_state', { round: 0, step: 'standby' });
    }

    function triggerLeaderboardShow() {
      socket.emit('quiz_admin_show_leaderboard');
    }

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
        if (autoBtn) {
          autoBtn.textContent = "Авто-Гонка 50с";
          autoBtn.style.background = '#a17c18';
          autoBtn.style.color = '#000';
        }
        return;
      }
      
      if (autoBtn) {
        autoBtn.textContent = "ОСТАНОВИТЬ";
        autoBtn.style.background = '#ef4444';
        autoBtn.style.color = '#fff';
      }
      
      let currentSub = 0;
      const qList = QUIZ_QUESTIONS[1] || [];
      const totalSub = qList.length || 10;
      
      function runNext() {
        if (currentSub >= totalSub) {
          clearInterval(autoRoundInterval);
          autoRoundInterval = null;
          if (autoBtn) {
            autoBtn.textContent = "Авто-Гонка 50с";
            autoBtn.style.background = '#a17c18';
            autoBtn.style.color = '#000';
          }
          setState(1, 'standby');
          return;
        }
        
        setSubQ(1, currentSub);
        setState(1, 'question');
        
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

    // --- РЕДАКТОР СТОЛОВ ---
    function renderTablesEditor() {
      const listDiv = document.getElementById('tables-editor-list');
      if (!listDiv) return;
      listDiv.innerHTML = '';

      const sortedKeys = Object.keys(editorTablesCopy).sort((a, b) => parseInt(a) - parseInt(b));
      sortedKeys.forEach(key => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.gap = '8px';
        item.style.alignItems = 'center';
        item.style.background = 'rgba(255,255,255,0.03)';
        item.style.padding = '8px';
        item.style.borderRadius = '6px';
        item.style.border = '1px solid #2d2618';
        
        item.innerHTML = \`
          <span style="font-weight:bold; color:#ffd700; width:70px;">Стол \${key}:</span>
          <input type="text" class="editor-input" value="\${editorTablesCopy[key]}" onchange="updateEditorTableName('\${key}', this.value)" style="flex-grow:1; padding:6px 10px;">
          <button class="action-btn-danger" style="padding:6px 12px; font-size:10px;" onclick="deleteTableFromEditor('\${key}')">Удалить</button>
        \`;
        listDiv.appendChild(item);
      });
    }

    function updateEditorTableName(key, val) {
      editorTablesCopy[key] = val;
    }

    function deleteTableFromEditor(key) {
      if (confirm(\`Удалить стол \${key} (\${editorTablesCopy[key]}) из списка?\`)) {
        delete editorTablesCopy[key];
        renderTablesEditor();
      }
    }

    function addNewTableToEditor() {
      const idInput = document.getElementById('new-table-id');
      const nameInput = document.getElementById('new-table-name');
      
      const id = idInput.value.trim();
      const name = nameInput.value.trim();
      
      if (!id || !name) {
        alert('Введите номер и название стола!');
        return;
      }
      
      if (editorTablesCopy[id]) {
        alert('Стол с таким номером уже существует!');
        return;
      }
      
      editorTablesCopy[id] = name;
      idInput.value = '';
      nameInput.value = '';
      
      renderTablesEditor();
    }

    function saveTablesEditor() {
      if (confirm('Вы уверены, что хотите сохранить новую конфигурацию столов? Все пульты и экраны обновятся автоматически.')) {
        socket.emit('quiz_admin_save_tables', editorTablesCopy);
        alert('Конфигурация столов сохранена!');
      }
    }

    function resetTablesEditor() {
      editorTablesCopy = JSON.parse(JSON.stringify(TABLE_NAMES));
      renderTablesEditor();
    }

    // --- РЕДАКТОР ВОПРОСОВ ---
    function loadRoundQuestionsInEditor() {
      const round = document.getElementById('editor-round-select').value;
      const qSelect = document.getElementById('editor-question-select');
      if (!qSelect) return;
      qSelect.innerHTML = '';
      
      const questions = editorQuestionsCopy[round] || [];
      if (questions.length === 0) {
        qSelect.innerHTML = '<option value="">Нет вопросов в этом раунде</option>';
        document.getElementById('editor-question-details-box').style.display = 'none';
        return;
      }

      questions.forEach((q, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = \`Вопрос \${idx + 1}: \${q.text.substring(0, 50)}\${q.text.length > 50 ? '...' : ''}\`;
        qSelect.appendChild(option);
      });

      loadQuestionDetailsInEditor();
    }

    function loadQuestionDetailsInEditor() {
      const round = document.getElementById('editor-round-select').value;
      const idx = document.getElementById('editor-question-select').value;
      const detailsBox = document.getElementById('editor-question-details-box');
      
      if (idx === "" || !editorQuestionsCopy[round] || !editorQuestionsCopy[round][idx]) {
        detailsBox.style.display = 'none';
        return;
      }

      const q = editorQuestionsCopy[round][idx];
      detailsBox.style.display = 'flex';

      document.getElementById('editor-q-text').value = q.text;
      
      const optionsBlock = document.getElementById('editor-options-block');
      
      if (round == 2) {
        // В Раунде 2 вариантов ответов нет, это скан-раунд
        optionsBlock.style.display = 'none';
        document.getElementById('editor-q-correct').parentElement.style.display = 'none';
      } else {
        optionsBlock.style.display = 'grid';
        document.getElementById('editor-q-correct').parentElement.style.display = 'block';
        
        document.getElementById('editor-opt-a').value = q.options && q.options[0] !== undefined ? q.options[0] : '';
        document.getElementById('editor-opt-b').value = q.options && q.options[1] !== undefined ? q.options[1] : '';
        document.getElementById('editor-opt-c').value = q.options && q.options[2] !== undefined ? q.options[2] : '';
        document.getElementById('editor-opt-d').value = q.options && q.options[3] !== undefined ? q.options[3] : '';
        document.getElementById('editor-q-correct').value = q.correct || '';
      }
    }

    function applyQuestionChangeInEditor() {
      const round = document.getElementById('editor-round-select').value;
      const idx = document.getElementById('editor-question-select').value;
      
      if (idx === "" || !editorQuestionsCopy[round] || !editorQuestionsCopy[round][idx]) return;

      const qText = document.getElementById('editor-q-text').value.trim();
      if (!qText) {
        alert('Введите текст вопроса!');
        return;
      }

      editorQuestionsCopy[round][idx].text = qText;

      if (round != 2) {
        const optA = document.getElementById('editor-opt-a').value.trim();
        const optB = document.getElementById('editor-opt-b').value.trim();
        const optC = document.getElementById('editor-opt-c').value.trim();
        const optD = document.getElementById('editor-opt-d').value.trim();
        const correct = document.getElementById('editor-q-correct').value;

        editorQuestionsCopy[round][idx].options = [optA, optB, optC, optD];
        editorQuestionsCopy[round][idx].correct = correct;
      }

      alert('Изменения временно применены к текущему вопросу. Не забудьте сохранить все изменения вопросов!');
      loadRoundQuestionsInEditor();
      document.getElementById('editor-question-select').value = idx;
      loadQuestionDetailsInEditor();
    }

    function addNewQuestionToEditor() {
      const round = document.getElementById('editor-round-select').value;
      if (!editorQuestionsCopy[round]) {
        editorQuestionsCopy[round] = [];
      }

      const newQ = {
        text: 'Новый Вопрос',
        options: round == 2 ? [] : ['Вариант А', 'Вариант Б', 'Вариант В', 'Вариант Г'],
        correct: round == 2 ? '' : 'A'
      };

      editorQuestionsCopy[round].push(newQ);
      loadRoundQuestionsInEditor();
      
      // Select the last question
      const newIdx = editorQuestionsCopy[round].length - 1;
      document.getElementById('editor-question-select').value = newIdx;
      loadQuestionDetailsInEditor();
    }

    function deleteQuestionFromEditor() {
      const round = document.getElementById('editor-round-select').value;
      const idx = document.getElementById('editor-question-select').value;
      
      if (idx === "" || !editorQuestionsCopy[round] || !editorQuestionsCopy[round][idx]) return;

      if (confirm('Вы уверены, что хотите удалить этот вопрос?')) {
        editorQuestionsCopy[round].splice(idx, 1);
        loadRoundQuestionsInEditor();
      }
    }

    function saveQuestionsEditor() {
      if (confirm('Вы уверены, что хотите сохранить все измененные вопросы? Они будут записаны на диск и обновлены во всей игре.')) {
        socket.emit('quiz_admin_save_questions', editorQuestionsCopy);
        alert('Вопросы успешно сохранены!');
      }
    }

    function resetQuestionsEditor() {
      editorQuestionsCopy = JSON.parse(JSON.stringify(QUIZ_QUESTIONS));
      loadRoundQuestionsInEditor();
    }

    // --- Обновление элементов интерфейса игры ---
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

        const tableName = TABLE_NAMES[ans.tableNumber] || \`Стол \${ans.tableNumber}\`;

        tr.innerHTML = \`
          <td style="font-weight:bold; color:#ffd700;">Стол \${ans.tableNumber} (\${tableName})</td>
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

content = content.substring(0, scriptStart) + newScriptBody + content.substring(scriptEnd + '</script>'.length);

fs.writeFileSync(adminHtmlPath, content, 'utf8');
console.log('Successfully updated quiz-admin.html with navigation tabs and full editor features.');

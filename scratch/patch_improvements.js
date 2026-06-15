const fs = require('fs');
const path = require('path');

const screenHtmlPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\public\\quiz-screen.html';
const adminHtmlPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\public\\quiz-admin.html';

// ==========================================
// 1. PATCH QUIZ-SCREEN.HTML (REMOVE LETTERS, ADD CDN FALLBACK)
// ==========================================
if (fs.existsSync(screenHtmlPath)) {
  let content = fs.readFileSync(screenHtmlPath, 'utf8');

  // Inject CDN Fallback right after socket.io.js script in head
  const socketIoTag = '<script src="/socket.io/socket.io.js"></script>';
  const socketIoIdx = content.indexOf(socketIoTag);
  if (socketIoIdx !== -1) {
    const fallbackScript = `\n  <script>
    if (typeof io === 'undefined') {
      document.write('<script src="https://cdn.socket.io/4.7.5/socket.io.min.js"><\\/script>');
    }
  </script>`;
    content = content.substring(0, socketIoIdx + socketIoTag.length) + fallbackScript + content.substring(socketIoIdx + socketIoTag.length);
  }

  // Delete matrix glagolitic letters golden rain drawing logic
  const rainSearch = `      if (currentRound > 0) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
        ctx.font = fontSize + 'px "Cinzel", serif';

        for (let i = 0; i < rainDrops.length; i++) {
          const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
          ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

          if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.985) {
            rainDrops[i] = 0;
          }
          rainDrops[i]++;
        }
      }`;

  content = content.replace(rainSearch, '');

  fs.writeFileSync(screenHtmlPath, content, 'utf8');
  console.log('Successfully updated quiz-screen.html by removing Glagolitic code rain and adding socket fallback.');
} else {
  console.error('quiz-screen.html not found!');
}

// ==========================================
// 2. PATCH QUIZ-ADMIN.HTML (FLOW CONTROL, PREVIEW & PROGRESS)
// ==========================================
if (fs.existsSync(adminHtmlPath)) {
  let content = fs.readFileSync(adminHtmlPath, 'utf8');

  // Find main-panel tabs tag and inject Flow Control and Preview HTML right after it
  const tabsSearch = `      <!-- Вкладки навигации панели модератора -->
      <div class="admin-nav-tabs" style="display:flex; gap:12px; margin-bottom:15px; border-bottom:2px solid #2d2618; padding-bottom:12px; flex-shrink:0;">
        <button class="tab-nav-btn active" id="tab-btn-game" onclick="switchTab('game')">Панель Игры</button>
        <button class="tab-nav-btn" id="tab-btn-questions" onclick="switchTab('questions')">Редактор Вопросов</button>
        <button class="tab-nav-btn" id="tab-btn-tables" onclick="switchTab('tables')">Управление Столами</button>
      </div>`;

  const flowControlHtml = `\n
      <!-- Панель управления потоком игры (СЛЕДУЮЩИЙ ШАГ) -->
      <div id="flow-control-panel" style="background: linear-gradient(135deg, #1d170e, #0e0a05); border: 2.5px solid #d4af37; padding: 18px 24px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.6); flex-shrink:0; margin-bottom: 20px;">
        <div style="display:flex; flex-direction:column; gap:4px;">
          <div style="font-family: 'Cinzel', serif; font-size:15px; color:#ffd700; font-weight:bold; letter-spacing:0.5px;">⚜ УПРАВЛЕНИЕ ПОТОКОМ ИГРЫ:</div>
          <div style="font-size:12px; color:#c4b59f;">Ответило столов: <strong id="answered-count-text" style="color:#ffd700; font-size:14px;">0</strong> из <strong id="total-connected-text" style="color:#ffd700; font-size:14px;">0</strong> подключенных</div>
        </div>
        <button class="action-btn-royal" style="width: auto; padding: 12px 30px; font-size: 14px; font-weight:900; letter-spacing:1px;" onclick="triggerNextGameStep()" id="flow-next-step-btn">СЛЕДУЮЩИЙ ШАГ ➔</button>
      </div>

      <!-- Карточка предпросмотра текущего вопроса -->
      <div class="round-card-box" id="active-question-preview-box" style="display:none; border-color:#ffd700; padding:18px 24px; margin-top:-10px; margin-bottom:20px; background:rgba(30, 24, 16, 0.5);">
        <h4 style="margin: 0 0 10px 0; font-family:'Cinzel', serif; font-size:12px; color:#888; text-transform:uppercase; letter-spacing:0.5px;">Текущий Вопрос на Экране:</h4>
        <div style="font-size: 17px; font-weight: 700; color: #ffd700; margin-bottom:12px; line-height:1.4;" id="preview-q-text"></div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:13px;" id="preview-options-list">
          <!-- Заполняется JS -->
        </div>
      </div>`;

  content = content.replace(tabsSearch, tabsSearch + flowControlHtml);

  // Now, inject JS functions into the script block
  // We will find `updateUIState()` and place our updates inside it
  const updateUIStateSearch = `    function updateUIState() {
      const round = localState.currentRound;
      const step = localState.roundStep;`;

  const updateUIStateReplace = `    function updateUIState() {
      const round = localState.currentRound;
      const step = localState.roundStep;
      
      updateActiveQuestionPreview();
      updateAnswerProgress();
      updateFlowButtonLabel();`;

  content = content.replace(updateUIStateSearch, updateUIStateReplace);

  // Call updateAnswerProgress in score and connection changes too
  const connectionsUpdateSearch = `    socket.on('quiz_connections_update', (conns) => {
      localConnections = conns;
      updateUIConnections();
    });`;
  const connectionsUpdateReplace = `    socket.on('quiz_connections_update', (conns) => {
      localConnections = conns;
      updateUIConnections();
      updateAnswerProgress();
    });`;
  content = content.replace(connectionsUpdateSearch, connectionsUpdateReplace);

  const answersListSearch = `    socket.on('quiz_answers_list', (answers) => {
      localAnswers = answers;
      updateUIAnswersLog();
    });`;
  const answersListReplace = `    socket.on('quiz_answers_list', (answers) => {
      localAnswers = answers;
      updateUIAnswersLog();
      updateAnswerProgress();
    });`;
  content = content.replace(answersListSearch, answersListReplace);

  // Insert the helper functions at the end of the script block
  const scriptEndIdx = content.lastIndexOf('  </script>');
  if (scriptEndIdx !== -1) {
    const flowFunctions = `
    // --- УПРАВЛЕНИЕ УДОБСТВОМ И ПОТОКОМ ИГРЫ ---
    
    function triggerNextGameStep() {
      const round = localState.currentRound;
      const step = localState.roundStep;
      const subIdx = localState.subQuestionIndex;
      const qList = QUIZ_QUESTIONS[round] || [];
      
      if (round === 0) {
        // Запуск первого раунда, первого вопроса
        socket.emit('quiz_admin_set_state', { round: 1, step: 'question', subQuestionIndex: 0 });
        return;
      }
      
      if (step === 'standby') {
        // Показать вопрос
        setState(round, 'question');
        return;
      }
      
      if (step === 'question') {
        // Активировать пульты
        setState(round, 'answers_active');
        return;
      }
      
      if (step === 'answers_active') {
        // Показать верный ответ
        setState(round, 'correct_answer');
        return;
      }
      
      if (step === 'correct_answer' || step === 'correct_answer_wait') {
        // Переход к следующему вопросу или раунду
        if (subIdx + 1 < qList.length) {
          setSubQ(round, subIdx + 1);
          setState(round, 'question');
        } else {
          // Завершились вопросы в раунде. Переводим на standby следующего раунда
          if (round < 7) {
            socket.emit('quiz_admin_set_state', { round: round + 1, step: 'standby', subQuestionIndex: 0 });
          } else {
            // Квиз закончен. Переводим в раунд 0
            socket.emit('quiz_admin_set_state', { round: 0, step: 'standby', subQuestionIndex: 0 });
          }
        }
      }
    }

    function updateFlowButtonLabel() {
      const btn = document.getElementById('flow-next-step-btn');
      if (!btn) return;

      const round = localState.currentRound;
      const step = localState.roundStep;
      const subIdx = localState.subQuestionIndex;
      const qList = QUIZ_QUESTIONS[round] || [];

      if (round === 0) {
        btn.textContent = "НАЧАТЬ КВИЗ ➔";
        return;
      }

      if (step === 'standby') {
        btn.textContent = \`ПОКАЗАТЬ ВОПРОС \${subIdx + 1} ➔\`;
      } else if (step === 'question') {
        btn.textContent = "ВКЛЮЧИТЬ ПУЛЬТЫ (30с) ➔";
      } else if (step === 'answers_active') {
        btn.textContent = "ПОКАЗАТЬ ВЕРНЫЙ ОТВЕТ ➔";
      } else if (step === 'correct_answer' || step === 'correct_answer_wait') {
        if (subIdx + 1 < qList.length) {
          btn.textContent = \`ПЕРЕЙТИ К ВОПРОСУ \${subIdx + 2} ➔\`;
        } else {
          if (round < 7) {
            btn.textContent = \`ПЕРЕЙТИ К РАУНДУ \${round + 1} ➔\`;
          } else {
            btn.textContent = "ЗАВЕРШИТЬ КВИЗ ➔";
          }
        }
      }
    }

    function updateAnswerProgress() {
      const ansText = document.getElementById('answered-count-text');
      const connText = document.getElementById('total-connected-text');
      if (!ansText || !connText) return;

      let totalConnected = 0;
      for (const key in localConnections) {
        if (localConnections[key] > 0) {
          totalConnected++;
        }
      }

      ansText.textContent = localAnswers.length;
      connText.textContent = totalConnected;
    }

    function updateActiveQuestionPreview() {
      const previewBox = document.getElementById('active-question-preview-box');
      if (!previewBox) return;

      const round = localState.currentRound;
      if (round === 0 || !localState.activeQuestion) {
        previewBox.style.display = 'none';
        return;
      }

      previewBox.style.display = 'block';
      document.getElementById('preview-q-text').textContent = localState.activeQuestion.text;

      const optsList = document.getElementById('preview-options-list');
      optsList.innerHTML = '';

      const correctCode = localState.correctAnswer;
      const opts = localState.activeQuestion.options || [];

      if (opts.length > 0) {
        opts.forEach((opt, idx) => {
          const code = ['A', 'B', 'C', 'D'][idx];
          const item = document.createElement('div');
          item.style.padding = '8px 12px';
          item.style.borderRadius = '6px';
          item.style.background = 'rgba(255,255,255,0.03)';
          item.style.border = '1px solid #2d2618';
          
          if (code === correctCode) {
            item.style.borderColor = '#00e676';
            item.style.color = '#00e676';
            item.style.background = 'rgba(0, 230, 118, 0.05)';
            item.innerHTML = \`<strong>\${code}) \${opt}</strong> <span style="font-size:10px; color:#00e676; margin-left:5px;">(ВЕРНО)</span>\`;
          } else {
            item.textContent = \`\${code}) \${opt}\`;
          }
          optsList.appendChild(item);
        });
      } else {
        optsList.innerHTML = '<div style="grid-column: span 2; color:#888; font-style:italic;">Раунд без выбора вариантов (Скан-раунд)</div>';
      }
    }
`;
    content = content.substring(0, scriptEndIdx) + flowFunctions + content.substring(scriptEndIdx);
  }

  fs.writeFileSync(adminHtmlPath, content, 'utf8');
  console.log('Successfully updated quiz-admin.html with flow control, progress and active preview.');
} else {
  console.error('quiz-admin.html not found!');
}

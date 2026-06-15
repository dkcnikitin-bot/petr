const fs = require('fs');
const path = require('path');

const serverJsPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\server.js';
const phoneHtmlPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\public\\quiz-phone.html';
const adminHtmlPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\public\\quiz-admin.html';
const screenHtmlPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\public\\quiz-screen.html';

// ==========================================
// 1. PATCH SERVER.JS (AUTOMATIC POINTS CALCULATION)
// ==========================================
if (fs.existsSync(serverJsPath)) {
  let code = fs.readFileSync(serverJsPath, 'utf8');

  // Inject lastAwardedQuestionKey declaration
  const stateDeclSearch = 'let timerInterval = null;';
  const stateDeclReplace = 'let timerInterval = null;\nlet lastAwardedQuestionKey = "";';
  code = code.replace(stateDeclSearch, stateDeclReplace);

  // Modify correct_answer set_state handler to award points automatically
  const correctStateSearch = `    // Если переходим на верный ответ
    if (step === 'correct_answer') {
      clearInterval(timerInterval);
      quizState.answersLocked = true;
      quizState.roundStep = 'correct_answer';
    }`;

  const correctStateReplace = `    // Если переходим на верный ответ
    if (step === 'correct_answer') {
      clearInterval(timerInterval);
      quizState.answersLocked = true;
      quizState.roundStep = 'correct_answer';

      // Автоматическое начисление баллов правильным столам
      const correctCode = quizState.correctAnswer;
      const currentKey = \`\${quizState.currentRound}_\${quizState.subQuestionIndex}\`;
      
      if (correctCode && lastAwardedQuestionKey !== currentKey) {
        lastAwardedQuestionKey = currentKey;
        let countCorrect = 0;
        currentAnswers.forEach(ans => {
          if (ans.answer === correctCode) {
            const table = String(ans.tableNumber);
            if (tableScores[table] !== undefined) {
              tableScores[table] = tableScores[table] + 100;
              countCorrect++;
            }
          }
        });
        io.emit('quiz_scores_update', tableScores);
        console.log(\`[Авто-Баллы] \${countCorrect} столов получили по +100 за верный ответ \${correctCode}.\`);
      }
    }`;

  code = code.replace(correctStateSearch, correctStateReplace);

  // Also clear lastAwardedQuestionKey on score reset
  const scoreResetSearch = `    for (const key in TABLE_NAMES) {
      tableScores[key] = 0;
    }`;
  const scoreResetReplace = `    for (const key in TABLE_NAMES) {
      tableScores[key] = 0;
    }
    lastAwardedQuestionKey = "";`;
  code = code.replace(scoreResetSearch, scoreResetReplace);

  fs.writeFileSync(serverJsPath, code, 'utf8');
  console.log('Successfully patched server.js with automatic points calculation.');
} else {
  console.error('server.js not found!');
}

// ==========================================
// 2. PATCH QUIZ-PHONE.HTML (SCROLL FIX)
// ==========================================
if (fs.existsSync(phoneHtmlPath)) {
  let content = fs.readFileSync(phoneHtmlPath, 'utf8');

  // Change justify-content from center to flex-start to allow scrolling without clipping
  const justifySearch = 'justify-content: center;\r\n      width: 100%;\r\n      height: 100%;\r\n      padding: 24px;\r\n      z-index: 5;\r\n      position: relative;\r\n      overflow-y: auto;';
  const justifySearchLf = 'justify-content: center;\n      width: 100%;\n      height: 100%;\n      padding: 24px;\n      z-index: 5;\n      position: relative;\n      overflow-y: auto;';

  const justifyReplace = 'justify-content: flex-start;\n      width: 100%;\n      height: 100%;\n      padding: 24px;\n      z-index: 5;\n      position: relative;\n      overflow-y: auto;\n      -webkit-overflow-scrolling: touch;';

  if (content.indexOf(justifySearch) !== -1) {
    content = content.replace(justifySearch, justifyReplace);
  } else {
    content = content.replace(justifySearchLf, justifyReplace);
  }

  fs.writeFileSync(phoneHtmlPath, content, 'utf8');
  console.log('Successfully patched quiz-phone.html to support scrolling.');
} else {
  console.error('quiz-phone.html not found!');
}

// ==========================================
// 3. PATCH QUIZ-ADMIN.HTML (TIMER PACING & AUTO-ROUND LIMITS)
// ==========================================
if (fs.existsSync(adminHtmlPath)) {
  let content = fs.readFileSync(adminHtmlPath, 'utf8');

  // Change default timer limit to 30
  content = content.replace('let timerLimit = 5;', 'let timerLimit = 30;');

  // Change button label and timing in startAutoRound1
  content = content.replace('Авто-Гонка 50с', 'Авто-Гонка 5 мин');
  content = content.replace('btn-1-auto" onclick="startAutoRound1()">Авто-Гонка 50с</button>', 'btn-1-auto" onclick="startAutoRound1()">Авто-Гонка 5 мин</button>');

  const autoFuncSearch = `      function runNext() {
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
      autoRoundInterval = setInterval(runNext, 5000);`;

  const autoFuncReplace = `      function runNext() {
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
        
        // 1. Показать портрет
        setSubQ(1, currentSub);
        setState(1, 'question');
        
        // 2. Через 2 секунды включить таймер ответа на 28 секунд
        setTimeout(() => {
          socket.emit('quiz_admin_set_state', { round: 1, step: 'answers_active', timerLimit: 28, subQuestionIndex: currentSub - 1 });
        }, 2000);
        
        currentSub++;
      }
      
      runNext();
      autoRoundInterval = setInterval(runNext, 30000);`;

  content = content.replace(autoFuncSearch, autoFuncReplace);
  
  // Clean up duplicate labels if they exist
  content = content.replace(/Авто-Гонка 50с/g, 'Авто-Гонка 5 мин');

  fs.writeFileSync(adminHtmlPath, content, 'utf8');
  console.log('Successfully patched quiz-admin.html with 30s auto-round limits.');
} else {
  console.error('quiz-admin.html not found!');
}

// ==========================================
// 4. PATCH QUIZ-SCREEN.HTML (TIMER LAYOUT & OVERLAY POINTER EVENTS)
// ==========================================
if (fs.existsSync(screenHtmlPath)) {
  let content = fs.readFileSync(screenHtmlPath, 'utf8');

  // Change .timer-container CSS to relative, centered below logo
  const timerCssSearch = `    .timer-container {
      position: absolute;
      top: 30px;
      right: 50px;
      width: 120px;
      height: 120px;
      z-index: 20;
      display: none;
      align-items: center;
      justify-content: center;
    }`;

  const timerCssReplace = `    .timer-container {
      position: relative;
      margin: 15px auto;
      width: 110px;
      height: 110px;
      z-index: 20;
      display: flex !important; /* Всегда в потоке */
      opacity: 0;
      pointer-events: none;
      align-items: center;
      justify-content: center;
      transition: opacity 0.4s ease-in-out;
      flex-shrink: 0;
    }
    .timer-container.active {
      opacity: 1;
      pointer-events: auto;
    }`;

  content = content.replace(timerCssSearch, timerCssReplace);

  // Update timer active/inactive state mapping in javascript
  const timerStateSearch = `      if (step === 'answers_active') {
        activeTimerLimit = state.timerLimit || 5;
        timerBox.classList.add('active');
      } else if (step === 'question' || step === 'standby') {
        timerBox.classList.remove('active');
      }`;

  const timerStateReplace = `      if (step === 'answers_active') {
        activeTimerLimit = state.timerLimit || 30; // default 30
        timerBox.classList.add('active');
      } else {
        timerBox.classList.remove('active');
      }`;

  content = content.replace(timerStateSearch, timerStateReplace);

  // Re-enable pointer events on the active leaderboard overlay to allow scrolling
  const activeLeaderboardSearch = `    .full-screen-leaderboard-overlay.active {
      display: flex;
      opacity: 1;
    }`;
  const activeLeaderboardReplace = `    .full-screen-leaderboard-overlay.active {
      display: flex;
      opacity: 1;
      pointer-events: auto; /* Позволяет прокручивать таблицу */
    }`;

  content = content.replace(activeLeaderboardSearch, activeLeaderboardReplace);

  fs.writeFileSync(screenHtmlPath, content, 'utf8');
  console.log('Successfully patched quiz-screen.html with centered timer layout.');
} else {
  console.error('quiz-screen.html not found!');
}

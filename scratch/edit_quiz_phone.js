const fs = require('fs');
const path = require('path');

const phoneHtmlPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\public\\quiz-phone.html';

if (!fs.existsSync(phoneHtmlPath)) {
  console.error('File not found:', phoneHtmlPath);
  process.exit(1);
}

let content = fs.readFileSync(phoneHtmlPath, 'utf8');

// The replacement script tag
const newScriptContent = `  <script>
    // --- Локальное состояние пульта ---
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

    let socket = null;
    let tableNumber = null;
    let currentScore = 0;
    let selectedTableIndex = null;
    let hasAnswered = false;

    // Ссылки на сцены
    const scenes = {
      login: document.getElementById('scene-login'),
      ready: document.getElementById('scene-ready'),
      standby: document.getElementById('scene-standby'),
      quiz: document.getElementById('scene-quiz'),
      photo: document.getElementById('scene-photo'),
      victory: document.getElementById('scene-victory')
    };

    function showScene(sceneName) {
      Object.keys(scenes).forEach(k => {
        scenes[k].classList.remove('active');
      });
      scenes[sceneName].classList.add('active');
    }

    // Инициализация таблицы выбора
    const grid = document.getElementById('login-table-grid');
    const readySubmitBtn = document.getElementById('ready-submit-btn');

    for (let i = 1; i <= 10; i++) {
      const btn = document.createElement('button');
      btn.className = 'table-btn';
      btn.innerHTML = \`<span style="font-weight:800; font-size:12px;">СТОЛ №\${i}</span><span style="font-size:9px; color:#ffd700; margin-top:2px;">(\${TABLE_NAMES[i]})</span>\`;
      btn.addEventListener('click', () => {
        selectedTableIndex = i;
        tableNumber = i;
        showScene('ready');
      });
      grid.appendChild(btn);
    }

    // Клик по гигантской кнопке ГОТОВ ВОРВАТЬСЯ!
    readySubmitBtn.addEventListener('click', () => {
      if (tableNumber !== null) {
        initializeSocket();
        const tableNameText = TABLE_NAMES[tableNumber];
        document.getElementById('standby-table-label').textContent = \`СТОЛ №\${tableNumber} (\${tableNameText})\`;
        document.getElementById('quiz-header-table-name').textContent = \`СТОЛ №\${tableNumber} (\${tableNameText})\`;
        document.getElementById('photo-header-table-name').textContent = \`СТОЛ №\${tableNumber} (\${tableNameText})\`;
        showScene('standby');
      }
    });

    // Инициализация WebSockets
    function initializeSocket() {
      // Инициализируем сокет с поддержкой file:/// протокола
      const socketUrl = (window.location.protocol === 'file:' || !window.location.host) ? 'http://localhost:3000' : '';
      socket = io(socketUrl);

      socket.on('connect', () => {
        console.log('Подключено к серверу, регистрируем стол', tableNumber);
        socket.emit('quiz_client_join', { tableNumber });
      });

      // Получение глобального состояния квиза
      socket.on('quiz_state_update', (data) => {
        console.log('quiz_state_update:', data);
        
        let state = data;
        // Если пришло от quiz_client_join, оно обернуто в объект с score
        if (data.quizState) {
          state = data.quizState;
          if (data.score !== undefined) {
            currentScore = data.score;
            document.getElementById('quiz-header-table-score').textContent = \`\${currentScore} монет\`;
            document.getElementById('photo-header-table-score').textContent = \`\${currentScore} монет\`;
          }
        }

        handleStateChange(state);
      });

      // Обновление баллов стола
      socket.on('quiz_scores_update', (scores) => {
        if (tableNumber && scores[String(tableNumber)] !== undefined) {
          currentScore = scores[String(tableNumber)];
          document.getElementById('quiz-header-table-score').textContent = \`\${currentScore} монет\`;
          document.getElementById('photo-header-table-score').textContent = \`\${currentScore} монет\`;
        }
      });

      // Ответ принят сервером
      socket.on('quiz_answer_acknowledged', (res) => {
        if (res.success) {
          hasAnswered = true;
          document.getElementById('submitted-answer-text').textContent = \`Ваш выбор: \${res.answer}\`;
          document.getElementById('submitted-overlay').classList.add('active');
        }
      });

      // Синхронизация ответа стола (если кто-то другой за столом ответил быстрее)
      socket.on('quiz_table_answered_sync', (res) => {
        hasAnswered = true;
        document.getElementById('submitted-answer-text').textContent = \`Ваш стол выбрал: \${res.answer}\`;
        document.getElementById('submitted-overlay').classList.add('active');
        lockAnswerButtons(true);
      });

      // Таймер истек
      socket.on('quiz_timer_end', () => {
        lockAnswerButtons(true);
      });
      
      // Сброс на standby
      socket.on('quiz_reset_standby', () => {
        showScene('standby');
      });
    }

    // Обработчик изменения стейта
    function handleStateChange(state) {
      const round = state.currentRound;
      const step = state.roundStep;

      // Сброс оверлея ответа
      if (step === 'question' || step === 'standby') {
        hasAnswered = false;
        document.getElementById('submitted-overlay').classList.remove('active');
        lockAnswerButtons(false);
      }

      // Стейт: Standby
      if (round === 0 || step === 'standby') {
        showScene('standby');
        return;
      }

      // Раунд 2 (Сканирование картин на весь экран)
      if (round === 2) {
        showScene('photo');
        showTablePainting(tableNumber);
        return;
      }

      // Сцена Гранд-Финала ПОБЕДА!
      if (round === 7 && step === 'correct_answer') {
        showScene('victory');
        return;
      }

      // Другие раунды
      showScene('quiz');

      const splitText = document.getElementById('split-text-container');
      const buttonsBox = document.getElementById('answer-buttons-box');
      const r3Box = document.getElementById('round3-pic-box');

      // Поведение в зависимости от раунда
      if (round === 3) {
        r3Box.style.display = 'flex';
        drawFragmentCanvas();
      } else {
        r3Box.style.display = 'none';
      }

      // Разделение логики в раундах 5 и 6
      let isTextOnly = false;
      let textMsg = "";

      if (round === 5) {
        // Нечетные столы (1, 3, 5, 7, 9) видят только текст вопроса
        if (tableNumber % 2 !== 0) {
          isTextOnly = true;
          textMsg = state.activeQuestion ? state.activeQuestion.text : "";
        }
      } else if (round === 6) {
        // Нечетные столы (1, 3, 5, 7, 9) видят только начало фразы
        if (tableNumber % 2 !== 0) {
          isTextOnly = true;
          textMsg = state.activeQuestion ? state.activeQuestion.text : "";
        }
      }

      if (isTextOnly) {
        splitText.style.display = 'flex';
        buttonsBox.style.display = 'none';
        document.getElementById('split-text-message').innerHTML = textMsg;
      } else {
        splitText.style.display = 'none';
        buttonsBox.style.display = 'flex';
        
        // Настройка опций на кнопках
        const btnBox = document.getElementById('answer-buttons-box');
        if (round === 1) {
          btnBox.classList.add('grid-2x2');
        } else {
          btnBox.classList.remove('grid-2x2');
        }

        // В раунде 7 ставим золотой стиль
        const buttons = document.querySelectorAll('.answer-giant-btn');
        buttons.forEach((btn, idx) => {
          if (round === 7) {
            btn.classList.add('gold-cast');
          } else {
            btn.classList.remove('gold-cast');
          }

          // Назначаем текст опций, если есть
          if (state.activeQuestion && state.activeQuestion.options && state.activeQuestion.options.length > idx) {
            btn.textContent = state.activeQuestion.options[idx];
            btn.style.display = 'flex';
          } else {
            // Откат на А, Б, В, Г по умолчанию
            const defaultLabels = ['А', 'Б', 'В', 'Г'];
            btn.textContent = defaultLabels[idx];
            btn.style.display = 'flex';
          }
        });
      }

      // Активировать или заблокировать кнопки в зависимости от шага
      if (step === 'answers_active') {
        if (!hasAnswered) {
          lockAnswerButtons(false);
        }
      } else {
        lockAnswerButtons(true);
      }
    }

    function lockAnswerButtons(lock) {
      document.querySelectorAll('.answer-giant-btn').forEach(btn => {
        if (lock) {
          btn.classList.add('disabled');
        } else {
          btn.classList.remove('disabled');
          btn.classList.remove('clicked');
        }
      });
    }

    // Регистрация клика по ответу
    document.querySelectorAll('.answer-giant-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled') || hasAnswered) return;
        
        btn.classList.add('clicked');
        lockAnswerButtons(true);
        
        const ans = btn.getAttribute('data-ans');
        if (socket) {
          socket.emit('quiz_client_answer', { answer: ans });
        }
      });
    });

    // --- PROCEDURAL GENERATORS (ГЕНЕРАТОРЫ ЖИВОПИСИ И ФРАГМЕНТОВ НА CANVAS) ---

    // Отрисовка картины для Раунда 2 (Секретные масляные полотна)
    function showTablePainting(tbl) {
      const canvas = document.getElementById('round2-painting-canvas');
      const img = document.getElementById('round2-painting-img');
      const title = document.getElementById('round2-painting-title');

      title.textContent = \`Тайная живопись стола №\${tbl} (\${TABLE_NAMES[tbl]})\`;

      if (img) {
        img.src = \`photo_\${tbl}.png\`;
        img.style.display = 'block';
      }
      if (canvas) {
        canvas.style.display = 'none';
      }
    }

    // Отрисовка фрагмента для Раунда 3 (Ключ к шифру)
    function drawFragmentCanvas() {
      const canvas = document.getElementById('round3-canvas');
      if (!canvas) return;
      canvas.width = 300;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.src = \`photo_\${tableNumber || 1}.png\`;
      img.onload = () => {
        // Отрисовка 1/10 площади по центру
        const sWidth = img.width * 0.316;
        const sHeight = img.height * 0.316;
        const sx = (img.width - sWidth) / 2;
        const sy = (img.height - sHeight) / 2;
        
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 300, 150);
        
        // Золотая рамка вокруг фрагмента
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, 300, 150);
      };
    }
  </script>`;

// Find script tag in html and replace it
const startTag = '<script>';
const endTag = '</script>';
const startIndex = content.indexOf(startTag, content.indexOf('<!-- ================= СЦЕНА ПОБЕДЫ (VICTORY) ================= -->'));
const endIndex = content.indexOf(endTag, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find JS script tag to replace!');
  process.exit(1);
}

const updatedContent = content.substring(0, startIndex) + newScriptContent + content.substring(endIndex + endTag.length);

fs.writeFileSync(phoneHtmlPath, updatedContent, 'utf8');
console.log('Successfully updated JS script tag in quiz-phone.html');

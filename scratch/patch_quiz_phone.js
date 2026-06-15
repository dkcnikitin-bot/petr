const fs = require('fs');
const path = require('path');

const phoneHtmlPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\public\\quiz-phone.html';
if (!fs.existsSync(phoneHtmlPath)) {
  console.error('quiz-phone.html not found!');
  process.exit(1);
}

let content = fs.readFileSync(phoneHtmlPath, 'utf8');

// 1. Remove the duplicate script in the <head>
// Finding the script tag right after socket.io script
const socketioScript = '<script src="/socket.io/socket.io.js"></script>';
const socketioIndex = content.indexOf(socketioScript);
if (socketioIndex === -1) {
  console.error('Could not find socket.io script tag in head!');
  process.exit(1);
}

const headScriptStart = content.indexOf('<script>', socketioIndex + socketioScript.length);
const styleIndex = content.indexOf('<style>', headScriptStart);
const headScriptEnd = content.lastIndexOf('</script>', styleIndex);

if (headScriptStart === -1 || headScriptEnd === -1 || headScriptEnd <= headScriptStart) {
  console.error('Could not find duplicate head script tag!');
  process.exit(1);
}

// Cut out the head script (including the <script> and </script> tags)
content = content.substring(0, headScriptStart) + content.substring(headScriptEnd + '</script>'.length);

// 2. Add scene-victory to the body
// We will look for <div class="scene" id="scene-photo"> and its closing tag, then append scene-victory
const photoSceneStart = content.indexOf('<div class="scene" id="scene-photo">');
if (photoSceneStart === -1) {
  console.error('Could not find scene-photo container!');
  process.exit(1);
}

// Find the next </div> (closing scene-photo)
const searchFromPhoto = content.indexOf('Раунд 2: Нейро-сканирование живописи', photoSceneStart);
const photoSceneEnd = content.indexOf('</div>', searchFromPhoto); // closing of bottom-hint or layout container
// Let's find the closing of scene-photo itself. Since it's nested, it's the 3rd </div> after photoSceneStart.
let divIndex = photoSceneStart;
for (let i = 0; i < 3; i++) {
  divIndex = content.indexOf('</div>', divIndex + 6);
}

const closingTag = '</div>';
if (divIndex === -1) {
  console.error('Could not find closing </div> of scene-photo!');
  process.exit(1);
}

const insertIndex = divIndex + closingTag.length;

const victorySceneHtml = `

  <!-- ================= СЦЕНА ПОБЕДЫ (VICTORY) ================= -->
  <div class="scene" id="scene-victory" style="background: #000000 !important;">
    <div class="victory-crown-box">
      <img src="royal_crown.png" alt="Победная Корона" class="victory-crown-img">
    </div>
    <h1 style="font-size: 32px; animation: victoryBlink 1s infinite alternate ease-in-out;">ВИВАТ, ИМПЕРАТОРЫ!</h1>
    <p style="font-family: 'Cinzel', serif; font-size: 16px; color: #ffd700;" id="victory-table-label">Ваш стол одержал великую победу!</p>
  </div>`;

content = content.substring(0, insertIndex) + victorySceneHtml + content.substring(insertIndex);

// 3. Replace the bottom script block with the new dynamic one
// The bottom script is the last script block in the body
const lastScriptStart = content.lastIndexOf('<script>');
const lastScriptEnd = content.lastIndexOf('</script>');

if (lastScriptStart === -1 || lastScriptEnd === -1 || lastScriptEnd <= lastScriptStart) {
  console.error('Could not find last script tag in body!');
  process.exit(1);
}

const newScriptBody = `
  <script>
    // --- Локальное состояние пульта ---
    let TABLE_NAMES = {}; // Loaded dynamically from server

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
        if (scenes[k]) {
          scenes[k].classList.remove('active');
        }
      });
      if (scenes[sceneName]) {
        scenes[sceneName].classList.add('active');
      }
    }

    // Инициализация WebSockets сразу для получения списка столов
    initializeSocket();

    // Клик по гигантской кнопке ГОТОВ ВОРВАТЬСЯ!
    const readySubmitBtn = document.getElementById('ready-submit-btn');
    readySubmitBtn.addEventListener('click', () => {
      if (tableNumber !== null) {
        // Регистрируем выбор стола на сервере
        socket.emit('quiz_client_join', { tableNumber });
        
        const tableNameText = TABLE_NAMES[tableNumber] || \`Стол №\${tableNumber}\`;
        document.getElementById('standby-table-label').textContent = \`СТОЛ №\${tableNumber} (\${tableNameText})\`;
        document.getElementById('quiz-header-table-name').textContent = \`СТОЛ №\${tableNumber} (\${tableNameText})\`;
        document.getElementById('photo-header-table-name').textContent = \`СТОЛ №\${tableNumber} (\${tableNameText})\`;
        
        const victoryLabel = document.getElementById('victory-table-label');
        if (victoryLabel) {
          victoryLabel.textContent = \`Стол №\${tableNumber} (\${tableNameText}) одержал великую победу!\`;
        }
        
        showScene('standby');
      }
    });

    // Инициализация WebSockets
    function initializeSocket() {
      const socketUrl = (window.location.protocol === 'file:' || !window.location.host) ? 'http://localhost:3000' : '';
      socket = io(socketUrl);

      socket.on('connect', () => {
        console.log('Подключено к серверу');
        if (tableNumber !== null) {
          socket.emit('quiz_client_join', { tableNumber });
        }
      });

      // Динамическое обновление списка столов
      socket.on('quiz_tables_update', (tables) => {
        TABLE_NAMES = tables;
        renderTableGrid();
      });

      // Получение глобального состояния квиза
      socket.on('quiz_state_update', (data) => {
        console.log('quiz_state_update:', data);
        
        let state = data;
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

    function renderTableGrid() {
      const grid = document.getElementById('login-table-grid');
      if (!grid) return;
      grid.innerHTML = '';
      
      const sortedKeys = Object.keys(TABLE_NAMES).sort((a, b) => parseInt(a) - parseInt(b));
      sortedKeys.forEach(key => {
        const i = parseInt(key);
        const btn = document.createElement('button');
        btn.className = 'table-btn';
        btn.innerHTML = \`<span style="font-weight:800; font-size:12px;">СТОЛ №\${key}</span><span style="font-size:9px; color:#ffd700; margin-top:2px;">(\${TABLE_NAMES[key]})</span>\`;
        btn.addEventListener('click', () => {
          selectedTableIndex = i;
          tableNumber = i;
          showScene('ready');
        });
        grid.appendChild(btn);
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
        // Белая фотовспышка перед экраном победы
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100vw';
        flash.style.height = '100vh';
        flash.style.background = '#ffffff';
        flash.style.zIndex = '99999';
        flash.style.transition = 'opacity 1s ease-out';
        document.body.appendChild(flash);
        
        setTimeout(() => {
          flash.style.opacity = '0';
          setTimeout(() => {
            flash.remove();
          }, 1000);
        }, 100);

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
        // Нечетные столы (1, 3, 5, 7, 9) видят только текст-подсказку
        if (tableNumber % 2 !== 0) {
          isTextOnly = true;
          textMsg = "Смотрите на сцену!<br><br>Ваш стол подсказывает ответы чётным столам!";
        }
      } else if (round === 6) {
        // Четные столы (2, 4, 6, 8, 10) видят только текст-подсказку
        if (tableNumber % 2 === 0) {
          isTextOnly = true;
          textMsg = "Смотрите на сцену!<br><br>Ваш стол подсказывает ответы нечётным столам!";
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

    // Отрисовка картины для Раунда 2 (Секретные масляные полотна)
    function showTablePainting(tbl) {
      const canvas = document.getElementById('round2-painting-canvas');
      const img = document.getElementById('round2-painting-img');
      const title = document.getElementById('round2-painting-title');

      const tableNameText = TABLE_NAMES[tbl] || \`Стол №\${tbl}\`;
      title.textContent = \`Тайная живопись стола №\${tbl} (\${tableNameText})\`;

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
        const sWidth = img.width * 0.316;
        const sHeight = img.height * 0.316;
        const sx = (img.width - sWidth) / 2;
        const sy = (img.height - sHeight) / 2;
        
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 300, 150);
        
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, 300, 150);
      };
    }
  </script>`;

content = content.substring(0, lastScriptStart) + newScriptBody + content.substring(lastScriptEnd + '</script>'.length);

fs.writeFileSync(phoneHtmlPath, content, 'utf8');
console.log('Successfully updated quiz-phone.html by cleaning script blocks and adding victory screen.');

const fs = require('fs');
const path = require('path');

const phoneHtmlPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\public\\quiz-phone.html';
const screenHtmlPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\public\\quiz-screen.html';

// ==========================================
// 1. PATCH QUIZ-PHONE.HTML
// ==========================================
if (fs.existsSync(phoneHtmlPath)) {
  let content = fs.readFileSync(phoneHtmlPath, 'utf8');

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

  // Pre-populate TABLE_NAMES and render grid immediately
  const emptyTablesSearch = 'let TABLE_NAMES = {}; // Loaded dynamically';
  const filledTablesReplace = `let TABLE_NAMES = {
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
    };`;
  content = content.replace(emptyTablesSearch, filledTablesReplace);

  // Call renderTableGrid immediately after initializeSocket()
  const initSocketSearch = 'initializeSocket();';
  const initSocketReplace = 'initializeSocket();\n    renderTableGrid();';
  content = content.replace(initSocketSearch, initSocketReplace);

  fs.writeFileSync(phoneHtmlPath, content, 'utf8');
  console.log('Successfully patched quiz-phone.html with socket.io fallback and default tables.');
} else {
  console.error('quiz-phone.html not found!');
}

// ==========================================
// 2. PATCH QUIZ-SCREEN.HTML
// ==========================================
if (fs.existsSync(screenHtmlPath)) {
  let content = fs.readFileSync(screenHtmlPath, 'utf8');

  // Increase fortress opacity and add hologram-peter styles
  const styleEndIndex = content.indexOf('</style>');
  if (styleEndIndex !== -1) {
    const additionalStyles = `
    /* Увеличенная видимость крепости */
    .hologram-fortress {
      opacity: 0.22 !important;
    }

    /* Голограмма Петра Великого */
    .hologram-peter {
      position: absolute;
      top: 15%;
      right: 5%;
      width: 320px;
      height: 400px;
      background: url('петр.png') no-repeat center;
      background-size: contain;
      z-index: 2;
      opacity: 0.15;
      filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.4)) sepia(1) saturate(2) brightness(0.9);
      mix-blend-mode: screen;
      pointer-events: none;
      transition: opacity 1.5s ease-in-out;
      animation: peterBreathing 8s infinite ease-in-out;
    }
    @keyframes peterBreathing {
      0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 15px rgba(255,215,0,0.3)) sepia(1) saturate(1.8); }
      50% { transform: translateY(-8px) scale(1.03); filter: drop-shadow(0 0 25px rgba(255,215,0,0.5)) sepia(1) saturate(2.2); }
    }

    /* Полноэкранный лидерборд - Турнирная Таблица */
    .full-screen-leaderboard-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(4, 3, 2, 0.94);
      z-index: 40;
      display: none;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      opacity: 0;
      transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
    }
    .full-screen-leaderboard-overlay.active {
      display: flex;
      opacity: 1;
    }
    .leaderboard-scroll {
      width: 85%;
      max-width: 800px;
      background: rgba(18, 14, 9, 0.96);
      border: 3px solid #ffd700;
      border-radius: 12px;
      padding: 35px 40px;
      box-shadow: 0 0 45px rgba(255, 215, 0, 0.25), inset 0 0 30px rgba(0,0,0,0.9);
      position: relative;
      transform: scale(0.9) translateY(20px);
      transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
    }
    .full-screen-leaderboard-overlay.active .leaderboard-scroll {
      transform: scale(1) translateY(0);
    }
    .leaderboard-table-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 480px;
      overflow-y: auto;
      padding-right: 10px;
    }
    .leaderboard-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      background: rgba(45, 36, 22, 0.22);
      border: 1px solid #4a3e26;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    .leaderboard-row.rank-1 {
      background: linear-gradient(90deg, rgba(212, 175, 55, 0.16) 0%, rgba(45, 36, 22, 0.25) 100%);
      border-color: #ffd700;
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.1);
    }
    .leaderboard-row.rank-2 {
      background: linear-gradient(90deg, rgba(192, 192, 192, 0.12) 0%, rgba(45, 36, 22, 0.25) 100%);
      border-color: #c0c0c0;
    }
    .leaderboard-row.rank-3 {
      background: linear-gradient(90deg, rgba(205, 127, 50, 0.1) 0%, rgba(45, 36, 22, 0.25) 100%);
      border-color: #cd7f32;
    }
    .rank-badge {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #27272a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
      font-family: 'Cinzel', serif;
      color: #c4b59f;
      border: 1.5px solid #4a3e26;
    }
    .rank-1 .rank-badge {
      background: #ffd700;
      color: #000;
      border-color: #fff;
      box-shadow: 0 0 10px #ffd700;
    }
    .rank-2 .rank-badge {
      background: #c0c0c0;
      color: #000;
      border-color: #fff;
      box-shadow: 0 0 8px #c0c0c0;
    }
    .rank-3 .rank-badge {
      background: #cd7f32;
      color: #000;
      border-color: #fff;
      box-shadow: 0 0 6px #cd7f32;
    }
    .leaderboard-table-name {
      font-family: 'Cinzel', serif;
      font-size: 18px;
      font-weight: 700;
      color: #f5f5f7;
      flex-grow: 1;
      margin-left: 20px;
      text-align: left;
    }
    .leaderboard-score-val {
      font-family: 'Montserrat', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #ffd700;
      text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
    }
`;
    content = content.substring(0, styleEndIndex) + additionalStyles + content.substring(styleEndIndex);
  }

  // Insert hologram-peter after hologram-fortress
  const fortressSearch = '<div class="hologram-fortress"></div>';
  const fortressIdx = content.indexOf(fortressSearch);
  if (fortressIdx !== -1) {
    const peterHtml = '\n\n  <!-- Голограмма Петра Великого -->\n  <div class="hologram-peter" id="screen-hologram-peter"></div>';
    content = content.substring(0, fortressIdx + fortressSearch.length) + peterHtml + content.substring(fortressIdx + fortressSearch.length);
  }

  // Insert full screen leaderboard right before gate overlay
  const gateSearch = '<div class="gate-curtain-overlay" id="screen-gates-overlay">';
  const gateIdx = content.indexOf(gateSearch);
  if (gateIdx !== -1) {
    const fsLeaderboardHtml = `
  <!-- ================= ПОЛНОЭКРАННАЯ ТУРНИРНАЯ ТАБЛИЦА (LEADERBOARD OVERLAY) ================= -->
  <div class="full-screen-leaderboard-overlay" id="screen-fullscreen-leaderboard">
    <div class="leaderboard-scroll">
      <div class="scroll-corner sc-tl"></div>
      <div class="scroll-corner sc-tr"></div>
      <div class="scroll-corner sc-bl"></div>
      <div class="scroll-corner sc-br"></div>
      
      <h2 style="font-family: 'Cinzel', serif; font-size: 38px; color: #ffd700; text-align: center; margin-bottom: 25px; text-shadow: 0 0 15px rgba(255, 215, 0, 0.4);">
        ⚜ ТУРНИРНАЯ ТАБЛИЦА АССАМБЛЕИ ⚜
      </h2>
      
      <div class="leaderboard-table-container" id="leaderboard-table-rows">
        <!-- Строки будут добавлены JS -->
      </div>
    </div>
  </div>\n\n  `;
    content = content.substring(0, gateIdx) + fsLeaderboardHtml + content.substring(gateIdx);
  }

  // Now let's insert functions into the script block
  // First, socket show leaderboard event handler
  const socketShowSearch = `    socket.on('quiz_screen_laser_effect', (data) => {`;
  const socketShowReplace = `    socket.on('quiz_screen_show_leaderboard', () => {
      showFullscreenLeaderboard(true);
    });

    socket.on('quiz_screen_laser_effect', (data) => {`;
  content = content.replace(socketShowSearch, socketShowReplace);

  // Next, hide overlay in handleStateChange when round updates to question or active answers
  const handleStateChangeSearch = '      if (round === 0) {';
  const handleStateChangeReplace = `      // Автоматически скрываем полноэкранную таблицу при активных игровых шагах
      if (step === 'question' || step === 'answers_active') {
        showFullscreenLeaderboard(false);
      } else if (step === 'standby' && round > 0) {
        showFullscreenLeaderboard(true); // Показываем между раундами
      }

      // Настройка видимости голограммы Петра (ярче во время Standby/результатов)
      const peterHolo = document.getElementById('screen-hologram-peter');
      if (peterHolo) {
        peterHolo.style.opacity = (round === 0 || step === 'standby' || step === 'correct_answer') ? '0.15' : '0.03';
      }

      if (round === 0) {`;
  content = content.replace(handleStateChangeSearch, handleStateChangeReplace);

  // Next, add the helper functions showFullscreenLeaderboard and inject them in the bottom of script
  const scriptEndIdx = content.lastIndexOf('  </script>');
  if (scriptEndIdx !== -1) {
    const helperFunctions = `
    function showFullscreenLeaderboard(show) {
      const overlay = document.getElementById('screen-fullscreen-leaderboard');
      if (!overlay) return;
      
      if (show) {
        const rowsContainer = document.getElementById('leaderboard-table-rows');
        if (rowsContainer) {
          rowsContainer.innerHTML = '';
          
          // Сортируем столы по очкам по убыванию
          const sortedTables = Object.keys(TABLE_NAMES).map(key => ({
            key: key,
            name: TABLE_NAMES[key],
            score: tableScores[key] || 0
          })).sort((a, b) => b.score - a.score);
          
          sortedTables.forEach((item, idx) => {
            const rank = idx + 1;
            const row = document.createElement('div');
            row.className = \`leaderboard-row rank-\${rank}\`;
            
            row.innerHTML = \`
              <div class="rank-badge">\${rank}</div>
              <div class="leaderboard-table-name">СТОЛ №\${item.key} (\${item.name})</div>
              <div class="leaderboard-score-val">\${item.score} монет</div>
            \`;
            rowsContainer.appendChild(row);
          });
        }
        overlay.style.display = 'flex';
        setTimeout(() => {
          overlay.classList.add('active');
        }, 50);
      } else {
        overlay.classList.remove('active');
        setTimeout(() => {
          overlay.style.display = 'none';
        }, 600);
      }
    }
`;
    content = content.substring(0, scriptEndIdx) + helperFunctions + content.substring(scriptEndIdx);
  }

  fs.writeFileSync(screenHtmlPath, content, 'utf8');
  console.log('Successfully updated quiz-screen.html with hologram-peter and fullscreen tournament board.');
} else {
  console.error('quiz-screen.html not found!');
}

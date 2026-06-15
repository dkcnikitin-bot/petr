const fs = require('fs');
const path = require('path');

const screenHtmlPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\public\\quiz-screen.html';
if (!fs.existsSync(screenHtmlPath)) {
  console.error('quiz-screen.html not found!');
  process.exit(1);
}

let content = fs.readFileSync(screenHtmlPath, 'utf8');

const scriptStart = content.lastIndexOf('<script>');
const scriptEnd = content.lastIndexOf('</script>');

if (scriptStart === -1 || scriptEnd === -1 || scriptEnd <= scriptStart) {
  console.error('Could not find script tag in quiz-screen.html!');
  process.exit(1);
}

const newScriptBody = `
  <script>
    // --- ПОДКЛЮЧЕНИЕ СЕРВЕРА ---
    let TABLE_NAMES = {}; // Loaded dynamically

    const socketUrl = (window.location.protocol === 'file:' || !window.location.host) ? 'http://localhost:3000' : '';
    const socket = io(socketUrl);

    let tableScores = {};
    let activeTimerLimit = 5;
    let currentRound = 0;

    socket.on('connect', () => {
      console.log('Экран успешно подключился к сокетам');
      socket.emit('quiz_screen_join');
    });

    // Получаем динамический список столов
    socket.on('quiz_tables_update', (tables) => {
      TABLE_NAMES = tables;
      renderLeaderboardLanes();
      updateShipsPositions();
    });

    socket.on('quiz_state_update', (state) => {
      console.log('Quiz state update:', state);
      currentRound = state.currentRound;
      handleStateChange(state);
    });

    socket.on('quiz_scores_update', (scores) => {
      tableScores = scores;
      updateShipsPositions();
    });

    socket.on('quiz_timer_tick', (rem) => {
      const circle = document.getElementById('timer-circle');
      const text = document.getElementById('timer-number');
      if (text) text.textContent = rem;

      if (circle) {
        const perimeter = 2 * Math.PI * 55; // 345
        const progress = rem / activeTimerLimit;
        circle.style.strokeDashoffset = perimeter * (1 - progress);
      }

      if (rem <= 2) {
        text.classList.add('pulse-critical');
      } else {
        text.classList.remove('pulse-critical');
      }
    });

    socket.on('quiz_timer_end', () => {
      const circle = document.getElementById('timer-circle');
      const text = document.getElementById('timer-number');
      if (text) {
        text.textContent = "0";
        text.classList.remove('pulse-critical');
      }
      if (circle) circle.style.strokeDashoffset = 345;
    });

    socket.on('quiz_screen_laser_effect', (data) => {
      const laserOverlay = document.getElementById('screen-laser-box');
      const scanCard = document.getElementById('screen-scan-card');
      const nameLabel = document.getElementById('scan-card-table-name');
      const simLabel = document.getElementById('scan-card-similarity');

      laserOverlay.style.display = 'block';
      const tblNameText = TABLE_NAMES[data.tableNumber] || \`Стол №\${data.tableNumber}\`;
      nameLabel.textContent = \`СТОЛ №\${data.tableNumber} (\${tblNameText})\`;
      simLabel.innerHTML = \`<span style="font-size:12px; font-weight:400; color:rgba(0,230,118,0.5); letter-spacing:1px; margin-bottom:5px;">MATCH</span>\${data.similarity}%\`;
      
      setTimeout(() => {
        scanCard.classList.add('active');
      }, 500);

      setTimeout(() => {
        scanCard.classList.remove('active');
        setTimeout(() => {
          laserOverlay.style.display = 'none';
        }, 600);
      }, 5000);
    });

    function renderLeaderboardLanes() {
      const leaderboardBox = document.getElementById('screen-leaderboard');
      if (!leaderboardBox) return;
      leaderboardBox.innerHTML = '';

      const sortedKeys = Object.keys(TABLE_NAMES).sort((a, b) => parseInt(a) - parseInt(b));
      const count = sortedKeys.length;

      sortedKeys.forEach((key, idx) => {
        const lane = document.createElement('div');
        lane.className = 'race-lane';
        lane.id = \`race-lane-\${key}\`;
        
        const scaleVal = (0.76 + idx * (0.24 / Math.max(count - 1, 1))).toFixed(3);
        const opacityVal = (0.55 + idx * (0.45 / Math.max(count - 1, 1))).toFixed(2);
        
        lane.style.transform = \`scale(\${scaleVal})\`;
        lane.style.opacity = opacityVal;
        
        const label = document.createElement('span');
        label.className = 'lane-label';
        label.textContent = TABLE_NAMES[key];
        lane.appendChild(label);

        // Создаем фрегат
        const ship = document.createElement('div');
        ship.className = 'frigate-ship';
        ship.id = \`frigate-\${key}\`;
        ship.style.left = '10%'; // Стартовая позиция

        ship.innerHTML = \`
          <div class="ship-3d-label">\${TABLE_NAMES[key]}</div>
          <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; fill: #ffd700;">
            <path d="M 12 58 L 88 58 C 84 78, 20 78, 12 58 Z" fill="#5c3f1a" stroke="#ffd700" stroke-width="1.8"/>
            <path d="M 88 58 L 97 50 L 90 56 Z" fill="#ffd700"/>
            <line x1="32" y1="58" x2="32" y2="12" stroke="#ffd700" stroke-width="2.5"/>
            <line x1="55" y1="58" x2="55" y2="5" stroke="#ffd700" stroke-width="2.8"/>
            <line x1="78" y1="58" x2="78" y2="18" stroke="#ffd700" stroke-width="2.5"/>
            <line x1="86" y1="58" x2="98" y2="42" stroke="#ffd700" stroke-width="1.8"/>
            <path d="M 32 18 Q 12 28, 32 37 Z" fill="#fffaef" stroke="#c49a2a" stroke-width="0.8"/>
            <path d="M 32 37 Q 15 45, 32 54 Z" fill="#fffaef" stroke="#c49a2a" stroke-width="0.8"/>
            <path d="M 55 12 Q 25 22, 55 32 Z" fill="#fffaef" stroke="#c49a2a" stroke-width="0.8"/>
            <path d="M 55 32 Q 22 42, 55 54 Z" fill="#fffaef" stroke="#c49a2a" stroke-width="1"/>
            <path d="M 78 22 Q 62 28, 78 36 Z" fill="#fffaef" stroke="#c49a2a" stroke-width="0.8"/>
            <path d="M 78 36 Q 64 44, 78 52 Z" fill="#fffaef" stroke="#c49a2a" stroke-width="0.8"/>
            <path d="M 78 27 Q 88 37, 86 46 Z" fill="#fffaef" stroke="#c49a2a"/>
            <polygon points="32,12 42,15 32,18" fill="#ffd700"/>
            <polygon points="55,5 68,9 55,13" fill="#ef4444"/>
            <polygon points="78,18 85,20 78,22" fill="#ffd700"/>
          </svg>
          <div class="gulf-wake-particle"></div>
          <div class="gulf-wake-particle" style="animation-delay: 0.4s;"></div>
          <div class="gulf-wake-particle" style="animation-delay: 0.8s;"></div>
        \`;
        
        lane.appendChild(ship);
        leaderboardBox.appendChild(lane);
      });
    }

    function handleStateChange(state) {
      const round = state.currentRound;
      const step = state.roundStep;

      const logo = document.querySelector('.stage-logo');
      const standbySplash = document.getElementById('screen-standby-splash');
      const questionScroll = document.getElementById('screen-parchment-scroll');
      const timerBox = document.getElementById('timer-box');
      const leaderboard = document.getElementById('screen-leaderboard');
      const gates = document.getElementById('screen-gates-overlay');
      const victoryStage = document.getElementById('screen-victory-stage');
      const portraitBox = document.getElementById('screen-portrait-box');

      if (round === 0) {
        if (logo) logo.style.display = 'none'; // Скрываем верхнюю мелкую корону на заставке
        standbySplash.style.display = 'flex';
        questionScroll.classList.remove('active');
        timerBox.classList.remove('active');
        leaderboard.classList.remove('active'); // Скрываем дорожки полностью
        gates.style.display = 'none';
        victoryStage.style.display = 'none';
        portraitBox.style.display = 'none';
        return;
      }

      if (logo) logo.style.display = 'block'; // Показываем мелкую корону в раундах

      // Показываем дорожки в раундах
      if (round === 7 && step === 'correct_answer') {
        leaderboard.classList.remove('active');
      } else {
        leaderboard.classList.add('active');
      }

      standbySplash.style.display = 'none';

      if (round === 2) {
        questionScroll.classList.remove('active');
        timerBox.classList.remove('active');
        portraitBox.style.display = 'none';
        return;
      }

      // Настройка портретов в Раунде 1
      if (round === 1) {
        portraitBox.style.display = 'flex';
        document.getElementById('screen-portrait-img').src = 'петр.png'; 
      } else {
        portraitBox.style.display = 'none';
      }

      if (state.activeQuestion) {
        questionScroll.classList.add('active');
        
        let roundTag = \`РАУНД \${round}\`;
        if (round === 1) {
          roundTag = \`РАУНД 1. Портрет \${state.subQuestionIndex + 1}\`;
        } else if (round === 4) {
          roundTag = \`БЛИЦ. Вопрос \${state.subQuestionIndex + 1}\`;
        } else if (round === 5) {
          roundTag = \`АЛЬЯНС. Шифровка \${state.subQuestionIndex + 1}\`;
        } else if (round === 6) {
          roundTag = \`ПОСЛЫ. Мем \${state.subQuestionIndex + 1}\`;
        }
        document.getElementById('screen-round-tag').textContent = roundTag;
        
        let qText = state.activeQuestion.text;
        if (round === 5) {
          qText += " (Отвечают чётные столы по подсказкам нечётных!)";
        } else if (round === 6) {
          qText += " (Отвечают нечётные столы по подсказкам чётных!)";
        }
        
        document.getElementById('screen-question-text').textContent = qText;

        const optionsBox = document.getElementById('screen-options-box');
        optionsBox.innerHTML = '';
        
        if (state.activeQuestion.options && state.activeQuestion.options.length > 0) {
          state.activeQuestion.options.forEach((opt, idx) => {
            const code = ['A', 'B', 'C', 'D'][idx];
            const div = document.createElement('div');
            div.className = 'option-card';
            div.id = \`opt-card-\${code}\`;
            div.textContent = opt;
            optionsBox.appendChild(div);
          });
        }
      }

      if (step === 'answers_active') {
        activeTimerLimit = state.timerLimit || 5;
        timerBox.classList.add('active');
      } else if (step === 'question' || step === 'standby') {
        timerBox.classList.remove('active');
      }

      if (step === 'correct_answer') {
        timerBox.classList.remove('active');
        const correctCode = state.correctAnswer;
        if (correctCode) {
          document.querySelectorAll('.option-card').forEach(card => {
            if (card.id === \`opt-card-\${correctCode}\`) {
              card.classList.add('correct');
            } else {
              card.classList.add('incorrect');
            }
          });
        }

        if (round === 7) {
          triggerGatesWinner();
        }
      }
    }

    function updateShipsPositions() {
      let maxScore = 0;
      const sortedKeys = Object.keys(TABLE_NAMES);
      if (sortedKeys.length === 0) return;

      sortedKeys.forEach(t => {
        if (tableScores[t] > maxScore) {
          maxScore = tableScores[t];
        }
      });

      const scoreDenominator = maxScore > 0 ? maxScore : 100;

      sortedKeys.forEach(key => {
        const score = tableScores[key] || 0;
        const ship = document.getElementById(\`frigate-\${key}\`);
        if (ship) {
          const leftPercent = 10 + 75 * (score / scoreDenominator);
          ship.style.left = \`\${leftPercent}%\`;

          if (score === maxScore && maxScore > 0) {
            ship.querySelector('svg').style.filter = 'drop-shadow(0 0 12px rgba(255,215,0,0.95))';
          } else {
            ship.querySelector('svg').style.filter = 'drop-shadow(0 6px 8px rgba(0,0,0,0.8))';
          }
        }
      });
    }

    function triggerGatesWinner() {
      const sortedKeys = Object.keys(TABLE_NAMES);
      if (sortedKeys.length === 0) return;

      let winnerTable = sortedKeys[0];
      let maxScore = -1;
      
      sortedKeys.forEach(key => {
        const score = tableScores[key] || 0;
        if (score > maxScore) {
          maxScore = score;
          winnerTable = key;
        }
      });

      const gates = document.getElementById('screen-gates-overlay');
      const victoryStage = document.getElementById('screen-victory-stage');
      const winnerLabel = document.getElementById('victory-table-winner');

      const tblNameText = TABLE_NAMES[winnerTable] || \`Стол №\${winnerTable}\`;
      winnerLabel.textContent = \`СТОЛ №\${winnerTable} (\${tblNameText})\`;

      gates.style.display = 'block';

      document.querySelector('.gate-left').style.transform = 'rotateY(0deg)';
      document.querySelector('.gate-right').style.transform = 'rotateY(0deg)';

      setTimeout(() => {
        document.querySelector('.gate-left').style.transform = 'rotateY(-110deg)';
        document.querySelector('.gate-right').style.transform = 'rotateY(110deg)';
        
        victoryStage.style.display = 'flex';
        victoryStage.style.opacity = '0';
        
        let op = 0;
        const fadeInt = setInterval(() => {
          op += 0.05;
          victoryStage.style.opacity = op;
          if (op >= 1) clearInterval(fadeInt);
        }, 80);

      }, 1000);
    }

    // --- background matrix code + stars on canvas ---
    const canvas = document.getElementById('bg-matrix-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    const dustParticles = [];
    
    for (let i = 0; i < 45; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.7,
        size: 0.5 + Math.random() * 1.5,
        alpha: Math.random(),
        twinkleSpeed: 0.01 + Math.random() * 0.02
      });
    }

    for (let i = 0; i < 20; i++) {
      dustParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 3,
        alpha: 0.1 + Math.random() * 0.3,
        speedX: -0.2 - Math.random() * 0.3,
        speedY: (Math.random() - 0.5) * 0.1
      });
    }

    const alphabet = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ⚜⚓⛵⚜⚜";
    const fontSize = 18;
    const columns = canvas.width / fontSize;

    const rainDrops = [];
    for (let x = 0; x < columns; x++) {
      rainDrops[x] = Math.random() * -100;
    }

    function drawMatrix() {
      // 1. Очистка экрана с легким шлейфом
      ctx.fillStyle = 'rgba(3, 3, 5, 0.14)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Отрисовка звездного неба
      stars.forEach(star => {
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }
        ctx.fillStyle = \`rgba(255, 215, 0, \${Math.max(0, star.alpha)})\`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Отрисовка парящей золотой пыли
      dustParticles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.y < -10 || p.y > canvas.height + 10) p.y = Math.random() * canvas.height;

        ctx.fillStyle = \`rgba(212, 175, 55, \${p.alpha})\`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Отрисовка Glagolitic матричного дождя (только если не на заставке)
      if (currentRound > 0) {
        ctx.fillStyle = '#ffd700';
        ctx.font = fontSize + 'px "Cinzel", serif';

        for (let i = 0; i < rainDrops.length; i++) {
          const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
          ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

          if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.985) {
            rainDrops[i] = 0;
          }
          rainDrops[i]++;
        }
      }
    }

    setInterval(drawMatrix, 45);

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  </script>`;

content = content.substring(0, scriptStart) + newScriptBody + content.substring(scriptEnd + '</script>'.length);

fs.writeFileSync(screenHtmlPath, content, 'utf8');
console.log('Successfully updated quiz-screen.html with dynamic lanes loading.');

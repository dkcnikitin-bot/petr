const fs = require('fs');
const path = require('path');

const serverJsPath = 'c:\\Users\\Никитин Иван\\Documents\\petr\\server.js';
if (!fs.existsSync(serverJsPath)) {
  console.error('server.js not found!');
  process.exit(1);
}

let code = fs.readFileSync(serverJsPath, 'utf8');

// 1. Define files paths and read/write helpers
const fileHelpersCode = `
// ==========================================
//  КВИЗ "ТАЙНЫЙ ВЕЧЕР" - ДИНАМИЧЕСКИЕ ДАННЫЕ
// ==========================================

const TABLES_FILE = path.join(__dirname, 'tables.json');
const QUESTIONS_FILE = path.join(__dirname, 'quiz_questions.json');

const DEFAULT_TABLES = {
  '1': "Императорский",
  '2': "Земли Центральные",
  '3': "Боярский союз",
  '4': "Купеческая гильдия",
  '5': "Академия наук",
  '6': "Адмиралтейский приказ",
  '7': "Посольская миссия",
  '8': "Царская канцелярия",
  '9': "Сенатские палаты",
  '10': "Архитекторы IT"
};

const DEFAULT_QUIZ_QUESTIONS = {
  1: [ // Round 1 (Нейро-Бояре)
    {
      text: "Портрет 1 (Полководец с 20-летним опытом)",
      options: ["ЕВГЕНИЙ НАГИЕВ", "ИВАН НИКИТИН", "ПЕТР ПЕРВЫЙ", "НЕИЗВЕСТНЫЙ БОЯРИН"],
      correct: "A"
    },
    {
      text: "Портрет 2 (Лекарь с дисковым телефоном)",
      options: ["ИННА ШУБНИКОВА", "ЕЛЕНА БЫЧЕНКОВА", "МАРИАННА ГУЖВИНА", "ЛЕНА ТРОПИНА"],
      correct: "A"
    },
    {
      text: "Портрет 3 (Купчиха в библиотеке)",
      options: ["ОЛЬГА ПЕТРОВА", "ЕЛЕНА БЫЧЕНКОВА", "ЮЛИЯ ГОЛОЦУКОВА", "ЗОЯ КУЗЬМИНА"],
      correct: "B"
    },
    {
      text: "Портрет 4 (Распорядительница бала)",
      options: ["ЗОЯ КУЗЬМИНА", "МАРИНА СТЕПАНОВА", "НАТАЛЬЯ ФЕЛЛЕР", "ИННА ШУБНИКОВА"],
      correct: "A"
    },
    {
      text: "Портрет 5 (Архитектор с чертежами Урала)",
      options: ["МАРИНА СТЕПАНОВА", "ЕЛЕНА БЫЧЕНКОВА", "ЛЕНА ТРОПИНА", "ОЛЬГА ПЕТРОВА"],
      correct: "A"
    },
    {
      text: "Портрет 6 (Канцлер со свитком правил)",
      options: ["МАРИАННА ГУЖВИНА", "ИННА ШУБНИКОВА", "ЮЛИЯ ГОЛОЦУКОВА", "НАТАЛЬЯ ФЕЛЛЕР"],
      correct: "A"
    },
    {
      text: "Портрет 7 (Леди-посол в саду с семьей)",
      options: ["ЮЛИЯ ГОЛОЦУКОВА", "ЗОЯ КУЗЬМИНА", "ОЛЬГА ПЕТРОВА", "МАРИНА СТЕПАНОВА"],
      correct: "A"
    },
    {
      text: "Портрет 8 (Придворный медик с травами)",
      options: ["ЛЕНА ТРОПИНА", "МАРИАННА ГУЖВИНА", "ЕЛЕНА БЫЧЕНКОВА", "ИННА ШУБНИКОВА"],
      correct: "A"
    },
    {
      text: "Портрет 9 (Графиня на веселом чаепитии)",
      options: ["ОЛЬГА ПЕТРОВА", "МАРИНА СТЕПАНОВА", "ЮЛИЯ ГОЛОЦУКОВА", "НАТАЛЬЯ ФЕЛЛЕР"],
      correct: "A"
    },
    {
      text: "Портрет 10 (Молодая дворянка с сундуком золота)",
      options: ["НАТАЛЬЯ ФЕЛЛЕР", "ЗОЯ КУЗЬМИНА", "МАРИАННА ГУЖВИНА", "ЛЕНА ТРОПИНА"],
      correct: "A"
    }
  ],
  2: [ // Round 2 (Ожившие Полотна)
    {
      text: "Ожившие Полотна: Скопируйте историческую фотографию на танцполе!",
      options: [],
      correct: ""
    }
  ],
  3: [ // Round 3 (Разбитые Зеркала)
    {
      text: "Разбитые Зеркала: 1/10 часть фотографии события",
      options: ["ELEVATION", "BOOTKAMP", "СТАМБУЛ", "БИБЛИОТЕКА ЛЕНИНА"],
      correct: "A"
    }
  ],
  4: [ // Round 4 (Прорубить окно: БЛИЦ)
    {
      text: "Вопрос 1 (О корабле Петра I)",
      options: ["ПОЛТАВА", "ШТАНДАРТ", "ИНГЕРМАНЛАНД", "АЗОВ"],
      correct: "B"
    },
    {
      text: "Вопрос 2 (Первые презентации летом 2025)",
      options: ["БИБЛИОТЕКА ЛЕНИНА", "РЕСТОРАН \\"ГРАБЛИ\\"", "МАРИИНСКИЙ ТЕАТР", "СТАМБУЛ"],
      correct: "B"
    },
    {
      text: "Вопрос 3 (Первый международный буткемп)",
      options: ["ДУБАЙ", "ПАРИЖ", "СТАМБУЛ", "АНТАЛИЯ"],
      correct: "C"
    },
    {
      text: "Вопрос 4 (Объем рынка путешествий)",
      options: ["77 МИЛЛИАРДОВ", "134 МИЛЛИАРДА", "1 ТРИЛЛИОН", "ПОЧТИ 9 ТРИЛЛИОНОВ"],
      correct: "D"
    },
    {
      text: "Вопрос 5 (Новый IT-инструмент)",
      options: ["ШКОЛА ПРИКЛАДНОГО УПРАВЛЕНИЯ 2.0", "ВИРТУАЛЬНЫЙ ПОМОЩНИК", "НЕЙРО-БОТ", "ЦИФРОВОЙ КОМПАС"],
      correct: "B"
    }
  ],
  5: [ // Round 5 (Секретный Альянс)
    {
      text: "В каком городе Урала в июле 2025 года прошел запуск региона с Евгением Нагиевым?!",
      options: ["ПЕРМЬ", "ЕКАТЕРИНБУРГ", "УФА", "ТЮМЕНЬ"],
      correct: "B"
    },
    {
      text: "Какая площадка в Москве приняла первые презентации Elevation?!",
      options: ["БОЛЬШОЙ ТЕАТР", "МОСКВА-СИТИ", "БИБЛИОТЕКА ЛЕНИНА", "РЕСТОРАН \\"ГРАБЛИ\\""],
      correct: "C"
    },
    {
      text: "В какой регион была совершена первая крупная бизнес-экспедиция команды?!",
      options: ["ЕВРОПА", "ИНДИЯ", "АЗИЯ", "ВОСТОК"],
      correct: "B"
    },
    {
      text: "В каком городе прошел первый международный буткемп?!",
      options: ["ДУБАЙ", "ПАРИЖ", "АНТАЛИЯ", "СТАМБУЛ"],
      correct: "D"
    },
    {
      text: "Какая утренняя традиция объединяет команду Elevation каждый день?!",
      options: ["ВЕЧЕРНИЙ ЧАЙ", "ЭФИРЫ \\"ДОБРОЕ УТРО\\"", "НОЧНОЙ ДОЖОР", "ПЛАНЁРКИ"],
      correct: "B"
    }
  ],
  6: [ // Round 6 (Дерзкие Послы)
    {
      text: "Если наш Капитан Евгений Нагиев говорит: \\"Мы играем в долгую\\"...?!",
      options: ["...ЗНАЧИТ МЫ КУПИМ СЛОНА!", "...ЗНАЧИТ МЫ БУДЕМ ПАХАТЬ И ЗАБЕРЕМ ВЕСЬ РЫНОК!", "...ЗНАЧИТ ТУР БУДЕТ ДОЛГИМ!", "...ЗНАЧИТ ПОРА СПАТ!"],
      correct: "B"
    },
    {
      text: "Когда Евгений Нагиев летит на встречу с лидерами, то...?!",
      options: ["...ЕМУ НЕ ХВАТИЛО МЕСТА!", "...ОН ПИЛОТИРУЕТ САМОЛЕТ!", "...ОН СИДИТ В БАГАЖЕ, У НЕГО НЕТ ПАСПОРТА!", "...ОН ОСТАЛСЯ В СЕРВЕРНОЙ!"],
      correct: "C"
    },
    {
      text: "Наших конкурентов с их устаревшими IT-системами мы...?!",
      options: ["...ОСТАВЛЯЕМ ИХ В ПРОШЛОМ, КАК СТАРЫЕ ДИСКОВЫЕ ТЕЛЕФОНЫ!", "...ПОКУПАЕМ ИМ ПУТЕВКИ!", "...БЕРЕМ ИХ С СОБОЙ!", "...УЧИМ ИХ РАБОТАТЬ!"],
      correct: "A"
    },
    {
      text: "Инновационная платформа и виртуальный помощник — это...?!",
      options: ["...ВАШ ПРЯМОЙ КЛЮЧ К ФИНАНСОВОЙ НЕЗАВИСИМОСТИ!", "...КРАСИВЫЕ СЛОВА!", "...УТРЕННЯЯ ЗАРЯДКА!", "...НАША ГЛАВНАЯ ТАЙНА!"],
      correct: "A"
    },
    {
      text: "Совместно с IT-Архитекторами мы нацелены на рынок объемом...?!",
      options: ["1 МИЛЛИОН!", "1 МИЛЛИАРД!", "100 РУБЛЕЙ!", "...ПОЧТИ ДЕВЯТЬ ТРИЛЛИОНОВ ДОЛЛАРОВ!"],
      correct: "D"
    }
  ],
  7: [ // Round 7 (Гранд-Финал)
    {
      text: "Гранд-Финал: Манифест Империи",
      options: [
        "А) ПРОДАВАТЬ САМЫЕ ДОРОГИЕ ТУРЫ В МИРЕ",
        "Б) ЗАРАБОТАТЬ МИЛЛИАРДЫ ДОЛЛАРОВ",
        "В) ОСВОБОДИТЬ ЛЮДЕЙ ОТ РУТИНЫ",
        "Г) СКУПИТЬ ВСЕХ КОНКУРЕНТОВ"
      ],
      correct: "C"
    }
  ]
};

function readTables() {
  try {
    if (!fs.existsSync(TABLES_FILE)) {
      fs.writeFileSync(TABLES_FILE, JSON.stringify(DEFAULT_TABLES, null, 2), 'utf8');
      return DEFAULT_TABLES;
    }
    const data = fs.readFileSync(TABLES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Ошибка чтения tables.json:', err);
    return DEFAULT_TABLES;
  }
}

function writeTables(tables) {
  try {
    fs.writeFileSync(TABLES_FILE, JSON.stringify(tables, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Ошибка записи в tables.json:', err);
    return false;
  }
}

function readQuestions() {
  try {
    if (!fs.existsSync(QUESTIONS_FILE)) {
      fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(DEFAULT_QUIZ_QUESTIONS, null, 2), 'utf8');
      return DEFAULT_QUIZ_QUESTIONS;
    }
    const data = fs.readFileSync(QUESTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Ошибка чтения quiz_questions.json:', err);
    return DEFAULT_QUIZ_QUESTIONS;
  }
}

function writeQuestions(questions) {
  try {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Ошибка записи в quiz_questions.json:', err);
    return false;
  }
}

let TABLE_NAMES = readTables();
let QUIZ_QUESTIONS = readQuestions();

let quizState = {
  currentRound: 0,       // 0: Standby/Login, 1-7: Rounds
  roundStep: 'standby',  // 'standby', 'question', 'answers_active', 'correct_answer_wait', 'correct_answer'
  subQuestionIndex: 0,   // Sub-question index (0-indexed)
  timerLimit: 5,         // default 5s
  timerRemaining: 0,
  answersLocked: false,
  correctAnswer: '',
  activeQuestion: null
};

// Инициализируем счета на основе загруженных столов
let tableScores = {};
for (const key in TABLE_NAMES) {
  tableScores[key] = 0;
}

let currentAnswers = []; // Array of { tableNumber, answer, latency, socketId }
let answersActivatedTime = null;
let connectedTables = {}; // socket.id -> tableNumber
let timerInterval = null;

// Функция для расчёта статистики подключений по столам
function getTableConnectionsStats() {
  const stats = {};
  for (const key in TABLE_NAMES) {
    stats[key] = 0;
  }
  for (const socketId in connectedTables) {
    const table = connectedTables[socketId];
    if (stats[table] !== undefined) {
      stats[table]++;
    }
  }
  return stats;
}
`;

// Replace the old variables segment (lines 240 to 453)
const startMarker = '//  КВИЗ "ТАЙНЫЙ ВЕЧЕР" - СОСТОЯНИЕ И ЛОГИКА';
const endMarker = 'io.on(\'connection\', (socket) => {';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers to replace state setup in server.js!');
  process.exit(1);
}

// Rebuild code with dynamic helpers
code = code.substring(0, startIndex - 2) + fileHelpersCode + '\n\n' + code.substring(endIndex);

// 2. Now let's inject new websocket event listeners inside io.on('connection')
// We will search for quiz_admin_join and replace the join handlers to emit the tables and questions lists.
// Also we will add quiz_admin_save_tables and quiz_admin_save_questions inside connection handler.

const searchString = `  socket.on('quiz_admin_join', () => {
    socket.join('quiz_admins');
    console.log('Администратор квиза подключен:', socket.id);
    socket.emit('quiz_state_update', quizState);
    socket.emit('quiz_scores_update', tableScores);
    socket.emit('quiz_connections_update', getTableConnectionsStats());
    socket.emit('quiz_answers_list', currentAnswers);
  });`;

const replacementString = `  socket.on('quiz_admin_join', () => {
    socket.join('quiz_admins');
    console.log('Администратор квиза подключен:', socket.id);
    socket.emit('quiz_tables_update', TABLE_NAMES);
    socket.emit('quiz_questions_update', QUIZ_QUESTIONS);
    socket.emit('quiz_state_update', quizState);
    socket.emit('quiz_scores_update', tableScores);
    socket.emit('quiz_connections_update', getTableConnectionsStats());
    socket.emit('quiz_answers_list', currentAnswers);
  });

  socket.on('quiz_admin_save_tables', (newTables) => {
    TABLE_NAMES = newTables;
    writeTables(TABLE_NAMES);
    // Инициализируем новые столы со счетом 0, если их еще не было
    for (const key in TABLE_NAMES) {
      if (tableScores[key] === undefined) {
        tableScores[key] = 0;
      }
    }
    // Рассылаем всем клиентам обновленный список столов и очков
    io.emit('quiz_tables_update', TABLE_NAMES);
    io.emit('quiz_scores_update', tableScores);
    io.to('quiz_admins').emit('quiz_connections_update', getTableConnectionsStats());
    console.log('[Сохранение Столов] Столы успешно обновлены и разосланы.');
  });

  socket.on('quiz_admin_save_questions', (newQuestions) => {
    QUIZ_QUESTIONS = newQuestions;
    writeQuestions(QUIZ_QUESTIONS);
    
    // Обновляем текущий вопрос в игре, если нужно
    const qList = QUIZ_QUESTIONS[quizState.currentRound];
    if (qList && qList.length > 0) {
      const subIdx = Math.min(quizState.subQuestionIndex, qList.length - 1);
      quizState.activeQuestion = qList[subIdx];
      quizState.correctAnswer = quizState.activeQuestion ? quizState.activeQuestion.correct : '';
    } else {
      quizState.activeQuestion = null;
      quizState.correctAnswer = '';
    }
    
    io.to('quiz_admins').emit('quiz_questions_update', QUIZ_QUESTIONS);
    io.emit('quiz_state_update', quizState);
    console.log('[Сохранение Вопросов] Вопросы успешно обновлены и разосланы.');
  });`;

code = code.replace(searchString, replacementString);

// Re-emit tables update on client and screen joins
const screenJoinSearch = `  socket.on('quiz_screen_join', () => {
    socket.join('quiz_screens');
    console.log('Экран сцены квиза подключен:', socket.id);
    socket.emit('quiz_state_update', quizState);
    socket.emit('quiz_scores_update', tableScores);
  });`;

const screenJoinReplace = `  socket.on('quiz_screen_join', () => {
    socket.join('quiz_screens');
    console.log('Экран сцены квиза подключен:', socket.id);
    socket.emit('quiz_tables_update', TABLE_NAMES);
    socket.emit('quiz_state_update', quizState);
    socket.emit('quiz_scores_update', tableScores);
  });`;

code = code.replace(screenJoinSearch, screenJoinReplace);

const clientJoinSearch = `  socket.on('quiz_client_join', (data) => {
    const tableNumber = String(data.tableNumber);
    connectedTables[socket.id] = tableNumber;
    socket.join(\`table_\${tableNumber}\`);
    socket.join('quiz_phones');
    
    console.log(\`Телефон подключен: стол \${tableNumber}, ID: \${socket.id}\`);
    
    // Оповещаем админов об обновлении онлайна
    io.to('quiz_admins').emit('quiz_connections_update', getTableConnectionsStats());
    
    // Отправляем текущее состояние клиенту
    socket.emit('quiz_state_update', {
      quizState,
      tableNumber,
      score: tableScores[tableNumber] || 0
    });
  });`;

const clientJoinReplace = `  socket.on('quiz_client_join', (data) => {
    const tableNumber = String(data.tableNumber);
    connectedTables[socket.id] = tableNumber;
    socket.join(\`table_\${tableNumber}\`);
    socket.join('quiz_phones');
    
    console.log(\`Телефон подключен: стол \${tableNumber}, ID: \${socket.id}\`);
    
    // Оповещаем админов об обновлении онлайна
    io.to('quiz_admins').emit('quiz_connections_update', getTableConnectionsStats());
    
    socket.emit('quiz_tables_update', TABLE_NAMES);
    
    // Отправляем текущее состояние клиенту
    socket.emit('quiz_state_update', {
      quizState,
      tableNumber,
      score: tableScores[tableNumber] || 0
    });
  });`;

code = code.replace(clientJoinSearch, clientJoinReplace);

// Fix points reset for dynamic tables
const resetScoresSearch = `  // Сброс очков
  socket.on('quiz_admin_reset_scores', () => {
    for (let i = 1; i <= 10; i++) {
      tableScores[String(i)] = 0;
    }
    io.emit('quiz_scores_update', tableScores);
    console.log(\`[Сброс] Все очки квиза обнулены\`);
  });`;

const resetScoresReplace = `  // Сброс очков
  socket.on('quiz_admin_reset_scores', () => {
    for (const key in TABLE_NAMES) {
      tableScores[key] = 0;
    }
    io.emit('quiz_scores_update', tableScores);
    console.log(\`[Сброс] Все очки квиза обнулены\`);
  });`;

code = code.replace(resetScoresSearch, resetScoresReplace);

fs.writeFileSync(serverJsPath, code, 'utf8');
console.log('Successfully patched server.js with dynamic tables and questions features.');

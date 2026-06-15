const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const GUESTS_FILE = path.join(__dirname, 'guests.json');

// Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/diplom', express.static(path.join(__dirname, 'diplom')));

// Вспомогательный словарь координат для автоопределения городов при быстром добавлении
const CITY_COORDINATES = {
  'санкт-петербург': { lat: 59.9343, lng: 30.3351 },
  'спб': { lat: 59.9343, lng: 30.3351 },
  'питер': { lat: 59.9343, lng: 30.3351 },
  'москва': { lat: 55.7558, lng: 37.6173 },
  'воронеж': { lat: 51.6608, lng: 39.2003 },
  'тобольск': { lat: 58.2000, lng: 68.2500 },
  'дмитров': { lat: 56.3424, lng: 37.5204 },
  'казань': { lat: 55.8304, lng: 49.0661 },
  'тула': { lat: 54.1961, lng: 37.6182 },
  'новгород': { lat: 58.5252, lng: 31.2755 },
  'великий новгород': { lat: 58.5252, lng: 31.2755 },
  'астрахань': { lat: 46.3497, lng: 48.0408 },
  'выборг': { lat: 60.7100, lng: 28.7490 },
  'екатеринбург': { lat: 56.8389, lng: 60.6057 },
  'новосибирск': { lat: 55.0084, lng: 82.9357 },
  'нижний новгород': { lat: 56.3269, lng: 44.0059 },
  'челябинск': { lat: 55.1644, lng: 61.4368 },
  'самара': { lat: 53.2001, lng: 50.1500 },
  'омск': { lat: 54.9885, lng: 73.3245 },
  'ростов-на-дону': { lat: 47.2357, lng: 39.7015 },
  'уфа': { lat: 54.7431, lng: 55.9678 },
  'красноярск': { lat: 56.0153, lng: 92.8932 },
  'пермь': { lat: 58.0105, lng: 56.2502 },
  'волгоград': { lat: 48.7080, lng: 44.5133 },
  'сочи': { lat: 43.6028, lng: 39.7342 },
  'владивосток': { lat: 43.1198, lng: 131.8869 },
  'архангельск': { lat: 64.5401, lng: 40.5433 }
};

// Функция чтения гостей из файла
function readGuests() {
  try {
    if (!fs.existsSync(GUESTS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(GUESTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Ошибка чтения guests.json:', err);
    return [];
  }
}

// Функция записи гостей в файл
function writeGuests(guests) {
  try {
    fs.writeFileSync(GUESTS_FILE, JSON.stringify(guests, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Ошибка записи в guests.json:', err);
    return false;
  }
}

// Эндпоинт получения списка гостей
app.get('/api/guests', (req, res) => {
  const guests = readGuests();
  res.json(guests);
});

// Эндпоинт отметки гостя о прибытии
app.post('/api/guests/:id/arrive', (req, res) => {
  const guestId = parseInt(req.params.id, 10);
  const guests = readGuests();
  const guestIndex = guests.findIndex(g => g.id === guestId);

  if (guestIndex !== -1) {
    guests[guestIndex].isArrived = true;
    if (writeGuests(guests)) {
      const updatedGuest = guests[guestIndex];
      // Оповещаем всех клиентов по Socket.io
      io.emit('guest_arrived', updatedGuest);
      console.log(`[Прибыл] ${updatedGuest.fullName} из г. ${updatedGuest.city}`);
      return res.json({ success: true, guest: updatedGuest });
    } else {
      return res.status(500).json({ error: 'Не удалось сохранить данные' });
    }
  } else {
    return res.status(404).json({ error: 'Гость с таким ID не найден' });
  }
});

// Эндпоинт экспресс-регистрации нового гостя хостес на месте
app.post('/api/guests/add', (req, res) => {
  const { fullName, city, tableNumber, status, lat, lng } = req.body;
  if (!fullName || !city) {
    return res.status(400).json({ error: 'Имя и город обязательны для заполнения' });
  }

  const guests = readGuests();
  
  // Вычисляем новый уникальный ID
  const newId = guests.length > 0 ? Math.max(...guests.map(g => g.id)) + 1 : 1;

  // Определение координат: по словарю, кастомные или случайный разброс вокруг центра России в случае неизвестного города
  let finalLat = parseFloat(lat);
  let finalLng = parseFloat(lng);

  if (isNaN(finalLat) || isNaN(finalLng)) {
    const normCity = city.trim().toLowerCase();
    if (CITY_COORDINATES[normCity]) {
      finalLat = CITY_COORDINATES[normCity].lat;
      finalLng = CITY_COORDINATES[normCity].lng;
    } else {
      // Имитируем случайную координату в европейской части России, если город неизвестен
      finalLat = 55.0 + (Math.random() - 0.5) * 5; 
      finalLng = 37.0 + (Math.random() - 0.5) * 15;
    }
  }

  const newGuest = {
    id: newId,
    fullName: fullName.trim(),
    city: city.trim(),
    tableNumber: tableNumber ? tableNumber.trim() : '',
    status: status ? status.trim() : 'Silver',
    lat: parseFloat(finalLat.toFixed(4)),
    lng: parseFloat(finalLng.toFixed(4)),
    isArrived: true // Новый гость сразу считается прибывшим
  };

  guests.push(newGuest);
  if (writeGuests(guests)) {
    // Немедленно оповещаем клиентов по сокету
    io.emit('guest_arrived', newGuest);
    console.log(`[Создан и Прибыл] ${newGuest.fullName} из г. ${newGuest.city}`);
    return res.json({ success: true, guest: newGuest });
  } else {
    return res.status(500).json({ error: 'Не удалось сохранить гостя в базу данных' });
  }
});

// Утилита: Сброс статуса всех гостей для повторного тестирования
app.post('/api/guests/reset', (req, res) => {
  let guests = readGuests();
  guests = guests.map(g => ({ ...g, isArrived: false }));
  if (writeGuests(guests)) {
    io.emit('guests_reset');
    console.log('[Сброс] Статус всех гостей сброшен на "ожидается"');
    return res.json({ success: true, message: 'Статусы всех гостей успешно сброшены' });
  } else {
    return res.status(500).json({ error: 'Не удалось сбросить статусы' });
  }
});

// Эндпоинт пакетного импорта гостей (из Excel/CSV)
app.post('/api/guests/import', (req, res) => {
  const { guests, mode } = req.body;
  if (!Array.isArray(guests)) {
    return res.status(400).json({ error: 'Неверный формат данных: ожидается массив' });
  }

  let currentGuests = mode === 'append' ? readGuests() : [];
  let maxId = currentGuests.length > 0 ? Math.max(...currentGuests.map(g => g.id)) : 0;

  const newGuests = guests.map((g, index) => {
    const normCity = (g.city || '').trim().toLowerCase();
    let lat = parseFloat(g.lat);
    let lng = parseFloat(g.lng);

    // Если координаты отсутствуют или некорректны, определяем по словарю или даем случайные в европейской части РФ
    if (isNaN(lat) || isNaN(lng)) {
      if (CITY_COORDINATES[normCity]) {
        lat = CITY_COORDINATES[normCity].lat;
        lng = CITY_COORDINATES[normCity].lng;
      } else {
        lat = parseFloat((55.0 + (Math.random() - 0.5) * 5).toFixed(4));
        lng = parseFloat((37.0 + (Math.random() - 0.5) * 15).toFixed(4));
      }
    }

    return {
      id: maxId + index + 1,
      fullName: (g.fullName || 'Без имени').trim(),
      city: (g.city || 'Неизвестно').trim(),
      tableNumber: g.tableNumber ? String(g.tableNumber).trim() : '',
      status: g.status ? String(g.status).trim() : 'Silver',
      lat: lat,
      lng: lng,
      isArrived: g.isArrived === true || g.isArrived === 'true'
    };
  });

  const merged = currentGuests.concat(newGuests);

  if (writeGuests(merged)) {
    io.emit('guests_reset'); // Сигнализируем всем экранам о необходимости полной перезагрузки данных
    console.log(`[Импорт] Импортировано ${newGuests.length} гостей в режиме "${mode}"`);
    return res.json({ success: true, count: newGuests.length });
  } else {
    return res.status(500).json({ error: 'Не удалось сохранить импортированных гостей' });
  }
});

// Эндпоинт удаления гостя из базы
app.delete('/api/guests/:id', (req, res) => {
  const guestId = parseInt(req.params.id, 10);
  const guests = readGuests();
  const filtered = guests.filter(g => g.id !== guestId);
  
  if (guests.length === filtered.length) {
    return res.status(404).json({ error: 'Гость не найден' });
  }

  if (writeGuests(filtered)) {
    io.emit('guests_reset'); // Оповещаем экраны о перезагрузке
    console.log(`[Удаление] Гость ID ${guestId} удален из базы`);
    return res.json({ success: true });
  } else {
    return res.status(500).json({ error: 'Не удалось сохранить данные' });
  }
});



// =========================================
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
      options: ["БИБЛИОТЕКА ЛЕНИНА", "РЕСТОРАН \"ГРАБЛИ\"", "МАРИИНСКИЙ ТЕАТР", "СТАМБУЛ"],
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
      options: ["БОЛЬШОЙ ТЕАТР", "МОСКВА-СИТИ", "БИБЛИОТЕКА ЛЕНИНА", "РЕСТОРАН \"ГРАБЛИ\""],
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
      options: ["ВЕЧЕРНИЙ ЧАЙ", "ЭФИРЫ \"ДОБРОЕ УТРО\"", "НОЧНОЙ ДОЖОР", "ПЛАНЁРКИ"],
      correct: "B"
    }
  ],
  6: [ // Round 6 (Дерзкие Послы)
    {
      text: "Если наш Капитан Евгений Нагиев говорит: \"Мы играем в долгую\"...?!",
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
let lastAwardedQuestionKey = "";

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


io.on('connection', (socket) => {
  console.log('Подключен новый клиент:', socket.id);
  
  // Присоединение в качестве админа/экрана или гостя
  socket.on('quiz_admin_join', () => {
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
  });

  socket.on('quiz_screen_join', () => {
    socket.join('quiz_screens');
    console.log('Экран сцены квиза подключен:', socket.id);
    socket.emit('quiz_tables_update', TABLE_NAMES);
    socket.emit('quiz_state_update', quizState);
    socket.emit('quiz_scores_update', tableScores);
  });

  socket.on('quiz_client_join', (data) => {
    const tableNumber = String(data.tableNumber);
    connectedTables[socket.id] = tableNumber;
    socket.join(`table_${tableNumber}`);
    socket.join('quiz_phones');
    
    console.log(`Телефон подключен: стол ${tableNumber}, ID: ${socket.id}`);
    
    // Оповещаем админов об обновлении онлайна
    io.to('quiz_admins').emit('quiz_connections_update', getTableConnectionsStats());
    
    socket.emit('quiz_tables_update', TABLE_NAMES);
    
    // Отправляем текущее состояние клиенту
    socket.emit('quiz_state_update', {
      quizState,
      tableNumber,
      score: tableScores[tableNumber] || 0
    });
  });

  // Получение ответа от гостя
  socket.on('quiz_client_answer', (data) => {
    const tableNumber = connectedTables[socket.id];
    if (!tableNumber) return;

    if (quizState.roundStep !== 'answers_active' || quizState.answersLocked) {
      return; // Ответы не принимаются
    }

    // Проверяем, ответил ли уже этот стол
    const alreadyAnswered = currentAnswers.some(ans => ans.tableNumber === tableNumber);
    if (alreadyAnswered) {
      socket.emit('quiz_answer_acknowledged', { success: false, reason: 'Ваш стол уже ответил!' });
      return;
    }

    const latency = answersActivatedTime ? (Date.now() - answersActivatedTime) : 0;
    const answer = data.answer;

    const answerRecord = {
      tableNumber,
      answer,
      latency,
      socketId: socket.id
    };

    currentAnswers.push(answerRecord);

    // Оповещаем этот конкретный сокет о приеме ответа
    socket.emit('quiz_answer_acknowledged', { success: true, answer });
    
    // Бродкастим для всех телефонов этого стола, что стол ответил
    io.to(`table_${tableNumber}`).emit('quiz_table_answered_sync', { answer });

    // Отсылаем админам обновленный список ответов
    io.to('quiz_admins').emit('quiz_answers_list', currentAnswers);
    io.to('quiz_admins').emit('quiz_admin_answer_received', { tableNumber, answer, latency });

    // Если это Раунд 7 и фаза answers_active, проверяем большинство правильных ответов
    if (quizState.currentRound === 7 && quizState.roundStep === 'answers_active') {
      const stats = getTableConnectionsStats();
      let totalConnected = 0;
      for (const t in stats) {
        if (stats[t] > 0) {
          totalConnected++;
        }
      }
      
      const correctCode = quizState.correctAnswer || 'C'; // В Раунде 7 правильный вариант 'C' ("В")
      const correctAnswersCount = currentAnswers.filter(ans => ans.answer === correctCode).length;
      
      // Если большинство ответило верно
      const majorityNeeded = totalConnected > 0 ? Math.max(1, Math.ceil(totalConnected / 2)) : 1;
      if (correctAnswersCount >= majorityNeeded) {
        console.log(`[Гранд-Финал] Большинство столов (${correctAnswersCount} из ${totalConnected}) ответило верно (${correctCode}). Запуск анимации победы автоматически!`);
        
        // Автоматически переводим игру в состояние correct_answer
        clearInterval(timerInterval);
        quizState.answersLocked = true;
        quizState.roundStep = 'correct_answer';
        
        // Начисляем очки
        const currentKey = `7_0`;
        if (lastAwardedQuestionKey !== currentKey) {
          lastAwardedQuestionKey = currentKey;
          currentAnswers.forEach(ans => {
            if (ans.answer === correctCode) {
              const table = String(ans.tableNumber);
              if (tableScores[table] !== undefined) {
                tableScores[table] = tableScores[table] + 100;
              }
            }
          });
          io.emit('quiz_scores_update', tableScores);
        }
        
        io.emit('quiz_state_update', quizState);
      }
    }
  });

  // Управление игрой со стороны админа
  socket.on('quiz_admin_set_state', (data) => {
    const { round, step, timerLimit, subQuestionIndex } = data;
    
    if (round !== undefined) {
      const rVal = parseInt(round, 10);
      if (quizState.currentRound !== rVal) {
        quizState.currentRound = rVal;
        quizState.subQuestionIndex = 0; // Сброс при смене раунда
      }
    }
    if (subQuestionIndex !== undefined) {
      quizState.subQuestionIndex = parseInt(subQuestionIndex, 10);
    }
    if (step !== undefined) quizState.roundStep = step;
    
    // Пересчитываем activeQuestion на основе currentRound и subQuestionIndex
    const qList = QUIZ_QUESTIONS[quizState.currentRound];
    if (qList && qList.length > 0) {
      const subIdx = Math.min(quizState.subQuestionIndex, qList.length - 1);
      quizState.activeQuestion = qList[subIdx];
      quizState.correctAnswer = quizState.activeQuestion ? quizState.activeQuestion.correct : '';
    } else {
      quizState.activeQuestion = null;
      quizState.correctAnswer = '';
    }
    
    // Если переходим на показ вопроса
    if (step === 'question') {
      clearInterval(timerInterval);
      quizState.answersLocked = true;
      currentAnswers = [];
      io.to('quiz_admins').emit('quiz_answers_list', currentAnswers);
    }
    
    // Если активируем пульты
    if (step === 'answers_active') {
      clearInterval(timerInterval);
      quizState.answersLocked = false;
      currentAnswers = [];
      io.to('quiz_admins').emit('quiz_answers_list', currentAnswers);
      
      const limit = parseInt(timerLimit, 10) || 5;
      quizState.timerLimit = limit;
      quizState.timerRemaining = limit;
      answersActivatedTime = Date.now();
      
      // Начинаем отсчет
      timerInterval = setInterval(() => {
        quizState.timerRemaining--;
        io.emit('quiz_timer_tick', quizState.timerRemaining);
        
        if (quizState.timerRemaining <= 0) {
          clearInterval(timerInterval);
          quizState.answersLocked = true;
          quizState.roundStep = 'correct_answer_wait';
          io.emit('quiz_timer_end');
          io.emit('quiz_state_update', quizState);
        }
      }, 1000);
    }

    // Если переходим на верный ответ
    if (step === 'correct_answer') {
      clearInterval(timerInterval);
      quizState.answersLocked = true;
      quizState.roundStep = 'correct_answer';

      // Автоматическое начисление баллов правильным столам
      const correctCode = quizState.correctAnswer;
      const currentKey = `${quizState.currentRound}_${quizState.subQuestionIndex}`;
      
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
        console.log(`[Авто-Баллы] ${countCorrect} столов получили по +100 за верный ответ ${correctCode}.`);
      }
    }

    // Оповещаем все подключенные интерфейсы о смене состояния
    io.emit('quiz_state_update', quizState);
  });

  // Начисление баллов (вручную или по расчету модератора)
  socket.on('quiz_admin_award_points', (data) => {
    const { tableNumber, points } = data;
    const table = String(tableNumber);
    const pts = parseInt(points, 10);
    
    if (tableScores[table] !== undefined && !isNaN(pts)) {
      tableScores[table] = Math.max(0, tableScores[table] + pts);
      io.emit('quiz_scores_update', tableScores);
      console.log(`[Баллы] Стол ${table} получил ${pts} монет. Всего: ${tableScores[table]}`);
    }
  });

  // Пакетное начисление баллов
  socket.on('quiz_admin_award_bulk', (data) => {
    if (Array.isArray(data.awards)) {
      data.awards.forEach(aw => {
        const table = String(aw.tableNumber);
        const pts = parseInt(aw.points, 10);
        if (tableScores[table] !== undefined && !isNaN(pts)) {
          tableScores[table] = Math.max(0, tableScores[table] + pts);
        }
      });
      io.emit('quiz_scores_update', tableScores);
      console.log(`[Баллы] Выполнено пакетное начисление баллов.`);
    }
  });

  // Запуск анимации лазера (Раунд 2)
  socket.on('quiz_admin_trigger_laser', (data) => {
    const { tableNumber, similarity } = data;
    io.to('quiz_screens').emit('quiz_screen_laser_effect', { tableNumber, similarity });
  });

  // Запуск гонки кораблей
  socket.on('quiz_admin_show_leaderboard', () => {
    io.to('quiz_screens').emit('quiz_screen_show_leaderboard');
    io.to('quiz_phones').emit('quiz_leaderboard_show'); // Оповещаем телефоны
  });

  // Сброс очков
  socket.on('quiz_admin_reset_scores', () => {
    for (const key in TABLE_NAMES) {
      tableScores[key] = 0;
    }
    lastAwardedQuestionKey = "";
    io.emit('quiz_scores_update', tableScores);
    console.log(`[Сброс] Все очки квиза обнулены`);
  });

  // Отключение клиента
  socket.on('disconnect', () => {
    if (connectedTables[socket.id]) {
      const table = connectedTables[socket.id];
      delete connectedTables[socket.id];
      io.to('quiz_admins').emit('quiz_connections_update', getTableConnectionsStats());
      console.log(`Клиент отключился: стол ${table}, ID: ${socket.id}`);
    } else {
      console.log('Клиент отключился:', socket.id);
    }
  });
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Сервер "Петровская Ассамблея" запущен!`);
  console.log(` Ссылка: http://localhost:${PORT}`);
  console.log(` - Экран карты: http://localhost:${PORT}/map.html`);
  console.log(` - Панель хостес: http://localhost:${PORT}/hostess.html`);
  console.log(` - Экран глашатая: http://localhost:${PORT}/herald.html`);
  console.log(` - Панель организатора: http://localhost:${PORT}/organizer.html`);
  console.log(`===================================================`);
});

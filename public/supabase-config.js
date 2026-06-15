/* ================================================
   SUPABASE CONFIG — Петровская Ассамблея
   Подключите этот файл ПЕРВЫМ во всех HTML файлах:
   <script src="supabase-config.js"></script>
   ================================================ */

const SUPABASE_URL = 'https://pkillhsdugnsevogizum.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5mfxOtyJRCNa1yFBgGBwsw_ykqwsmJ8';

// Инициализация клиента Supabase (доступен глобально как window.sb)
window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: { eventsPerSecond: 10 }
  }
});

// SQL для создания всех таблиц — выполнить в Supabase SQL Editor
window.SETUP_SQL = `
-- Таблица гостей
CREATE TABLE IF NOT EXISTS guests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name TEXT NOT NULL,
  city TEXT DEFAULT '',
  table_number TEXT DEFAULT '',
  status TEXT DEFAULT 'Silver',
  lat FLOAT DEFAULT 55.0,
  lng FLOAT DEFAULT 37.0,
  is_arrived BOOLEAN DEFAULT FALSE,
  payment INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Политика RLS (публичный доступ)
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access" ON guests;
CREATE POLICY "Public access" ON guests FOR ALL USING (true) WITH CHECK (true);

-- Включить Realtime для таблицы гостей
ALTER PUBLICATION supabase_realtime ADD TABLE guests;

-- Состояние квиза (singleton)
CREATE TABLE IF NOT EXISTS quiz_state (
  id INT PRIMARY KEY DEFAULT 1,
  current_round INT DEFAULT 0,
  round_step TEXT DEFAULT 'standby',
  sub_question_index INT DEFAULT 0,
  timer_limit INT DEFAULT 5,
  timer_remaining INT DEFAULT 0,
  answers_locked BOOLEAN DEFAULT TRUE,
  correct_answer TEXT DEFAULT '',
  active_question JSONB DEFAULT NULL,
  laser_mode TEXT DEFAULT 'none',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE quiz_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public quiz_state" ON quiz_state;
CREATE POLICY "Public quiz_state" ON quiz_state FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_state;

-- Вставка начального состояния (если не существует)
INSERT INTO quiz_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Очки столов
CREATE TABLE IF NOT EXISTS quiz_scores (
  table_number TEXT PRIMARY KEY,
  score INT DEFAULT 0
);
ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public quiz_scores" ON quiz_scores;
CREATE POLICY "Public quiz_scores" ON quiz_scores FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_scores;

-- Ответы столов
CREATE TABLE IF NOT EXISTS quiz_answers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_number TEXT,
  answer TEXT,
  latency INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public quiz_answers" ON quiz_answers;
CREATE POLICY "Public quiz_answers" ON quiz_answers FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_answers;

-- Подключения (для отслеживания пультов)
CREATE TABLE IF NOT EXISTS quiz_connections (
  table_number TEXT PRIMARY KEY,
  last_ping TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE quiz_connections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public quiz_connections" ON quiz_connections;
CREATE POLICY "Public quiz_connections" ON quiz_connections FOR ALL USING (true) WITH CHECK (true);

-- Создание бакета для дипломов в Storage (выполнить в Supabase SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('diplomas', 'diplomas', true)
ON CONFLICT (id) DO NOTHING;

-- Разрешаем публичный доступ на чтение объектов в бакете diplomas
DROP POLICY IF EXISTS "Public access to diplomas" ON storage.objects;
CREATE POLICY "Public access to diplomas" ON storage.objects FOR SELECT USING (bucket_id = 'diplomas');

-- Разрешаем публичную загрузку и изменение объектов в бакете diplomas
DROP POLICY IF EXISTS "Public insert/update to diplomas" ON storage.objects;
CREATE POLICY "Public insert/update to diplomas" ON storage.objects FOR ALL USING (bucket_id = 'diplomas') WITH CHECK (bucket_id = 'diplomas');
`;

console.log('[Суперbase] Клиент инициализирован:', SUPABASE_URL);

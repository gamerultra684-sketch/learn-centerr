-- ========================================================================================
-- LEARN CENTER - UNIFIED DATABASE SCHEMA (Production Ready)
-- Target: PostgreSQL (Supabase)
-- Note: Safe to run multiple times. Handles both fresh installs and updates.
-- ========================================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ───────────────────────────────────────────────────────────────────────────────────────
-- 1. UTILITIES & TRIGGERS
-- ───────────────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────────────────────────────
-- 2. PROFILES (Extends auth.users)
-- ───────────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Trigger to create profile when auth.user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ───────────────────────────────────────────────────────────────────────────────────────
-- 3. FOLDERS
-- ───────────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);

DROP TRIGGER IF EXISTS set_folders_updated_at ON folders;
CREATE TRIGGER set_folders_updated_at BEFORE UPDATE ON folders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ───────────────────────────────────────────────────────────────────────────────────────
-- 4. NOTES
-- ───────────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    attachments JSONB,
    views INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist for existing databases
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS attachments JSONB;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public);

DROP TRIGGER IF EXISTS set_notes_updated_at ON notes;
CREATE TRIGGER set_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ───────────────────────────────────────────────────────────────────────────────────────
-- 5. QUIZZES & QUESTIONS
-- ───────────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    description TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    time_limit INTEGER DEFAULT 30,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist for existing databases
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard'));
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS time_limit INTEGER DEFAULT 30;

CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_public ON quizzes(is_public);

DROP TRIGGER IF EXISTS set_quizzes_updated_at ON quizzes;
CREATE TRIGGER set_quizzes_updated_at BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_text TEXT,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    question_type VARCHAR(50) DEFAULT 'multiple_choice',
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist for existing databases
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS question_text TEXT;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 1;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS question_type VARCHAR(50) DEFAULT 'multiple_choice';
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS order_num INTEGER DEFAULT 0;
UPDATE quiz_questions SET question_text = question WHERE question_text IS NULL;

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_user_id ON quiz_questions(user_id);

CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    answers JSONB,
    mode VARCHAR(50) DEFAULT 'study' CHECK (mode IN ('study', 'exam')),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist for existing databases
ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS answers JSONB;

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);


-- ───────────────────────────────────────────────────────────────────────────────────────
-- 6. INTERACTION TABLES (Comments, Likes)
-- ───────────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS note_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS note_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(note_id, user_id)
);

CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);


-- ───────────────────────────────────────────────────────────────────────────────────────
-- 7. FLASHCARDS
-- ───────────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flashcard_decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_id ON flashcard_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_is_public ON flashcard_decks(is_public);

DROP TRIGGER IF EXISTS set_flashcard_decks_updated_at ON flashcard_decks;
CREATE TRIGGER set_flashcard_decks_updated_at BEFORE UPDATE ON flashcard_decks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    image_url TEXT,
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist for existing databases
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS order_num INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);

CREATE TABLE IF NOT EXISTS flashcard_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    box INTEGER DEFAULT 1,
    next_review TIMESTAMPTZ DEFAULT NOW(),
    last_reviewed TIMESTAMPTZ,
    UNIQUE(user_id, flashcard_id)
);

CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_id ON flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_review ON flashcard_progress(next_review);


-- ───────────────────────────────────────────────────────────────────────────────────────
-- 8. LEARNING SESSIONS
-- ───────────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    module_type VARCHAR(100) NOT NULL,
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    deck_id UUID REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    state JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW()
);

-- Constraint needs special care if it already exists. We drop and recreate.
ALTER TABLE learning_sessions DROP CONSTRAINT IF EXISTS has_max_one_ref;
ALTER TABLE learning_sessions ADD CONSTRAINT has_max_one_ref CHECK (
  (note_id IS NOT NULL)::integer +
  (quiz_id IS NOT NULL)::integer +
  (deck_id IS NOT NULL)::integer <= 1
);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);


-- ========================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Folders
DROP POLICY IF EXISTS "folders_select" ON folders;
CREATE POLICY "folders_select" ON folders FOR SELECT USING (auth.uid() = user_id OR is_admin());
DROP POLICY IF EXISTS "folders_insert" ON folders;
CREATE POLICY "folders_insert" ON folders FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "folders_update" ON folders;
CREATE POLICY "folders_update" ON folders FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "folders_delete" ON folders;
CREATE POLICY "folders_delete" ON folders FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Notes
DROP POLICY IF EXISTS "notes_select" ON notes;
CREATE POLICY "notes_select" ON notes FOR SELECT USING (auth.uid() = user_id OR is_public = true OR is_admin());
DROP POLICY IF EXISTS "notes_insert" ON notes;
CREATE POLICY "notes_insert" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "notes_update" ON notes;
CREATE POLICY "notes_update" ON notes FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notes_delete" ON notes;
CREATE POLICY "notes_delete" ON notes FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Quizzes
DROP POLICY IF EXISTS "quizzes_select" ON quizzes;
CREATE POLICY "quizzes_select" ON quizzes FOR SELECT USING (auth.uid() = user_id OR is_public = true OR is_admin());
DROP POLICY IF EXISTS "quizzes_insert" ON quizzes;
CREATE POLICY "quizzes_insert" ON quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "quizzes_update" ON quizzes;
CREATE POLICY "quizzes_update" ON quizzes FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "quizzes_delete" ON quizzes;
CREATE POLICY "quizzes_delete" ON quizzes FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Quiz Questions
DROP POLICY IF EXISTS "quiz_questions_select" ON quiz_questions;
CREATE POLICY "quiz_questions_select" ON quiz_questions FOR SELECT USING (auth.uid() = user_id OR is_admin() OR EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_questions.quiz_id AND is_public = true));
DROP POLICY IF EXISTS "quiz_questions_insert" ON quiz_questions;
CREATE POLICY "quiz_questions_insert" ON quiz_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "quiz_questions_update" ON quiz_questions;
CREATE POLICY "quiz_questions_update" ON quiz_questions FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "quiz_questions_delete" ON quiz_questions;
CREATE POLICY "quiz_questions_delete" ON quiz_questions FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Quiz Results
DROP POLICY IF EXISTS "quiz_results_select" ON quiz_results;
CREATE POLICY "quiz_results_select" ON quiz_results FOR SELECT USING (auth.uid() = user_id OR is_admin());
DROP POLICY IF EXISTS "quiz_results_insert" ON quiz_results;
CREATE POLICY "quiz_results_insert" ON quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "quiz_results_update" ON quiz_results;
CREATE POLICY "quiz_results_update" ON quiz_results FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "quiz_results_delete" ON quiz_results;
CREATE POLICY "quiz_results_delete" ON quiz_results FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Note Comments
DROP POLICY IF EXISTS "comments_select" ON note_comments;
CREATE POLICY "comments_select" ON note_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "comments_insert" ON note_comments;
CREATE POLICY "comments_insert" ON note_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "comments_delete" ON note_comments;
CREATE POLICY "comments_delete" ON note_comments FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Note Likes
DROP POLICY IF EXISTS "likes_select" ON note_likes;
CREATE POLICY "likes_select" ON note_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "likes_insert" ON note_likes;
CREATE POLICY "likes_insert" ON note_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "likes_delete" ON note_likes;
CREATE POLICY "likes_delete" ON note_likes FOR DELETE USING (auth.uid() = user_id);

-- User Ratings
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ratings_select" ON user_ratings;
CREATE POLICY "ratings_select" ON user_ratings FOR SELECT USING (is_admin() OR auth.uid() = user_id);
DROP POLICY IF EXISTS "ratings_insert" ON user_ratings;
CREATE POLICY "ratings_insert" ON user_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "ratings_update" ON user_ratings;
CREATE POLICY "ratings_update" ON user_ratings FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "ratings_delete" ON user_ratings;
CREATE POLICY "ratings_delete" ON user_ratings FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Flashcards
DROP POLICY IF EXISTS "flashcard_decks_select" ON flashcard_decks;
CREATE POLICY "flashcard_decks_select" ON flashcard_decks FOR SELECT USING (auth.uid() = user_id OR is_public = true OR is_admin());
DROP POLICY IF EXISTS "flashcard_decks_insert" ON flashcard_decks;
CREATE POLICY "flashcard_decks_insert" ON flashcard_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "flashcard_decks_update" ON flashcard_decks;
CREATE POLICY "flashcard_decks_update" ON flashcard_decks FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "flashcard_decks_delete" ON flashcard_decks;
CREATE POLICY "flashcard_decks_delete" ON flashcard_decks FOR DELETE USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "flashcards_select" ON flashcards;
CREATE POLICY "flashcards_select" ON flashcards FOR SELECT USING (auth.uid() = user_id OR is_admin() OR EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND is_public = true));
DROP POLICY IF EXISTS "flashcards_insert" ON flashcards;
CREATE POLICY "flashcards_insert" ON flashcards FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "flashcards_update" ON flashcards;
CREATE POLICY "flashcards_update" ON flashcards FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "flashcards_delete" ON flashcards;
CREATE POLICY "flashcards_delete" ON flashcards FOR DELETE USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "flashcard_progress_select" ON flashcard_progress;
CREATE POLICY "flashcard_progress_select" ON flashcard_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "flashcard_progress_insert" ON flashcard_progress;
CREATE POLICY "flashcard_progress_insert" ON flashcard_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "flashcard_progress_update" ON flashcard_progress;
CREATE POLICY "flashcard_progress_update" ON flashcard_progress FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "flashcard_progress_delete" ON flashcard_progress;
CREATE POLICY "flashcard_progress_delete" ON flashcard_progress FOR DELETE USING (auth.uid() = user_id);

-- Learning Sessions
DROP POLICY IF EXISTS "learning_sessions_select" ON learning_sessions;
CREATE POLICY "learning_sessions_select" ON learning_sessions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "learning_sessions_insert" ON learning_sessions;
CREATE POLICY "learning_sessions_insert" ON learning_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "learning_sessions_update" ON learning_sessions;
CREATE POLICY "learning_sessions_update" ON learning_sessions FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "learning_sessions_delete" ON learning_sessions;
CREATE POLICY "learning_sessions_delete" ON learning_sessions FOR DELETE USING (auth.uid() = user_id);

-- ========================================================================================
-- RPC FUNCTIONS for Dashboard Charts
-- ========================================================================================
CREATE OR REPLACE FUNCTION get_weekly_stats(user_id_param UUID DEFAULT NULL)
RETURNS TABLE(day_num INTEGER, quiz_count BIGINT)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXTRACT(DOW FROM completed_at)::INTEGER AS day_num, COUNT(*) AS quiz_count
  FROM quiz_results
  WHERE completed_at >= NOW() - INTERVAL '7 days' AND (user_id_param IS NULL OR user_id = user_id_param)
  GROUP BY EXTRACT(DOW FROM completed_at)::INTEGER;
$$;

CREATE OR REPLACE FUNCTION get_subject_stats(user_id_param UUID DEFAULT NULL)
RETURNS TABLE(subject TEXT, attempts BIGINT, avg_score NUMERIC)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COALESCE(q.subject, 'Lainnya')::TEXT AS subject, COUNT(qr.id) AS attempts, COALESCE(AVG((qr.score::NUMERIC / NULLIF(qr.total_points, 0)) * 100), 0) AS avg_score
  FROM quiz_results qr
  JOIN quizzes q ON qr.quiz_id = q.id
  WHERE qr.total_points > 0 AND (user_id_param IS NULL OR qr.user_id = user_id_param)
  GROUP BY COALESCE(q.subject, 'Lainnya');
$$;

CREATE OR REPLACE FUNCTION get_daily_avg_scores(user_id_param UUID DEFAULT NULL)
RETURNS TABLE(date TEXT, avg_score NUMERIC, attempts BIGINT)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT TO_CHAR(completed_at, 'YYYY-MM-DD') AS date, COALESCE(AVG((score::NUMERIC / NULLIF(total_points, 0)) * 100), 0) AS avg_score, COUNT(*) AS attempts
  FROM quiz_results
  WHERE completed_at >= NOW() - INTERVAL '30 days' AND total_points > 0 AND (user_id_param IS NULL OR user_id = user_id_param)
  GROUP BY TO_CHAR(completed_at, 'YYYY-MM-DD')
  ORDER BY date;
$$;

GRANT EXECUTE ON FUNCTION get_weekly_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subject_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_avg_scores(UUID) TO authenticated;

-- ========================================================================================
-- END OF SCHEMA
-- ========================================================================================

-- Create enum for achievement types
CREATE TYPE achievement_type AS ENUM (
  'first_study', 
  'study_streak_3', 
  'study_streak_7', 
  'study_streak_30',
  'flashcards_master_50',
  'flashcards_master_100',
  'flashcards_master_500',
  'test_ace_5',
  'test_ace_10',
  'perfect_score',
  'early_bird',
  'night_owl',
  'weekend_warrior',
  'level_up_5',
  'level_up_10',
  'level_up_25'
);

-- User gamification stats table
CREATE TABLE user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE,
  total_study_sessions INTEGER NOT NULL DEFAULT 0,
  total_flashcards_reviewed INTEGER NOT NULL DEFAULT 0,
  total_tests_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Achievements definition table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_type achievement_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  criteria JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- User achievements tracking
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type achievement_type NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- Study sessions for XP tracking
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL, -- 'flashcard', 'test', 'resource'
  xp_earned INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER,
  items_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_gamification
CREATE POLICY "Users can view their own gamification stats"
  ON user_gamification FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view leaderboard (limited data)"
  ON user_gamification FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own gamification stats"
  ON user_gamification FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gamification stats"
  ON user_gamification FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Everyone can view achievements"
  ON achievements FOR SELECT
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' achievement counts"
  ON user_achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for study_sessions
CREATE POLICY "Users can view their own study sessions"
  ON study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions"
  ON study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE TRIGGER update_user_gamification_updated_at
  BEFORE UPDATE ON user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default achievements
INSERT INTO achievements (achievement_type, name, description, icon, xp_reward, criteria) VALUES
  ('first_study', 'First Steps', 'Complete your first study session', 'Sparkles', 10, '{"sessions": 1}'),
  ('study_streak_3', 'Getting Started', 'Study for 3 days in a row', 'Flame', 25, '{"streak": 3}'),
  ('study_streak_7', 'Week Warrior', 'Study for 7 days in a row', 'Zap', 50, '{"streak": 7}'),
  ('study_streak_30', 'Dedicated Scholar', 'Study for 30 days in a row', 'Trophy', 200, '{"streak": 30}'),
  ('flashcards_master_50', 'Card Collector', 'Review 50 flashcards', 'BookOpen', 30, '{"flashcards": 50}'),
  ('flashcards_master_100', 'Flashcard Pro', 'Review 100 flashcards', 'Brain', 75, '{"flashcards": 100}'),
  ('flashcards_master_500', 'Memory Master', 'Review 500 flashcards', 'Award', 250, '{"flashcards": 500}'),
  ('test_ace_5', 'Quiz Master', 'Complete 5 tests', 'FileText', 40, '{"tests": 5}'),
  ('test_ace_10', 'Test Champion', 'Complete 10 tests', 'CheckCircle2', 100, '{"tests": 10}'),
  ('perfect_score', 'Perfectionist', 'Score 100% on any test', 'Star', 150, '{"perfect_score": true}'),
  ('early_bird', 'Early Bird', 'Study before 8 AM', 'Sun', 20, '{"hour": 8}'),
  ('night_owl', 'Night Owl', 'Study after 10 PM', 'Moon', 20, '{"hour": 22}'),
  ('weekend_warrior', 'Weekend Warrior', 'Study on both weekend days', 'Calendar', 35, '{"weekend": true}'),
  ('level_up_5', 'Rising Star', 'Reach level 5', 'TrendingUp', 50, '{"level": 5}'),
  ('level_up_10', 'Knowledge Seeker', 'Reach level 10', 'Target', 100, '{"level": 10}'),
  ('level_up_25', 'Scholar Supreme', 'Reach level 25', 'Crown', 500, '{"level": 25}');

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  calculated_level INTEGER;
BEGIN
  -- Formula: Level = floor(sqrt(XP / 100))
  -- Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 400 XP, etc.
  calculated_level := FLOOR(SQRT(xp_amount / 100.0)) + 1;
  RETURN GREATEST(1, calculated_level);
END;
$$;

-- Function to get XP needed for next level
CREATE OR REPLACE FUNCTION xp_for_next_level(current_level INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- XP needed = (level^2) * 100
  RETURN (current_level * current_level) * 100;
END;
$$;
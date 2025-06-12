-- Create focus_modes table
CREATE TABLE IF NOT EXISTS focus_modes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_apps TEXT[] DEFAULT '{}',
  block_notifications BOOLEAN DEFAULT false,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Create pomodoro_stats table
CREATE TABLE IF NOT EXISTS pomodoro_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pomodoros_completed INTEGER DEFAULT 0,
  total_focus_time INTEGER DEFAULT 0,
  total_break_time INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Create pomodoro_sessions table
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('focus', 'break')),
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_focus_modes_user_id ON focus_modes(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_stats_user_id ON pomodoro_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_start_time ON pomodoro_sessions(start_time);

-- Create RLS policies
ALTER TABLE focus_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Focus modes policies
CREATE POLICY "Users can view their own focus modes"
  ON focus_modes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own focus modes"
  ON focus_modes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus modes"
  ON focus_modes FOR UPDATE
  USING (auth.uid() = user_id);

-- Pomodoro stats policies
CREATE POLICY "Users can view their own pomodoro stats"
  ON pomodoro_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pomodoro stats"
  ON pomodoro_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pomodoro stats"
  ON pomodoro_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Pomodoro sessions policies
CREATE POLICY "Users can view their own pomodoro sessions"
  ON pomodoro_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pomodoro sessions"
  ON pomodoro_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pomodoro sessions"
  ON pomodoro_sessions FOR UPDATE
  USING (auth.uid() = user_id); 
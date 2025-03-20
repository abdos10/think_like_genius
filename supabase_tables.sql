-- Create tables for storing tab history in Supabase

-- Table for tab_history to store general state of tabs
CREATE TABLE IF NOT EXISTS public.tab_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tab_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table for evaluate tab history
CREATE TABLE IF NOT EXISTS public.evaluate_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  problem_type TEXT NOT NULL,
  description TEXT NOT NULL,
  thinking_process TEXT NOT NULL,
  expected_outcome TEXT NOT NULL,
  score INTEGER,
  feedback TEXT,
  strengths JSONB,
  weaknesses JSONB,
  improvements JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table for reverse engineering tab history
CREATE TABLE IF NOT EXISTS public.reverse_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  problem_type TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT,
  process JSONB,
  principles JSONB,
  insights JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table for verification tab history
CREATE TABLE IF NOT EXISTS public.verify_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  problem TEXT NOT NULL,
  thinking_process TEXT NOT NULL,
  conclusion TEXT NOT NULL,
  is_valid BOOLEAN,
  confidence REAL,
  gaps JSONB,
  alternatives JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.tab_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reverse_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verify_history ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Allow anonymous access to tab_history" ON public.tab_history;
DROP POLICY IF EXISTS "Allow anonymous access to evaluate_history" ON public.evaluate_history;
DROP POLICY IF EXISTS "Allow anonymous access to reverse_history" ON public.reverse_history;
DROP POLICY IF EXISTS "Allow anonymous access to verify_history" ON public.verify_history;

-- Create permissive policies for anonymous access (testing purposes only)
CREATE POLICY "Allow full access to tab_history" ON public.tab_history
  FOR ALL USING (true) WITH CHECK (true);
  
CREATE POLICY "Allow full access to evaluate_history" ON public.evaluate_history
  FOR ALL USING (true) WITH CHECK (true);
  
CREATE POLICY "Allow full access to reverse_history" ON public.reverse_history
  FOR ALL USING (true) WITH CHECK (true);
  
CREATE POLICY "Allow full access to verify_history" ON public.verify_history
  FOR ALL USING (true) WITH CHECK (true);

-- Grant access permissions to anon and authenticated roles
GRANT ALL ON public.tab_history TO anon, authenticated;
GRANT ALL ON public.evaluate_history TO anon, authenticated;
GRANT ALL ON public.reverse_history TO anon, authenticated;
GRANT ALL ON public.verify_history TO anon, authenticated;

-- Ensure sequences are grantable
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
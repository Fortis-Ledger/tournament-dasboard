-- Supabase SQL for Tournament Dashboard
-- Run this in your Supabase SQL Editor (Settings -> SQL Editor -> New Query)

-- ============================================
-- STEP 1: Create tournaments table
-- ============================================
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  game_name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('solo', 'duo', 'squad')),
  image_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  rules TEXT DEFAULT '',
  total_prize_pool INTEGER DEFAULT 0,
  prize_distribution JSONB DEFAULT '[]'::jsonb,
  entry_fee INTEGER DEFAULT 0,
  max_slots INTEGER DEFAULT 100,
  registered_count INTEGER DEFAULT 0,
  registration_end TIMESTAMPTZ NOT NULL,
  tournament_start TIMESTAMPTZ NOT NULL,
  links JSONB DEFAULT '{"discord": "", "whatsapp": "", "youtube": "", "googleForm": ""}'::jsonb,
  is_active BOOLEAN DEFAULT false,
  is_open BOOLEAN DEFAULT true,
  stats JSONB DEFAULT '{"visits": 0, "redirects": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: Create indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tournaments_is_open ON tournaments(is_open);
CREATE INDEX IF NOT EXISTS idx_tournaments_is_active ON tournaments(is_active);
CREATE INDEX IF NOT EXISTS idx_tournaments_created_at ON tournaments(created_at DESC);

-- ============================================
-- STEP 3: Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to read tournaments
CREATE POLICY "Allow public read access" ON tournaments
  FOR SELECT USING (true);

-- Policy: Allow all operations (for admin - you can restrict this later)
CREATE POLICY "Allow all operations" ON tournaments
  FOR ALL USING (true);

-- ============================================
-- STEP 4: Create Storage Bucket (DO THIS MANUALLY!)
-- ============================================
-- Go to Supabase Dashboard -> Storage -> New Bucket
-- Bucket name: tournament-images
-- Check "Public bucket" ON

-- Then run this SQL to set up storage policies:
INSERT INTO storage.buckets (id, name, public)
VALUES ('tournament-images', 'tournament-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public to view images
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'tournament-images');

-- Allow anyone to upload (you can restrict this later)
CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'tournament-images');

-- Allow anyone to delete (you can restrict this later)
CREATE POLICY "Allow deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'tournament-images');

-- ============================================
-- DONE! Your database is ready.
-- ============================================

# Supabase Database & Storage Setup Schema

Run the following SQL commands in your Supabase SQL Editor to create the necessary `games` table and storage policies:

```sql
-- 1. Create Games Table
CREATE TABLE IF NOT EXISTS public.games (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    difficulty TEXT DEFAULT 'Medium',
    hint TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    images TEXT[],
    image_titles TEXT[],
    image_answers TEXT[],
    grid_cols INT DEFAULT 10,
    grid_rows INT DEFAULT 5,
    reveal_count INT DEFAULT 5,
    enable_hints BOOLEAN DEFAULT true,
    enable_timer BOOLEAN DEFAULT false,
    countdown_enabled BOOLEAN DEFAULT false,
    shuffle_enabled BOOLEAN DEFAULT false,
    start_number INT DEFAULT 1,
    numbering_direction TEXT DEFAULT 'left-right',
    tile_styles JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) & Public Access
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to games" ON public.games
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update/delete access to games" ON public.games
    FOR ALL USING (true);

-- 3. Create Storage Bucket 'images'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage Bucket Public Access Policies
CREATE POLICY "Public Read Images" ON storage.objects
    FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Public Upload Images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'images');

CREATE POLICY "Public Delete Images" ON storage.objects
    FOR DELETE USING (bucket_id = 'images');
```

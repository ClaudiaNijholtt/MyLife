# Supabase Migrations

This directory contains database migration scripts for the My Life app.

## Running Migrations

Execute these SQL scripts in your Supabase SQL Editor in order:

### 1. Change photo storage from data URL to file path
```sql
-- Rename column from photo_data_url to photo_path
ALTER TABLE clothing_items 
  RENAME COLUMN photo_data_url TO photo_path;

-- Update type to TEXT (if needed)
ALTER TABLE clothing_items 
  ALTER COLUMN photo_path TYPE TEXT;
```

### 2. Add brand field
```sql
-- Add brand column (nullable)
ALTER TABLE clothing_items 
  ADD COLUMN brand TEXT;
```

## Initial Schema

If you need to create the table from scratch:

```sql
CREATE TABLE clothing_items (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_path TEXT NOT NULL,
  category TEXT NOT NULL,
  season TEXT NOT NULL,
  colors TEXT[] NOT NULL DEFAULT '{}',
  occasions TEXT[] NOT NULL DEFAULT '{}',
  brand TEXT,
  laundry_state TEXT NOT NULL DEFAULT 'clean',
  wears_since_wash INTEGER NOT NULL DEFAULT 0,
  wash_after_wears INTEGER NOT NULL DEFAULT 3,
  last_worn_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own items
CREATE POLICY "Users can access own items" ON clothing_items
  FOR ALL USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_clothing_items_user_id ON clothing_items(user_id);
CREATE INDEX idx_clothing_items_category ON clothing_items(category);
```

## Storage Setup

Create a private bucket for wardrobe photos:

1. Go to Storage in Supabase Dashboard
2. Create a new bucket named `wardrobe`
3. Set it to **Private** (not public)
4. Add storage policy:

```sql
-- Policy: Users can upload their own photos
CREATE POLICY "Users can upload own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'wardrobe' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can view their own photos
CREATE POLICY "Users can view own photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'wardrobe' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'wardrobe' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can update their own photos
CREATE POLICY "Users can update own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'wardrobe' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## File Storage Pattern

Photos are stored at: `{userId}/{itemId}.webp`

Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890/item123.webp`

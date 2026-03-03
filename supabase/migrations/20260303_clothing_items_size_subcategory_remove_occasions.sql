-- Add missing item-level columns
ALTER TABLE clothing_items
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS size TEXT;

-- Remove occasions from items (will be used for outfits later)
ALTER TABLE clothing_items
  DROP COLUMN IF EXISTS occasions;
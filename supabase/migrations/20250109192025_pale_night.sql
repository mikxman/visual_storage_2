/*
  # Add coordinates columns to storage_items table

  1. Changes
    - Add `x` and `y` columns to `storage_items` table for storing item positions
    - Both columns are nullable to support items without positions
    - Use double precision for accurate coordinate storage

  2. Security
    - No changes to RLS policies needed as the existing policies cover these new columns
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'storage_items' AND column_name = 'x'
  ) THEN
    ALTER TABLE storage_items ADD COLUMN x double precision;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'storage_items' AND column_name = 'y'
  ) THEN
    ALTER TABLE storage_items ADD COLUMN y double precision;
  END IF;
END $$;
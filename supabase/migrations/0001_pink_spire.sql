/*
  # Create Storage Management Schema

  1. New Tables
    - `storage_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `quantity` (integer)
      - `category` (text)
      - `location` (text)
      - `created_at` (timestamp)
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `color` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their data
*/

-- Create storage_items table
CREATE TABLE storage_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  category text NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE storage_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for storage_items
CREATE POLICY "Users can view their storage items"
  ON storage_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their storage items"
  ON storage_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their storage items"
  ON storage_items
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for categories
CREATE POLICY "Users can view categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
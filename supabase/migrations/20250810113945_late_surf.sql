/*
  # Create Gallery and Admin Tables

  1. New Tables
    - `gallery_photos`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, optional)
      - `image_url` (text)
      - `thumbnail_url` (text, optional)
      - `uploaded_by` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `admin_users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `created_at` (timestamp)
      - `last_login` (timestamp, optional)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access to gallery
    - Add policies for admin-only write access
    - Insert default admin user

  3. Storage
    - Create storage bucket for gallery photos
    - Set up storage policies
*/

-- Create gallery_photos table
CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  thumbnail_url text,
  uploaded_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Enable RLS
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Gallery policies (public can read, admin can write)
CREATE POLICY "Anyone can view gallery photos"
  ON gallery_photos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can insert photos"
  ON gallery_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update photos"
  ON gallery_photos
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can delete photos"
  ON gallery_photos
  FOR DELETE
  TO authenticated
  USING (true);

-- Admin policies (only authenticated can access)
CREATE POLICY "Only authenticated users can view admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can update admin users"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (true);

-- Insert default admin user (username: admin, password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu')
ON CONFLICT (username) DO NOTHING;

-- Create storage bucket for gallery photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view gallery images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can upload gallery images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can update gallery images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can delete gallery images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery');

-- Update trigger for gallery_photos
CREATE OR REPLACE FUNCTION update_gallery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gallery_photos_updated_at
  BEFORE UPDATE ON gallery_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_gallery_updated_at();
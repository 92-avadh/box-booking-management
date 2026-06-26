-- Consolidated database setup script for Box Cricket Turf Booking & Management System
-- Copy and run this entire script in your Supabase SQL Editor (https://supabase.com dashboard under SQL Editor)

-- 1. Drop existing tables in reverse dependency order to avoid constraint errors
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS grounds CASCADE;

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create Grounds Table
CREATE TABLE grounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create Users (Profiles) Table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'partner' CHECK (role IN ('admin', 'partner')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    ground_id UUID REFERENCES grounds(id) ON DELETE CASCADE NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    additional_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    final_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Completed', 'Cancelled')) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 6. Create Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('Cash', 'UPI', 'Card', 'Bank Transfer')) NOT NULL,
    payment_status VARCHAR(50) CHECK (payment_status IN ('Paid', 'Partial', 'Pending')) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Create Activity Logs Table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Seed Default Grounds
INSERT INTO grounds (name, hourly_rate)
VALUES 
('Box 1 (Premium Turf)', 1200.00),
('Box 2 (Premium Turf)', 1200.00);

-- 9. Disable RLS on all tables to allow public read/write access (simplest MVP setup)
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE grounds DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Grant API access (usage) on the public schema and table privileges to anon, authenticated and service_role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Configure default privileges so any future tables/sequences/functions get these grants automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- 10. Seed Admin and Partners into auth.users and public.users
-- Admin: cricetclub267@gmail.com (Password: Yug@godhani, Phone: 9824416051)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  phone
) 
SELECT
  'c952ced9-32ab-4dd7-8bc8-607d5f3a5a67',
  '00000000-0000-0000-0000-000000000000',
  'cricetclub267@gmail.com',
  extensions.crypt('Yug@godhani', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now(),
  'authenticated',
  '9824416051'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'cricetclub267@gmail.com' OR phone = '9824416051' OR id = 'c952ced9-32ab-4dd7-8bc8-607d5f3a5a67'
);

INSERT INTO public.users (id, email, phone, role, created_at)
SELECT id, email, COALESCE(phone, '9824416051'), 'admin', now()
FROM auth.users
WHERE email = 'cricetclub267@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Partner 1: partner1@gmail.com (Password: Subham@bhojani, Phone: 9328021142)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  phone
) 
SELECT
  '93a86c6b-9c3f-4271-9c6f-c1fdf4d7fca1',
  '00000000-0000-0000-0000-000000000000',
  'partner1@gmail.com',
  extensions.crypt('Subham@bhojani', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now(),
  'authenticated',
  '9328021142'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'partner1@gmail.com' OR phone = '9328021142' OR id = '93a86c6b-9c3f-4271-9c6f-c1fdf4d7fca1'
);

INSERT INTO public.users (id, email, phone, role, created_at)
SELECT id, email, COALESCE(phone, '9328021142'), 'partner', now()
FROM auth.users
WHERE email = 'partner1@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Partner 2: partner2@gmail.com (Password: Yatin@navdiya, Phone: 9426481232)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  phone
) 
SELECT
  'ad9e5590-db0e-4001-8bf7-df427e1f6e2a',
  '00000000-0000-0000-0000-000000000000',
  'partner2@gmail.com',
  extensions.crypt('Yatin@navdiya', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now(),
  'authenticated',
  '9426481232'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'partner2@gmail.com' OR phone = '9426481232' OR id = 'ad9e5590-db0e-4001-8bf7-df427e1f6e2a'
);

INSERT INTO public.users (id, email, phone, role, created_at)
SELECT id, email, COALESCE(phone, '9426481232'), 'partner', now()
FROM auth.users
WHERE email = 'partner2@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Partner 3: partner3@gmail.com (Password: Subham@sivo, Phone: 9499745268)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  phone
) 
SELECT
  'a3f01ab3-27e1-4c6e-bfbf-2b7e0129cd8a',
  '00000000-0000-0000-0000-000000000000',
  'partner3@gmail.com',
  extensions.crypt('Subham@sivo', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now(),
  'authenticated',
  '9499745268'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'partner3@gmail.com' OR phone = '9499745268' OR id = 'a3f01ab3-27e1-4c6e-bfbf-2b7e0129cd8a'
);

INSERT INTO public.users (id, email, phone, role, created_at)
SELECT id, email, COALESCE(phone, '9499745268'), 'partner', now()
FROM auth.users
WHERE email = 'partner3@gmail.com'
ON CONFLICT (id) DO NOTHING;

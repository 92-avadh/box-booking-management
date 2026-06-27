-- Box Cricket Turf Booking & Management System SQL Schema

-- 1. Grounds Table
CREATE TABLE IF NOT EXISTS grounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Users Table (Extensions/Profiles for Supabase Auth Users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'partner' CHECK (role IN ('admin', 'partner')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    ground_id UUID REFERENCES grounds(id) ON DELETE CASCADE NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL, -- e.g., '18:00:00'
    end_time TIME NOT NULL, -- e.g., '19:00:00'
    amount DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    additional_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    final_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Completed', 'Cancelled')) NOT NULL,
    notes TEXT,
    reference_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete support
);

-- 5. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('Cash', 'UPI', 'Card', 'Bank Transfer')) NOT NULL,
    payment_status VARCHAR(50) CHECK (payment_status IN ('Paid', 'Partial', 'Pending')) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed Initial Data for Grounds
INSERT INTO grounds (name, hourly_rate)
VALUES 
('Ground A (Premium Turf)', 1200.00),
('Ground B (Standard Turf)', 1000.00)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (optional / for configuration by owner)
ALTER TABLE grounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Simple permissive policies for authenticated users (MVP setting)
CREATE POLICY "Allow all access to authenticated users on grounds" ON grounds FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access to authenticated users on customers" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access to authenticated users on users" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access to authenticated users on bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access to authenticated users on payments" ON payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all access to authenticated users on activity_logs" ON activity_logs FOR ALL USING (auth.role() = 'authenticated');

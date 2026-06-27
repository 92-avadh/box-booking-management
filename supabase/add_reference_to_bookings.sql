-- Migration SQL to add reference_name to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reference_name VARCHAR(255);

-- Schema SQL untuk Neon DB (PostgreSQL)
-- Sesuai Bab 7 PRD: Sistem Peminjaman Ruangan Berbasis Web

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF', 'DOSEN', 'MAHASISWA');
CREATE TYPE room_status AS ENUM ('ACTIVE', 'MAINTENANCE');
CREATE TYPE booking_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'MAHASISWA',
    password_hash VARCHAR(255) NOT NULL,
    identifier_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    facilities TEXT[] NOT NULL DEFAULT '{}',
    status room_status NOT NULL DEFAULT 'ACTIVE',
    building VARCHAR(255) NOT NULL,
    floor INT NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT NOT NULL,
    attendees_count INT NOT NULL DEFAULT 1,
    document_name VARCHAR(255),
    status booking_status NOT NULL DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast query availability check
CREATE INDEX IF NOT EXISTS idx_bookings_date_room ON bookings(date, room_id, status);


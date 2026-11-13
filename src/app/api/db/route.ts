import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ADMIN_USER, DEFAULT_ROOMS } from '@/data/mockData';

export async function GET(request: NextRequest) {
  try {
    // 1. Create Enums if not exist
    await sql`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF', 'DOSEN', 'MAHASISWA');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE room_status AS ENUM ('ACTIVE', 'MAINTENANCE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE booking_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // 2. Create Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role user_role NOT NULL DEFAULT 'MAHASISWA',
        password_hash VARCHAR(255) NOT NULL DEFAULT 'admin123',
        identifier_number VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Create Rooms Table
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        capacity INT NOT NULL,
        facilities TEXT[] NOT NULL DEFAULT '{}',
        status room_status NOT NULL DEFAULT 'ACTIVE',
        building VARCHAR(255) NOT NULL,
        floor INT NOT NULL DEFAULT 1,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Create Bookings Table
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        room_id VARCHAR(100) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        date VARCHAR(20) NOT NULL,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        purpose TEXT NOT NULL,
        attendees_count INT NOT NULL DEFAULT 1,
        document_name VARCHAR(255),
        status booking_status NOT NULL DEFAULT 'PENDING',
        approved_by VARCHAR(255),
        rejection_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Reset dummy bookings: delete all dummy bookings
    await sql`DELETE FROM bookings;`;

    // Reset users: keep only Admin user
    await sql`DELETE FROM users;`;
    await sql`
      INSERT INTO users (id, name, email, role, password_hash, identifier_number)
      VALUES (${ADMIN_USER.id}, ${ADMIN_USER.name}, ${ADMIN_USER.email}, ${ADMIN_USER.role}::user_role, 'admin123', ${ADMIN_USER.identifierNumber})
      ON CONFLICT (email) DO UPDATE SET role = 'ADMIN'::user_role, password_hash = 'admin123';
    `;

    // Ensure default rooms exist
    const roomCount = await sql`SELECT count(*)::int as c FROM rooms;`;
    if (roomCount[0].c === 0) {
      for (const r of DEFAULT_ROOMS) {
        await sql`
          INSERT INTO rooms (id, name, capacity, facilities, status, building, floor, description)
          VALUES (${r.id}, ${r.name}, ${r.capacity}, ${r.facilities}, ${r.status}::room_status, ${r.building}, ${r.floor}, ${r.description || ''})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database disetel ulang: Data dummy dibersihkan, hanya akun Admin yang tersimpan.',
      adminCredentials: {
        username: 'admin',
        password: 'admin123',
        role: 'ADMIN',
      },
      counts: {
        users: (await sql`SELECT count(*)::int as c FROM users;`)[0].c,
        rooms: (await sql`SELECT count(*)::int as c FROM rooms;`)[0].c,
        bookings: (await sql`SELECT count(*)::int as c FROM bookings;`)[0].c,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    const users = await sql`
      SELECT id, name, email, role, identifier_number as "identifierNumber", password_hash
      FROM users
      WHERE email = ${username.trim().toLowerCase()} OR identifier_number = ${username.trim()};
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Akun tidak ditemukan. Pastikan username sudah terdaftar.' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check password (for admin: 'admin123' or stored hash)
    if (user.password_hash !== password) {
      return NextResponse.json(
        { success: false, message: 'Password salah. Silakan coba lagi.' },
        { status: 401 }
      );
    }

    const { password_hash, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: safeUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}


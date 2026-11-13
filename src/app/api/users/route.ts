import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const users = await sql`
      SELECT id, name, email, role, identifier_number as "identifierNumber", created_at as "createdAt"
      FROM users
      ORDER BY created_at ASC;
    `;
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, identifierNumber, password } = body;
    const id = `u-${Date.now().toString().slice(-6)}`;
    const pass = password || 'kampus123'; // Default password for new registered users

    await sql`
      INSERT INTO users (id, name, email, role, password_hash, identifier_number)
      VALUES (${id}, ${name}, ${email.trim().toLowerCase()}, ${role}::user_role, ${pass}, ${identifierNumber});
    `;

    return NextResponse.json({
      success: true,
      user: {
        id,
        name,
        email: email.trim().toLowerCase(),
        role,
        identifierNumber,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID wajib disertakan' }, { status: 400 });
    }

    // Protect super admin from deletion
    const checkUser = await sql`SELECT role FROM users WHERE id = ${id};`;
    if (checkUser.length > 0 && checkUser[0].role === 'ADMIN') {
      const adminCount = await sql`SELECT count(*)::int as c FROM users WHERE role = 'ADMIN';`;
      if (adminCount[0].c <= 1) {
        return NextResponse.json({ success: false, error: 'Tidak dapat menghapus satu-satunya Administrator.' }, { status: 400 });
      }
    }

    await sql`DELETE FROM users WHERE id = ${id};`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


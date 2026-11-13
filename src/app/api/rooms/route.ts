import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const rooms = await sql`
      SELECT id, name, capacity, facilities, status, building, floor, description 
      FROM rooms 
      ORDER BY id ASC;
    `;
    return NextResponse.json({ success: true, rooms });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, capacity, facilities, status, building, floor, description } = body;
    const id = `r-${Date.now().toString().slice(-4)}`;

    await sql`
      INSERT INTO rooms (id, name, capacity, facilities, status, building, floor, description)
      VALUES (${id}, ${name}, ${capacity}, ${facilities}, ${status}::room_status, ${building}, ${floor}, ${description || ''});
    `;

    return NextResponse.json({ success: true, room: { id, ...body } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, name, capacity, facilities, building, floor, description } = body;

    if (status && !name) {
      // Quick status update (e.g. toggle maintenance)
      await sql`
        UPDATE rooms
        SET status = ${status}::room_status
        WHERE id = ${id};
      `;
    } else {
      // Full update
      await sql`
        UPDATE rooms
        SET 
          name = ${name},
          capacity = ${capacity},
          facilities = ${facilities},
          status = ${status}::room_status,
          building = ${building},
          floor = ${floor},
          description = ${description || ''}
        WHERE id = ${id};
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Room ID wajib disertakan' }, { status: 400 });
    }

    await sql`DELETE FROM rooms WHERE id = ${id};`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

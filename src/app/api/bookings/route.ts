import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const bookings = await sql`
      SELECT 
        b.id,
        b.user_id as "userId",
        u.name as "userName",
        u.role as "userRole",
        u.email as "userEmail",
        b.room_id as "roomId",
        r.name as "roomName",
        b.date,
        b.start_time as "startTime",
        b.end_time as "endTime",
        b.purpose,
        b.attendees_count as "attendeesCount",
        b.document_name as "documentName",
        b.status,
        b.approved_by as "approvedBy",
        b.rejection_reason as "rejectionReason",
        b.created_at as "createdAt"
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN rooms r ON b.room_id = r.id
      ORDER BY b.created_at DESC;
    `;
    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      roomId,
      date,
      startTime,
      endTime,
      purpose,
      attendeesCount,
      documentName,
    } = body;

    const id = `b-${Date.now().toString().slice(-6)}`;

    await sql`
      INSERT INTO bookings (
        id, user_id, room_id, date, start_time, end_time, purpose, attendees_count, document_name, status
      )
      VALUES (
        ${id}, ${userId}, ${roomId}, ${date}, ${startTime}, ${endTime}, ${purpose}, ${attendeesCount}, ${documentName || null}, 'PENDING'
      );
    `;

    return NextResponse.json({ success: true, bookingId: id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approvedBy, rejectionReason } = body;

    await sql`
      UPDATE bookings 
      SET 
        status = ${status}::booking_status,
        approved_by = ${approvedBy || null},
        rejection_reason = ${rejectionReason || null}
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


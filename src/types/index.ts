export type Role = 'ADMIN' | 'STAFF' | 'DOSEN' | 'MAHASISWA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  identifierNumber: string; // NIM or NIP or ADM
  password?: string;
}

export type RoomStatus = 'ACTIVE' | 'MAINTENANCE';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  facilities: string[];
  status: RoomStatus;
  building: string;
  floor: number;
  description?: string;
  imageUrl?: string;
}

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  userEmail: string;
  roomId: string;
  roomName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm e.g. "08:00"
  endTime: string; // HH:mm e.g. "10:00"
  purpose: string;
  attendeesCount: number;
  documentName?: string;
  status: BookingStatus;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface OperationalSlot {
  startTime: string;
  endTime: string;
  label: string;
}

export const CAMPUS_TIME_SLOTS: OperationalSlot[] = [
  { startTime: '08:00', endTime: '10:00', label: '08:00 - 10:00' },
  { startTime: '10:00', endTime: '12:00', label: '10:00 - 12:00' },
  { startTime: '13:00', endTime: '15:00', label: '13:00 - 15:00' },
  { startTime: '15:00', endTime: '17:00', label: '15:00 - 17:00' },
  { startTime: '17:00', endTime: '19:00', label: '17:00 - 19:00' },
  { startTime: '19:00', endTime: '21:00', label: '19:00 - 21:00' },
];

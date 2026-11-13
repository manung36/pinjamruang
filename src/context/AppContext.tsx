'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Room, Booking, Role, CAMPUS_TIME_SLOTS } from '@/types';
import { ADMIN_USER, DEFAULT_ROOMS, DEFAULT_DATE } from '@/data/mockData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  rooms: Room[];
  bookings: Booking[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean; message: string }>;
  updateBookingStatus: (bookingId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => Promise<void>;
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  updateRoom: (id: string, room: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<{ success: boolean; message: string }>;
  deleteUser: (id: string) => Promise<void>;
  isSlotAvailable: (roomId: string, date: string, startTime: string, endTime: string, ignoreBookingId?: string) => boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_AUTH = 'pinjamruang_session_user';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([ADMIN_USER]);
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(DEFAULT_DATE);

  // Restore authenticated session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH);
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch real-time data directly from Neon DB
  const refreshData = async () => {
    try {
      // 1. Fetch Rooms from Neon DB
      const roomsRes = await fetch('/api/rooms');
      if (roomsRes.ok) {
        const data = await roomsRes.json();
        if (data.rooms) {
          setRooms(data.rooms);
        }
      }

      // 2. Fetch Users from Neon DB
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const data = await usersRes.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
        }
      }

      // 3. Fetch Bookings from Neon DB
      const bookingsRes = await fetch('/api/bookings');
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        if (data.bookings) {
          setBookings(data.bookings);
        }
      }
    } catch (err) {
      console.error('Error fetching live data from Neon:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(data.user));
        return { success: true, message: 'Login berhasil.' };
      } else {
        return { success: false, message: data.message || 'Kredensial tidak valid' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Gagal menghubungi server' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  };

  const isSlotAvailable = (
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    ignoreBookingId?: string
  ): boolean => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room || room.status === 'MAINTENANCE') return false;

    const parseMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const reqStart = parseMinutes(startTime);
    const reqEnd = parseMinutes(endTime);

    const conflicting = bookings.filter((b) => {
      if (b.id === ignoreBookingId) return false;
      if (b.roomId !== roomId || b.date !== date) return false;
      if (b.status !== 'APPROVED' && b.status !== 'PENDING') return false;

      const bStart = parseMinutes(b.startTime);
      const bEnd = parseMinutes(b.endTime);

      return reqStart < bEnd && bStart < reqEnd;
    });

    return conflicting.length === 0;
  };

  const createBooking = async (
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || (currentUser.role !== 'DOSEN' && currentUser.role !== 'MAHASISWA')) {
      return {
        success: false,
        message: 'Hanya Dosen atau Mahasiswa yang memiliki otoritas untuk meminjam ruangan.',
      };
    }

    const available = isSlotAvailable(
      bookingData.roomId,
      bookingData.date,
      bookingData.startTime,
      bookingData.endTime
    );

    if (!available) {
      return {
        success: false,
        message: 'Jadwal ruangan yang dipilih sudah dipesan atau sedang dalam peninjauan.',
      };
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return {
          success: true,
          message: 'Pengajuan peminjaman berhasil dibuat dan menunggu persetujuan Staff.',
        };
      } else {
        return { success: false, message: data.error || 'Gagal menyimpan booking' };
      }
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const updateBookingStatus = async (
    bookingId: string,
    status: 'APPROVED' | 'REJECTED',
    reason?: string
  ) => {
    if (!currentUser || (currentUser.role !== 'STAFF' && currentUser.role !== 'ADMIN')) {
      alert('Anda tidak memiliki hak otoritas untuk menyetujui peminjaman.');
      return;
    }

    try {
      await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: bookingId,
          status,
          approvedBy: `${currentUser.name} (${currentUser.role})`,
          rejectionReason: status === 'REJECTED' ? reason || 'Jadwal ruangan tidak tersedia atau persyaratan belum lengkap' : null,
        }),
      });
      await refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const addRoom = async (roomData: Omit<Room, 'id'>) => {
    if (!currentUser || (currentUser.role !== 'STAFF' && currentUser.role !== 'ADMIN')) {
      alert('Hanya Staff atau Admin yang dapat menambah ruangan.');
      return;
    }
    try {
      await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });
      await refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const updateRoom = async (id: string, updatedFields: Partial<Room>) => {
    if (!currentUser || (currentUser.role !== 'STAFF' && currentUser.role !== 'ADMIN')) {
      alert('Hanya Staff atau Admin yang dapat mengubah status ruangan.');
      return;
    }
    try {
      await fetch('/api/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedFields }),
      });
      await refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRoom = async (id: string) => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      alert('Hanya Administrator yang memiliki wewenang menghapus data master ruangan.');
      return;
    }
    try {
      await fetch(`/api/rooms?id=${id}`, { method: 'DELETE' });
      await refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const addUser = async (userData: Omit<User, 'id'>): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Hanya Admin yang dapat mengelola data pengguna.' };
    }
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        return { success: true, message: 'Pengguna berhasil disimpan ke Neon DB.' };
      } else {
        return { success: false, message: data.error || 'Gagal menambahkan user' };
      }
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const deleteUser = async (id: string) => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      alert('Hanya Admin yang dapat menghapus data pengguna.');
      return;
    }
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Gagal menghapus pengguna');
      } else {
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        rooms,
        bookings,
        selectedDate,
        setSelectedDate,
        login,
        logout,
        createBooking,
        updateBookingStatus,
        addRoom,
        updateRoom,
        deleteRoom,
        addUser,
        deleteUser,
        isSlotAvailable,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

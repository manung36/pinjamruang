'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CAMPUS_TIME_SLOTS, Room } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { BookingModal } from './BookingModal';
import {
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  Info,
  CalendarCheck,
  Building,
} from 'lucide-react';

export const ScheduleExplorer: React.FC = () => {
  const { rooms, bookings, selectedDate, setSelectedDate, isSlotAvailable, currentUser } = useApp();

  const [selectedSlot, setSelectedSlot] = useState<string>('all');
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetRoom, setTargetRoom] = useState<Room | null>(null);
  const [modalStartTime, setModalStartTime] = useState<string>('08:00');
  const [modalEndTime, setModalEndTime] = useState<string>('10:00');

  // Collect all unique facilities across active rooms
  const allFacilities = Array.from(
    new Set(rooms.flatMap((r) => r.facilities))
  );

  // Filtered rooms
  const filteredRooms = rooms.filter((room) => {
    // Search query
    if (
      searchQuery &&
      !room.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !room.building.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Capacity
    if (minCapacity > 0 && room.capacity < minCapacity) {
      return false;
    }

    // Facility filter
    if (selectedFacility !== 'all' && !room.facilities.includes(selectedFacility)) {
      return false;
    }

    return true;
  });

  const handleOpenBooking = (room: Room, startTime = '08:00', endTime = '10:00') => {
    setTargetRoom(room);
    setModalStartTime(startTime);
    setModalEndTime(endTime);
    setIsModalOpen(true);
  };

  // Helper to get status of a room for a specific slot on selectedDate
  const getSlotDetails = (roomId: string, startTime: string, endTime: string) => {
    const booking = bookings.find(
      (b) =>
        b.roomId === roomId &&
        b.date === selectedDate &&
        (b.status === 'APPROVED' || b.status === 'PENDING') &&
        b.startTime < endTime &&
        startTime < b.endTime
    );

    if (booking) {
      return {
        status: booking.status === 'APPROVED' ? 'BOOKED' : 'PENDING_APPROVAL',
        booking,
      };
    }
    return { status: 'AVAILABLE', booking: null };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Jadwal Real-Time Kampus
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Pencarian & Jadwal Ruangan Kosong
          </h1>
          <p className="mt-2 text-sm sm:text-base text-orange-100 font-normal">
            Lihat ketersediaan ruangan per jam secara langsung tanpa harus login. Slot kosong (Available) dapat langsung Anda pesan untuk kegiatan akademik maupun organisasi.
          </p>
        </div>

        {/* Date Selector Banner Strip */}
        <div className="mt-6 pt-5 border-t border-white/20 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-orange-200" />
            <span className="text-xs font-medium text-orange-100">Pilih Tanggal:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white text-zinc-900 text-xs font-semibold px-2.5 py-1 rounded-lg border-0 focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div className="text-xs text-orange-100 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              Hijau: Slot Tersedia (Kosong)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-300"></span>
              Kuning: Menunggu ACC
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-300"></span>
              Merah: Sudah Terisi
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-orange-100 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama ruangan atau gedung..."
            className="w-full text-sm pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Capacity filter */}
          <select
            value={minCapacity}
            onChange={(e) => setMinCapacity(Number(e.target.value))}
            className="text-xs font-medium px-3 py-2.5 border border-zinc-200 rounded-xl bg-white text-zinc-700 focus:ring-2 focus:ring-orange-500"
          >
            <option value={0}>Semua Kapasitas</option>
            <option value={30}>Min. 30 Orang</option>
            <option value={50}>Min. 50 Orang</option>
            <option value={100}>Min. 100+ Orang (Auditorium)</option>
          </select>

          {/* Facility filter */}
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="text-xs font-medium px-3 py-2.5 border border-zinc-200 rounded-xl bg-white text-zinc-700 focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Semua Fasilitas</option>
            {allFacilities.map((fac) => (
              <option key={fac} value={fac}>
                {fac}
              </option>
            ))}
          </select>

          {/* Time slot quick filter */}
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="text-xs font-medium px-3 py-2.5 border border-zinc-200 rounded-xl bg-white text-zinc-700 focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Semua Jam Operasional</option>
            {CAMPUS_TIME_SLOTS.map((s) => (
              <option key={s.startTime} value={s.startTime}>
                Slot {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Schedule Grid view */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-orange-600" />
            Matriks Ketersediaan Ruangan ({filteredRooms.length} Ruangan)
          </h2>
          <span className="text-xs text-zinc-500">
            Tanggal: <strong className="text-zinc-800">{selectedDate}</strong>
          </span>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
            <Info className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
            <h3 className="font-bold text-zinc-800">Tidak ada ruangan yang cocok</h3>
            <p className="text-sm text-zinc-500 mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRooms.map((room) => {
              const isMaintenance = room.status === 'MAINTENANCE';

              // Slots to display
              const slotsToShow =
                selectedSlot === 'all'
                  ? CAMPUS_TIME_SLOTS
                  : CAMPUS_TIME_SLOTS.filter((s) => s.startTime === selectedSlot);

              return (
                <div
                  key={room.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isMaintenance
                      ? 'border-zinc-200 bg-zinc-50/50 opacity-75'
                      : 'border-orange-100 hover:shadow-md hover:border-orange-200'
                  }`}
                >
                  <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-zinc-900">{room.name}</h3>
                        {isMaintenance ? (
                          <Badge variant="red" className="text-[10px]">Perbaikan / Maintenance</Badge>
                        ) : (
                          <Badge variant="green" className="text-[10px]">Aktif</Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                        <span>{room.building}</span>
                        <span>•</span>
                        <span>Lantai {room.floor}</span>
                        <span>•</span>
                        <span className="font-semibold text-zinc-700 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-orange-600" />
                          Kapasitas: {room.capacity} orang
                        </span>
                      </p>

                      {/* Facilities badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {room.facilities.map((fac) => (
                          <span
                            key={fac}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-medium"
                          >
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>

                    {!isMaintenance && (
                      <div className="shrink-0 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenBooking(room, '08:00', '10:00')}
                        >
                          Booking Ruangan Ini
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Slot grid bar */}
                  <div className="p-4 bg-orange-50/20">
                    <div className="text-xs font-semibold text-zinc-600 mb-2.5 flex items-center justify-between">
                      <span>Status Tiap Slot Jam (Pukul 08:00 - 21:00):</span>
                      <span className="text-[11px] text-zinc-400">Klik slot kosong untuk booking langsung</span>
                    </div>

                    {isMaintenance ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        Ruangan ini sedang tidak beroperasi karena proses perbaikan fasilitas.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {slotsToShow.map((slot) => {
                          const slotInfo = getSlotDetails(room.id, slot.startTime, slot.endTime);
                          const isAvailable = slotInfo.status === 'AVAILABLE';
                          const isPending = slotInfo.status === 'PENDING_APPROVAL';

                          return (
                            <div
                              key={slot.startTime}
                              onClick={() => {
                                if (isAvailable) {
                                  handleOpenBooking(room, slot.startTime, slot.endTime);
                                }
                              }}
                              className={`p-2.5 rounded-xl border text-center transition-all ${
                                isAvailable
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer hover:scale-[1.02]'
                                  : isPending
                                  ? 'bg-amber-50 border-amber-200 text-amber-900 cursor-not-allowed'
                                  : 'bg-rose-50 border-rose-200 text-rose-900 cursor-not-allowed'
                              }`}
                            >
                              <div className="text-xs font-bold">{slot.label}</div>
                              <div className="mt-1 text-[11px] font-medium flex items-center justify-center gap-1">
                                {isAvailable ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Tersedia</span>
                                  </>
                                ) : isPending ? (
                                  <>
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Menunggu ACC</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Terisi</span>
                                  </>
                                )}
                              </div>
                              {slotInfo.booking && (
                                <div className="text-[10px] text-zinc-500 truncate mt-1 max-w-[120px] mx-auto" title={slotInfo.booking.purpose}>
                                  {slotInfo.booking.userName.split(',')[0]}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        room={targetRoom}
        initialDate={selectedDate}
        initialStartTime={modalStartTime}
        initialEndTime={modalEndTime}
      />
    </div>
  );
};


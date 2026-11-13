'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Room } from '@/types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Calendar, Clock, Users, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  room,
  initialDate,
  initialStartTime = '08:00',
  initialEndTime = '10:00',
}) => {
  const { currentUser, selectedDate, createBooking, isSlotAvailable } = useApp();

  const [date, setDate] = useState(initialDate || selectedDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [purpose, setPurpose] = useState('');
  const [attendeesCount, setAttendeesCount] = useState<number>(room ? Math.min(room.capacity, 20) : 10);
  const [documentName, setDocumentName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!room) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentUser) {
      setErrorMsg('Silakan login terlebih dahulu untuk melakukan peminjaman ruangan.');
      return;
    }

    if (currentUser.role !== 'DOSEN' && currentUser.role !== 'MAHASISWA') {
      setErrorMsg('Hanya akun Dosen atau Mahasiswa yang dapat mengajukan peminjaman ruangan.');
      return;
    }

    if (!purpose.trim()) {
      setErrorMsg('Tujuan peminjaman wajib diisi.');
      return;
    }

    if (startTime >= endTime) {
      setErrorMsg('Jam selesai harus lebih akhir dari jam mulai.');
      return;
    }

    if (attendeesCount > room.capacity) {
      setErrorMsg(`Jumlah peserta melebihi kapasitas ruangan (${room.capacity} orang).`);
      return;
    }

    const available = isSlotAvailable(room.id, date, startTime, endTime);
    if (!available) {
      setErrorMsg('Maaf! Ruangan pada jam dan tanggal ini sudah di-booking atau berstatus pending.');
      return;
    }

    const res = await createBooking({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userEmail: currentUser.email,
      roomId: room.id,
      roomName: room.name,
      date,
      startTime,
      endTime,
      purpose,
      attendeesCount,
      documentName: documentName.trim() || undefined,
    });

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setSuccessMsg('');
        setPurpose('');
        setDocumentName('');
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Formulir Peminjaman Ruangan"
      description={`Mengajukan peminjaman untuk ${room.name}`}
      maxWidth="lg"
    >
      {successMsg ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-bold text-zinc-900">Pengajuan Berhasil Disimpan!</h4>
          <p className="text-sm text-zinc-600 max-w-sm mx-auto">{successMsg}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Room info summary badge */}
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-orange-950">{room.name}</p>
              <p className="text-orange-700">{room.building} • Lantai {room.floor}</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-orange-900">Kapasitas Maksimal</span>
              <p className="text-orange-700">{room.capacity} Orang</p>
            </div>
          </div>

          {/* User info */}
          {currentUser && (
            <div className="text-xs text-zinc-500 bg-zinc-50 p-2.5 rounded-lg">
              Diajukan oleh: <strong className="text-zinc-800">{currentUser.name}</strong> ({currentUser.role} - {currentUser.identifierNumber})
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-600" />
              Tanggal Peminjaman
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                Jam Mulai
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="08:00">08:00</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="13:00">13:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="17:00">17:00</option>
                <option value="19:00">19:00</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                Jam Selesai
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="12:00">12:00</option>
                <option value="13:00">13:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
                <option value="17:00">17:00</option>
                <option value="19:00">19:00</option>
                <option value="21:00">21:00</option>
              </select>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-orange-600" />
              Perkiraan Jumlah Peserta
            </label>
            <input
              type="number"
              min="1"
              max={room.capacity}
              value={attendeesCount}
              onChange={(e) => setAttendeesCount(parseInt(e.target.value) || 1)}
              className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Tujuan Peminjaman Ruangan *
            </label>
            <textarea
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Contoh: Kuliah Pengganti Pemrograman Web Kelas TI-2B, Gladi Bersih Seminar..."
              className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Supporting Document */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-orange-600" />
              Dokumen / Proposal Pendukung (Opsional)
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Nama file / Nomor surat tugas (cth: Surat_Izin_Dekan_2026.pdf)"
              className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="default">
              Kirim Permintaan Booking
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};


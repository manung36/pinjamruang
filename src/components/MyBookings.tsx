'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { StatusBadge } from './ui/Badge';
import { Button } from './ui/Button';
import { Calendar, Clock, MapPin, Users, FileText, CheckCircle2, XCircle, AlertCircle, Plus } from 'lucide-react';
import { BookingModal } from './BookingModal';

export const MyBookings: React.FC<{ onExploreClick: () => void }> = ({ onExploreClick }) => {
  const { currentUser, bookings, rooms } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  if (!currentUser) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-zinc-200 max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-zinc-900">Silakan Login Terlebih Dahulu</h3>
        <p className="text-sm text-zinc-600 mt-1 mb-4">
          Anda perlu login sebagai Dosen atau Mahasiswa untuk melihat riwayat peminjaman ruangan.
        </p>
      </div>
    );
  }

  // Filter bookings for current user
  const userBookings = bookings.filter((b) => b.userId === currentUser.id);

  const filtered = userBookings.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Riwayat Peminjaman Ruangan</h1>
          <p className="text-sm text-zinc-500">
            Daftar permohonan booking yang diajukan oleh <strong className="text-zinc-800">{currentUser.name}</strong> ({currentUser.role})
          </p>
        </div>

        <Button onClick={onExploreClick} className="gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Ajukan Peminjaman Baru
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            filterStatus === 'ALL'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Semua ({userBookings.length})
        </button>
        <button
          onClick={() => setFilterStatus('PENDING')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            filterStatus === 'PENDING'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Menunggu ACC ({userBookings.filter((b) => b.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilterStatus('APPROVED')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            filterStatus === 'APPROVED'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Disetujui ({userBookings.filter((b) => b.status === 'APPROVED').length})
        </button>
        <button
          onClick={() => setFilterStatus('REJECTED')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            filterStatus === 'REJECTED'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Ditolak ({userBookings.filter((b) => b.status === 'REJECTED').length})
        </button>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
          <Calendar className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
          <h3 className="font-bold text-zinc-800">Tidak ada data peminjaman</h3>
          <p className="text-sm text-zinc-500 mt-1 mb-4">
            Belum ada permohonan peminjaman ruangan dengan status ini.
          </p>
          <Button variant="outline" size="sm" onClick={onExploreClick}>
            Cek Jadwal Ruangan Kosong
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="relative overflow-hidden flex flex-col justify-between">
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      ID: #{item.id}
                    </span>
                    <h3 className="font-bold text-base text-zinc-900 mt-1">{item.roomName}</h3>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="space-y-1.5 text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>Tanggal: <strong className="text-zinc-900">{item.date}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>Pukul: <strong className="text-zinc-900">{item.startTime} - {item.endTime} WIB</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>Peserta: {item.attendeesCount} Orang</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-zinc-700">Tujuan Kegiatan:</h4>
                  <p className="text-xs text-zinc-600 mt-0.5 line-clamp-3 bg-white p-2 rounded-lg border border-zinc-100">
                    {item.purpose}
                  </p>
                </div>

                {item.documentName && (
                  <div className="text-xs flex items-center gap-1.5 text-zinc-500">
                    <FileText className="w-3.5 h-3.5 text-orange-600" />
                    <span>Lampiran: <span className="font-medium text-zinc-800">{item.documentName}</span></span>
                  </div>
                )}

                {/* Staff Feedback / Rejection Info */}
                {item.status === 'APPROVED' && item.approvedBy && (
                  <div className="text-xs p-2 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Telah di-ACC oleh: <strong>{item.approvedBy}</strong></span>
                  </div>
                )}

                {item.status === 'REJECTED' && (
                  <div className="text-xs p-2 bg-rose-50 text-rose-800 rounded-lg space-y-1 border border-rose-200">
                    <div className="flex items-center gap-1.5 font-bold">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Alasan Penolakan:</span>
                    </div>
                    <p className="pl-5 text-rose-700">{item.rejectionReason || 'Jadwal ruangan tidak tersedia atau bentrok.'}</p>
                  </div>
                )}
              </div>

              <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-100 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Diajukan pada: {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="font-medium text-zinc-600">Hak Akses: {item.userRole}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};


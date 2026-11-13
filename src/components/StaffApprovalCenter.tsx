'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Booking, Room } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { StatusBadge, Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  Building,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Edit2,
  Trash2,
  Settings,
} from 'lucide-react';

export const StaffApprovalCenter: React.FC = () => {
  const { bookings, rooms, updateBookingStatus, addRoom, updateRoom, deleteRoom, currentUser } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'approvals' | 'rooms'>('approvals');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBookingToReject, setSelectedBookingToReject] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Room modal state for CRUD
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({
    name: '',
    building: '',
    floor: 1,
    capacity: 30,
    facilities: '',
    status: 'ACTIVE' as 'ACTIVE' | 'MAINTENANCE',
    description: '',
  });

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const processedBookings = bookings.filter((b) => b.status !== 'PENDING');

  const handleApprove = (bookingId: string) => {
    updateBookingStatus(bookingId, 'APPROVED');
  };

  const openRejectDialog = (booking: Booking) => {
    setSelectedBookingToReject(booking);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (selectedBookingToReject) {
      updateBookingStatus(selectedBookingToReject.id, 'REJECTED', rejectionReason);
      setRejectModalOpen(false);
      setSelectedBookingToReject(null);
    }
  };

  const openRoomModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setRoomForm({
        name: room.name,
        building: room.building,
        floor: room.floor,
        capacity: room.capacity,
        facilities: room.facilities.join(', '),
        status: room.status,
        description: room.description || '',
      });
    } else {
      setEditingRoom(null);
      setRoomForm({
        name: '',
        building: 'Gedung A',
        floor: 1,
        capacity: 40,
        facilities: 'AC, Proyektor, Whiteboard',
        status: 'ACTIVE',
        description: '',
      });
    }
    setRoomModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const facilitiesArray = roomForm.facilities
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (editingRoom) {
      updateRoom(editingRoom.id, {
        name: roomForm.name,
        building: roomForm.building,
        floor: roomForm.floor,
        capacity: roomForm.capacity,
        facilities: facilitiesArray,
        status: roomForm.status,
        description: roomForm.description,
      });
    } else {
      addRoom({
        name: roomForm.name,
        building: roomForm.building,
        floor: roomForm.floor,
        capacity: roomForm.capacity,
        facilities: facilitiesArray,
        status: roomForm.status,
        description: roomForm.description,
      });
    }
    setRoomModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900">Dashboard Manajemen Staff Sarpras</h1>
            <Badge variant="orange" className="text-xs">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Akses Staff
            </Badge>
          </div>
          <p className="text-sm text-zinc-500">
            Pusat persetujuan (ACC/Tolak) pengajuan sewa ruangan dan pengelolaan status ketersediaan/maintenance ruangan.
          </p>
        </div>

        {/* Sub-tabs switcher */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('approvals')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'approvals' ? 'bg-white text-orange-600 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Antrean ACC ({pendingBookings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('rooms')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'rooms' ? 'bg-white text-orange-600 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Manajemen Ruangan ({rooms.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'approvals' ? (
        <div className="space-y-6">
          {/* Pending Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Permohonan Menunggu Tindakan ({pendingBookings.length})
              </h2>
              <span className="text-xs text-zinc-400">Persetujuan otomatis mengunci slot jadwal</span>
            </div>

            {pendingBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-zinc-200">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-zinc-800">Semua Permohonan Telah Ditinjau</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Tidak ada permohonan booking yang menunggu persetujuan saat ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingBookings.map((b) => (
                  <Card key={b.id} className="border-amber-200 bg-amber-50/10">
                    <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                            #{b.id}
                          </span>
                          <span className="font-bold text-zinc-900 text-base">{b.roomName}</span>
                          <Badge variant="yellow" className="text-[11px]">Pending Review</Badge>
                          <span className="text-xs text-zinc-400">
                            Diajukan: {new Date(b.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-zinc-600">
                          <div>
                            <span className="text-zinc-400 block text-[10px]">PEMINJAM</span>
                            <strong className="text-zinc-800">{b.userName}</strong>
                            <span className="block text-[11px] text-orange-600 font-medium">({b.userRole})</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[10px]">TANGGAL & JAM</span>
                            <span className="font-semibold text-zinc-900">{b.date}</span>
                            <span className="block text-zinc-700">{b.startTime} - {b.endTime} WIB</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[10px]">PESERTA & DOKUMEN</span>
                            <span>{b.attendeesCount} Orang</span>
                            {b.documentName ? (
                              <span className="block text-orange-600 truncate text-[11px] font-medium" title={b.documentName}>
                                📄 {b.documentName}
                              </span>
                            ) : (
                              <span className="block text-zinc-400 text-[11px]">- Tanpa lampiran -</span>
                            )}
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-zinc-100 text-xs text-zinc-700">
                          <span className="font-semibold text-zinc-900 block text-[11px] text-zinc-400 mb-0.5">
                            TUJUAN KEGIATAN:
                          </span>
                          {b.purpose}
                        </div>
                      </div>

                      {/* Approval Actions */}
                      <div className="flex sm:flex-row lg:flex-col items-stretch gap-2 shrink-0">
                        <Button
                          variant="default"
                          size="md"
                          onClick={() => handleApprove(b.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs py-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          ACC / Setujui
                        </Button>
                        <Button
                          variant="outline"
                          size="md"
                          onClick={() => openRejectDialog(b)}
                          className="border-rose-300 text-rose-700 hover:bg-rose-50 text-xs py-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Tolak Booking
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Processed Bookings History */}
          <div className="space-y-3 pt-6 border-t border-zinc-200">
            <h2 className="text-base font-bold text-zinc-900">Riwayat Keputusan Staff</h2>
            <div className="overflow-x-auto bg-white rounded-2xl border border-zinc-200 shadow-xs">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">ID / Ruangan</th>
                    <th className="p-3.5">Peminjam</th>
                    <th className="p-3.5">Jadwal</th>
                    <th className="p-3.5">Tujuan</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Petugas / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {processedBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-50/50">
                      <td className="p-3.5 font-medium text-zinc-900">
                        <span className="text-[10px] text-orange-600 block font-mono">#{b.id}</span>
                        {b.roomName}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-zinc-800">{b.userName}</div>
                        <div className="text-[10px] text-zinc-400">{b.userRole}</div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-medium text-zinc-800">{b.date}</div>
                        <div className="text-zinc-500">{b.startTime} - {b.endTime}</div>
                      </td>
                      <td className="p-3.5 max-w-xs truncate" title={b.purpose}>
                        {b.purpose}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="p-3.5">
                        {b.status === 'APPROVED' ? (
                          <span className="text-emerald-700 font-medium">{b.approvedBy || 'Staff'}</span>
                        ) : (
                          <span className="text-rose-600 line-clamp-1">{b.rejectionReason}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Room Management Sub-tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Katalog & Status Ruangan Kampus</h2>
              <p className="text-xs text-zinc-500">
                Atur ketersediaan ruangan, ubah ke mode perbaikan (Maintenance), atau tambahkan ruangan baru.
              </p>
            </div>
            <Button onClick={() => openRoomModal()} size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              Tambah Ruangan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const isMaintenance = room.status === 'MAINTENANCE';

              return (
                <Card key={room.id} className="flex flex-col justify-between">
                  <div className="p-5 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-zinc-400">ID: {room.id}</span>
                        <h3 className="font-bold text-zinc-900 text-base">{room.name}</h3>
                      </div>
                      <Badge variant={isMaintenance ? 'red' : 'green'}>
                        {isMaintenance ? 'Perbaikan' : 'Aktif'}
                      </Badge>
                    </div>

                    <div className="text-xs text-zinc-500 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-orange-600" />
                        {room.building} (Lantai {room.floor})
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-orange-600" />
                        Kapasitas: {room.capacity} Orang
                      </p>
                    </div>

                    <p className="text-xs text-zinc-600 italic bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                      {room.description || 'Tidak ada catatan.'}
                    </p>

                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Fasilitas:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {room.facilities.map((fac) => (
                          <span
                            key={fac}
                            className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-800 rounded font-medium border border-orange-200"
                          >
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-2">
                    {/* Toggle maintenance shortcut */}
                    <button
                      onClick={() =>
                        updateRoom(room.id, {
                          status: isMaintenance ? 'ACTIVE' : 'MAINTENANCE',
                        })
                      }
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold border transition-colors cursor-pointer ${
                        isMaintenance
                          ? 'border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50'
                          : 'border-rose-300 text-rose-700 bg-white hover:bg-rose-50'
                      }`}
                    >
                      {isMaintenance ? 'Aktifkan Ruangan' : 'Set Maintenance'}
                    </button>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openRoomModal(room)} className="p-1.5 h-8 w-8">
                        <Edit2 className="w-3.5 h-3.5 text-zinc-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus ${room.name}?`)) {
                            deleteRoom(room.id);
                          }
                        }}
                        className="p-1.5 h-8 w-8 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Tolak Pengajuan Booking Ruangan"
        description={`Permohonan #${selectedBookingToReject?.id} - ${selectedBookingToReject?.roomName}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Alasan Penolakan (Akan disampaikan ke Peminjam) *
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Contoh: Ruangan akan digunakan untuk agenda Rektorat mendadak, atau kapasitas tidak sesuai..."
              className="w-full text-sm p-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="danger"
              disabled={!rejectionReason.trim()}
              onClick={confirmReject}
            >
              Konfirmasi Tolak
            </Button>
          </div>
        </div>
      </Modal>

      {/* Room Create / Edit Modal */}
      <Modal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        title={editingRoom ? 'Edit Data Ruangan' : 'Tambah Ruangan Baru'}
        description="Data ruangan akan langsung tampil di jadwal ketersediaan publik"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveRoom} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Nama Ruangan</label>
            <input
              type="text"
              required
              value={roomForm.name}
              onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
              placeholder="Contoh: Ruang Teori A1.3"
              className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Gedung</label>
              <input
                type="text"
                required
                value={roomForm.building}
                onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
                placeholder="Gedung A"
                className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Lantai</label>
              <input
                type="number"
                min="1"
                required
                value={roomForm.floor}
                onChange={(e) => setRoomForm({ ...roomForm, floor: Number(e.target.value) })}
                className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Kapasitas (Orang)</label>
              <input
                type="number"
                min="1"
                required
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Status Awal</label>
              <select
                value={roomForm.status}
                onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value as 'ACTIVE' | 'MAINTENANCE' })}
                className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="ACTIVE">ACTIVE (Tersedia untuk dipesan)</option>
                <option value="MAINTENANCE">MAINTENANCE (Perbaikan)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Daftar Fasilitas (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={roomForm.facilities}
              onChange={(e) => setRoomForm({ ...roomForm, facilities: e.target.value })}
              placeholder="AC, Proyektor HD, Sound System, Whiteboard"
              className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Keterangan / Deskripsi</label>
            <textarea
              rows={2}
              value={roomForm.description}
              onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
              placeholder="Deskripsi singkat ruangan..."
              className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <Button type="button" variant="ghost" onClick={() => setRoomModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="default">
              Simpan Data Ruangan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Role, User } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import {
  Users,
  Shield,
  KeyRound,
  Plus,
  Trash2,
  Database,
  Sliders,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { users, addUser, deleteUser, rooms, bookings } = useApp();

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'MAHASISWA' as Role,
    identifierNumber: '',
  });

  const [leadTimeLimit, setLeadTimeLimit] = useState<number>(3); // Max booking lead time (days) in PRD
  const [maxBookingDuration, setMaxBookingDuration] = useState<number>(4); // Max hours per booking
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;

    addUser({
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      identifierNumber: userForm.identifierNumber || `${Date.now().toString().slice(-8)}`,
    });

    setUserForm({
      name: '',
      email: '',
      role: 'MAHASISWA',
      identifierNumber: '',
    });
    setUserModalOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-zinc-900">Panel Kontrol Administrator</h1>
          <Badge variant="orange" className="text-xs">
            <Shield className="w-3.5 h-3.5 mr-1" />
            Super Admin
          </Badge>
        </div>
        <p className="text-sm text-zinc-500">
          Manajemen data master pengguna (SSO), data master ruangan, dan konfigurasi batasan sistem.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-orange-100 shadow-xs">
          <span className="text-xs text-zinc-500 font-medium">Total Akun Terdaftar</span>
          <div className="text-2xl font-extrabold text-orange-600 mt-1">{users.length}</div>
          <span className="text-[11px] text-zinc-400">Admin, Staff, Dosen, Mhs</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-orange-100 shadow-xs">
          <span className="text-xs text-zinc-500 font-medium">Total Ruangan Kampus</span>
          <div className="text-2xl font-extrabold text-orange-600 mt-1">{rooms.length}</div>
          <span className="text-[11px] text-zinc-400">{rooms.filter(r => r.status === 'ACTIVE').length} Aktif Operasional</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-orange-100 shadow-xs">
          <span className="text-xs text-zinc-500 font-medium">Total Peminjaman</span>
          <div className="text-2xl font-extrabold text-orange-600 mt-1">{bookings.length}</div>
          <span className="text-[11px] text-zinc-400">{bookings.filter(b => b.status === 'APPROVED').length} Telah di-ACC</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-orange-100 shadow-xs">
          <span className="text-xs text-zinc-500 font-medium">Database Server</span>
          <div className="text-sm font-extrabold text-emerald-600 mt-2 flex items-center gap-1.5">
            <Database className="w-4 h-4" /> Neon PostgreSQL
          </div>
          <span className="text-[10px] text-zinc-400">Serverless Connected</span>
        </div>
      </div>

      {/* Users Management Section */}
      <Card>
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100">
          <div>
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              Manajemen Pengguna (User Management SSO)
            </h2>
            <p className="text-xs text-zinc-500">
              Kelola hak akses untuk Admin, Staff Sarpras, Dosen, dan Mahasiswa
            </p>
          </div>
          <Button onClick={() => setUserModalOpen(true)} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Tambah Pengguna
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600">
            <thead className="bg-zinc-50 font-semibold text-zinc-700 uppercase tracking-wider text-[11px] border-b border-zinc-100">
              <tr>
                <th className="p-3.5">Nama & Identitas</th>
                <th className="p-3.5">Email Kampus</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Nomor Induk (NIM/NIP)</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/50">
                  <td className="p-3.5 font-bold text-zinc-900">{u.name}</td>
                  <td className="p-3.5">{u.email}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'STAFF'
                          ? 'bg-blue-100 text-blue-800'
                          : u.role === 'DOSEN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono">{u.identifierNumber}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (users.length <= 1) {
                          alert('Tidak dapat menghapus user terakhir');
                          return;
                        }
                        if (confirm(`Hapus akun ${u.name}?`)) {
                          deleteUser(u.id);
                        }
                      }}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* System Settings & Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sliders className="w-5 h-5 text-orange-600" />
            Pengaturan Kebijakan Sistem Peminjaman (System Settings)
          </CardTitle>
          <p className="text-xs text-zinc-500">
            Sesuai bagian 5C PRD: Menetapkan batasan waktu dan regulasi peminjaman ruangan kampus.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
            {settingsSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Pengaturan sistem berhasil disimpan.
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Batas Maksimal Pengajuan Sebelum Acara (Hari)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={leadTimeLimit}
                onChange={(e) => setLeadTimeLimit(Number(e.target.value))}
                className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Misal 3 hari: Peminjaman harus diajukan selambat-lambatnya 3 hari sebelum waktu kegiatan.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Durasi Maksimal per Booking (Jam)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={maxBookingDuration}
                onChange={(e) => setMaxBookingDuration(Number(e.target.value))}
                className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Membatasi durasi peminjaman satu sesi untuk menjaga pemerataan fasilitas antar prodi/unit.
              </span>
            </div>

            <Button type="submit" variant="default" size="sm">
              Simpan Pengaturan
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title="Tambah Akun Pengguna Kampus"
        description="Buat akun untuk Dosen, Mahasiswa, Staff, atau Administrator"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Nama Lengkap & Gelar</label>
            <input
              type="text"
              required
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              placeholder="Contoh: Dr. Ir. Hendra Gunawan, M.T."
              className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Kampus (@kampus.ac.id)</label>
            <input
              type="email"
              required
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              placeholder="hendra@kampus.ac.id"
              className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Hak Akses (Role)</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value as Role })}
                className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="MAHASISWA">MAHASISWA</option>
                <option value="DOSEN">DOSEN</option>
                <option value="STAFF">STAFF (Sarpras)</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Nomor Induk (NIM / NIP)</label>
              <input
                type="text"
                value={userForm.identifierNumber}
                onChange={(e) => setUserForm({ ...userForm, identifierNumber: e.target.value })}
                placeholder="21051204099"
                className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <Button type="button" variant="ghost" onClick={() => setUserModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="default">
              Daftarkan Pengguna
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


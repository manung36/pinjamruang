'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Modal } from './ui/Modal';
import { Building2, LogIn, LogOut, ShieldAlert, KeyRound, User, Lock, AlertCircle } from 'lucide-react';

export const Navbar: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({
  activeTab,
  setActiveTab,
}) => {
  const { currentUser, login, logout } = useApp();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    const res = await login(username, password);
    setIsLoading(false);

    if (res.success) {
      setLoginModalOpen(false);
      setUsername('');
      setPassword('');
    } else {
      setLoginError(res.message);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    PinjamRuang
                  </span>
                  <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                    Kampus
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 hidden sm:block">Sistem Peminjaman Ruangan & Jadwal Real-Time</p>
              </div>
            </div>

            {/* Navigation Links based on Roles & Authority */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Public/All Roles: Live Schedule */}
              <button
                onClick={() => setActiveTab('explore')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'explore'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                Jadwal Kosong
              </button>

              {/* Dosen & Mahasiswa: Booking History */}
              {currentUser && (currentUser.role === 'DOSEN' || currentUser.role === 'MAHASISWA') && (
                <button
                  onClick={() => setActiveTab('my-bookings')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'my-bookings'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  Riwayat Peminjaman Saya
                </button>
              )}

              {/* Staff Sarpras & Admin: Approval Center & Room Maintenance */}
              {currentUser && (currentUser.role === 'STAFF' || currentUser.role === 'ADMIN') && (
                <button
                  onClick={() => setActiveTab('staff-approval')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'staff-approval'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  Pusat Persetujuan (Staff)
                </button>
              )}

              {/* Admin ONLY: Master Data & System Settings */}
              {currentUser && currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('admin-panel')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'admin-panel'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  Kelola Data Master (Admin)
                </button>
              )}
            </nav>

            {/* User Profile & Auth Button */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl border border-orange-200 bg-orange-50/70">
                    <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 leading-tight">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <span className="font-semibold text-orange-700">{currentUser.role}</span>
                        <span>•</span>
                        <span>{currentUser.identifierNumber}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 h-9"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs">Keluar</span>
                  </Button>
                </div>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setLoginError('');
                    setLoginModalOpen(true);
                  }}
                  className="gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  Masuk / Login
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation bar */}
          <div className="flex md:hidden items-center gap-1 py-2 overflow-x-auto border-t border-zinc-100 scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                activeTab === 'explore' ? 'bg-orange-500 text-white font-medium' : 'text-zinc-600'
              }`}
            >
              Jadwal Kosong
            </button>
            {currentUser && (currentUser.role === 'DOSEN' || currentUser.role === 'MAHASISWA') && (
              <button
                onClick={() => setActiveTab('my-bookings')}
                className={`px-3 py-1 rounded-full whitespace-nowrap ${
                  activeTab === 'my-bookings' ? 'bg-orange-500 text-white font-medium' : 'text-zinc-600'
                }`}
              >
                Riwayat Saya
              </button>
            )}
            {currentUser && (currentUser.role === 'STAFF' || currentUser.role === 'ADMIN') && (
              <button
                onClick={() => setActiveTab('staff-approval')}
                className={`px-3 py-1 rounded-full whitespace-nowrap ${
                  activeTab === 'staff-approval' ? 'bg-orange-500 text-white font-medium' : 'text-zinc-600'
                }`}
              >
                Approval Staff
              </button>
            )}
            {currentUser && currentUser.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('admin-panel')}
                className={`px-3 py-1 rounded-full whitespace-nowrap ${
                  activeTab === 'admin-panel' ? 'bg-orange-500 text-white font-medium' : 'text-zinc-600'
                }`}
              >
                Data Master (Admin)
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <Modal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        title="Masuk ke Sistem Kampus"
        description="Gunakan kredensial akun terdaftar untuk mengakses hak otoritas Anda"
      >
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl text-xs text-orange-950 space-y-1">
            <span className="font-bold flex items-center gap-1 text-orange-900">
              <KeyRound className="w-3.5 h-3.5" /> Kredensial Administrator:
            </span>
            <p>Username: <code className="bg-white px-1.5 py-0.5 rounded border border-orange-200 font-mono font-bold">admin</code></p>
            <p>Password: <code className="bg-white px-1.5 py-0.5 rounded border border-orange-200 font-mono font-bold">admin123</code></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-zinc-500" />
              Username / Email
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username atau email"
              className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              Kata Sandi (Password)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <Button type="button" variant="ghost" onClick={() => setLoginModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="default" disabled={isLoading}>
              {isLoading ? 'Memverifikasi...' : 'Masuk'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

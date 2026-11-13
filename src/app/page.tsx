'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ScheduleExplorer } from '@/components/ScheduleExplorer';
import { MyBookings } from '@/components/MyBookings';
import { StaffApprovalCenter } from '@/components/StaffApprovalCenter';
import { AdminPanel } from '@/components/AdminPanel';
import { useApp } from '@/context/AppContext';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('explore');
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'explore' && <ScheduleExplorer />}
        {activeTab === 'my-bookings' && <MyBookings onExploreClick={() => setActiveTab('explore')} />}
        {activeTab === 'staff-approval' && <StaffApprovalCenter />}
        {activeTab === 'admin-panel' && <AdminPanel />}
      </main>

      <footer className="bg-white border-t border-zinc-200 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Sistem Peminjaman Ruangan Kampus • Sesuai Spesifikasi PRD</p>
          <p className="text-zinc-400">
            Powered by Next.js, Tailwind CSS, Shadcn UI & Neon DB
          </p>
        </div>
      </footer>
    </div>
  );
}

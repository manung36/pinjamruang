import { User, Room, Booking } from '@/types';

// Admin single credential
export const ADMIN_USER: User = {
  id: 'u-admin-1',
  name: 'Administrator Kampus',
  email: 'admin',
  role: 'ADMIN',
  identifierNumber: 'ADM-001',
};

// Default rooms master data (real campus facilities, empty bookings)
export const DEFAULT_ROOMS: Room[] = [
  {
    id: 'r-101',
    name: 'Ruang Teori A1.1',
    capacity: 45,
    facilities: ['AC', 'Proyektor HD', 'Whiteboard', 'Sound System', 'Koneksi LAN'],
    status: 'ACTIVE',
    building: 'Gedung A (Rektorat Lama)',
    floor: 1,
    description: 'Ruang kuliah representatif cocok untuk perkuliahan umum, seminar kecil, dan sidang.',
  },
  {
    id: 'r-102',
    name: 'Ruang Teori A1.2',
    capacity: 40,
    facilities: ['AC', 'Proyektor', 'Whiteboard'],
    status: 'ACTIVE',
    building: 'Gedung A (Rektorat Lama)',
    floor: 1,
    description: 'Ruang kuliah standar dengan sirkulasi udara baik dan tata cahaya alami.',
  },
  {
    id: 'r-201',
    name: 'Laboratorium Komputer Terpadu',
    capacity: 35,
    facilities: ['35 Unit PC i7', 'AC Sentral', 'Proyektor Ultra HD', 'Gigabit Internet', 'Smart Board'],
    status: 'ACTIVE',
    building: 'Gedung B (Pusat Sains & Teknologi)',
    floor: 2,
    description: 'Lab komputer spesifikasi tinggi untuk workshop software, pemrograman, dan ujian online.',
  },
  {
    id: 'r-301',
    name: 'Auditorium Utama Prof. Soedarto',
    capacity: 250,
    facilities: ['AC Sentral', '2 Proyektor Besar', 'Sound Stage', 'Lighting System', 'Podium', 'Ruang VIP'],
    status: 'ACTIVE',
    building: 'Gedung C (Pusat Kegiatan Mahasiswa)',
    floor: 3,
    description: 'Aula berkapasitas besar untuk kuliah umum, seminar nasional, dies natalis, dan festival seni.',
  },
  {
    id: 'r-204',
    name: 'Ruang Rapat Senat B2.4',
    capacity: 25,
    facilities: ['Meja Konferensi', 'AC', 'Video Conference Set', 'Microphone Delegasi', 'Dispenser'],
    status: 'ACTIVE',
    building: 'Gedung B (Pusat Sains & Teknologi)',
    floor: 2,
    description: 'Ruang rapat formal eksekutif untuk rapat koordinasi jurusan, fakultas, dan dekanat.',
  },
  {
    id: 'r-105',
    name: 'Ruang Multimedia A1.5',
    capacity: 50,
    facilities: ['AC', 'Dual Screen Projector', 'Audio Studio Grade'],
    status: 'MAINTENANCE',
    building: 'Gedung A (Rektorat Lama)',
    floor: 1,
    description: 'Sedang dalam perbaikan sistem peredam suara dan kalibrasi unit pendingin.',
  },
];

export const DEFAULT_DATE = '2026-11-13';

// Empty bookings - no dummy booking data
export const INITIAL_BOOKINGS: Booking[] = [];

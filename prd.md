# Product Requirements Document (PRD): Sistem Peminjaman Ruangan Berbasis Web

## 1. Ringkasan Eksekutif

Aplikasi ini adalah sistem manajemen dan peminjaman ruangan berbasis web yang dirancang untuk memfasilitasi mahasiswa dan dosen dalam memesan ruangan di lingkungan kampus. Aplikasi ini menyederhanakan proses pencarian jadwal kosong, pengajuan peminjaman, hingga proses persetujuan (approval) oleh staff secara digital dan real-time.

## 2. Kebutuhan Teknologi (Tech Stack)

* **Framework:** Next.js (Disarankan menggunakan App Router untuk performa dan SEO).
* **Styling:** Tailwind CSS.
* **Komponen UI:** Shadcn UI (Aksesibilitas tinggi, dapat dikustomisasi, mendukung tema warna).
* **Database:** Neon DB (Serverless PostgreSQL).
* **ORM (Opsional namun disarankan):** Prisma atau Drizzle ORM untuk interaksi dengan Neon DB.

## 3. Target Pengguna & Hak Akses (Role)

| Role | Deskripsi & Hak Akses |
| --- | --- |
| **Admin** | Memiliki akses penuh terhadap sistem. Bertugas mengelola data master (Data Pengguna, Data Ruangan dasar, Kategori Ruangan) dan memantau log sistem. |
| **Staff** | Bertugas memanajemen ruangan. Hak akses meliputi: menyetujui (ACC) atau menolak permintaan peminjaman, menambah/mengubah ketersediaan ruangan, dan melihat laporan penggunaan ruangan. |
| **Dosen (Peminjam)** | Dapat melihat jadwal ruangan kosong, melakukan booking ruangan untuk keperluan kelas pengganti, seminar, atau rapat, dan melihat status pengajuannya. |
| **Mahasiswa (Peminjam)** | Dapat melihat jadwal ruangan kosong, melakukan booking ruangan untuk kegiatan organisasi, tugas, atau acara mahasiswa, dan melihat status pengajuannya. |

## 4. Alur Kerja (User Flow)

1. **Eksplorasi (Tanpa Login / Halaman Awal):**
Pengguna mengunjungi halaman utama (Dashboard) dan langsung disajikan tampilan jadwal (kalender/grid) yang menampilkan daftar ruangan beserta slot jam yang **kosong atau tidak dipakai** pada hari itu.
2. **Autentikasi:**
Pengguna (Mahasiswa/Dosen) melakukan login untuk dapat melakukan peminjaman.
3. **Proses Booking:**
* Pengguna memilih tanggal dan jam yang masih *available*.
* Pengguna mengisi formulir peminjaman (Tujuan peminjaman, jumlah peserta, dokumen pendukung jika diperlukan).
* Submit permintaan. Status peminjaman menjadi **"Pending"**. (Slot waktu ini dapat diatur menjadi *reserved* sementara agar tidak terjadi *double-booking*).


4. **Proses Persetujuan (Staff):**
* Staff menerima notifikasi/melihat daftar "Menunggu Persetujuan" di dashboard Staff.
* Staff melakukan tinjauan dan menekan tombol **"ACC" (Approve)** atau **"Tolak" (Reject)**.


5. **Pembaruan Status:**
* Jika di-ACC: Status ruangan pada tanggal dan jam tersebut otomatis berubah menjadi **Tidak Available (Booked)** dan hilang dari daftar slot kosong di halaman awal.
* Jika Ditolak: Slot waktu kembali berstatus *Available* dan dapat dipinjam oleh orang lain. Peminjam mendapat alasan penolakan.



## 5. Spesifikasi Fitur Utama

### A. Halaman Publik & Dashboard Peminjam

* **Live Schedule Grid:** Tabel atau kalender interaktif yang menampilkan ketersediaan ruangan secara real-time.
* **Filter & Pencarian:** Filter ruangan berdasarkan kapasitas, fasilitas (Proyektor, AC), dan rentang waktu.
* **Riwayat Peminjaman:** Halaman khusus bagi Dosen/Mahasiswa untuk melacak status booking mereka (Pending, Approved, Rejected, Selesai).

### B. Dashboard Staff (Manajemen Ruangan)

* **Approval Center:** Tabel antrean pengajuan peminjaman yang membutuhkan aksi (Approve/Reject) beserta detail kegiatan.
* **Manajemen Ruangan:** Fitur CRUD (Create, Read, Update, Delete) untuk data ruangan, termasuk mengatur jika ruangan sedang dalam perbaikan (Maintenance mode).
* **Kalender Ruangan:** Tampilan visual seluruh ruangan yang sudah di-booking dalam satu minggu/bulan.

### C. Dashboard Admin

* **User Management:** CRUD data Staff, Dosen, dan Mahasiswa (atau integrasi SSO kampus).
* **System Settings:** Pengaturan batasan waktu peminjaman (misal: maksimal peminjaman 3 hari sebelum acara).

## 6. Panduan UI/UX & Tema (Color Palette)

Aplikasi akan menggunakan antarmuka modern dan responsif yang dibangun dengan **Shadcn UI**. Skema warna utama difokuskan pada **Warna Orange dan turunannya**.

* **Primary Color (Orange Base):** `#F97316` (Tailwind `orange-500`) - Digunakan untuk tombol utama (Call to Action), aksen header, dan elemen aktif.
* **Primary Hover/Dark:** `#EA580C` (Tailwind `orange-600`) - Digunakan untuk efek hover pada tombol utama.
* **Light Orange (Background/Accent):** `#FFEDD5` (Tailwind `orange-100`) - Digunakan untuk *badge* status, *highlight* slot jadwal kosong, atau latar belakang section tertentu.
* **Neutral/Background:** `#FAFAFA` (Zinc-50) atau `#FFFFFF` untuk menjaga tampilan tetap bersih sehingga warna orange bisa menonjol.
* **Typography:** Inter atau Geist (Bawaan Next.js) untuk kesan profesional dan tingkat keterbacaan tinggi.
* **Komponen Shadcn yang digunakan:** `Button`, `DataTable` (untuk daftar booking), `Calendar` & `DatePicker`, `Dialog/Modal` (untuk form booking), `Card` (untuk menampilkan info ruangan), `Badge` (untuk status: Pending, Approved).

## 7. Struktur Database Dasar (Neon DB - PostgreSQL)

Berikut adalah gambaran relasi entitas dasar yang perlu diimplementasikan:

1. **Table `Users**`
* `id` (UUID, PK)
* `name` (String)
* `email` (String, Unique)
* `role` (Enum: 'ADMIN', 'STAFF', 'DOSEN', 'MAHASISWA')
* `password_hash` (String)


2. **Table `Rooms**`
* `id` (UUID, PK)
* `name` (String) - *Contoh: Ruang A1.1*
* `capacity` (Int)
* `facilities` (Text/Array)
* `status` (Enum: 'ACTIVE', 'MAINTENANCE')


3. **Table `Bookings**`
* `id` (UUID, PK)
* `user_id` (UUID, FK to Users)
* `room_id` (UUID, FK to Rooms)
* `start_time` (Timestamp)
* `end_time` (Timestamp)
* `purpose` (Text)
* `status` (Enum: 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')
* `approved_by` (UUID, FK to Users - Staff ID, Nullable)
* `created_at` (Timestamp)



*Catatan: Saat melakukan query di Halaman Awal untuk menampilkan slot kosong, sistem akan melakukan filter pada rentang waktu jam operasional kampus yang TIDAK memiliki relasi di tabel `Bookings` dengan status `APPROVED`.*
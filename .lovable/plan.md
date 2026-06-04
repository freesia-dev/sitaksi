## Modul Monitoring Debitur

Menu baru "Monitoring" untuk mencatat kunjungan ke debitur (calon, aktif, menunggak, restrukturisasi) lengkap dengan Berita Acara Kunjungan PDF berkop & TTD, dashboard statistik, dan reminder jadwal kunjungan.

### 1. Sidebar & Routing
- Tambahkan grup menu **Monitoring** di `src/components/layout/Sidebar.tsx` (icon `ClipboardCheck`) dengan sub-menu:
  - Daftar Kunjungan (`/monitoring`)
  - Jadwal & Reminder (`/monitoring/jadwal`)
  - Dashboard Monitoring (`/monitoring/dashboard`)
- Register route lazy di `src/App.tsx`. Semua role (Officer, Admin, Pimpinan) bisa akses.

### 2. Database (1 migrasi)
Tabel **`monitoring_kunjungan`** (kolom domain):
- `kategori` enum: `prospek` | `aktif` | `menunggak` | `restrukturisasi`
- `tanggal_kunjungan`, `jam_kunjungan`
- `nama_debitur`, `no_rekening`, `no_hp`, `alamat`
- `plafond`, `baki_debet`, `tunggakan_pokok`, `tunggakan_bunga`, `hari_tunggakan`
- `tujuan_kunjungan`, `kondisi_usaha`, `kondisi_agunan`, `hasil_kunjungan`
- `rencana_tindak_lanjut`, `komitmen_bayar_nominal`, `komitmen_bayar_tanggal`
- `foto_kunjungan` (text[] path Storage)
- `taksasi_id` (nullable, link ke `taksasi`)
- `officer_nama`, `pimpinan_nama` (snapshot TTD)
- `status` enum: `draft` | `final`
- `user_id`, `created_at`, `updated_at`
- Index: `(user_id)`, `(kategori)`, `(tanggal_kunjungan)`
- GRANT untuk `authenticated` + `service_role`; RLS: semua user authenticated boleh `SELECT/INSERT/UPDATE/DELETE` (sesuai jawaban "semua user").
- Trigger `update_updated_at_column`.

Tabel **`monitoring_jadwal`** (reminder):
- `tanggal_rencana`, `jam_rencana`, `nama_debitur`, `no_rekening`, `kategori`, `keterangan`, `status` (`scheduled`|`done`|`canceled`), `user_id`.
- Sama-sama RLS authenticated.

Storage bucket baru: **`monitoring`** (public) untuk foto kunjungan.

### 3. Halaman & Komponen
- `src/pages/monitoring/MonitoringList.tsx` — tabel dengan filter kategori + search + tombol "Tambah Kunjungan" & "Cetak BA".
- `src/pages/monitoring/MonitoringForm.tsx` — form tambah/edit kunjungan; tab: Data Debitur → Hasil Kunjungan → Tindak Lanjut → Foto.
- `src/pages/monitoring/MonitoringDetail.tsx` — preview A4 + tombol Edit Preview & Cetak (pakai `A4PageWrapper` yang sudah ada).
- `src/pages/monitoring/MonitoringJadwal.tsx` — list jadwal kunjungan + tombol tandai selesai; badge merah untuk yang lewat tanggal.
- `src/pages/monitoring/MonitoringDashboard.tsx` — stat cards (total kunjungan bulan ini, per kategori, per officer) + chart bar bulanan + chart pie kategori (pakai `recharts`).

### 4. Komponen Export PDF
`src/components/export/ExportBeritaAcaraKunjungan.tsx`:
- **KOP**: logo Bankaltimtara + "PT. BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA — KCP TELIHAN" + alamat (mengikuti style cover yang ada).
- Judul: **BERITA ACARA KUNJUNGAN DEBITUR** + nomor BA otomatis (`BA-MON/{YYYY}/{MM}/{seq}`).
- Section: Identitas Debitur (tabel) → Data Kredit (plafond/baki debet/tunggakan) → Hasil Kunjungan & Kondisi Usaha → Foto Dokumentasi (grid 2 kolom) → Rencana Tindak Lanjut & Komitmen Bayar.
- Footer TTD 2 kolom: **Officer Relationship Kredit** (kiri) & **Pimpinan KCP Telihan** (kanan), nama di-pull dari form.
- Bungkus di `A4PageWrapper` agar konsisten dengan modul taksasi; reuse pola `handlePrint` dari `DetailTaksasi.tsx`.

### 5. Dashboard Monitoring (fitur tambahan yang dipilih)
- Stat cards: Total Kunjungan, Kunjungan Bulan Ini, Menunggak, Komitmen Bayar Terkumpul (Rp).
- Bar chart: kunjungan per bulan (12 bulan terakhir).
- Pie chart: distribusi kategori kunjungan.
- Table top 5 officer paling aktif.

### 6. Reminder & Jadwal (fitur tambahan yang dipilih)
- Halaman jadwal dengan kalender sederhana (list per minggu).
- Badge notifikasi di sidebar item "Monitoring" jika ada jadwal hari ini / tertunggak.
- Optional ringan: query `monitoring_jadwal` di Dashboard utama untuk widget "Kunjungan Hari Ini".

### 7. Detail Teknis
- Form pakai `react-hook-form` + `zod` (pola sama dengan `TaksasiTanah.tsx`).
- Format mata uang pakai `CurrencyInput` yang sudah ada.
- Foto upload pakai `CloudImageUploader` (bucket `monitoring`).
- Print/PDF pakai window.print + style print yang sudah dipoles di `DetailTaksasi.tsx` (extract jadi util `src/lib/printA4.ts` agar reusable).
- Tipe TypeScript baru di `src/types/index.ts`: `MonitoringKunjungan`, `MonitoringJadwal`, `KategoriKunjungan`.

### File Plan
**Baru:** `src/pages/monitoring/{MonitoringList,MonitoringForm,MonitoringDetail,MonitoringJadwal,MonitoringDashboard}.tsx`, `src/components/export/ExportBeritaAcaraKunjungan.tsx`, `src/lib/printA4.ts`, migrasi DB, bucket `monitoring`.
**Diubah:** `src/App.tsx`, `src/components/layout/Sidebar.tsx`, `src/types/index.ts`, `src/pages/Dashboard.tsx` (widget reminder), `src/pages/DetailTaksasi.tsx` (refactor pakai `printA4.ts`).

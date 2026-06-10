# Rencana: Restruktur Menu + Grup "Laporan RKO"

## 1. Sidebar
- Pindahkan **Riwayat** ke grup **Taksasi** (posisi paling bawah dalam grup, setelah Kendaraan).
- Tambah grup baru **Laporan RKO** (icon: FileBarChart) berisi:
  - Laporan Subrogasi
  - Laporan PL to NPL

## 2. Database (3 tabel baru)

**a. `subrogasi_debitur`** — master debitur subrogasi (sekali input, dipakai ulang tiap bulan)
- nama_debitur, no_loan, produk, nik, no_premi_asuransi, no_perjanjian_kredit, nilai_subrogasi, tahun_pencairan, nama_cabang
- field statis: jarang berubah

**b. `subrogasi_laporan`** — header laporan per bulan
- periode (YYYY-MM), nama_kantor, tanggal_laporan, created_by

**c. `subrogasi_laporan_item`** — baris per debitur per bulan
- laporan_id → subrogasi_laporan
- debitur_id → subrogasi_debitur
- field yang berubah tiap bulan: tanggal_pembayaran, akumulasi_pembayaran, sisa_subrogasi (auto = nilai − akumulasi), konfirmasi_asuransi, konfirmasi_cabang, hasil_kesepakatan

**d. `mlf_snapshot`** — data MLF terakhir di-upload (sekali per upload, replace seluruh data)
- Field: jobdate, l0lnno (no_loan), kol, l0name (nama), l0narr (no_pk), date, date1, l0rstl (no_rek), pla (plafon), baki, tungpk, tungbg, lytitl (jenis kredit), brname (cabang)
- Index pada l0lnno + l0name untuk pencarian cepat
- Tabel di-truncate & re-insert saat upload baru

**e. `pl_to_npl_laporan`** — laporan PL to NPL
- periode, mlf_jobdate (tanggal data MLF yang dipakai), created_by

**f. `pl_to_npl_item`** — debitur yang diproyeksikan masuk NPL
- laporan_id, snapshot semua field MLF + proyeksi_tw (TW1/TW2/TW3/TW4), alasan_masuk_npl

Semua tabel di-RLS: authenticated + is_approved bisa CRUD miliknya sendiri; Admin/Pimpinan bisa lihat semua.

## 3. Halaman & Alur

### Laporan Subrogasi (`/laporan-rko/subrogasi`)
- **List**: daftar laporan per bulan (Periode, Jumlah Debitur, Total Sisa, Aksi: Edit / Export / Hapus)
- **Form Baru**:
  - Pilih periode (bulan/tahun) + nama kantor (default: KCP Telihan)
  - Tabel item: tombol **+ Pilih Debitur** → modal dengan Combobox cari debitur eksisting + tombol "Tambah Debitur Baru" (buka form input lengkap)
  - Saat pilih debitur eksisting → field statis auto-isi, user tinggal isi field bulanan
  - Sisa Subrogasi = Nilai − Akumulasi (auto)
- **Export Excel**: replikasi layout file contoh (header 4 baris, kolom 1-16, footer "Bontang, [tgl] / PT. BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA / KANTOR CABANG PEMBANTU TELIHAN")

### Laporan PL to NPL (`/laporan-rko/pl-to-npl`)
- **Upload MLF**: tombol di pojok kanan atas — upload .xls/.xlsx → parse sheet `Master_Loan_Filter` → simpan ke `mlf_snapshot` (replace). Tampilkan info: "Data MLF terakhir: [tanggal JOBDATE], [jumlah] debitur"
- **List laporan**: per periode (Q1-2026, Q2-2026, dst)
- **Form Baru**:
  - Pilih periode laporan
  - Tabel item dengan tombol **+ Tambah Debitur**:
    - Combobox search by nama/no loan dari mlf_snapshot
    - Pilih → semua field MLF (no_loan, kol, nama, no_pk, tgl_mulai, tgl_mature, no_rek, plafon, baki, tunggakan pokok, tunggakan bunga, jenis kredit) auto-fill (read-only, snapshot)
    - User isi: Proyeksi (dropdown TW1/TW2/TW3/TW4) + Alasan masuk NPL (textarea)
- **Export Excel**: tabel dengan kolom sesuai 14 field yang diminta user

## 4. Output format
- Subrogasi: Excel (.xlsx) sesuai template — pakai library `xlsx` (sudah terpakai di project? cek dulu) atau implementasi via export ke .xlsx baru. Header kop + footer tanda tangan diikutkan.
- PL to NPL: Excel (.xlsx) dengan header sederhana.
- (PDF bisa ditambah nanti kalau perlu — fokus Excel dulu karena ini laporan internal yang biasanya diolah lagi)

## 5. Library
- Cek `package.json` apakah sudah ada `xlsx`. Jika belum, install `xlsx` (SheetJS) untuk:
  - Parse MLF di client (upload → parse → kirim ke backend)
  - Generate Excel export

## 6. Routing (`src/App.tsx`)
- `/laporan-rko/subrogasi` → list
- `/laporan-rko/subrogasi/new`, `/laporan-rko/subrogasi/edit/:id`
- `/laporan-rko/pl-to-npl` → list  
- `/laporan-rko/pl-to-npl/new`, `/laporan-rko/pl-to-npl/edit/:id`

## Catatan
- Subrogasi: dirancang supaya bulan ke-2 dst hanya pilih debitur lama + isi 4-5 field yang berubah. Bulan pertama input lengkap.
- MLF di-upload sekali, semua laporan PL-to-NPL bulan berikutnya tinggal pakai data MLF terbaru.
- Aku akan pakai format Excel saja untuk export (sesuai dengan workflow yang ada di file contohmu). Kalau nanti perlu PDF, tinggal ditambahkan.

Bilang **lanjut** kalau setuju, atau koreksi bagian yang perlu diubah.

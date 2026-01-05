export type UserRole = 'Admin' | 'Pimpinan' | 'Officer';

export interface User {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
}

export type JenisAgunan = 'Tanah' | 'Tanah & Bangunan' | 'Kendaraan';

export type StatusOtorisasi = 'Menunggu' | 'Disetujui' | 'Ditolak';

export interface DetailAgunanTanah {
  luas_tanah: number;
  harga_per_meter: number;
}

export interface DetailAgunanTB {
  luas_tanah: number;
  harga_tanah_per_meter: number;
  luas_bangunan: number;
  harga_bangunan_per_meter: number;
}

export interface HargaPembanding {
  harga: number;
  sumber: string;
}

export interface DokumentasiAgunan {
  tampak_depan?: string;
  tampak_belakang?: string;
  tampak_samping_kiri?: string;
  tampak_samping_kanan?: string;
  speedometer?: string;
  nomor_rangka?: string;
  nomor_mesin?: string;
  foto_lainnya?: string[];
}

export interface DetailAgunanKendaraan {
  jenis: string;
  merk: string;
  model: string;
  tahun: number;
  nomor_polisi: string;
  nomor_mesin: string;
  nomor_rangka: string;
  buatan: string;
  bukti_kepemilikan: string;
  nomor_bukti_kepemilikan: string;
  tanggal_bukti_kepemilikan: string;
  nama_kepemilikan: string;
  kondisi_unit: 'Terawat' | 'Tidak Terawat';
  harga_pasar: number;
  harga_pembanding: HargaPembanding[];
  keterangan: string[];
  dokumentasi?: DokumentasiAgunan;
}

export type DetailAgunan = DetailAgunanTanah | DetailAgunanTB | DetailAgunanKendaraan;

export interface TimPenilai {
  nama: string;
  jabatan: string;
}

export interface Taksasi {
  id: string;
  id_user: string;
  nomor_dokumen: string;
  jenis_agunan: JenisAgunan;
  nama_nasabah: string;
  alamat: string;
  nilai_pasar: number;
  nilai_taksasi: number;
  nilai_taksasi_pembulatan: number;
  nilai_likuidasi: number;
  nilai_likuidasi_pembulatan: number;
  safety_margin: number;
  terbilang: string;
  status_otorisasi: StatusOtorisasi;
  catatan_pimpinan?: string;
  detail_agunan: DetailAgunan;
  tanggal: string;
  petugas: string;
  jabatan_petugas: string;
  kantor_cabang: string;
  alamat_cabang: string;
  pimpinan: string;
  jabatan_pimpinan: string;
  tim_penilai: TimPenilai[];
}

// Calculation formulas based on the documents
export const FORMULAS = {
  tanah: {
    // Nilai Taksasi = Luas Tanah × Harga per m²
    // Nilai Likuidasi = Nilai Taksasi × 80%
    calculateTaksasi: (luasTanah: number, hargaPerMeter: number) => luasTanah * hargaPerMeter,
    likuidasiRatio: 0.8,
    safetyMargin: 20,
  },
  tanahBangunan: {
    // Nilai Taksasi = (Luas Tanah × Harga Tanah/m²) + (Luas Bangunan × Harga Bangunan/m²)
    // Nilai Likuidasi = Nilai Taksasi × 80%
    calculateTaksasi: (
      luasTanah: number,
      hargaTanahPerMeter: number,
      luasBangunan: number,
      hargaBangunanPerMeter: number
    ) => (luasTanah * hargaTanahPerMeter) + (luasBangunan * hargaBangunanPerMeter),
    likuidasiRatio: 0.8,
    safetyMargin: 20,
  },
  kendaraan: {
    // Nilai Taksasi = Rata-rata Harga Pasar (dari pembanding)
    // Nilai Likuidasi = Nilai Taksasi × 75% (Safety Margin 25%)
    calculateTaksasi: (hargaPembanding: number[]) => {
      if (hargaPembanding.length === 0) return 0;
      return hargaPembanding.reduce((a, b) => a + b, 0) / hargaPembanding.length;
    },
    likuidasiRatio: 0.75,
    safetyMargin: 25,
    // Pembulatan ke jutaan terdekat (ke bawah)
    pembulatan: (nilai: number) => Math.floor(nilai / 1000000) * 1000000,
    // Pembulatan ke ratusan ribu terdekat
    pembulatanRatusan: (nilai: number) => Math.floor(nilai / 100000) * 100000,
  },
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCurrencyWithDecimals = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatDateWithDay = (date: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

// Terbilang (number to words in Indonesian)
const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

export const terbilang = (nilai: number): string => {
  if (nilai < 12) return satuan[nilai];
  if (nilai < 20) return satuan[nilai - 10] + ' Belas';
  if (nilai < 100) return satuan[Math.floor(nilai / 10)] + ' Puluh ' + satuan[nilai % 10];
  if (nilai < 200) return 'Seratus ' + terbilang(nilai - 100);
  if (nilai < 1000) return satuan[Math.floor(nilai / 100)] + ' Ratus ' + terbilang(nilai % 100);
  if (nilai < 2000) return 'Seribu ' + terbilang(nilai - 1000);
  if (nilai < 1000000) return terbilang(Math.floor(nilai / 1000)) + ' Ribu ' + terbilang(nilai % 1000);
  if (nilai < 1000000000) return terbilang(Math.floor(nilai / 1000000)) + ' Juta ' + terbilang(nilai % 1000000);
  if (nilai < 1000000000000) return terbilang(Math.floor(nilai / 1000000000)) + ' Miliar ' + terbilang(nilai % 1000000000);
  return terbilang(Math.floor(nilai / 1000000000000)) + ' Triliun ' + terbilang(nilai % 1000000000000);
};

export const formatTerbilang = (nilai: number): string => {
  if (nilai === 0) return 'Nol Rupiah';
  return terbilang(nilai).replace(/\s+/g, ' ').trim() + ' Rupiah';
};

// Generate document number
export const generateNomorDokumen = (cabang: string = 'TLH'): string => {
  const now = new Date();
  const bulanRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const random = Math.floor(Math.random() * 1000);
  return `${random}/F-3/BPD-${cabang}/${bulanRomawi[now.getMonth()]}/${now.getFullYear()}`;
};

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

export interface DetailAgunanKendaraan {
  jenis: string;
  merk: string;
  model: string;
  tahun: number;
  nomor_polisi: string;
  nomor_mesin?: string;
  nomor_rangka?: string;
  harga_pasar: number;
  harga_pembanding: {
    harga: number;
    sumber: string;
  }[];
}

export type DetailAgunan = DetailAgunanTanah | DetailAgunanTB | DetailAgunanKendaraan;

export interface Taksasi {
  id: string;
  id_user: string;
  jenis_agunan: JenisAgunan;
  nama_nasabah: string;
  alamat: string;
  nilai_pasar: number;
  nilai_taksasi: number;
  nilai_likuidasi: number;
  status_otorisasi: StatusOtorisasi;
  catatan_pimpinan?: string;
  foto_agunan?: string[];
  detail_agunan: DetailAgunan;
  tanggal: string;
  petugas: string;
}

// Calculation formulas based on the documents
export const FORMULAS = {
  tanah: {
    // Nilai Taksasi = Luas Tanah × Harga per m²
    // Nilai Likuidasi = Nilai Taksasi × 80%
    calculateTaksasi: (luasTanah: number, hargaPerMeter: number) => luasTanah * hargaPerMeter,
    likuidasiRatio: 0.8,
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
  },
  kendaraan: {
    // Nilai Taksasi = Rata-rata Harga Pasar (dari pembanding)
    // Nilai Likuidasi = Nilai Taksasi × 75% (Safety Margin 25%)
    calculateTaksasi: (hargaPembanding: number[]) => {
      if (hargaPembanding.length === 0) return 0;
      return hargaPembanding.reduce((a, b) => a + b, 0) / hargaPembanding.length;
    },
    likuidasiRatio: 0.75,
    // Pembulatan ke ribuan terdekat (ke bawah)
    pembulatan: (nilai: number) => Math.floor(nilai / 1000000) * 1000000,
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

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

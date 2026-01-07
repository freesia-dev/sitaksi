export type UserRole = 'Admin' | 'Pimpinan' | 'Officer';

export interface User {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
}

export type JenisAgunan = 'Tanah' | 'Tanah & Bangunan' | 'Kendaraan';

export type StatusTaksasi = 'Selesai';

// Legacy type for backward compatibility
export type StatusOtorisasi = StatusTaksasi;

// ============ TANAH TYPES ============
export interface HargaPembandingTanah {
  harga: number;
  sumber: string;
}

// Simple legacy type for backward compatibility
export interface DetailAgunanTanahSimple {
  luas_tanah: number;
  harga_per_meter: number;
}

export interface SafetyMarginTanah {
  lokasi_daerah: { kondisi: string; margin: number };
  topography: { kondisi: string; margin: number };
  ukuran_bentuk: { kondisi: string; margin: number };
  bukti_kepemilikan: { kondisi: string; margin: number };
  lingkungan_sekitar: { kondisi: string; margin: number };
  permasalahan: { kondisi: string; margin: number };
}

export interface DetailAgunanTanah {
  // Profil
  bukti_kepemilikan: string;
  nomor_bukti: string;
  tanggal_bukti: string;
  masa_berlaku: string;
  nama_pemegang_hak: string;
  hubungan_dengan_debitur: string;
  nomor_gambar_situasi: string;
  nomor_induk_bidang: string;
  luas_tanah: number;
  tempat_didaftarkan: string;

  // Hasil Pemeriksaan Fisik
  letak_tanah: string;
  bentuk_tanah: string;
  luas_tanah_fisik: number;
  arah_menghadap: string;
  lebar_jalan_depan: string;
  bahan_jalan: string;
  batas_depan: string;
  batas_belakang: string;
  batas_kanan: string;
  batas_kiri: string;
  keterangan_fisik: string;

  // Analisa Lingkungan
  kondisi_lalu_lintas: string;
  kelas_jalan: string;
  listrik_pln: string;
  air_bersih: string;
  saluran_telepon: string;
  fasilitas_penunjang: string[];
  keterangan_lingkungan: string;

  // Harga Pasar
  harga_pembanding: HargaPembandingTanah[];

  // Safety Margin
  safety_margin_details: SafetyMarginTanah;
}

// ============ BANGUNAN TYPES ============
export interface SafetyMarginBangunan {
  design: { kondisi: string; margin: number };
  umur: { kondisi: string; margin: number };
  peruntukkan: { kondisi: string; margin: number };
  imb: { kondisi: string; margin: number };
  kesesuaian_lahan: { kondisi: string; margin: number };
  permasalahan: { kondisi: string; margin: number };
}

export interface DetailBangunan {
  id: string;
  peruntukkan: string;
  
  // Profil IMB
  imb_ada: boolean;
  nomor_imb: string;
  tanggal_imb: string;
  nama_di_imb: string;
  luas_sesuai_imb: number;
  tinggi_sesuai_imb: number;

  // Hasil Pemeriksaan Fisik
  konstruksi: string;
  pondasi: string;
  tinggi_lantai: number;
  atap: string;
  dinding: string;
  plester_dinding: boolean;
  plafon: string;
  lantai: string;
  tiang: string;
  luas_bangunan: number;
  keterangan_fisik: string;

  // Harga Pasar
  harga_pembanding: HargaPembandingTanah[];

  // Safety Margin
  safety_margin_details: SafetyMarginBangunan;

  // Calculated values
  harga_rata_rata: number;
  nilai_pasar: number;
  nilai_likuidasi: number;
}

// Simple legacy type for backward compatibility
export interface DetailAgunanTBSimple {
  luas_tanah: number;
  harga_tanah_per_meter: number;
  luas_bangunan: number;
  harga_bangunan_per_meter: number;
}

export interface DetailAgunanTB {
  // Data Tanah
  tanah?: DetailAgunanTanah;
  
  // Multiple Bangunan
  bangunan_list?: DetailBangunan[];
  
  // Legacy fields for backward compatibility
  luas_tanah: number;
  harga_tanah_per_meter: number;
  luas_bangunan: number;
  harga_bangunan_per_meter: number;
}

// ============ KENDARAAN TYPES ============
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
  dokumentasi_urls?: string[];
}

export type DetailAgunan = DetailAgunanTanah | DetailAgunanTanahSimple | DetailAgunanTB | DetailAgunanTBSimple | DetailAgunanKendaraan;

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
  marketability?: string;
  catatan_marketability?: string[];
  dokumentasi?: DokumentasiAgunan;
}

// Calculation formulas based on the documents
export const FORMULAS = {
  tanah: {
    // Nilai Taksasi = Luas Tanah × Harga per m²
    // Nilai Likuidasi = Nilai Taksasi × Safety Margin
    calculateTaksasi: (luasTanah: number, hargaPerMeter: number) => luasTanah * hargaPerMeter,
    calculateHargaRataRata: (hargaPembanding: number[]) => {
      if (hargaPembanding.length === 0) return 0;
      return hargaPembanding.reduce((a, b) => a + b, 0) / hargaPembanding.length;
    },
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
    calculateHargaRataRata: (hargaPembanding: number[]) => {
      if (hargaPembanding.length === 0) return 0;
      return hargaPembanding.reduce((a, b) => a + b, 0) / hargaPembanding.length;
    },
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

// Generate document number with user-provided number
export const generateNomorDokumen = (cabang: string = 'TLH', nomorInput?: string): string => {
  const now = new Date();
  const bulanRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const nomor = nomorInput ? nomorInput.padStart(3, '0') : Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${nomor}/F-3/BPD-${cabang}/${bulanRomawi[now.getMonth()]}/${now.getFullYear()}`;
};

// Calculate average safety margin
export const calculateAverageSafetyMargin = (margins: { margin: number }[]): number => {
  if (margins.length === 0) return 80;
  const total = margins.reduce((acc, item) => acc + item.margin, 0);
  return Math.round(total / margins.length);
};

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

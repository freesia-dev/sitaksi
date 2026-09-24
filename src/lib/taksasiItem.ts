/**
 * Satu sumber untuk bidang tanah & bangunan di form taksasi:
 * bentuk isian form, nilai awal, rumus hitung, dan konversi ke/dari data
 * yang disimpan di taksasi.detail_agunan.
 *
 * Dulu tiap form (Tanah, Tanah & Bangunan, dan versi edit masing-masing)
 * menyalin semua ini sendiri-sendiri, sehingga rumus dan kolom yang disimpan
 * bisa berbeda antar form.
 */
import { generateId, TanahItemData, BangunanItemData } from '@/types';
import { SAFETY_MARGIN_TANAH, SAFETY_MARGIN_BANGUNAN, getMarginByValue } from '@/lib/safetyMarginConfig';

export interface TanahItem {
  id: string;
  bukti_kepemilikan: string;
  nomor_bukti: string;
  tanggal_bukti: string;
  masa_berlaku: string;
  nama_pemegang_hak: string;
  hubungan_dengan_debitur: string;
  nomor_gambar_situasi: string;
  nomor_induk_bidang: string;
  luas_tanah: string;
  tempat_didaftarkan: string;
  lokasi: string;
  letak_tanah: string;
  bentuk_tanah: string;
  arah_menghadap: string;
  lebar_jalan_depan: string;
  bahan_jalan: string;
  batas_depan: string;
  batas_belakang: string;
  batas_kanan: string;
  batas_kiri: string;
  kondisi_lalu_lintas: string;
  kelas_jalan: string;
  listrik_pln: string;
  air_bersih: string;
  saluran_telepon: string;
  fasilitas_penunjang: string[];
  harga_pembanding_1: string;
  sumber_1: string;
  harga_pembanding_2: string;
  sumber_2: string;
  harga_pembanding_3: string;
  sumber_3: string;
  safety_lokasi: string;
  safety_topography: string;
  safety_ukuran: string;
  safety_bukti: string;
  safety_lingkungan: string;
  safety_permasalahan: string;
}

export interface BangunanItem {
  id: string;
  peruntukkan: string;
  imb_ada: boolean;
  nomor_imb: string;
  tanggal_imb: string;
  nama_di_imb: string;
  luas_sesuai_imb: string;
  tinggi_sesuai_imb: string;
  konstruksi: string;
  pondasi: string;
  tinggi_lantai: string;
  atap: string;
  dinding: string;
  plester_dinding: boolean;
  plafon: string;
  lantai: string;
  tiang: string;
  luas_bangunan: string;
  keterangan: string;
  harga_pembanding_1: string;
  sumber_1: string;
  harga_pembanding_2: string;
  sumber_2: string;
  harga_pembanding_3: string;
  sumber_3: string;
  safety_design: string;
  safety_umur: string;
  safety_peruntukkan: string;
  safety_imb: string;
  safety_kesesuaian: string;
  safety_permasalahan: string;
}

export const buatTanah = (): TanahItem => ({
  id: generateId(),
  bukti_kepemilikan: 'hak_milik',
  nomor_bukti: '',
  tanggal_bukti: '',
  masa_berlaku: '',
  nama_pemegang_hak: '',
  hubungan_dengan_debitur: 'milik_sendiri',
  nomor_gambar_situasi: '',
  nomor_induk_bidang: '',
  luas_tanah: '',
  tempat_didaftarkan: '',
  lokasi: '',
  letak_tanah: 'normal',
  bentuk_tanah: 'beraturan',
  arah_menghadap: 'utara',
  lebar_jalan_depan: '',
  bahan_jalan: 'aspal',
  batas_depan: '',
  batas_belakang: '',
  batas_kanan: '',
  batas_kiri: '',
  kondisi_lalu_lintas: '',
  kelas_jalan: 'kampung',
  listrik_pln: '',
  air_bersih: 'ada',
  saluran_telepon: 'tidak_ada',
  fasilitas_penunjang: [],
  harga_pembanding_1: '',
  sumber_1: '',
  harga_pembanding_2: '',
  sumber_2: '',
  harga_pembanding_3: '',
  sumber_3: '',
  safety_lokasi: 'cukup_strategis',
  safety_topography: 'datar',
  safety_ukuran: 'ideal',
  safety_bukti: 'hak_milik',
  safety_lingkungan: 'prospek_berkembang',
  safety_permasalahan: 'aman',
});

export const buatBangunan = (): BangunanItem => ({
  id: generateId(),
  peruntukkan: 'rumah_tinggal',
  imb_ada: false,
  nomor_imb: '',
  tanggal_imb: '',
  nama_di_imb: '',
  luas_sesuai_imb: '',
  tinggi_sesuai_imb: '',
  konstruksi: 'permanent',
  pondasi: 'beton',
  tinggi_lantai: '1',
  atap: 'genteng',
  dinding: 'batu_bata',
  plester_dinding: true,
  plafon: 'gypsum',
  lantai: 'keramik',
  tiang: 'beton',
  luas_bangunan: '',
  keterangan: '',
  harga_pembanding_1: '',
  sumber_1: '',
  harga_pembanding_2: '',
  sumber_2: '',
  harga_pembanding_3: '',
  sumber_3: '',
  safety_design: 'semi_modern',
  safety_umur: 'muda',
  safety_peruntukkan: 'non_produktif',
  safety_imb: 'tidak_ada_non_produktif',
  safety_kesesuaian: 'ideal',
  safety_permasalahan: 'aman',
});

// ---------------------------------------------------------------------------
// Rumus
// ---------------------------------------------------------------------------

export interface HasilItem {
  nilai_pasar: number;
  nilai_likuidasi: number;
  avg_safety: number;
}

const rataRata = (angka: string[]) => {
  const list = angka.map((a) => parseFloat(a) || 0).filter((h) => h > 0);
  return list.length > 0 ? list.reduce((a, b) => a + b, 0) / list.length : 0;
};

/** Nilai pasar = luas × rata-rata harga pembanding; likuidasi = pasar × rata-rata safety margin */
export const hitungTanah = (t: TanahItem): HasilItem => {
  const nilaiPasar = (parseFloat(t.luas_tanah) || 0) * rataRata([t.harga_pembanding_1, t.harga_pembanding_2, t.harga_pembanding_3]);
  const margins = [
    getMarginByValue(SAFETY_MARGIN_TANAH.lokasi_daerah, t.safety_lokasi),
    getMarginByValue(SAFETY_MARGIN_TANAH.topography, t.safety_topography),
    getMarginByValue(SAFETY_MARGIN_TANAH.ukuran_bentuk, t.safety_ukuran),
    getMarginByValue(SAFETY_MARGIN_TANAH.bukti_kepemilikan, t.safety_bukti),
    getMarginByValue(SAFETY_MARGIN_TANAH.lingkungan_sekitar, t.safety_lingkungan),
    getMarginByValue(SAFETY_MARGIN_TANAH.permasalahan, t.safety_permasalahan),
  ];
  const avgSafety = margins.reduce((a, b) => a + b, 0) / margins.length / 100;
  return { nilai_pasar: nilaiPasar, nilai_likuidasi: nilaiPasar * avgSafety, avg_safety: avgSafety * 100 };
};

export const hitungBangunan = (b: BangunanItem): HasilItem => {
  const nilaiPasar = (parseFloat(b.luas_bangunan) || 0) * rataRata([b.harga_pembanding_1, b.harga_pembanding_2, b.harga_pembanding_3]);
  const margins = [
    getMarginByValue(SAFETY_MARGIN_BANGUNAN.design, b.safety_design),
    getMarginByValue(SAFETY_MARGIN_BANGUNAN.umur, b.safety_umur),
    getMarginByValue(SAFETY_MARGIN_BANGUNAN.peruntukkan, b.safety_peruntukkan),
    getMarginByValue(SAFETY_MARGIN_BANGUNAN.imb, b.safety_imb),
    getMarginByValue(SAFETY_MARGIN_BANGUNAN.kesesuaian_lahan, b.safety_kesesuaian),
    getMarginByValue(SAFETY_MARGIN_BANGUNAN.permasalahan, b.safety_permasalahan),
  ];
  const avgSafety = margins.reduce((a, b) => a + b, 0) / margins.length / 100;
  return { nilai_pasar: nilaiPasar, nilai_likuidasi: nilaiPasar * avgSafety, avg_safety: avgSafety * 100 };
};

// ---------------------------------------------------------------------------
// Form ⇄ data tersimpan
// ---------------------------------------------------------------------------

const pembanding = (h1: string, s1: string, h2: string, s2: string, h3: string, s3: string) =>
  [
    { harga: parseFloat(h1) || 0, sumber: s1 },
    { harga: parseFloat(h2) || 0, sumber: s2 },
    { harga: parseFloat(h3) || 0, sumber: s3 },
  ].filter((h) => h.harga > 0);

export const tanahKeData = (t: TanahItem): TanahItemData => ({
  bukti_kepemilikan: t.bukti_kepemilikan,
  nomor_bukti: t.nomor_bukti,
  tanggal_bukti: t.tanggal_bukti,
  masa_berlaku: t.masa_berlaku,
  nama_pemegang_hak: t.nama_pemegang_hak,
  hubungan_dengan_debitur: t.hubungan_dengan_debitur,
  nomor_gambar_situasi: t.nomor_gambar_situasi,
  nomor_induk_bidang: t.nomor_induk_bidang,
  luas_tanah: parseFloat(t.luas_tanah) || 0,
  tempat_didaftarkan: t.tempat_didaftarkan,
  lokasi: t.lokasi,
  letak_tanah: t.letak_tanah,
  bentuk_tanah: t.bentuk_tanah,
  arah_menghadap: t.arah_menghadap,
  lebar_jalan_depan: t.lebar_jalan_depan,
  bahan_jalan: t.bahan_jalan,
  batas_depan: t.batas_depan,
  batas_belakang: t.batas_belakang,
  batas_kanan: t.batas_kanan,
  batas_kiri: t.batas_kiri,
  kondisi_lalu_lintas: t.kondisi_lalu_lintas,
  kelas_jalan: t.kelas_jalan,
  listrik_pln: t.listrik_pln,
  air_bersih: t.air_bersih,
  saluran_telepon: t.saluran_telepon,
  fasilitas_penunjang: t.fasilitas_penunjang,
  harga_pembanding: pembanding(t.harga_pembanding_1, t.sumber_1, t.harga_pembanding_2, t.sumber_2, t.harga_pembanding_3, t.sumber_3),
  safety_margins: {
    lokasi: t.safety_lokasi,
    topography: t.safety_topography,
    ukuran: t.safety_ukuran,
    bukti: t.safety_bukti,
    lingkungan: t.safety_lingkungan,
    permasalahan: t.safety_permasalahan,
  },
});

export const dataKeTanah = (t: TanahItemData): TanahItem => {
  const d = buatTanah();
  return {
    ...d,
    bukti_kepemilikan: t.bukti_kepemilikan || d.bukti_kepemilikan,
    nomor_bukti: t.nomor_bukti || '',
    tanggal_bukti: t.tanggal_bukti || '',
    masa_berlaku: t.masa_berlaku || '',
    nama_pemegang_hak: t.nama_pemegang_hak || '',
    hubungan_dengan_debitur: t.hubungan_dengan_debitur || d.hubungan_dengan_debitur,
    nomor_gambar_situasi: t.nomor_gambar_situasi || '',
    nomor_induk_bidang: t.nomor_induk_bidang || '',
    luas_tanah: t.luas_tanah?.toString() || '',
    tempat_didaftarkan: t.tempat_didaftarkan || '',
    lokasi: t.lokasi || '',
    letak_tanah: t.letak_tanah || d.letak_tanah,
    bentuk_tanah: t.bentuk_tanah || d.bentuk_tanah,
    arah_menghadap: t.arah_menghadap || d.arah_menghadap,
    lebar_jalan_depan: t.lebar_jalan_depan || '',
    bahan_jalan: t.bahan_jalan || d.bahan_jalan,
    batas_depan: t.batas_depan || '',
    batas_belakang: t.batas_belakang || '',
    batas_kanan: t.batas_kanan || '',
    batas_kiri: t.batas_kiri || '',
    kondisi_lalu_lintas: t.kondisi_lalu_lintas || '',
    kelas_jalan: t.kelas_jalan || d.kelas_jalan,
    listrik_pln: t.listrik_pln || '',
    air_bersih: t.air_bersih || d.air_bersih,
    saluran_telepon: t.saluran_telepon || d.saluran_telepon,
    fasilitas_penunjang: t.fasilitas_penunjang || [],
    harga_pembanding_1: t.harga_pembanding?.[0]?.harga?.toString() || '',
    sumber_1: t.harga_pembanding?.[0]?.sumber || '',
    harga_pembanding_2: t.harga_pembanding?.[1]?.harga?.toString() || '',
    sumber_2: t.harga_pembanding?.[1]?.sumber || '',
    harga_pembanding_3: t.harga_pembanding?.[2]?.harga?.toString() || '',
    sumber_3: t.harga_pembanding?.[2]?.sumber || '',
    safety_lokasi: t.safety_margins?.lokasi || d.safety_lokasi,
    safety_topography: t.safety_margins?.topography || d.safety_topography,
    safety_ukuran: t.safety_margins?.ukuran || d.safety_ukuran,
    safety_bukti: t.safety_margins?.bukti || d.safety_bukti,
    safety_lingkungan: t.safety_margins?.lingkungan || d.safety_lingkungan,
    safety_permasalahan: t.safety_margins?.permasalahan || d.safety_permasalahan,
  };
};

export const bangunanKeData = (b: BangunanItem): BangunanItemData => ({
  peruntukkan: b.peruntukkan,
  imb_ada: b.imb_ada,
  nomor_imb: b.nomor_imb,
  tanggal_imb: b.tanggal_imb,
  nama_di_imb: b.nama_di_imb,
  luas_sesuai_imb: b.luas_sesuai_imb,
  tinggi_sesuai_imb: b.tinggi_sesuai_imb,
  konstruksi: b.konstruksi,
  pondasi: b.pondasi,
  tinggi_lantai: b.tinggi_lantai,
  atap: b.atap,
  dinding: b.dinding,
  plester_dinding: b.plester_dinding,
  plafon: b.plafon,
  lantai: b.lantai,
  tiang: b.tiang,
  luas_bangunan: parseFloat(b.luas_bangunan) || 0,
  keterangan: b.keterangan,
  harga_pembanding: pembanding(b.harga_pembanding_1, b.sumber_1, b.harga_pembanding_2, b.sumber_2, b.harga_pembanding_3, b.sumber_3),
  safety_margins: {
    design: b.safety_design,
    umur: b.safety_umur,
    peruntukkan: b.safety_peruntukkan,
    imb: b.safety_imb,
    kesesuaian: b.safety_kesesuaian,
    permasalahan: b.safety_permasalahan,
  },
});

export const dataKeBangunan = (b: BangunanItemData): BangunanItem => {
  const d = buatBangunan();
  return {
    ...d,
    peruntukkan: b.peruntukkan || d.peruntukkan,
    imb_ada: b.imb_ada || false,
    nomor_imb: b.nomor_imb || '',
    tanggal_imb: b.tanggal_imb || '',
    nama_di_imb: b.nama_di_imb || '',
    luas_sesuai_imb: b.luas_sesuai_imb || '',
    tinggi_sesuai_imb: b.tinggi_sesuai_imb || '',
    konstruksi: b.konstruksi || d.konstruksi,
    pondasi: b.pondasi || d.pondasi,
    tinggi_lantai: b.tinggi_lantai || d.tinggi_lantai,
    atap: b.atap || d.atap,
    dinding: b.dinding || d.dinding,
    plester_dinding: b.plester_dinding ?? true,
    plafon: b.plafon || d.plafon,
    lantai: b.lantai || d.lantai,
    tiang: b.tiang || d.tiang,
    luas_bangunan: b.luas_bangunan?.toString() || '',
    keterangan: b.keterangan || '',
    harga_pembanding_1: b.harga_pembanding?.[0]?.harga?.toString() || '',
    sumber_1: b.harga_pembanding?.[0]?.sumber || '',
    harga_pembanding_2: b.harga_pembanding?.[1]?.harga?.toString() || '',
    sumber_2: b.harga_pembanding?.[1]?.sumber || '',
    harga_pembanding_3: b.harga_pembanding?.[2]?.harga?.toString() || '',
    sumber_3: b.harga_pembanding?.[2]?.sumber || '',
    safety_design: b.safety_margins?.design || d.safety_design,
    safety_umur: b.safety_margins?.umur || d.safety_umur,
    safety_peruntukkan: b.safety_margins?.peruntukkan || d.safety_peruntukkan,
    safety_imb: b.safety_margins?.imb || d.safety_imb,
    safety_kesesuaian: b.safety_margins?.kesesuaian || d.safety_kesesuaian,
    safety_permasalahan: b.safety_margins?.permasalahan || d.safety_permasalahan,
  };
};

/** Ambil angka nomor urut dari nomor dokumen lengkap ("007/F-3/BPD-TLH/IX/2026" → "007") */
export const nomorUrutDari = (nomorDokumen?: string) => (nomorDokumen || '').split('/')[0] || '';

/** Kunci draf per jenis form, per user, per dokumen (baru / id taksasi) */
export const kunciDraf = (jenis: string, userId?: string, id?: string) =>
  userId ? `sitaksi:draf:${jenis}:${userId}:${id || 'baru'}` : null;

export type KategoriKunjungan = 'prospek' | 'aktif' | 'menunggak' | 'restrukturisasi';
export type MonitoringStatus = 'draft' | 'final';
export type JadwalStatus = 'scheduled' | 'done' | 'canceled';

export interface MonitoringKunjungan {
  id: string;
  user_id: string;
  nomor_ba: string | null;
  kategori: KategoriKunjungan;
  tanggal_kunjungan: string;
  jam_kunjungan: string | null;
  nama_debitur: string;
  no_rekening: string | null;
  no_hp: string | null;
  alamat: string | null;
  plafond: number;
  baki_debet: number;
  tunggakan_pokok: number;
  tunggakan_bunga: number;
  hari_tunggakan: number;
  tujuan_kunjungan: string | null;
  kondisi_usaha: string | null;
  kondisi_agunan: string | null;
  hasil_kunjungan: string | null;
  rencana_tindak_lanjut: string | null;
  komitmen_bayar_nominal: number;
  komitmen_bayar_tanggal: string | null;
  foto_kunjungan: string[];
  taksasi_id: string | null;
  officer_nama: string | null;
  pimpinan_nama: string | null;
  kantor_cabang: string | null;
  status: MonitoringStatus;
  created_at: string;
  updated_at: string;
}

export interface MonitoringJadwal {
  id: string;
  user_id: string;
  tanggal_rencana: string;
  jam_rencana: string | null;
  nama_debitur: string;
  no_rekening: string | null;
  kategori: KategoriKunjungan;
  keterangan: string | null;
  status: JadwalStatus;
  created_at: string;
  updated_at: string;
}

export const KATEGORI_LABEL: Record<KategoriKunjungan, string> = {
  prospek: 'Calon Debitur (Prospek)',
  aktif: 'Debitur Aktif',
  menunggak: 'Debitur Menunggak',
  restrukturisasi: 'Restrukturisasi',
};

export const KATEGORI_COLOR: Record<KategoriKunjungan, string> = {
  prospek: 'bg-blue-100 text-blue-800 border-blue-200',
  aktif: 'bg-green-100 text-green-800 border-green-200',
  menunggak: 'bg-red-100 text-red-800 border-red-200',
  restrukturisasi: 'bg-amber-100 text-amber-800 border-amber-200',
};
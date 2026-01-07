import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Taksasi, generateNomorDokumen } from '@/types';

interface TaksasiContextType {
  taksasiList: Taksasi[];
  addTaksasi: (taksasi: Omit<Taksasi, 'id'>) => void;
  updateTaksasi: (id: string, updates: Partial<Taksasi>) => void;
  deleteTaksasi: (id: string) => void;
  getTaksasiByUser: (userId: string) => Taksasi[];
  getTaksasiById: (id: string) => Taksasi | undefined;
}

const TaksasiContext = createContext<TaksasiContextType | undefined>(undefined);

// Sample data for demo
const INITIAL_TAKSASI: Taksasi[] = [
  {
    id: '1',
    id_user: '3',
    nomor_dokumen: '939/F-3/BPD-TLH/XII/2025',
    jenis_agunan: 'Kendaraan',
    nama_nasabah: 'TRIVENA INGGRIT AYU',
    alamat: 'Jl. Belibis Gg. Merpati RT. 008 Kel. Kanaan Kec. Bontang Barat Kota Bontang',
    nilai_pasar: 14400000,
    nilai_taksasi: 14400000,
    nilai_taksasi_pembulatan: 14000000,
    nilai_likuidasi: 10500000,
    nilai_likuidasi_pembulatan: 10500000,
    safety_margin: 25,
    terbilang: 'Empat Belas Juta Rupiah',
    status_otorisasi: 'Selesai',
    detail_agunan: {
      jenis: 'BARANG BERGERAK / KENDARAAN RODA 2 HONDA CBR 150 2018',
      merk: 'HONDA',
      model: 'SOLO / P5E02R22M1 M/T',
      tahun: 2018,
      nomor_polisi: 'KT 4329 QC',
      nomor_mesin: 'KC91E-1204762',
      nomor_rangka: 'MH1KC9116K212204',
      buatan: 'Jepang',
      bukti_kepemilikan: 'BPKB',
      nomor_bukti_kepemilikan: 'N-10026971N',
      tanggal_bukti_kepemilikan: '2018-09-17',
      nama_kepemilikan: 'AGUS PURWIYANTO (Suami Debitur)',
      kondisi_unit: 'Terawat',
      harga_pasar: 14400000,
      harga_pembanding: [
        { harga: 13500000, sumber: 'https://web.facebook.com/share/1JfMJY4Rcn/' },
        { harga: 14000000, sumber: 'https://web.facebook.com/share/1HH5jwmTnu/' },
        { harga: 15700000, sumber: 'https://web.facebook.com/share/1D6j6UneD2/' },
      ],
      keterangan: [
        'Harga Berdasarkan Dari Data Pembanding : Marketplace Facebook',
        'Kendaraan Hak Milik Debitur Beserta Surat-Surat Atas nama Suami Debitur.',
        'Kendaraan Dalam Kondisi Baik Dan Dapat Berfungsi Sebagaimana Mestinya.',
        'Disarankan Untuk Dilakukan Perikatan Sesuai Dengan Ketentuan Di Bankaltimtara.',
      ],
    },
    tanggal: '2025-12-16',
    petugas: 'HARIS FADILAH',
    jabatan_petugas: 'Officer Relationship Kredit',
    kantor_cabang: 'KANTOR CABANG PEMBANTU TELIHAN',
    alamat_cabang: 'JL.S.PARMAN NO.14-15 KEL.GN.TELIHAN KEC.BONTANG BARAT-75383',
    pimpinan: 'TRI HANDAYANI SURYASTUTI',
    jabatan_pimpinan: 'Pemimpin Capem',
    tim_penilai: [
      { nama: 'TRI HANDAYANI SURYASTUTI', jabatan: 'Pemimpin Capem' },
      { nama: 'HARIS FADILAH', jabatan: 'Officer Relationship Kredit' },
    ],
  },
  {
    id: '2',
    id_user: '3',
    nomor_dokumen: '940/F-3/BPD-TLH/XII/2025',
    jenis_agunan: 'Tanah',
    nama_nasabah: 'Ahmad Wijaya',
    alamat: 'Jl. Gajah Mada No. 45, Samarinda',
    nilai_pasar: 500000000,
    nilai_taksasi: 500000000,
    nilai_taksasi_pembulatan: 500000000,
    nilai_likuidasi: 400000000,
    nilai_likuidasi_pembulatan: 400000000,
    safety_margin: 20,
    terbilang: 'Lima Ratus Juta Rupiah',
    status_otorisasi: 'Selesai',
    detail_agunan: {
      luas_tanah: 500,
      harga_per_meter: 1000000,
    },
    tanggal: '2025-12-10',
    petugas: 'HARIS FADILAH',
    jabatan_petugas: 'Officer Relationship Kredit',
    kantor_cabang: 'KANTOR CABANG PEMBANTU TELIHAN',
    alamat_cabang: 'JL.S.PARMAN NO.14-15 KEL.GN.TELIHAN KEC.BONTANG BARAT-75383',
    pimpinan: 'TRI HANDAYANI SURYASTUTI',
    jabatan_pimpinan: 'Pemimpin Capem',
    tim_penilai: [
      { nama: 'TRI HANDAYANI SURYASTUTI', jabatan: 'Pemimpin Capem' },
      { nama: 'HARIS FADILAH', jabatan: 'Officer Relationship Kredit' },
    ],
  },
  {
    id: '3',
    id_user: '3',
    nomor_dokumen: '941/F-3/BPD-TLH/XII/2025',
    jenis_agunan: 'Tanah & Bangunan',
    nama_nasabah: 'Siti Rahayu',
    alamat: 'Jl. Diponegoro No. 78, Balikpapan',
    nilai_pasar: 850000000,
    nilai_taksasi: 850000000,
    nilai_taksasi_pembulatan: 850000000,
    nilai_likuidasi: 680000000,
    nilai_likuidasi_pembulatan: 680000000,
    safety_margin: 20,
    terbilang: 'Delapan Ratus Lima Puluh Juta Rupiah',
    status_otorisasi: 'Selesai',
    detail_agunan: {
      luas_tanah: 200,
      harga_tanah_per_meter: 2500000,
      luas_bangunan: 120,
      harga_bangunan_per_meter: 2916667,
    },
    tanggal: '2025-12-14',
    petugas: 'HARIS FADILAH',
    jabatan_petugas: 'Officer Relationship Kredit',
    kantor_cabang: 'KANTOR CABANG PEMBANTU TELIHAN',
    alamat_cabang: 'JL.S.PARMAN NO.14-15 KEL.GN.TELIHAN KEC.BONTANG BARAT-75383',
    pimpinan: 'TRI HANDAYANI SURYASTUTI',
    jabatan_pimpinan: 'Pemimpin Capem',
    tim_penilai: [
      { nama: 'TRI HANDAYANI SURYASTUTI', jabatan: 'Pemimpin Capem' },
      { nama: 'HARIS FADILAH', jabatan: 'Officer Relationship Kredit' },
    ],
  },
];

export function TaksasiProvider({ children }: { children: ReactNode }) {
  const [taksasiList, setTaksasiList] = useState<Taksasi[]>(INITIAL_TAKSASI);

  const addTaksasi = useCallback((taksasi: Omit<Taksasi, 'id'>) => {
    const newTaksasi: Taksasi = {
      ...taksasi,
      id: Date.now().toString(),
    };
    setTaksasiList(prev => [newTaksasi, ...prev]);
  }, []);

  const updateTaksasi = useCallback((id: string, updates: Partial<Taksasi>) => {
    setTaksasiList(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTaksasi = useCallback((id: string) => {
    setTaksasiList(prev => prev.filter(t => t.id !== id));
  }, []);

  const getTaksasiByUser = useCallback((userId: string) => {
    return taksasiList.filter(t => t.id_user === userId);
  }, [taksasiList]);

  const getTaksasiById = useCallback((id: string) => {
    return taksasiList.find(t => t.id === id);
  }, [taksasiList]);

  return (
    <TaksasiContext.Provider
      value={{
        taksasiList,
        addTaksasi,
        updateTaksasi,
        deleteTaksasi,
        getTaksasiByUser,
        getTaksasiById,
      }}
    >
      {children}
    </TaksasiContext.Provider>
  );
}

export function useTaksasi() {
  const context = useContext(TaksasiContext);
  if (context === undefined) {
    throw new Error('useTaksasi must be used within a TaksasiProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Taksasi, StatusOtorisasi } from '@/types';

interface TaksasiContextType {
  taksasiList: Taksasi[];
  addTaksasi: (taksasi: Omit<Taksasi, 'id'>) => void;
  updateTaksasi: (id: string, updates: Partial<Taksasi>) => void;
  getTaksasiByUser: (userId: string) => Taksasi[];
  getTaksasiByStatus: (status: StatusOtorisasi) => Taksasi[];
  getTaksasiById: (id: string) => Taksasi | undefined;
  approveTaksasi: (id: string, catatan?: string) => void;
  rejectTaksasi: (id: string, catatan: string) => void;
}

const TaksasiContext = createContext<TaksasiContextType | undefined>(undefined);

// Sample data for demo
const INITIAL_TAKSASI: Taksasi[] = [
  {
    id: '1',
    id_user: '3',
    jenis_agunan: 'Kendaraan',
    nama_nasabah: 'Trivena Inggrit Ayu',
    alamat: 'Jl. Belibis Gg. Merpati RT. 008 Kel. Kanaan Kec. Bontang Barat Kota Bontang',
    nilai_pasar: 14400000,
    nilai_taksasi: 14000000,
    nilai_likuidasi: 10500000,
    status_otorisasi: 'Menunggu',
    detail_agunan: {
      jenis: 'Sepeda Motor',
      merk: 'Honda',
      model: 'CBR 150 / SOLO / P5E02R22M1 M/T',
      tahun: 2018,
      nomor_polisi: 'KT 4329 QC',
      nomor_mesin: 'KC91E-1204762',
      nomor_rangka: 'MH1KC9116K212204',
      harga_pasar: 14400000,
      harga_pembanding: [
        { harga: 13500000, sumber: 'Marketplace Facebook - Balikpapan' },
        { harga: 14000000, sumber: 'Marketplace Facebook - Balikpapan' },
        { harga: 15700000, sumber: 'Marketplace Facebook - Banjar' },
      ],
    },
    tanggal: '2025-12-16',
    petugas: 'Haris Fadilah',
  },
  {
    id: '2',
    id_user: '3',
    jenis_agunan: 'Tanah',
    nama_nasabah: 'Ahmad Wijaya',
    alamat: 'Jl. Gajah Mada No. 45, Samarinda',
    nilai_pasar: 500000000,
    nilai_taksasi: 500000000,
    nilai_likuidasi: 400000000,
    status_otorisasi: 'Disetujui',
    catatan_pimpinan: 'Lokasi strategis, nilai wajar.',
    detail_agunan: {
      luas_tanah: 500,
      harga_per_meter: 1000000,
    },
    tanggal: '2025-12-10',
    petugas: 'Haris Fadilah',
  },
  {
    id: '3',
    id_user: '3',
    jenis_agunan: 'Tanah & Bangunan',
    nama_nasabah: 'Siti Rahayu',
    alamat: 'Jl. Diponegoro No. 78, Balikpapan',
    nilai_pasar: 850000000,
    nilai_taksasi: 850000000,
    nilai_likuidasi: 680000000,
    status_otorisasi: 'Menunggu',
    detail_agunan: {
      luas_tanah: 200,
      harga_tanah_per_meter: 2500000,
      luas_bangunan: 120,
      harga_bangunan_per_meter: 2916667,
    },
    tanggal: '2025-12-14',
    petugas: 'Haris Fadilah',
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

  const getTaksasiByUser = useCallback((userId: string) => {
    return taksasiList.filter(t => t.id_user === userId);
  }, [taksasiList]);

  const getTaksasiByStatus = useCallback((status: StatusOtorisasi) => {
    return taksasiList.filter(t => t.status_otorisasi === status);
  }, [taksasiList]);

  const getTaksasiById = useCallback((id: string) => {
    return taksasiList.find(t => t.id === id);
  }, [taksasiList]);

  const approveTaksasi = useCallback((id: string, catatan?: string) => {
    setTaksasiList(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, status_otorisasi: 'Disetujui' as StatusOtorisasi, catatan_pimpinan: catatan }
          : t
      )
    );
  }, []);

  const rejectTaksasi = useCallback((id: string, catatan: string) => {
    setTaksasiList(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, status_otorisasi: 'Ditolak' as StatusOtorisasi, catatan_pimpinan: catatan }
          : t
      )
    );
  }, []);

  return (
    <TaksasiContext.Provider
      value={{
        taksasiList,
        addTaksasi,
        updateTaksasi,
        getTaksasiByUser,
        getTaksasiByStatus,
        getTaksasiById,
        approveTaksasi,
        rejectTaksasi,
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

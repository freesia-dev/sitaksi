import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { Taksasi } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TaksasiContextType {
  taksasiList: Taksasi[];
  isLoading: boolean;
  addTaksasi: (taksasi: Omit<Taksasi, 'id'>) => Promise<void>;
  updateTaksasi: (id: string, updates: Partial<Taksasi>) => Promise<boolean>;
  deleteTaksasi: (id: string) => Promise<void>;
  getTaksasiByUser: (userId: string) => Taksasi[];
  getTaksasiById: (id: string) => Taksasi | undefined;
  refreshTaksasi: () => Promise<void>;
}

const TaksasiContext = createContext<TaksasiContextType | undefined>(undefined);

// Map jenis agunan to database format
const jenisAgunanMap: Record<string, string> = {
  'Tanah': 'tanah',
  'tanah': 'tanah',
  'Tanah & Bangunan': 'tanah_bangunan',
  'tanah_bangunan': 'tanah_bangunan',
  'Kendaraan': 'kendaraan',
  'kendaraan': 'kendaraan'
};

const jenisAgunanReverseMap: Record<string, string> = {
  'tanah': 'Tanah',
  'tanah_bangunan': 'Tanah & Bangunan',
  'Tanah & Bangunan': 'Tanah & Bangunan',
  'kendaraan': 'Kendaraan',
  'Kendaraan': 'Kendaraan',
  'Tanah': 'Tanah'
};

export function TaksasiProvider({ children }: { children: ReactNode }) {
  const [taksasiList, setTaksasiList] = useState<Taksasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, session } = useAuth();
  const { toast } = useToast();

  // Fetch taksasi from database
  const fetchTaksasi = useCallback(async () => {
    if (!session?.user) {
      setTaksasiList([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('taksasi')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching taksasi:', error);
        toast({
          title: 'Error',
          description: 'Gagal memuat data taksasi',
          variant: 'destructive'
        });
        return;
      }

      // Transform database data to Taksasi type
      const transformedData: Taksasi[] = (data || []).map((item: any) => ({
        id: item.id,
        id_user: item.user_id,
        nomor_dokumen: item.nomor_dokumen,
        jenis_agunan: jenisAgunanReverseMap[item.jenis_agunan] || item.jenis_agunan,
        nama_nasabah: item.nama_debitur,
        alamat: item.alamat_debitur || '',
        no_rekening: item.no_rekening || '',
        no_hp: item.no_hp || '',
        nilai_pasar: Number(item.nilai_pasar) || 0,
        nilai_taksasi: Number(item.nilai_taksasi) || 0,
        nilai_taksasi_pembulatan: Number(item.nilai_taksasi) || 0,
        nilai_likuidasi: Number(item.nilai_likuidasi) || 0,
        nilai_likuidasi_pembulatan: Number(item.nilai_likuidasi) || 0,
        safety_margin: item.detail_agunan?.safety_margin || 0,
        terbilang: item.detail_agunan?.terbilang || '',
        status: item.status === 'disetujui' ? 'disetujui' : item.status === 'ditolak' ? 'ditolak' : 'draft',
        status_otorisasi: item.status === 'disetujui' ? 'Selesai' : item.status === 'ditolak' ? 'Ditolak' : 'Draft',
        detail_agunan: item.detail_agunan || {},
        dokumentasi: item.dokumentasi || [],
        tanggal: item.tanggal,
        petugas: item.tim_penilai?.petugas || '',
        jabatan_petugas: item.tim_penilai?.jabatan_petugas || '',
        kantor_cabang: item.kantor_cabang || '',
        alamat_cabang: item.detail_agunan?.alamat_cabang || '',
        pimpinan: item.tim_penilai?.pimpinan || '',
        jabatan_pimpinan: item.tim_penilai?.jabatan_pimpinan || '',
        tim_penilai: item.tim_penilai?.members || [],
        keterangan: item.keterangan || '',
        marketability: item.marketability || ''
      }));

      setTaksasiList(transformedData);
    } catch (error) {
      console.error('Error fetching taksasi:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user, toast]);

  // Fetch on mount and when session changes
  useEffect(() => {
    fetchTaksasi();
  }, [fetchTaksasi]);

  const addTaksasi = useCallback(async (taksasi: Omit<Taksasi, 'id'>) => {
    if (!session?.user) {
      toast({
        title: 'Error',
        description: 'Anda harus login untuk menambah data',
        variant: 'destructive'
      });
      return;
    }

    try {
      const dbJenisAgunan = jenisAgunanMap[taksasi.jenis_agunan] || 'tanah';
      
      const insertData = {
        user_id: session.user.id,
        nomor_dokumen: taksasi.nomor_dokumen,
        tanggal: taksasi.tanggal || new Date().toISOString().split('T')[0],
        jenis_agunan: dbJenisAgunan,
        nama_debitur: taksasi.nama_nasabah,
        alamat_debitur: taksasi.alamat,
        no_rekening: taksasi.no_rekening || null,
        no_hp: taksasi.no_hp || null,
        status: 'draft' as const,
        detail_agunan: {
          ...taksasi.detail_agunan,
          safety_margin: taksasi.safety_margin,
          terbilang: taksasi.terbilang,
          alamat_cabang: taksasi.alamat_cabang
        },
        dokumentasi: (taksasi as any).dokumentasi_urls || [],
        nilai_pasar: taksasi.nilai_pasar || 0,
        nilai_taksasi: taksasi.nilai_taksasi || 0,
        nilai_likuidasi: taksasi.nilai_likuidasi || 0,
        tim_penilai: {
          petugas: taksasi.petugas,
          jabatan_petugas: taksasi.jabatan_petugas,
          pimpinan: taksasi.pimpinan,
          jabatan_pimpinan: taksasi.jabatan_pimpinan,
          members: taksasi.tim_penilai || []
        },
        kantor_cabang: taksasi.kantor_cabang,
        keterangan: taksasi.keterangan || null,
        marketability: taksasi.marketability || null
      };

      const { data, error } = await supabase
        .from('taksasi')
        .insert(insertData as any)
        .select()
        .single();

      if (error) {
        console.error('Error adding taksasi:', error);
        toast({
          title: 'Error',
          description: 'Gagal menyimpan data taksasi: ' + error.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Berhasil',
        description: 'Data taksasi berhasil disimpan'
      });

      // Refresh the list
      await fetchTaksasi();
    } catch (error: any) {
      console.error('Error adding taksasi:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan data taksasi',
        variant: 'destructive'
      });
    }
  }, [session?.user, toast, fetchTaksasi]);

  const updateTaksasi = useCallback(async (id: string, updates: Partial<Taksasi>): Promise<boolean> => {
    if (!session?.user) {
      toast({
        title: 'Error',
        description: 'Anda harus login untuk mengubah data',
        variant: 'destructive'
      });
      throw new Error('Not authenticated');
    }

    try {
      const updateData: any = {};

      if (updates.nomor_dokumen) updateData.nomor_dokumen = updates.nomor_dokumen;
      if (updates.tanggal) updateData.tanggal = updates.tanggal;
      if (updates.jenis_agunan) updateData.jenis_agunan = jenisAgunanMap[updates.jenis_agunan] || updates.jenis_agunan;
      if (updates.nama_nasabah) updateData.nama_debitur = updates.nama_nasabah;
      if (updates.alamat) updateData.alamat_debitur = updates.alamat;
      if (updates.no_rekening !== undefined) updateData.no_rekening = updates.no_rekening;
      if (updates.no_hp !== undefined) updateData.no_hp = updates.no_hp;
      if (updates.nilai_pasar !== undefined) updateData.nilai_pasar = updates.nilai_pasar;
      if (updates.nilai_taksasi !== undefined) updateData.nilai_taksasi = updates.nilai_taksasi;
      if (updates.nilai_likuidasi !== undefined) updateData.nilai_likuidasi = updates.nilai_likuidasi;
      if (updates.kantor_cabang) updateData.kantor_cabang = updates.kantor_cabang;
      if (updates.keterangan !== undefined) updateData.keterangan = updates.keterangan;
      if (updates.marketability !== undefined) updateData.marketability = updates.marketability;
      if (updates.dokumentasi) updateData.dokumentasi = updates.dokumentasi;
      
      if (updates.detail_agunan || updates.safety_margin || updates.terbilang || updates.alamat_cabang) {
        const existingTaksasi = taksasiList.find(t => t.id === id);
        updateData.detail_agunan = {
          ...(existingTaksasi?.detail_agunan || {}),
          ...(updates.detail_agunan || {}),
          safety_margin: updates.safety_margin ?? existingTaksasi?.safety_margin,
          terbilang: updates.terbilang ?? existingTaksasi?.terbilang,
          alamat_cabang: updates.alamat_cabang ?? existingTaksasi?.alamat_cabang
        };
      }

      if (updates.petugas || updates.jabatan_petugas || updates.pimpinan || updates.jabatan_pimpinan || updates.tim_penilai) {
        const existingTaksasi = taksasiList.find(t => t.id === id);
        updateData.tim_penilai = {
          petugas: updates.petugas ?? existingTaksasi?.petugas,
          jabatan_petugas: updates.jabatan_petugas ?? existingTaksasi?.jabatan_petugas,
          pimpinan: updates.pimpinan ?? existingTaksasi?.pimpinan,
          jabatan_pimpinan: updates.jabatan_pimpinan ?? existingTaksasi?.jabatan_pimpinan,
          members: updates.tim_penilai ?? existingTaksasi?.tim_penilai ?? []
        };
      }

      if (updates.status) {
        updateData.status = updates.status;
      }

      if (updates.status_otorisasi) {
        const statusMap: Record<string, string> = {
          'Selesai': 'disetujui',
          'Ditolak': 'ditolak',
          'Draft': 'draft'
        };
        updateData.status = statusMap[updates.status_otorisasi] || 'draft';
      }

      const { data: updatedRow, error } = await supabase
        .from('taksasi')
        .update(updateData)
        .eq('id', id)
        .select('id')
        .maybeSingle();

      if (error) {
        console.error('Error updating taksasi:', error);
        toast({
          title: 'Error',
          description: 'Gagal mengubah data taksasi: ' + error.message,
          variant: 'destructive'
        });
        throw error;
      }

      // If RLS blocks the update, PostgREST returns 200/204 with no rows updated (no error).
      if (!updatedRow) {
        toast({
          title: 'Tidak memiliki izin',
          description: 'Perubahan tidak tersimpan (Anda tidak punya akses untuk mengubah data ini).',
          variant: 'destructive'
        });
        throw new Error('Permission denied');
      }

      // Refresh the list to sync all views
      await fetchTaksasi();
      
      return true;
    } catch (error: any) {
      console.error('Error updating taksasi:', error);
      // Re-throw to let caller handle the error
      throw error;
    }
  }, [session?.user, toast, fetchTaksasi, taksasiList]);

  const deleteTaksasi = useCallback(async (id: string) => {
    if (!session?.user) {
      toast({
        title: 'Error',
        description: 'Anda harus login untuk menghapus data',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('taksasi')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting taksasi:', error);
        toast({
          title: 'Error',
          description: 'Gagal menghapus data taksasi: ' + error.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Berhasil',
        description: 'Data taksasi berhasil dihapus'
      });

      // Refresh the list
      await fetchTaksasi();
    } catch (error: any) {
      console.error('Error deleting taksasi:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus data taksasi',
        variant: 'destructive'
      });
    }
  }, [session?.user, toast, fetchTaksasi]);

  const getTaksasiByUser = useCallback((userId: string) => {
    return taksasiList.filter(t => t.id_user === userId);
  }, [taksasiList]);

  const getTaksasiById = useCallback((id: string) => {
    return taksasiList.find(t => t.id === id);
  }, [taksasiList]);

  const refreshTaksasi = useCallback(async () => {
    await fetchTaksasi();
  }, [fetchTaksasi]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    taksasiList,
    isLoading,
    addTaksasi,
    updateTaksasi,
    deleteTaksasi,
    getTaksasiByUser,
    getTaksasiById,
    refreshTaksasi,
  }), [taksasiList, isLoading, addTaksasi, updateTaksasi, deleteTaksasi, getTaksasiByUser, getTaksasiById, refreshTaksasi]);

  return (
    <TaksasiContext.Provider value={contextValue}>
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

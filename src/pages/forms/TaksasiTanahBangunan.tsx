import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTaksasi } from '@/context/TaksasiContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  FORMULAS, 
  formatCurrency, 
  formatTerbilang, 
  generateNomorDokumen, 
  DetailAgunanTBSimple,
  generateId 
} from '@/types';
import { 
  Calculator, 
  Save, 
  ArrowLeft, 
  MapPin, 
  Building2, 
  Home, 
  DollarSign, 
  User, 
  Building,
  Plus,
  Trash2,
  FileCheck
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';

interface TanahItem {
  id: string;
  bukti_kepemilikan: string;
  nomor_bukti: string;
  tanggal_bukti: string;
  nama_pemegang_hak: string;
  hubungan_dengan_debitur: string;
  luas_tanah: string;
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
  listrik_pln: string;
  air_bersih: string;
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

interface BangunanItem {
  id: string;
  peruntukkan: string;
  imb_ada: boolean;
  nomor_imb: string;
  tanggal_imb: string;
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

const defaultTanah: TanahItem = {
  id: generateId(),
  bukti_kepemilikan: 'Hak Milik',
  nomor_bukti: '',
  tanggal_bukti: '',
  nama_pemegang_hak: '',
  hubungan_dengan_debitur: 'Milik Sendiri',
  luas_tanah: '',
  lokasi: '',
  letak_tanah: 'Normal',
  bentuk_tanah: 'Beraturan',
  arah_menghadap: 'Utara',
  lebar_jalan_depan: '',
  bahan_jalan: 'Aspal',
  batas_depan: '',
  batas_belakang: '',
  batas_kanan: '',
  batas_kiri: '',
  listrik_pln: '',
  air_bersih: 'Ada',
  harga_pembanding_1: '',
  sumber_1: '',
  harga_pembanding_2: '',
  sumber_2: '',
  harga_pembanding_3: '',
  sumber_3: '',
  safety_lokasi: '80',
  safety_topography: '80',
  safety_ukuran: '80',
  safety_bukti: '80',
  safety_lingkungan: '80',
  safety_permasalahan: '80',
};

const defaultBangunan: BangunanItem = {
  id: generateId(),
  peruntukkan: 'Rumah Tempat Tinggal',
  imb_ada: false,
  nomor_imb: '',
  tanggal_imb: '',
  konstruksi: 'Permanent',
  pondasi: 'Beton',
  tinggi_lantai: '1',
  atap: 'Genteng',
  dinding: 'Batu Bata',
  plester_dinding: true,
  plafon: 'Gypsum',
  lantai: 'Keramik',
  tiang: 'Beton',
  luas_bangunan: '',
  harga_pembanding_1: '',
  sumber_1: '',
  harga_pembanding_2: '',
  sumber_2: '',
  harga_pembanding_3: '',
  sumber_3: '',
  safety_design: '70',
  safety_umur: '70',
  safety_peruntukkan: '80',
  safety_imb: '80',
  safety_kesesuaian: '80',
  safety_permasalahan: '80',
};

export default function TaksasiTanahBangunan() {
  const { user } = useAuth();
  const { addTaksasi } = useTaksasi();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nama_nasabah: '',
    kantor_cabang: 'KANTOR CABANG PEMBANTU TELIHAN',
    alamat_cabang: 'JL.S.PARMAN NO.14-15 KEL.GN.TELIHAN KEC.BONTANG BARAT-75383',
    pimpinan: '',
    jabatan_pimpinan: 'Pemimpin Capem',
    marketability: 'Cukup Marketable',
    catatan_marketability_1: '',
    catatan_marketability_2: '',
    catatan_marketability_3: '',
  });

  const [tanahList, setTanahList] = useState<TanahItem[]>([{ ...defaultTanah }]);
  const [bangunanList, setBangunanList] = useState<BangunanItem[]>([{ ...defaultBangunan }]);

  const [hasil, setHasil] = useState<{
    total_nilai_tanah: number;
    total_nilai_bangunan: number;
    nilai_taksasi: number;
    nilai_likuidasi: number;
    terbilang: string;
    detail_tanah: { nilai_pasar: number; nilai_likuidasi: number }[];
    detail_bangunan: { nilai_pasar: number; nilai_likuidasi: number }[];
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setHasil(null);
  };

  const updateTanah = (index: number, field: keyof TanahItem, value: string | boolean) => {
    setTanahList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setHasil(null);
  };

  const updateBangunan = (index: number, field: keyof BangunanItem, value: string | boolean) => {
    setBangunanList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setHasil(null);
  };

  const addTanah = () => {
    setTanahList(prev => [...prev, { ...defaultTanah, id: generateId() }]);
  };

  const removeTanah = (index: number) => {
    if (tanahList.length > 1) {
      setTanahList(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addBangunan = () => {
    setBangunanList(prev => [...prev, { ...defaultBangunan, id: generateId() }]);
  };

  const removeBangunan = (index: number) => {
    if (bangunanList.length > 1) {
      setBangunanList(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleHitung = () => {
    // Calculate tanah values
    const detailTanah = tanahList.map(t => {
      const hargaList = [
        parseFloat(t.harga_pembanding_1) || 0,
        parseFloat(t.harga_pembanding_2) || 0,
        parseFloat(t.harga_pembanding_3) || 0,
      ].filter(h => h > 0);
      
      const hargaRataRata = hargaList.length > 0 
        ? hargaList.reduce((a, b) => a + b, 0) / hargaList.length 
        : 0;
      
      const luas = parseFloat(t.luas_tanah) || 0;
      const nilaiPasar = luas * hargaRataRata;
      
      const safetyMargins = [
        parseFloat(t.safety_lokasi) || 80,
        parseFloat(t.safety_topography) || 80,
        parseFloat(t.safety_ukuran) || 80,
        parseFloat(t.safety_bukti) || 80,
        parseFloat(t.safety_lingkungan) || 80,
        parseFloat(t.safety_permasalahan) || 80,
      ];
      const avgSafety = safetyMargins.reduce((a, b) => a + b, 0) / safetyMargins.length / 100;
      const nilaiLikuidasi = nilaiPasar * avgSafety;
      
      return { nilai_pasar: nilaiPasar, nilai_likuidasi: nilaiLikuidasi };
    });

    // Calculate bangunan values
    const detailBangunan = bangunanList.map(b => {
      const hargaList = [
        parseFloat(b.harga_pembanding_1) || 0,
        parseFloat(b.harga_pembanding_2) || 0,
        parseFloat(b.harga_pembanding_3) || 0,
      ].filter(h => h > 0);
      
      const hargaRataRata = hargaList.length > 0 
        ? hargaList.reduce((a, b) => a + b, 0) / hargaList.length 
        : 0;
      
      const luas = parseFloat(b.luas_bangunan) || 0;
      const nilaiPasar = luas * hargaRataRata;
      
      const safetyMargins = [
        parseFloat(b.safety_design) || 70,
        parseFloat(b.safety_umur) || 70,
        parseFloat(b.safety_peruntukkan) || 80,
        parseFloat(b.safety_imb) || 80,
        parseFloat(b.safety_kesesuaian) || 80,
        parseFloat(b.safety_permasalahan) || 80,
      ];
      const avgSafety = safetyMargins.reduce((a, b) => a + b, 0) / safetyMargins.length / 100;
      const nilaiLikuidasi = nilaiPasar * avgSafety;
      
      return { nilai_pasar: nilaiPasar, nilai_likuidasi: nilaiLikuidasi };
    });

    const totalNilaiTanah = detailTanah.reduce((sum, d) => sum + d.nilai_pasar, 0);
    const totalNilaiBangunan = detailBangunan.reduce((sum, d) => sum + d.nilai_pasar, 0);
    const nilaiTaksasi = totalNilaiTanah + totalNilaiBangunan;
    const nilaiLikuidasi = detailTanah.reduce((sum, d) => sum + d.nilai_likuidasi, 0) + 
                          detailBangunan.reduce((sum, d) => sum + d.nilai_likuidasi, 0);

    setHasil({
      total_nilai_tanah: totalNilaiTanah,
      total_nilai_bangunan: totalNilaiBangunan,
      nilai_taksasi: nilaiTaksasi,
      nilai_likuidasi: nilaiLikuidasi,
      terbilang: formatTerbilang(nilaiTaksasi),
      detail_tanah: detailTanah,
      detail_bangunan: detailBangunan,
    });
  };

  const handleSimpan = () => {
    if (!hasil) {
      toast({
        title: 'Hitung terlebih dahulu',
        description: 'Silakan klik tombol Hitung Taksasi',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.nama_nasabah) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Nama nasabah wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    // Create simplified detail for storage
    const totalLuasTanah = tanahList.reduce((sum, t) => sum + (parseFloat(t.luas_tanah) || 0), 0);
    const totalLuasBangunan = bangunanList.reduce((sum, b) => sum + (parseFloat(b.luas_bangunan) || 0), 0);
    
    const avgHargaTanah = totalLuasTanah > 0 ? hasil.total_nilai_tanah / totalLuasTanah : 0;
    const avgHargaBangunan = totalLuasBangunan > 0 ? hasil.total_nilai_bangunan / totalLuasBangunan : 0;

    const detailAgunan: DetailAgunanTBSimple = {
      luas_tanah: totalLuasTanah,
      harga_tanah_per_meter: avgHargaTanah,
      luas_bangunan: totalLuasBangunan,
      harga_bangunan_per_meter: avgHargaBangunan,
    };

    const alamatGabungan = tanahList.map(t => t.lokasi).filter(l => l).join('; ') || 'Alamat tidak disebutkan';

    addTaksasi({
      id_user: user?.id || '',
      nomor_dokumen: generateNomorDokumen('TLH'),
      jenis_agunan: 'Tanah & Bangunan',
      nama_nasabah: formData.nama_nasabah,
      alamat: alamatGabungan,
      nilai_pasar: hasil.nilai_taksasi,
      nilai_taksasi: hasil.nilai_taksasi,
      nilai_taksasi_pembulatan: hasil.nilai_taksasi,
      nilai_likuidasi: hasil.nilai_likuidasi,
      nilai_likuidasi_pembulatan: hasil.nilai_likuidasi,
      safety_margin: 20,
      terbilang: hasil.terbilang,
      status_otorisasi: 'Menunggu',
      detail_agunan: detailAgunan,
      tanggal: new Date().toISOString().split('T')[0],
      petugas: user?.nama || '',
      jabatan_petugas: 'Officer Relationship Kredit',
      kantor_cabang: formData.kantor_cabang,
      alamat_cabang: formData.alamat_cabang,
      pimpinan: formData.pimpinan,
      jabatan_pimpinan: formData.jabatan_pimpinan,
      tim_penilai: [
        { nama: formData.pimpinan, jabatan: formData.jabatan_pimpinan },
        { nama: user?.nama || '', jabatan: 'Officer Relationship Kredit' },
      ],
      marketability: formData.marketability,
      catatan_marketability: [
        formData.catatan_marketability_1,
        formData.catatan_marketability_2,
        formData.catatan_marketability_3,
      ].filter(c => c),
    });

    toast({
      title: 'Taksasi berhasil disimpan',
      description: 'Data taksasi tanah & bangunan telah disimpan dan menunggu otorisasi',
    });

    navigate('/riwayat');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Formulir Taksasi Tanah & Bangunan"
        description="Penilaian agunan berupa tanah dengan bangunan"
        actions={
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2" size={16} />
            Kembali
          </Button>
        }
      />

      <div className="grid gap-6">
        {/* Data Nasabah */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            Data Nasabah
          </h3>
          <div>
            <Label htmlFor="nama_nasabah">Nama Calon Debitur / Debitur</Label>
            <Input
              id="nama_nasabah"
              name="nama_nasabah"
              placeholder="Masukkan nama nasabah"
              value={formData.nama_nasabah}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Data Tanah - Multiple */}
        {tanahList.map((tanah, index) => (
          <div key={tanah.id} className="rounded-xl border bg-card p-6 shadow-card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Home size={18} className="text-success" />
                Data Tanah {tanahList.length > 1 ? `#${index + 1}` : ''}
              </h3>
              {tanahList.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeTanah(index)} className="text-destructive">
                  <Trash2 size={16} />
                </Button>
              )}
            </div>

            {/* Profil */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">A. PROFIL</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Bukti Kepemilikan</Label>
                  <Select value={tanah.bukti_kepemilikan} onValueChange={(v) => updateTanah(index, 'bukti_kepemilikan', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hak Milik">Hak Milik</SelectItem>
                      <SelectItem value="HGB">HGB</SelectItem>
                      <SelectItem value="HGU">HGU</SelectItem>
                      <SelectItem value="Girik">Girik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nomor Bukti Kepemilikan</Label>
                  <Input value={tanah.nomor_bukti} onChange={(e) => updateTanah(index, 'nomor_bukti', e.target.value)} placeholder="Nomor sertifikat" />
                </div>
                <div>
                  <Label>Tanggal Bukti Kepemilikan</Label>
                  <Input type="date" value={tanah.tanggal_bukti} onChange={(e) => updateTanah(index, 'tanggal_bukti', e.target.value)} />
                </div>
                <div>
                  <Label>Nama Pemegang Hak</Label>
                  <Input value={tanah.nama_pemegang_hak} onChange={(e) => updateTanah(index, 'nama_pemegang_hak', e.target.value)} placeholder="Nama di sertifikat" />
                </div>
                <div>
                  <Label>Hub. Pemegang Hak dengan Debitur</Label>
                  <Select value={tanah.hubungan_dengan_debitur} onValueChange={(v) => updateTanah(index, 'hubungan_dengan_debitur', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Milik Sendiri">Milik Sendiri</SelectItem>
                      <SelectItem value="Kerabat/ Keluarga">Kerabat/ Keluarga</SelectItem>
                      <SelectItem value="Pihak Ketiga">Pihak Ketiga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Luas Tanah (m²)</Label>
                  <Input type="number" value={tanah.luas_tanah} onChange={(e) => updateTanah(index, 'luas_tanah', e.target.value)} placeholder="0" />
                </div>
              </div>
              <div>
                <Label>Lokasi Objek Agunan</Label>
                <Textarea value={tanah.lokasi} onChange={(e) => updateTanah(index, 'lokasi', e.target.value)} placeholder="Alamat lengkap lokasi tanah" rows={2} />
              </div>

              {/* Hasil Pemeriksaan Fisik */}
              <p className="text-sm font-medium text-muted-foreground pt-4">B. HASIL PEMERIKSAAN FISIK</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Letak Tanah</Label>
                  <Select value={tanah.letak_tanah} onValueChange={(v) => updateTanah(index, 'letak_tanah', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Rendah">Rendah</SelectItem>
                      <SelectItem value="Tinggi">Tinggi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bentuk Tanah</Label>
                  <Select value={tanah.bentuk_tanah} onValueChange={(v) => updateTanah(index, 'bentuk_tanah', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beraturan">Beraturan</SelectItem>
                      <SelectItem value="Tidak Beraturan">Tidak Beraturan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Arah Menghadap</Label>
                  <Select value={tanah.arah_menghadap} onValueChange={(v) => updateTanah(index, 'arah_menghadap', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Utara">Utara</SelectItem>
                      <SelectItem value="Selatan">Selatan</SelectItem>
                      <SelectItem value="Barat">Barat</SelectItem>
                      <SelectItem value="Timur">Timur</SelectItem>
                      <SelectItem value="Barat Daya">Barat Daya</SelectItem>
                      <SelectItem value="Barat Laut">Barat Laut</SelectItem>
                      <SelectItem value="Tenggara">Tenggara</SelectItem>
                      <SelectItem value="Timur Laut">Timur Laut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lebar Jalan Depan</Label>
                  <Input value={tanah.lebar_jalan_depan} onChange={(e) => updateTanah(index, 'lebar_jalan_depan', e.target.value)} placeholder="± 3 m" />
                </div>
                <div>
                  <Label>Bahan Jalan</Label>
                  <Select value={tanah.bahan_jalan} onValueChange={(v) => updateTanah(index, 'bahan_jalan', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aspal">Aspal</SelectItem>
                      <SelectItem value="Cor Semen">Cor Semen</SelectItem>
                      <SelectItem value="Tanah">Tanah</SelectItem>
                      <SelectItem value="Paving">Paving</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Listrik PLN</Label>
                  <Input value={tanah.listrik_pln} onChange={(e) => updateTanah(index, 'listrik_pln', e.target.value)} placeholder="1.300 Watt" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Batas Depan</Label>
                  <Input value={tanah.batas_depan} onChange={(e) => updateTanah(index, 'batas_depan', e.target.value)} placeholder="Gang / Jalan" />
                </div>
                <div>
                  <Label>Batas Belakang</Label>
                  <Input value={tanah.batas_belakang} onChange={(e) => updateTanah(index, 'batas_belakang', e.target.value)} placeholder="Tanah Kosong" />
                </div>
                <div>
                  <Label>Batas Kanan</Label>
                  <Input value={tanah.batas_kanan} onChange={(e) => updateTanah(index, 'batas_kanan', e.target.value)} placeholder="Tanah Kosong" />
                </div>
                <div>
                  <Label>Batas Kiri</Label>
                  <Input value={tanah.batas_kiri} onChange={(e) => updateTanah(index, 'batas_kiri', e.target.value)} placeholder="Tanah dan Bangunan" />
                </div>
              </div>

              {/* Harga Pasar */}
              <p className="text-sm font-medium text-muted-foreground pt-4">C. HARGA PASAR / m²</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Harga Pasar 1</Label>
                  <Input type="number" value={tanah.harga_pembanding_1} onChange={(e) => updateTanah(index, 'harga_pembanding_1', e.target.value)} placeholder="280000" />
                  <Input className="mt-2" value={tanah.sumber_1} onChange={(e) => updateTanah(index, 'sumber_1', e.target.value)} placeholder="Sumber informasi" />
                </div>
                <div>
                  <Label>Harga Pasar 2</Label>
                  <Input type="number" value={tanah.harga_pembanding_2} onChange={(e) => updateTanah(index, 'harga_pembanding_2', e.target.value)} placeholder="300000" />
                  <Input className="mt-2" value={tanah.sumber_2} onChange={(e) => updateTanah(index, 'sumber_2', e.target.value)} placeholder="Sumber informasi" />
                </div>
                <div>
                  <Label>Harga Pasar 3</Label>
                  <Input type="number" value={tanah.harga_pembanding_3} onChange={(e) => updateTanah(index, 'harga_pembanding_3', e.target.value)} placeholder="295000" />
                  <Input className="mt-2" value={tanah.sumber_3} onChange={(e) => updateTanah(index, 'sumber_3', e.target.value)} placeholder="Sumber informasi" />
                </div>
              </div>

              {/* Safety Margin Tanah */}
              <p className="text-sm font-medium text-muted-foreground pt-4">D. FAKTOR PENYESUAIAN (Safety Margin %)</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Lokasi/Daerah</Label>
                  <Input type="number" value={tanah.safety_lokasi} onChange={(e) => updateTanah(index, 'safety_lokasi', e.target.value)} placeholder="80" />
                </div>
                <div>
                  <Label>Topography</Label>
                  <Input type="number" value={tanah.safety_topography} onChange={(e) => updateTanah(index, 'safety_topography', e.target.value)} placeholder="80" />
                </div>
                <div>
                  <Label>Ukuran & Bentuk</Label>
                  <Input type="number" value={tanah.safety_ukuran} onChange={(e) => updateTanah(index, 'safety_ukuran', e.target.value)} placeholder="80" />
                </div>
                <div>
                  <Label>Bukti Kepemilikan</Label>
                  <Input type="number" value={tanah.safety_bukti} onChange={(e) => updateTanah(index, 'safety_bukti', e.target.value)} placeholder="80" />
                </div>
                <div>
                  <Label>Lingkungan Sekitar</Label>
                  <Input type="number" value={tanah.safety_lingkungan} onChange={(e) => updateTanah(index, 'safety_lingkungan', e.target.value)} placeholder="80" />
                </div>
                <div>
                  <Label>Permasalahan</Label>
                  <Input type="number" value={tanah.safety_permasalahan} onChange={(e) => updateTanah(index, 'safety_permasalahan', e.target.value)} placeholder="80" />
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" onClick={addTanah} className="flex items-center gap-2">
          <Plus size={16} />
          Tambah Tanah
        </Button>

        {/* Data Bangunan - Multiple */}
        {bangunanList.map((bangunan, index) => (
          <div key={bangunan.id} className="rounded-xl border bg-card p-6 shadow-card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Building2 size={18} className="text-primary" />
                Data Bangunan {bangunanList.length > 1 ? `#${index + 1}` : ''}
              </h3>
              {bangunanList.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeBangunan(index)} className="text-destructive">
                  <Trash2 size={16} />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Profil Bangunan */}
              <p className="text-sm font-medium text-muted-foreground">A. PROFIL</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Peruntukkan Bangunan</Label>
                  <Select value={bangunan.peruntukkan} onValueChange={(v) => updateBangunan(index, 'peruntukkan', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rumah Tempat Tinggal">Rumah Tempat Tinggal</SelectItem>
                      <SelectItem value="Ruko">Ruko</SelectItem>
                      <SelectItem value="Gedung">Gedung</SelectItem>
                      <SelectItem value="Gudang">Gudang</SelectItem>
                      <SelectItem value="Pabrik">Pabrik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <Checkbox 
                    id={`imb-${index}`} 
                    checked={bangunan.imb_ada} 
                    onCheckedChange={(checked) => updateBangunan(index, 'imb_ada', !!checked)}
                  />
                  <Label htmlFor={`imb-${index}`}>IMB Ada</Label>
                </div>
                {bangunan.imb_ada && (
                  <>
                    <div>
                      <Label>Nomor IMB</Label>
                      <Input value={bangunan.nomor_imb} onChange={(e) => updateBangunan(index, 'nomor_imb', e.target.value)} />
                    </div>
                    <div>
                      <Label>Tanggal IMB</Label>
                      <Input type="date" value={bangunan.tanggal_imb} onChange={(e) => updateBangunan(index, 'tanggal_imb', e.target.value)} />
                    </div>
                  </>
                )}
              </div>

              {/* Hasil Pemeriksaan Fisik Bangunan */}
              <p className="text-sm font-medium text-muted-foreground pt-4">B. HASIL PEMERIKSAAN FISIK</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Konstruksi</Label>
                  <Select value={bangunan.konstruksi} onValueChange={(v) => updateBangunan(index, 'konstruksi', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Semi Permanent">Semi Permanent</SelectItem>
                      <SelectItem value="Non Permanent">Non Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pondasi</Label>
                  <Select value={bangunan.pondasi} onValueChange={(v) => updateBangunan(index, 'pondasi', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beton">Beton</SelectItem>
                      <SelectItem value="Batu Kali">Batu Kali</SelectItem>
                      <SelectItem value="Cakar Ayam">Cakar Ayam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tinggi (Lantai)</Label>
                  <Input type="number" value={bangunan.tinggi_lantai} onChange={(e) => updateBangunan(index, 'tinggi_lantai', e.target.value)} placeholder="1" />
                </div>
                <div>
                  <Label>Atap</Label>
                  <Select value={bangunan.atap} onValueChange={(v) => updateBangunan(index, 'atap', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Genteng">Genteng</SelectItem>
                      <SelectItem value="Seng">Seng</SelectItem>
                      <SelectItem value="Asbes">Asbes</SelectItem>
                      <SelectItem value="Beton">Beton</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Dinding</Label>
                  <Select value={bangunan.dinding} onValueChange={(v) => updateBangunan(index, 'dinding', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Batu Bata">Batu Bata</SelectItem>
                      <SelectItem value="Bataco">Bataco</SelectItem>
                      <SelectItem value="Hebel">Hebel</SelectItem>
                      <SelectItem value="Kayu">Kayu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <Checkbox 
                    id={`plester-${index}`} 
                    checked={bangunan.plester_dinding} 
                    onCheckedChange={(checked) => updateBangunan(index, 'plester_dinding', !!checked)}
                  />
                  <Label htmlFor={`plester-${index}`}>Plester Dinding</Label>
                </div>
                <div>
                  <Label>Plafon</Label>
                  <Select value={bangunan.plafon} onValueChange={(v) => updateBangunan(index, 'plafon', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gypsum">Gypsum</SelectItem>
                      <SelectItem value="Kayu Solid">Kayu Solid</SelectItem>
                      <SelectItem value="Triplek">Triplek</SelectItem>
                      <SelectItem value="Tidak Ada">Tidak Ada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lantai</Label>
                  <Select value={bangunan.lantai} onValueChange={(v) => updateBangunan(index, 'lantai', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Keramik">Keramik</SelectItem>
                      <SelectItem value="Granit">Granit</SelectItem>
                      <SelectItem value="Marmer">Marmer</SelectItem>
                      <SelectItem value="Semen">Semen</SelectItem>
                      <SelectItem value="Kayu">Kayu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Luas Bangunan (m²)</Label>
                  <Input type="number" value={bangunan.luas_bangunan} onChange={(e) => updateBangunan(index, 'luas_bangunan', e.target.value)} placeholder="0" />
                </div>
              </div>

              {/* Harga Pasar Bangunan */}
              <p className="text-sm font-medium text-muted-foreground pt-4">C. HARGA PASAR / m²</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Harga Pasar 1</Label>
                  <Input type="number" value={bangunan.harga_pembanding_1} onChange={(e) => updateBangunan(index, 'harga_pembanding_1', e.target.value)} placeholder="1200000" />
                  <Input className="mt-2" value={bangunan.sumber_1} onChange={(e) => updateBangunan(index, 'sumber_1', e.target.value)} placeholder="Sumber informasi" />
                </div>
                <div>
                  <Label>Harga Pasar 2</Label>
                  <Input type="number" value={bangunan.harga_pembanding_2} onChange={(e) => updateBangunan(index, 'harga_pembanding_2', e.target.value)} placeholder="1250000" />
                  <Input className="mt-2" value={bangunan.sumber_2} onChange={(e) => updateBangunan(index, 'sumber_2', e.target.value)} placeholder="Sumber informasi" />
                </div>
                <div>
                  <Label>Harga Pasar 3</Label>
                  <Input type="number" value={bangunan.harga_pembanding_3} onChange={(e) => updateBangunan(index, 'harga_pembanding_3', e.target.value)} placeholder="1150000" />
                  <Input className="mt-2" value={bangunan.sumber_3} onChange={(e) => updateBangunan(index, 'sumber_3', e.target.value)} placeholder="Sumber informasi" />
                </div>
              </div>

              {/* Safety Margin Bangunan */}
              <p className="text-sm font-medium text-muted-foreground pt-4">D. FAKTOR PENYESUAIAN (Safety Margin %)</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Design</Label>
                  <Input type="number" value={bangunan.safety_design} onChange={(e) => updateBangunan(index, 'safety_design', e.target.value)} placeholder="70" />
                </div>
                <div>
                  <Label>Umur</Label>
                  <Input type="number" value={bangunan.safety_umur} onChange={(e) => updateBangunan(index, 'safety_umur', e.target.value)} placeholder="70" />
                </div>
                <div>
                  <Label>Peruntukkan</Label>
                  <Input type="number" value={bangunan.safety_peruntukkan} onChange={(e) => updateBangunan(index, 'safety_peruntukkan', e.target.value)} placeholder="80" />
                </div>
                <div>
                  <Label>IMB</Label>
                  <Input type="number" value={bangunan.safety_imb} onChange={(e) => updateBangunan(index, 'safety_imb', e.target.value)} placeholder="80" />
                </div>
                <div>
                  <Label>Kesesuaian Lahan</Label>
                  <Input type="number" value={bangunan.safety_kesesuaian} onChange={(e) => updateBangunan(index, 'safety_kesesuaian', e.target.value)} placeholder="80" />
                </div>
                <div>
                  <Label>Permasalahan</Label>
                  <Input type="number" value={bangunan.safety_permasalahan} onChange={(e) => updateBangunan(index, 'safety_permasalahan', e.target.value)} placeholder="80" />
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" onClick={addBangunan} className="flex items-center gap-2">
          <Plus size={16} />
          Tambah Bangunan
        </Button>

        {/* Tim Penilai */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User size={18} className="text-primary" />
            TIM PENILAI
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pimpinan">Nama Pimpinan</Label>
              <Input
                id="pimpinan"
                name="pimpinan"
                placeholder="Nama pimpinan cabang"
                value={formData.pimpinan}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="jabatan_pimpinan">Jabatan Pimpinan</Label>
              <Input
                id="jabatan_pimpinan"
                name="jabatan_pimpinan"
                value={formData.jabatan_pimpinan}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Kantor Cabang */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Building size={18} className="text-primary" />
            KANTOR CABANG
          </h3>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="kantor_cabang">Nama Kantor Cabang</Label>
              <Input
                id="kantor_cabang"
                name="kantor_cabang"
                value={formData.kantor_cabang}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="alamat_cabang">Alamat Kantor Cabang</Label>
              <Textarea
                id="alamat_cabang"
                name="alamat_cabang"
                value={formData.alamat_cabang}
                onChange={handleChange}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Marketability */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileCheck size={18} className="text-primary" />
            TINGKAT MARKETABILITY
          </h3>
          <div className="grid gap-4">
            <div>
              <Label>Tingkat Marketability</Label>
              <Select value={formData.marketability} onValueChange={(v) => setFormData(prev => ({ ...prev, marketability: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Marketable">Marketable</SelectItem>
                  <SelectItem value="Cukup Marketable">Cukup Marketable</SelectItem>
                  <SelectItem value="Kurang Marketable">Kurang Marketable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Catatan 1</Label>
              <Input
                name="catatan_marketability_1"
                value={formData.catatan_marketability_1}
                onChange={handleChange}
                placeholder="Lokasi tanah dan bangunan berada di tengah pemukiman warga"
              />
            </div>
            <div>
              <Label>Catatan 2</Label>
              <Input
                name="catatan_marketability_2"
                value={formData.catatan_marketability_2}
                onChange={handleChange}
                placeholder="Kondisi tanah sedikit berbukit"
              />
            </div>
            <div>
              <Label>Catatan 3</Label>
              <Input
                name="catatan_marketability_3"
                value={formData.catatan_marketability_3}
                onChange={handleChange}
                placeholder="Kondisi bangunan semi modern"
              />
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <Button variant="accent" onClick={handleHitung} className="w-full">
          <Calculator className="mr-2" size={16} />
          Hitung Taksasi
        </Button>

        {/* Hasil Perhitungan */}
        {hasil && (
          <div className="rounded-xl border bg-card p-6 shadow-card animate-scale-up">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-success" />
              Hasil Perhitungan
            </h3>

            {/* Detail per item */}
            {hasil.detail_tanah.map((dt, i) => (
              <div key={i} className="mb-2 p-3 rounded-lg bg-muted/30 text-sm">
                <span className="font-medium">Tanah #{i + 1}:</span>
                <span className="ml-2">Nilai Pasar: {formatCurrency(dt.nilai_pasar)}</span>
                <span className="ml-4">Nilai Likuidasi: {formatCurrency(dt.nilai_likuidasi)}</span>
              </div>
            ))}
            {hasil.detail_bangunan.map((db, i) => (
              <div key={i} className="mb-2 p-3 rounded-lg bg-muted/30 text-sm">
                <span className="font-medium">Bangunan #{i + 1}:</span>
                <span className="ml-2">Nilai Pasar: {formatCurrency(db.nilai_pasar)}</span>
                <span className="ml-4">Nilai Likuidasi: {formatCurrency(db.nilai_likuidasi)}</span>
              </div>
            ))}

            <div className="grid sm:grid-cols-2 gap-4 mt-4 mb-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Total Nilai Tanah</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(hasil.total_nilai_tanah)}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Total Nilai Bangunan</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(hasil.total_nilai_bangunan)}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground mb-1">Total Nilai Taksasi</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(hasil.nilai_taksasi)}</p>
                <p className="text-xs text-muted-foreground mt-1">= Nilai Tanah + Nilai Bangunan</p>
              </div>
              <div className="p-4 rounded-lg bg-success/10">
                <p className="text-sm text-muted-foreground mb-1">Nilai Likuidasi</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(hasil.nilai_likuidasi)}</p>
                <p className="text-xs text-muted-foreground mt-1">= Sesuai Safety Margin</p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <p className="text-sm">
                <span className="font-medium">Terbilang: </span>
                {hasil.terbilang}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="hero" onClick={handleSimpan} className="flex-1">
                <Save className="mr-2" size={16} />
                Simpan Taksasi
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

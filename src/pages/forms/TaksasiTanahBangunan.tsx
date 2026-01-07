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
  SAFETY_MARGIN_TANAH,
  SAFETY_MARGIN_BANGUNAN,
  getMarginByValue,
  getLabelByValue,
} from '@/lib/safetyMarginConfig';
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
  // Safety margins as dropdown values (condition names)
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
  // Safety margins as dropdown values (condition names)
  safety_design: string;
  safety_umur: string;
  safety_peruntukkan: string;
  safety_imb: string;
  safety_kesesuaian: string;
  safety_permasalahan: string;
}

const defaultTanah: TanahItem = {
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
  // Default safety margin conditions
  safety_lokasi: 'cukup_strategis',
  safety_topography: 'datar',
  safety_ukuran: 'ideal',
  safety_bukti: 'hak_milik',
  safety_lingkungan: 'prospek_berkembang',
  safety_permasalahan: 'aman',
};

const defaultBangunan: BangunanItem = {
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
  // Default safety margin conditions
  safety_design: 'semi_modern',
  safety_umur: 'muda',
  safety_peruntukkan: 'non_produktif',
  safety_imb: 'tidak_ada_non_produktif',
  safety_kesesuaian: 'ideal',
  safety_permasalahan: 'aman',
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
    marketability: 'cukup_marketable',
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
    detail_tanah: { nilai_pasar: number; nilai_likuidasi: number; avg_safety: number }[];
    detail_bangunan: { nilai_pasar: number; nilai_likuidasi: number; avg_safety: number }[];
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setHasil(null);
  };

  const updateTanah = (index: number, field: keyof TanahItem, value: string | boolean | string[]) => {
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
    // Calculate tanah values using condition-based safety margins
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
      
      // Get safety margins from condition values
      const safetyMargins = [
        getMarginByValue(SAFETY_MARGIN_TANAH.lokasi_daerah, t.safety_lokasi),
        getMarginByValue(SAFETY_MARGIN_TANAH.topography, t.safety_topography),
        getMarginByValue(SAFETY_MARGIN_TANAH.ukuran_bentuk, t.safety_ukuran),
        getMarginByValue(SAFETY_MARGIN_TANAH.bukti_kepemilikan, t.safety_bukti),
        getMarginByValue(SAFETY_MARGIN_TANAH.lingkungan_sekitar, t.safety_lingkungan),
        getMarginByValue(SAFETY_MARGIN_TANAH.permasalahan, t.safety_permasalahan),
      ];
      const avgSafety = safetyMargins.reduce((a, b) => a + b, 0) / safetyMargins.length / 100;
      const nilaiLikuidasi = nilaiPasar * avgSafety;
      
      return { nilai_pasar: nilaiPasar, nilai_likuidasi: nilaiLikuidasi, avg_safety: avgSafety * 100 };
    });

    // Calculate bangunan values using condition-based safety margins
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
      
      // Get safety margins from condition values
      const safetyMargins = [
        getMarginByValue(SAFETY_MARGIN_BANGUNAN.design, b.safety_design),
        getMarginByValue(SAFETY_MARGIN_BANGUNAN.umur, b.safety_umur),
        getMarginByValue(SAFETY_MARGIN_BANGUNAN.peruntukkan, b.safety_peruntukkan),
        getMarginByValue(SAFETY_MARGIN_BANGUNAN.imb, b.safety_imb),
        getMarginByValue(SAFETY_MARGIN_BANGUNAN.kesesuaian_lahan, b.safety_kesesuaian),
        getMarginByValue(SAFETY_MARGIN_BANGUNAN.permasalahan, b.safety_permasalahan),
      ];
      const avgSafety = safetyMargins.reduce((a, b) => a + b, 0) / safetyMargins.length / 100;
      const nilaiLikuidasi = nilaiPasar * avgSafety;
      
      return { nilai_pasar: nilaiPasar, nilai_likuidasi: nilaiLikuidasi, avg_safety: avgSafety * 100 };
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
                      <SelectItem value="hak_milik">Hak Milik</SelectItem>
                      <SelectItem value="hgb">HGB</SelectItem>
                      <SelectItem value="hgu">HGU</SelectItem>
                      <SelectItem value="hak_pakai">Hak Pakai</SelectItem>
                      <SelectItem value="girik">Girik</SelectItem>
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
                  <Label>Masa Berlaku Bukti Kepemilikan</Label>
                  <Input type="date" value={tanah.masa_berlaku} onChange={(e) => updateTanah(index, 'masa_berlaku', e.target.value)} placeholder="Kosongkan jika tidak ada" />
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
                      <SelectItem value="milik_sendiri">Milik Sendiri</SelectItem>
                      <SelectItem value="kerabat">Kerabat/ Keluarga</SelectItem>
                      <SelectItem value="pihak_ketiga">Pihak Ketiga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nomor Gambar Situasi</Label>
                  <Input value={tanah.nomor_gambar_situasi} onChange={(e) => updateTanah(index, 'nomor_gambar_situasi', e.target.value)} placeholder="Nomor gambar situasi" />
                </div>
                <div>
                  <Label>Nomor Induk Bidang</Label>
                  <Input value={tanah.nomor_induk_bidang} onChange={(e) => updateTanah(index, 'nomor_induk_bidang', e.target.value)} placeholder="NIB" />
                </div>
                <div>
                  <Label>Luas Tanah (m²)</Label>
                  <Input type="number" value={tanah.luas_tanah} onChange={(e) => updateTanah(index, 'luas_tanah', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label>Tempat Didaftarkan</Label>
                  <Input value={tanah.tempat_didaftarkan} onChange={(e) => updateTanah(index, 'tempat_didaftarkan', e.target.value)} placeholder="Kantor BPN" />
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
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="rendah">Rendah</SelectItem>
                      <SelectItem value="tinggi">Tinggi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bentuk Tanah</Label>
                  <Select value={tanah.bentuk_tanah} onValueChange={(v) => updateTanah(index, 'bentuk_tanah', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beraturan">Beraturan</SelectItem>
                      <SelectItem value="tidak_beraturan">Tidak Beraturan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Arah Menghadap</Label>
                  <Select value={tanah.arah_menghadap} onValueChange={(v) => updateTanah(index, 'arah_menghadap', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utara">Utara</SelectItem>
                      <SelectItem value="selatan">Selatan</SelectItem>
                      <SelectItem value="barat">Barat</SelectItem>
                      <SelectItem value="timur">Timur</SelectItem>
                      <SelectItem value="barat_daya">Barat Daya</SelectItem>
                      <SelectItem value="barat_laut">Barat Laut</SelectItem>
                      <SelectItem value="tenggara">Tenggara</SelectItem>
                      <SelectItem value="timur_laut">Timur Laut</SelectItem>
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
                      <SelectItem value="aspal">Aspal</SelectItem>
                      <SelectItem value="cor_semen">Cor Semen</SelectItem>
                      <SelectItem value="tanah">Tanah</SelectItem>
                      <SelectItem value="paving">Paving</SelectItem>
                    </SelectContent>
                  </Select>
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

              {/* Analisa Lingkungan */}
              <p className="text-sm font-medium text-muted-foreground pt-4">C. ANALISA LINGKUNGAN</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Kondisi Lalu Lintas</Label>
                  <Input value={tanah.kondisi_lalu_lintas} onChange={(e) => updateTanah(index, 'kondisi_lalu_lintas', e.target.value)} placeholder="Gang dapat dilalui kendaraan roda 4" />
                </div>
                <div>
                  <Label>Kelas Jalan</Label>
                  <Select value={tanah.kelas_jalan} onValueChange={(v) => updateTanah(index, 'kelas_jalan', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kampung">Kampung</SelectItem>
                      <SelectItem value="desa">Desa</SelectItem>
                      <SelectItem value="kota">Kota</SelectItem>
                      <SelectItem value="provinsi">Provinsi</SelectItem>
                      <SelectItem value="nasional">Nasional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Listrik PLN</Label>
                  <Input value={tanah.listrik_pln} onChange={(e) => updateTanah(index, 'listrik_pln', e.target.value)} placeholder="1.300 Watt" />
                </div>
                <div>
                  <Label>Air Bersih (PAM)</Label>
                  <Select value={tanah.air_bersih} onValueChange={(v) => updateTanah(index, 'air_bersih', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ada">Ada</SelectItem>
                      <SelectItem value="tidak_ada">Tidak Ada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Saluran Telepon</Label>
                  <Select value={tanah.saluran_telepon} onValueChange={(v) => updateTanah(index, 'saluran_telepon', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ada">Ada</SelectItem>
                      <SelectItem value="tidak_ada">Tidak Ada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Harga Pasar */}
              <p className="text-sm font-medium text-muted-foreground pt-4">D. HARGA PASAR / m²</p>
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

              {/* Safety Margin Tanah - Now with Dropdowns */}
              <p className="text-sm font-medium text-muted-foreground pt-4">E. FAKTOR PENYESUAIAN (Pilih Kondisi)</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Lokasi/Daerah</Label>
                  <Select value={tanah.safety_lokasi} onValueChange={(v) => updateTanah(index, 'safety_lokasi', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAFETY_MARGIN_TANAH.lokasi_daerah.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} ({opt.margin}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Topography</Label>
                  <Select value={tanah.safety_topography} onValueChange={(v) => updateTanah(index, 'safety_topography', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAFETY_MARGIN_TANAH.topography.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} ({opt.margin}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ukuran & Bentuk</Label>
                  <Select value={tanah.safety_ukuran} onValueChange={(v) => updateTanah(index, 'safety_ukuran', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAFETY_MARGIN_TANAH.ukuran_bentuk.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} ({opt.margin}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bukti Kepemilikan</Label>
                  <Select value={tanah.safety_bukti} onValueChange={(v) => updateTanah(index, 'safety_bukti', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAFETY_MARGIN_TANAH.bukti_kepemilikan.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} ({opt.margin}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lingkungan Sekitar</Label>
                  <Select value={tanah.safety_lingkungan} onValueChange={(v) => updateTanah(index, 'safety_lingkungan', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAFETY_MARGIN_TANAH.lingkungan_sekitar.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} ({opt.margin}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Permasalahan</Label>
                  <Select value={tanah.safety_permasalahan} onValueChange={(v) => updateTanah(index, 'safety_permasalahan', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAFETY_MARGIN_TANAH.permasalahan.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} ({opt.margin}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="rumah_tinggal">Rumah Tempat Tinggal</SelectItem>
                      <SelectItem value="ruko">Ruko</SelectItem>
                      <SelectItem value="gedung">Gedung</SelectItem>
                      <SelectItem value="gudang">Gudang</SelectItem>
                      <SelectItem value="pabrik">Pabrik</SelectItem>
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
                    <div>
                      <Label>Nama di IMB</Label>
                      <Input value={bangunan.nama_di_imb} onChange={(e) => updateBangunan(index, 'nama_di_imb', e.target.value)} />
                    </div>
                    <div>
                      <Label>Luas Sesuai IMB (m²)</Label>
                      <Input type="number" value={bangunan.luas_sesuai_imb} onChange={(e) => updateBangunan(index, 'luas_sesuai_imb', e.target.value)} />
                    </div>
                    <div>
                      <Label>Tinggi Sesuai IMB (lantai)</Label>
                      <Input type="number" value={bangunan.tinggi_sesuai_imb} onChange={(e) => updateBangunan(index, 'tinggi_sesuai_imb', e.target.value)} />
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
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="semi_permanent">Semi Permanent</SelectItem>
                      <SelectItem value="non_permanent">Non Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pondasi</Label>
                  <Select value={bangunan.pondasi} onValueChange={(v) => updateBangunan(index, 'pondasi', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beton">Beton</SelectItem>
                      <SelectItem value="batu_kali">Batu Kali</SelectItem>
                      <SelectItem value="cakar_ayam">Cakar Ayam</SelectItem>
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
                      <SelectItem value="genteng">Genteng</SelectItem>
                      <SelectItem value="seng">Seng</SelectItem>
                      <SelectItem value="asbes">Asbes</SelectItem>
                      <SelectItem value="beton">Beton</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Dinding</Label>
                  <Select value={bangunan.dinding} onValueChange={(v) => updateBangunan(index, 'dinding', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="batu_bata">Batu Bata</SelectItem>
                      <SelectItem value="bataco">Bataco</SelectItem>
                      <SelectItem value="hebel">Hebel</SelectItem>
                      <SelectItem value="kayu">Kayu</SelectItem>
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
                      <SelectItem value="gypsum">Gypsum</SelectItem>
                      <SelectItem value="kayu_solid">Kayu Solid</SelectItem>
                      <SelectItem value="triplek">Triplek</SelectItem>
                      <SelectItem value="tidak_ada">Tidak Ada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lantai</Label>
                  <Select value={bangunan.lantai} onValueChange={(v) => updateBangunan(index, 'lantai', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keramik">Keramik</SelectItem>
                      <SelectItem value="granit">Granit</SelectItem>
                      <SelectItem value="marmer">Marmer</SelectItem>
                      <SelectItem value="semen">Semen</SelectItem>
                      <SelectItem value="kayu">Kayu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Luas Bangunan (m²)</Label>
                  <Input type="number" value={bangunan.luas_bangunan} onChange={(e) => updateBangunan(index, 'luas_bangunan', e.target.value)} placeholder="0" />
                </div>
              </div>
              <div>
                <Label>Keterangan</Label>
                <Textarea value={bangunan.keterangan} onChange={(e) => updateBangunan(index, 'keterangan', e.target.value)} placeholder="Catatan tambahan tentang kondisi bangunan" rows={2} />
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

              {/* Safety Margin Bangunan - Now with Dropdowns */}
              <p className="text-sm font-medium text-muted-foreground pt-4">D. FAKTOR PENYESUAIAN (Pilih Kondisi)</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Design</Label>
                  <Select value={bangunan.safety_design} onValueChange={(v) => updateBangunan(index, 'safety_design', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAFETY_MARGIN_BANGUNAN.design.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} ({opt.margin}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Umur</Label>
                  <Select value={bangunan.safety_umur} onValueChange={(v) => updateBangunan(index, 'safety_umur', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAFETY_MARGIN_BANGUNAN.umur.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} ({opt.margin}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Peruntukkan</Label>
                  <Select value={bangunan.safety_peruntukkan} onValueChange={(v) => updateBangunan(index, 'safety_peruntukkan', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAFETY_MARGIN_BANGUNAN.peruntukkan.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} ({opt.margin}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>IMB</Label>
                  <Select value={bangunan.safety_imb} onValueChange={(v) => updateBangunan(index, 'safety_imb', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAFETY_MARGIN_BANGUNAN.imb.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} ({opt.margin}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Kesesuaian thd Lahan Sekitar</Label>
                  <Select value={bangunan.safety_kesesuaian} onValueChange={(v) => updateBangunan(index, 'safety_kesesuaian', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAFETY_MARGIN_BANGUNAN.kesesuaian_lahan.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} ({opt.margin}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Permasalahan</Label>
                  <Select value={bangunan.safety_permasalahan} onValueChange={(v) => updateBangunan(index, 'safety_permasalahan', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAFETY_MARGIN_BANGUNAN.permasalahan.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} ({opt.margin}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" onClick={addBangunan} className="flex items-center gap-2">
          <Plus size={16} />
          Tambah Bangunan
        </Button>

        {/* TIM PENILAI */}
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

        {/* KANTOR CABANG */}
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
          <h3 className="font-semibold mb-4">MARKETABILITY</h3>
          <div className="grid gap-4">
            <div>
              <Label>Tingkat Marketability</Label>
              <Select value={formData.marketability} onValueChange={(v) => setFormData(prev => ({ ...prev, marketability: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sangat_marketable">Sangat Marketable</SelectItem>
                  <SelectItem value="cukup_marketable">Cukup Marketable</SelectItem>
                  <SelectItem value="kurang_marketable">Kurang Marketable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Catatan Marketability 1</Label>
              <Input name="catatan_marketability_1" value={formData.catatan_marketability_1} onChange={handleChange} placeholder="Lokasi tanah dan bangunan berada di tengah pemukiman warga" />
            </div>
            <div>
              <Label>Catatan Marketability 2</Label>
              <Input name="catatan_marketability_2" value={formData.catatan_marketability_2} onChange={handleChange} placeholder="Kondisi tanah sedikit berbukit" />
            </div>
            <div>
              <Label>Catatan Marketability 3</Label>
              <Input name="catatan_marketability_3" value={formData.catatan_marketability_3} onChange={handleChange} placeholder="Kondisi bangunan semi modern" />
            </div>
          </div>
        </div>

        {/* Tombol Hitung */}
        <Button variant="accent" className="w-full" onClick={handleHitung}>
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
            
            {/* Detail per Tanah */}
            {hasil.detail_tanah.map((dt, i) => (
              <div key={i} className="mb-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium mb-2">Tanah #{i + 1}</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>Nilai Pasar: {formatCurrency(dt.nilai_pasar)}</div>
                  <div>Nilai Likuidasi: {formatCurrency(dt.nilai_likuidasi)}</div>
                  <div>Safety Margin: {dt.avg_safety.toFixed(1)}%</div>
                </div>
              </div>
            ))}

            {/* Detail per Bangunan */}
            {hasil.detail_bangunan.map((db, i) => (
              <div key={i} className="mb-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium mb-2">Bangunan #{i + 1}</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>Nilai Pasar: {formatCurrency(db.nilai_pasar)}</div>
                  <div>Nilai Likuidasi: {formatCurrency(db.nilai_likuidasi)}</div>
                  <div>Safety Margin: {db.avg_safety.toFixed(1)}%</div>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Total Nilai Taksasi</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(hasil.nilai_taksasi)}</p>
              </div>
              <div className="p-4 rounded-lg bg-success/10">
                <p className="text-sm text-muted-foreground mb-1">Total Nilai Likuidasi</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(hasil.nilai_likuidasi)}</p>
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

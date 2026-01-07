import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTaksasi } from '@/context/TaksasiContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  formatCurrency, 
  formatTerbilang, 
  generateNomorDokumen, 
  DetailAgunanTanahSimple,
  generateId 
} from '@/types';
import { 
  SAFETY_MARGIN_TANAH,
  getMarginByValue,
  getLabelByValue,
} from '@/lib/safetyMarginConfig';
import { 
  Calculator, 
  Save, 
  ArrowLeft, 
  MapPin, 
  Home, 
  DollarSign, 
  User, 
  Building,
  Plus,
  Trash2,
  AlertCircle,
  Camera,
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

export default function TaksasiTanah() {
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
  const [dokumentasi, setDokumentasi] = useState<string[]>([]);

  const [hasil, setHasil] = useState<{
    total_nilai_tanah: number;
    nilai_taksasi: number;
    nilai_likuidasi: number;
    terbilang: string;
    detail_tanah: { nilai_pasar: number; nilai_likuidasi: number; avg_safety: number }[];
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

  const addTanah = () => {
    setTanahList(prev => [...prev, { ...defaultTanah, id: generateId() }]);
  };

  const removeTanah = (index: number) => {
    if (tanahList.length > 1) {
      setTanahList(prev => prev.filter((_, i) => i !== index));
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

    const totalNilaiTanah = detailTanah.reduce((sum, d) => sum + d.nilai_pasar, 0);
    const nilaiTaksasi = totalNilaiTanah;
    const nilaiLikuidasi = detailTanah.reduce((sum, d) => sum + d.nilai_likuidasi, 0);

    setHasil({
      total_nilai_tanah: totalNilaiTanah,
      nilai_taksasi: nilaiTaksasi,
      nilai_likuidasi: nilaiLikuidasi,
      terbilang: formatTerbilang(nilaiTaksasi),
      detail_tanah: detailTanah,
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
    const avgHargaTanah = totalLuasTanah > 0 ? hasil.total_nilai_tanah / totalLuasTanah : 0;

    const detailAgunan: DetailAgunanTanahSimple = {
      luas_tanah: totalLuasTanah,
      harga_per_meter: avgHargaTanah,
    };

    const alamatGabungan = tanahList.map(t => t.lokasi).filter(l => l).join('; ') || 'Alamat tidak disebutkan';

    addTaksasi({
      id_user: user?.id || '',
      nomor_dokumen: generateNomorDokumen('TLH'),
      jenis_agunan: 'Tanah',
      nama_nasabah: formData.nama_nasabah,
      alamat: alamatGabungan,
      nilai_pasar: hasil.nilai_taksasi,
      nilai_taksasi: hasil.nilai_taksasi,
      nilai_taksasi_pembulatan: hasil.nilai_taksasi,
      nilai_likuidasi: hasil.nilai_likuidasi,
      nilai_likuidasi_pembulatan: hasil.nilai_likuidasi,
      safety_margin: 20,
      terbilang: hasil.terbilang,
      status_otorisasi: 'Selesai',
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
      description: 'Data taksasi tanah telah disimpan dan menunggu otorisasi',
    });

    navigate('/riwayat');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Formulir Taksasi Tanah"
        description="Penilaian agunan berupa tanah kosong"
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
                  <Input 
                    value={tanah.nomor_bukti} 
                    onChange={(e) => updateTanah(index, 'nomor_bukti', e.target.value)}
                    placeholder="No. Sertifikat"
                  />
                </div>
                <div>
                  <Label>Tanggal Bukti</Label>
                  <Input 
                    type="date"
                    value={tanah.tanggal_bukti} 
                    onChange={(e) => updateTanah(index, 'tanggal_bukti', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Masa Berlaku</Label>
                  <Input 
                    type="date"
                    value={tanah.masa_berlaku} 
                    onChange={(e) => updateTanah(index, 'masa_berlaku', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Nama Pemegang Hak</Label>
                  <Input 
                    value={tanah.nama_pemegang_hak} 
                    onChange={(e) => updateTanah(index, 'nama_pemegang_hak', e.target.value)}
                    placeholder="Nama pemegang hak"
                  />
                </div>
                <div>
                  <Label>Hubungan dengan Debitur</Label>
                  <Select value={tanah.hubungan_dengan_debitur} onValueChange={(v) => updateTanah(index, 'hubungan_dengan_debitur', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="milik_sendiri">Milik Sendiri</SelectItem>
                      <SelectItem value="suami_istri">Suami/Istri</SelectItem>
                      <SelectItem value="orang_tua">Orang Tua</SelectItem>
                      <SelectItem value="anak">Anak</SelectItem>
                      <SelectItem value="saudara">Saudara</SelectItem>
                      <SelectItem value="pihak_ketiga">Pihak Ketiga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nomor Gambar Situasi</Label>
                  <Input 
                    value={tanah.nomor_gambar_situasi} 
                    onChange={(e) => updateTanah(index, 'nomor_gambar_situasi', e.target.value)}
                    placeholder="No. GS/SU"
                  />
                </div>
                <div>
                  <Label>Nomor Induk Bidang (NIB)</Label>
                  <Input 
                    value={tanah.nomor_induk_bidang} 
                    onChange={(e) => updateTanah(index, 'nomor_induk_bidang', e.target.value)}
                    placeholder="NIB"
                  />
                </div>
                <div>
                  <Label>Luas Tanah (m²)</Label>
                  <Input 
                    type="number"
                    value={tanah.luas_tanah} 
                    onChange={(e) => updateTanah(index, 'luas_tanah', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Tempat Didaftarkan</Label>
                  <Input 
                    value={tanah.tempat_didaftarkan} 
                    onChange={(e) => updateTanah(index, 'tempat_didaftarkan', e.target.value)}
                    placeholder="BPN Kota/Kabupaten"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Lokasi Tanah</Label>
                  <Textarea 
                    value={tanah.lokasi} 
                    onChange={(e) => updateTanah(index, 'lokasi', e.target.value)}
                    placeholder="Alamat lengkap lokasi tanah"
                    rows={2}
                  />
                </div>
              </div>

              {/* Pemeriksaan Fisik */}
              <p className="text-sm font-medium text-muted-foreground mt-6">B. PEMERIKSAAN FISIK</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Letak Tanah</Label>
                  <Select value={tanah.letak_tanah} onValueChange={(v) => updateTanah(index, 'letak_tanah', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal / Sejajar Jalan</SelectItem>
                      <SelectItem value="lebih_tinggi">Lebih Tinggi dari Jalan</SelectItem>
                      <SelectItem value="lebih_rendah">Lebih Rendah dari Jalan</SelectItem>
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
                      <SelectItem value="timur">Timur</SelectItem>
                      <SelectItem value="barat">Barat</SelectItem>
                      <SelectItem value="timur_laut">Timur Laut</SelectItem>
                      <SelectItem value="tenggara">Tenggara</SelectItem>
                      <SelectItem value="barat_daya">Barat Daya</SelectItem>
                      <SelectItem value="barat_laut">Barat Laut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lebar Jalan Depan (m)</Label>
                  <Input 
                    value={tanah.lebar_jalan_depan} 
                    onChange={(e) => updateTanah(index, 'lebar_jalan_depan', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Bahan Jalan</Label>
                  <Select value={tanah.bahan_jalan} onValueChange={(v) => updateTanah(index, 'bahan_jalan', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aspal">Aspal</SelectItem>
                      <SelectItem value="beton">Beton</SelectItem>
                      <SelectItem value="paving">Paving Block</SelectItem>
                      <SelectItem value="tanah">Tanah</SelectItem>
                      <SelectItem value="kerikil">Kerikil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Kelas Jalan</Label>
                  <Select value={tanah.kelas_jalan} onValueChange={(v) => updateTanah(index, 'kelas_jalan', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="protokol">Jalan Protokol</SelectItem>
                      <SelectItem value="provinsi">Jalan Provinsi</SelectItem>
                      <SelectItem value="kota">Jalan Kota</SelectItem>
                      <SelectItem value="desa">Jalan Desa</SelectItem>
                      <SelectItem value="kampung">Jalan Kampung/Gang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Batas-batas */}
              <p className="text-xs text-muted-foreground mt-4">Batas-batas:</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Batas Depan</Label>
                  <Input 
                    value={tanah.batas_depan} 
                    onChange={(e) => updateTanah(index, 'batas_depan', e.target.value)}
                    placeholder="Jalan / Tanah milik..."
                  />
                </div>
                <div>
                  <Label>Batas Belakang</Label>
                  <Input 
                    value={tanah.batas_belakang} 
                    onChange={(e) => updateTanah(index, 'batas_belakang', e.target.value)}
                    placeholder="Tanah milik..."
                  />
                </div>
                <div>
                  <Label>Batas Kanan</Label>
                  <Input 
                    value={tanah.batas_kanan} 
                    onChange={(e) => updateTanah(index, 'batas_kanan', e.target.value)}
                    placeholder="Tanah milik..."
                  />
                </div>
                <div>
                  <Label>Batas Kiri</Label>
                  <Input 
                    value={tanah.batas_kiri} 
                    onChange={(e) => updateTanah(index, 'batas_kiri', e.target.value)}
                    placeholder="Tanah milik..."
                  />
                </div>
              </div>

              {/* Analisa Lingkungan */}
              <p className="text-sm font-medium text-muted-foreground mt-6">C. ANALISA LINGKUNGAN</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Kondisi Lalu Lintas</Label>
                  <Input 
                    value={tanah.kondisi_lalu_lintas} 
                    onChange={(e) => updateTanah(index, 'kondisi_lalu_lintas', e.target.value)}
                    placeholder="Ramai/Sedang/Sepi"
                  />
                </div>
                <div>
                  <Label>Listrik PLN</Label>
                  <Input 
                    value={tanah.listrik_pln} 
                    onChange={(e) => updateTanah(index, 'listrik_pln', e.target.value)}
                    placeholder="Ada/Tidak Ada"
                  />
                </div>
                <div>
                  <Label>Air Bersih</Label>
                  <Select value={tanah.air_bersih} onValueChange={(v) => updateTanah(index, 'air_bersih', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ada">Ada (PDAM/Sumur)</SelectItem>
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

              {/* Fasilitas Penunjang */}
              <div className="mt-4">
                <Label className="mb-2 block">Fasilitas Penunjang</Label>
                <div className="grid sm:grid-cols-3 gap-2">
                  {['Sekolah', 'Rumah Sakit', 'Pasar', 'Bank', 'Masjid/Gereja', 'Kantor Pemerintah'].map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <Checkbox 
                        checked={tanah.fasilitas_penunjang.includes(f)}
                        onCheckedChange={(checked) => {
                          const newFasilitas = checked 
                            ? [...tanah.fasilitas_penunjang, f]
                            : tanah.fasilitas_penunjang.filter(x => x !== f);
                          updateTanah(index, 'fasilitas_penunjang', newFasilitas);
                        }}
                      />
                      <span className="text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Harga Pasar Pembanding */}
              <p className="text-sm font-medium text-muted-foreground mt-6">D. HARGA PASAR PEMBANDING (per m²)</p>
              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Harga Pembanding 1 (Rp/m²)</Label>
                    <Input 
                      type="number"
                      value={tanah.harga_pembanding_1} 
                      onChange={(e) => updateTanah(index, 'harga_pembanding_1', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Sumber Data 1</Label>
                    <Input 
                      value={tanah.sumber_1} 
                      onChange={(e) => updateTanah(index, 'sumber_1', e.target.value)}
                      placeholder="URL/Keterangan"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Harga Pembanding 2 (Rp/m²)</Label>
                    <Input 
                      type="number"
                      value={tanah.harga_pembanding_2} 
                      onChange={(e) => updateTanah(index, 'harga_pembanding_2', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Sumber Data 2</Label>
                    <Input 
                      value={tanah.sumber_2} 
                      onChange={(e) => updateTanah(index, 'sumber_2', e.target.value)}
                      placeholder="URL/Keterangan"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Harga Pembanding 3 (Rp/m²)</Label>
                    <Input 
                      type="number"
                      value={tanah.harga_pembanding_3} 
                      onChange={(e) => updateTanah(index, 'harga_pembanding_3', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Sumber Data 3</Label>
                    <Input 
                      value={tanah.sumber_3} 
                      onChange={(e) => updateTanah(index, 'sumber_3', e.target.value)}
                      placeholder="URL/Keterangan"
                    />
                  </div>
                </div>
              </div>

              {/* Faktor Penyesuaian (Safety Margin) */}
              <p className="text-sm font-medium text-muted-foreground mt-6">E. FAKTOR PENYESUAIAN (Safety Margin)</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Lokasi/Daerah</Label>
                  <Select value={tanah.safety_lokasi} onValueChange={(v) => updateTanah(index, 'safety_lokasi', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAFETY_MARGIN_TANAH.lokasi_daerah.map(item => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label} ({item.margin}%)
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
                      {SAFETY_MARGIN_TANAH.topography.map(item => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label} ({item.margin}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ukuran/Bentuk</Label>
                  <Select value={tanah.safety_ukuran} onValueChange={(v) => updateTanah(index, 'safety_ukuran', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAFETY_MARGIN_TANAH.ukuran_bentuk.map(item => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label} ({item.margin}%)
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
                      {SAFETY_MARGIN_TANAH.bukti_kepemilikan.map(item => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label} ({item.margin}%)
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
                      {SAFETY_MARGIN_TANAH.lingkungan_sekitar.map(item => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label} ({item.margin}%)
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
                      {SAFETY_MARGIN_TANAH.permasalahan.map(item => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label} ({item.margin}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Tanah Button */}
        <Button variant="outline" onClick={addTanah} className="w-full">
          <Plus className="mr-2" size={16} />
          Tambah Tanah
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
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-warning" />
            MARKETABILITY
          </h3>
          <div className="grid gap-4">
            <div>
              <Label>Status Marketability</Label>
              <Select value={formData.marketability} onValueChange={(v) => setFormData(prev => ({ ...prev, marketability: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketable">Marketable</SelectItem>
                  <SelectItem value="cukup_marketable">Cukup Marketable</SelectItem>
                  <SelectItem value="kurang_marketable">Kurang Marketable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Catatan 1</Label>
              <Input
                name="catatan_marketability_1"
                value={formData.catatan_marketability_1}
                onChange={handleChange}
                placeholder="Catatan marketability..."
              />
            </div>
            <div>
              <Label>Catatan 2</Label>
              <Input
                name="catatan_marketability_2"
                value={formData.catatan_marketability_2}
                onChange={handleChange}
                placeholder="Catatan marketability..."
              />
            </div>
            <div>
              <Label>Catatan 3</Label>
              <Input
                name="catatan_marketability_3"
                value={formData.catatan_marketability_3}
                onChange={handleChange}
                placeholder="Catatan marketability..."
              />
            </div>
          </div>
        </div>

        {/* Dokumentasi */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up">
          <ImageUploader
            images={dokumentasi}
            onChange={setDokumentasi}
            maxImages={8}
            label="Dokumentasi Foto (Max 8)"
          />
        </div>

        {/* Hitung Button */}
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

            {/* Detail per Tanah */}
            {hasil.detail_tanah.map((detail, index) => (
              <div key={index} className="mb-4 p-3 rounded-lg bg-muted/30">
                <p className="text-sm font-medium mb-2">Tanah #{index + 1}</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nilai Pasar</p>
                    <p className="font-semibold">{formatCurrency(detail.nilai_pasar)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Safety Margin</p>
                    <p className="font-semibold">{detail.avg_safety.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nilai Likuidasi</p>
                    <p className="font-semibold text-success">{formatCurrency(detail.nilai_likuidasi)}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Nilai Taksasi Total</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(hasil.nilai_taksasi)}</p>
              </div>
              <div className="p-4 rounded-lg bg-success/10">
                <p className="text-sm text-muted-foreground mb-1">Nilai Likuidasi Total</p>
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

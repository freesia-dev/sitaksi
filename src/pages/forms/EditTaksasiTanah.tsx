import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTaksasi } from '@/context/TaksasiContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { CloudImageUploader, LabeledImage } from '@/components/shared/CloudImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  formatCurrency, 
  formatTerbilang, 
  DetailAgunanTanahSimple,
  generateId 
} from '@/types';
import { 
  SAFETY_MARGIN_TANAH,
  getMarginByValue,
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
  safety_lokasi: 'cukup_strategis',
  safety_topography: 'datar',
  safety_ukuran: 'ideal',
  safety_bukti: 'hak_milik',
  safety_lingkungan: 'prospek_berkembang',
  safety_permasalahan: 'aman',
};

export default function EditTaksasiTanah() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getTaksasiById, updateTaksasi } = useTaksasi();
  const navigate = useNavigate();
  const { toast } = useToast();

  const existingTaksasi = getTaksasiById(id || '');

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

  const [hasil, setHasil] = useState<{
    total_nilai_tanah: number;
    nilai_taksasi: number;
    nilai_likuidasi: number;
    terbilang: string;
    detail_tanah: { nilai_pasar: number; nilai_likuidasi: number; avg_safety: number }[];
  } | null>(null);

  const [dokumentasi, setDokumentasi] = useState<LabeledImage[]>([]);

  // Load existing data
  useEffect(() => {
    if (existingTaksasi) {
      setFormData({
        nama_nasabah: existingTaksasi.nama_nasabah,
        kantor_cabang: existingTaksasi.kantor_cabang || 'KANTOR CABANG PEMBANTU TELIHAN',
        alamat_cabang: existingTaksasi.alamat_cabang || '',
        pimpinan: existingTaksasi.pimpinan || '',
        jabatan_pimpinan: existingTaksasi.jabatan_pimpinan || 'Pemimpin Capem',
        marketability: existingTaksasi.marketability || 'cukup_marketable',
        catatan_marketability_1: existingTaksasi.catatan_marketability?.[0] || '',
        catatan_marketability_2: existingTaksasi.catatan_marketability?.[1] || '',
        catatan_marketability_3: existingTaksasi.catatan_marketability?.[2] || '',
      });

      // Load tanah data from detail_agunan
      const detail = existingTaksasi.detail_agunan as DetailAgunanTanahSimple;
      if (detail) {
        const loadedTanah: TanahItem = {
          ...defaultTanah,
          luas_tanah: detail.luas_tanah?.toString() || '',
          harga_pembanding_1: detail.harga_per_meter?.toString() || '',
          lokasi: existingTaksasi.alamat,
        };
        setTanahList([loadedTanah]);

        // Load dokumentasi
        const defaultLabels = ['Tampak Depan', 'Tampak Samping', 'Tampak Jalan', 'Surat Tanah'];
        const urls = detail.dokumentasi_urls || [];
        const labels = detail.dokumentasi_labels || [];
        const loadedDokumentasi: LabeledImage[] = urls.map((url, index) => ({
          url,
          label: labels[index] || defaultLabels[index] || `Foto ${index + 1}`,
        }));
        setDokumentasi(loadedDokumentasi);
      }
    }
  }, [existingTaksasi]);

  if (!existingTaksasi) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Data taksasi tidak ditemukan</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2" size={16} />
          Kembali
        </Button>
      </div>
    );
  }

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

  const handleUpdate = () => {
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

    const totalLuasTanah = tanahList.reduce((sum, t) => sum + (parseFloat(t.luas_tanah) || 0), 0);
    const avgHargaTanah = totalLuasTanah > 0 ? hasil.total_nilai_tanah / totalLuasTanah : 0;

    const detailAgunan: DetailAgunanTanahSimple = {
      luas_tanah: totalLuasTanah,
      harga_per_meter: avgHargaTanah,
      dokumentasi_urls: dokumentasi.map(d => d.url),
      dokumentasi_labels: dokumentasi.map(d => d.label),
    };

    const alamatGabungan = tanahList.map(t => t.lokasi).filter(l => l).join('; ') || 'Alamat tidak disebutkan';

    updateTaksasi(id!, {
      nama_nasabah: formData.nama_nasabah,
      alamat: alamatGabungan,
      nilai_pasar: hasil.nilai_taksasi,
      nilai_taksasi: hasil.nilai_taksasi,
      nilai_taksasi_pembulatan: hasil.nilai_taksasi,
      nilai_likuidasi: hasil.nilai_likuidasi,
      nilai_likuidasi_pembulatan: hasil.nilai_likuidasi,
      terbilang: hasil.terbilang,
      detail_agunan: detailAgunan,
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
      title: 'Taksasi berhasil diupdate',
      description: 'Data taksasi tanah telah diperbarui',
    });

    navigate('/riwayat');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Edit Taksasi Tanah"
        description={`Mengubah data taksasi: ${existingTaksasi.nomor_dokumen}`}
        actions={
          <Button variant="ghost" onClick={() => navigate('/riwayat')}>
            <ArrowLeft className="mr-2" size={16} />
            Kembali
          </Button>
        }
      />

      <div className="grid gap-6">
        {/* Data Nasabah */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
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
          <div key={tanah.id} className="rounded-xl border bg-card p-6 shadow-card">
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
                  <Label>Luas Tanah (m²)</Label>
                  <Input 
                    type="number"
                    value={tanah.luas_tanah} 
                    onChange={(e) => updateTanah(index, 'luas_tanah', e.target.value)}
                    placeholder="0"
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

              {/* Harga Pasar Pembanding */}
              <p className="text-sm font-medium text-muted-foreground mt-6">D. HARGA PASAR PEMBANDING (per m²)</p>
              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Harga Pembanding 1 (Rp/m²)</Label>
                    <CurrencyInput
                      value={tanah.harga_pembanding_1} 
                      onChange={(val) => updateTanah(index, 'harga_pembanding_1', val)}
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
                    <CurrencyInput
                      value={tanah.harga_pembanding_2} 
                      onChange={(val) => updateTanah(index, 'harga_pembanding_2', val)}
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
                    <CurrencyInput
                      value={tanah.harga_pembanding_3} 
                      onChange={(val) => updateTanah(index, 'harga_pembanding_3', val)}
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
        <div className="rounded-xl border bg-card p-6 shadow-card">
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
        <div className="rounded-xl border bg-card p-6 shadow-card">
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

        {/* DOKUMENTASI AGUNAN */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Camera size={18} className="text-accent" />
            DOKUMENTASI JAMINAN
          </h3>
          <CloudImageUploader
            images={dokumentasi}
            onChange={setDokumentasi}
            maxImages={8}
            title="Dokumentasi Jaminan"
            defaultLabels={['Tampak Depan', 'Tampak Samping', 'Tampak Jalan', 'Surat Tanah']}
            taksasiId={id}
          />
        </div>

        {/* Hitung Button */}
        <Button variant="accent" onClick={handleHitung} className="w-full">
          <Calculator className="mr-2" size={16} />
          Hitung Ulang Taksasi
        </Button>

        {/* Hasil Perhitungan */}
        {hasil && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-success" />
              Hasil Perhitungan
            </h3>

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
              <Button variant="hero" onClick={handleUpdate} className="flex-1">
                <Save className="mr-2" size={16} />
                Update Taksasi
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

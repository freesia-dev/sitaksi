import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTaksasi } from '@/context/TaksasiContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { CloudImageUploader, LabeledImage } from '@/components/shared/CloudImageUploader';
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
  DetailAgunanKendaraan,
  DokumentasiAgunan 
} from '@/types';
import { 
  Calculator, 
  Save, 
  ArrowLeft, 
  MapPin, 
  Car, 
  Plus, 
  Trash2, 
  DollarSign, 
  Link as LinkIcon,
  FileText,
  Camera,
  Upload,
  User,
  Building,
  Hash
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HargaPembanding {
  harga: string;
  sumber: string;
}

export default function TaksasiKendaraan() {
  const { user } = useAuth();
  const { addTaksasi } = useTaksasi();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nomor_dokumen: '',
    nama_nasabah: '',
    alamat: '',
    tanggal_penilaian: new Date().toISOString().split('T')[0],
    jenis: '',
    merk: '',
    model: '',
    tahun: '',
    nomor_polisi: '',
    nomor_mesin: '',
    nomor_rangka: '',
    buatan: '',
    bukti_kepemilikan: 'BPKB',
    nomor_bukti_kepemilikan: '',
    tanggal_bukti_kepemilikan: '',
    nama_kepemilikan: '',
    kondisi_unit: 'Terawat' as 'Terawat' | 'Tidak Terawat',
    keterangan_1: '',
    keterangan_2: '',
    keterangan_3: '',
    keterangan_4: '',
    kantor_cabang: 'KANTOR CABANG PEMBANTU TELIHAN',
    alamat_cabang: 'JL.S.PARMAN NO.14-15 KEL.GN.TELIHAN KEC.BONTANG BARAT-75383',
    pimpinan: '',
    jabatan_pimpinan: 'Pemimpin Capem',
  });

  const [dokumentasi, setDokumentasi] = useState<LabeledImage[]>([]);

  const [hargaPembanding, setHargaPembanding] = useState<HargaPembanding[]>([
    { harga: '', sumber: '' },
    { harga: '', sumber: '' },
    { harga: '', sumber: '' },
  ]);

  const [hasil, setHasil] = useState<{
    rata_rata: number;
    nilai_taksasi: number;
    nilai_taksasi_pembulatan: number;
    nilai_likuidasi: number;
    nilai_likuidasi_pembulatan: number;
    terbilang: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setHasil(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePembandingChange = (index: number, field: 'harga' | 'sumber', value: string) => {
    setHargaPembanding(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setHasil(null);
  };

  const addPembanding = () => {
    if (hargaPembanding.length < 5) {
      setHargaPembanding(prev => [...prev, { harga: '', sumber: '' }]);
    }
  };

  const removePembanding = (index: number) => {
    if (hargaPembanding.length > 1) {
      setHargaPembanding(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDokumentasiChange = (images: LabeledImage[]) => {
    setDokumentasi(images);
  };

  const handleHitung = () => {
    const hargaList = hargaPembanding
      .map(p => parseFloat(p.harga))
      .filter(h => !isNaN(h) && h > 0);

    if (hargaList.length === 0) {
      toast({
        title: 'Data tidak valid',
        description: 'Minimal harus ada 1 harga pembanding yang valid',
        variant: 'destructive',
      });
      return;
    }

    const rataRata = FORMULAS.kendaraan.calculateTaksasi(hargaList);
    const nilaiTaksasiPembulatan = FORMULAS.kendaraan.pembulatan(rataRata);
    // Safety Margin 25%, sehingga nilai likuidasi = 75%
    const nilaiLikuidasi = nilaiTaksasiPembulatan * FORMULAS.kendaraan.likuidasiRatio;
    const nilaiLikuidasiPembulatan = FORMULAS.kendaraan.pembulatanRatusan(nilaiLikuidasi);

    setHasil({
      rata_rata: rataRata,
      nilai_taksasi: rataRata,
      nilai_taksasi_pembulatan: nilaiTaksasiPembulatan,
      nilai_likuidasi: nilaiLikuidasi,
      nilai_likuidasi_pembulatan: nilaiLikuidasiPembulatan,
      terbilang: formatTerbilang(nilaiTaksasiPembulatan),
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

    if (!formData.nama_nasabah || !formData.alamat || !formData.merk || !formData.model) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Nama nasabah, alamat, merk, dan model wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    const validPembanding = hargaPembanding
      .filter(p => parseFloat(p.harga) > 0)
      .map(p => ({
        harga: parseFloat(p.harga),
        sumber: p.sumber,
      }));

    const keterangan = [
      formData.keterangan_1,
      formData.keterangan_2,
      formData.keterangan_3,
      formData.keterangan_4,
    ].filter(k => k.trim() !== '');

    const detailAgunan: DetailAgunanKendaraan = {
      jenis: formData.jenis,
      merk: formData.merk,
      model: formData.model,
      tahun: parseInt(formData.tahun) || new Date().getFullYear(),
      nomor_polisi: formData.nomor_polisi,
      nomor_mesin: formData.nomor_mesin,
      nomor_rangka: formData.nomor_rangka,
      buatan: formData.buatan,
      bukti_kepemilikan: formData.bukti_kepemilikan,
      nomor_bukti_kepemilikan: formData.nomor_bukti_kepemilikan,
      tanggal_bukti_kepemilikan: formData.tanggal_bukti_kepemilikan,
      nama_kepemilikan: formData.nama_kepemilikan,
      kondisi_unit: formData.kondisi_unit,
      harga_pasar: hasil.rata_rata,
      harga_pembanding: validPembanding,
      keterangan: keterangan,
      dokumentasi_urls: dokumentasi.map(d => d.url),
      dokumentasi_labels: dokumentasi.map(d => d.label),
    };

    addTaksasi({
      id_user: user?.id || '',
      nomor_dokumen: generateNomorDokumen('TLH', formData.nomor_dokumen),
      jenis_agunan: 'Kendaraan',
      nama_nasabah: formData.nama_nasabah,
      alamat: formData.alamat,
      nilai_pasar: hasil.rata_rata,
      nilai_taksasi: hasil.nilai_taksasi,
      nilai_taksasi_pembulatan: hasil.nilai_taksasi_pembulatan,
      nilai_likuidasi: hasil.nilai_likuidasi,
      nilai_likuidasi_pembulatan: hasil.nilai_likuidasi_pembulatan,
      safety_margin: FORMULAS.kendaraan.safetyMargin,
      terbilang: hasil.terbilang,
      status: 'draft',
      status_otorisasi: 'Draft',
      detail_agunan: detailAgunan,
      tanggal: formData.tanggal_penilaian,
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
    });

    toast({
      title: 'Taksasi berhasil disimpan',
      description: 'Data taksasi kendaraan telah disimpan dan menunggu otorisasi',
    });

    navigate('/riwayat');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Formulir Penilaian Agunan Kendaraan"
        description="Penilaian agunan berupa kendaraan bermotor sesuai format Bankaltimtara"
        actions={
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2" size={16} />
            Kembali
          </Button>
        }
      />

      <div className="grid gap-6">
        {/* I. UMUM - Data Nasabah */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <FileText size={20} className="text-primary" />
            I. UMUM
          </h3>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomor_dokumen" className="flex items-center gap-1">
                  <Hash size={14} />
                  Nomor Dokumen
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="nomor_dokumen"
                    name="nomor_dokumen"
                    type="number"
                    placeholder="001"
                    className="w-24"
                    value={formData.nomor_dokumen}
                    onChange={handleChange}
                    max={999}
                    min={1}
                  />
                  <span className="text-sm text-muted-foreground">
                    /F-3/BPD-TLH/{['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][new Date().getMonth()]}/{new Date().getFullYear()}
                  </span>
                </div>
              </div>
              <div>
                <Label htmlFor="tanggal_penilaian">Tanggal Penilaian</Label>
                <Input
                  type="date"
                  id="tanggal_penilaian"
                  name="tanggal_penilaian"
                  value={formData.tanggal_penilaian}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jenis">Jenis Agunan</Label>
                <Input
                  id="jenis"
                  name="jenis"
                  placeholder="BARANG BERGERAK / KENDARAAN RODA 2"
                  value={formData.jenis}
                  onChange={handleChange}
                />
              </div>
            </div>
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
            <div>
              <Label htmlFor="alamat">Lokasi Objek Agunan</Label>
              <Textarea
                id="alamat"
                name="alamat"
                placeholder="Masukkan alamat lengkap lokasi agunan"
                value={formData.alamat}
                onChange={handleChange}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* II. PROFIL AGUNAN - Data Kendaraan */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <Car size={20} className="text-warning" />
            II. PROFIL AGUNAN
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="jenis_kendaraan">Jenis Kendaraan</Label>
              <Input
                id="jenis_kendaraan"
                name="jenis"
                placeholder="SEPEDA MOTOR"
                value={formData.jenis}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="model">Model / Type</Label>
              <Input
                id="model"
                name="model"
                placeholder="SOLO / P5E02R22M1 M/T"
                value={formData.model}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="merk">Merk</Label>
              <Input
                id="merk"
                name="merk"
                placeholder="HONDA"
                value={formData.merk}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="tahun">Tahun Pembuatan</Label>
              <Input
                id="tahun"
                name="tahun"
                type="number"
                placeholder="2018"
                value={formData.tahun}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="nomor_polisi">Nomor Polisi</Label>
              <Input
                id="nomor_polisi"
                name="nomor_polisi"
                placeholder="KT 4329 QC"
                value={formData.nomor_polisi}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="nomor_mesin">Nomor Mesin</Label>
              <Input
                id="nomor_mesin"
                name="nomor_mesin"
                placeholder="KC91E-1204762"
                value={formData.nomor_mesin}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="nomor_rangka">Nomor Rangka</Label>
              <Input
                id="nomor_rangka"
                name="nomor_rangka"
                placeholder="MH1KC9116K212204"
                value={formData.nomor_rangka}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="buatan">Buatan</Label>
              <Input
                id="buatan"
                name="buatan"
                placeholder="Jepang"
                value={formData.buatan}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="bukti_kepemilikan">Bukti Kepemilikan</Label>
              <Select 
                value={formData.bukti_kepemilikan} 
                onValueChange={(v) => handleSelectChange('bukti_kepemilikan', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bukti kepemilikan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BPKB">BPKB</SelectItem>
                  <SelectItem value="STNK">STNK</SelectItem>
                  <SelectItem value="Faktur">Faktur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nomor_bukti_kepemilikan">Nomor Bukti Kepemilikan</Label>
              <Input
                id="nomor_bukti_kepemilikan"
                name="nomor_bukti_kepemilikan"
                placeholder="N-10026971N"
                value={formData.nomor_bukti_kepemilikan}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="tanggal_bukti_kepemilikan">Tanggal Bukti Kepemilikan</Label>
              <Input
                id="tanggal_bukti_kepemilikan"
                name="tanggal_bukti_kepemilikan"
                type="date"
                value={formData.tanggal_bukti_kepemilikan}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="nama_kepemilikan">Nama Kepemilikan</Label>
              <Input
                id="nama_kepemilikan"
                name="nama_kepemilikan"
                placeholder="Nama pemilik di BPKB"
                value={formData.nama_kepemilikan}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="kondisi_unit">Kondisi Unit</Label>
              <Select 
                value={formData.kondisi_unit} 
                onValueChange={(v) => handleSelectChange('kondisi_unit', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kondisi unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Terawat">Terawat</SelectItem>
                  <SelectItem value="Tidak Terawat">Tidak Terawat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* III. METODE PENILAIAN - Harga Pembanding */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2 text-lg">
              <LinkIcon size={20} className="text-accent" />
              III. METODE PENILAIAN
            </h3>
            {hargaPembanding.length < 5 && (
              <Button variant="ghost" size="sm" onClick={addPembanding}>
                <Plus size={16} className="mr-1" />
                Tambah
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Informasi Harga: {formData.model || '(Model Kendaraan)'}
          </p>
          <div className="space-y-4">
            {hargaPembanding.map((item, index) => (
              <div key={index} className="flex gap-3 items-start p-3 rounded-lg bg-muted/30">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Harga (Rp)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={item.harga}
                      onChange={(e) => handlePembandingChange(index, 'harga', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Sumber / Link</Label>
                    <Input
                      placeholder="https://web.facebook.com/..."
                      value={item.sumber}
                      onChange={(e) => handlePembandingChange(index, 'sumber', e.target.value)}
                    />
                  </div>
                </div>
                {hargaPembanding.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => removePembanding(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            variant="accent"
            className="mt-4"
            onClick={handleHitung}
          >
            <Calculator className="mr-2" size={16} />
            Hitung Taksasi
          </Button>
        </div>

        {/* IV. KETERANGAN */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <FileText size={20} className="text-muted-foreground" />
            IV. KETERANGAN
          </h3>
          <div className="space-y-3">
            <Input
              name="keterangan_1"
              placeholder="Keterangan 1: Harga Berdasarkan Dari Data Pembanding : Marketplace Facebook"
              value={formData.keterangan_1}
              onChange={handleChange}
            />
            <Input
              name="keterangan_2"
              placeholder="Keterangan 2: Kendaraan Hak Milik Debitur Beserta Surat-Surat..."
              value={formData.keterangan_2}
              onChange={handleChange}
            />
            <Input
              name="keterangan_3"
              placeholder="Keterangan 3: Kendaraan Dalam Kondisi Baik Dan Dapat Berfungsi..."
              value={formData.keterangan_3}
              onChange={handleChange}
            />
            <Input
              name="keterangan_4"
              placeholder="Keterangan 4: Disarankan Untuk Dilakukan Perikatan..."
              value={formData.keterangan_4}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* TIM PENILAI */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <User size={20} className="text-primary" />
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
                placeholder="Pemimpin Capem"
                value={formData.jabatan_pimpinan}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Petugas Penilai</Label>
              <Input
                value={user?.nama || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label>Jabatan Petugas</Label>
              <Input
                value="Officer Relationship Kredit"
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </div>

        {/* KANTOR CABANG */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <Building size={20} className="text-primary" />
            KANTOR CABANG
          </h3>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="kantor_cabang">Nama Kantor Cabang</Label>
              <Input
                id="kantor_cabang"
                name="kantor_cabang"
                placeholder="KANTOR CABANG PEMBANTU TELIHAN"
                value={formData.kantor_cabang}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="alamat_cabang">Alamat Kantor Cabang</Label>
              <Textarea
                id="alamat_cabang"
                name="alamat_cabang"
                placeholder="Alamat lengkap kantor cabang"
                value={formData.alamat_cabang}
                onChange={handleChange}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* DOKUMENTASI AGUNAN */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <Camera size={20} className="text-accent" />
            DOKUMENTASI JAMINAN (Max 8 Foto)
          </h3>
          <CloudImageUploader
            images={dokumentasi}
            onChange={handleDokumentasiChange}
            maxImages={8}
            defaultLabels={[
              'Tampak Depan',
              'Tampak Belakang',
              'Tampak Samping Kiri',
              'Tampak Samping Kanan',
              'Speedometer',
              'Nomor Rangka',
              'Nomor Mesin',
              'BPKB/STNK',
            ]}
          />
        </div>

        {/* Hasil Perhitungan */}
        {hasil && (
          <div className="rounded-xl border bg-card p-6 shadow-card animate-scale-up">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <DollarSign size={20} className="text-success" />
              PERHITUNGAN NILAI TAKSASI
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Model</th>
                    <th className="text-right py-2">Nilai Taksasi</th>
                    <th className="text-right py-2">Pembulatan</th>
                    <th className="text-right py-2">Safety Margin</th>
                    <th className="text-right py-2">Nilai Likuidasi</th>
                    <th className="text-right py-2">Pembulatan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">{formData.model || '-'}</td>
                    <td className="text-right">{formatCurrency(hasil.nilai_taksasi)}</td>
                    <td className="text-right font-semibold text-primary">{formatCurrency(hasil.nilai_taksasi_pembulatan)}</td>
                    <td className="text-right">{FORMULAS.kendaraan.safetyMargin}%</td>
                    <td className="text-right">{formatCurrency(hasil.nilai_likuidasi)}</td>
                    <td className="text-right font-semibold text-success">{formatCurrency(hasil.nilai_likuidasi_pembulatan)}</td>
                  </tr>
                </tbody>
              </table>
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

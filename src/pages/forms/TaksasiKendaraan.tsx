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
import { FORMULAS, formatCurrency, DetailAgunanKendaraan } from '@/types';
import { Calculator, Save, ArrowLeft, MapPin, Car, Plus, Trash2, DollarSign, Link as LinkIcon } from 'lucide-react';

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
    nama_nasabah: '',
    alamat: '',
    jenis: '',
    merk: '',
    model: '',
    tahun: '',
    nomor_polisi: '',
    nomor_mesin: '',
    nomor_rangka: '',
  });

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
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setHasil(null);
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

    setHasil({
      rata_rata: rataRata,
      nilai_taksasi: rataRata,
      nilai_taksasi_pembulatan: nilaiTaksasiPembulatan,
      nilai_likuidasi: nilaiLikuidasi,
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

    const detailAgunan: DetailAgunanKendaraan = {
      jenis: formData.jenis,
      merk: formData.merk,
      model: formData.model,
      tahun: parseInt(formData.tahun) || new Date().getFullYear(),
      nomor_polisi: formData.nomor_polisi,
      nomor_mesin: formData.nomor_mesin,
      nomor_rangka: formData.nomor_rangka,
      harga_pasar: hasil.rata_rata,
      harga_pembanding: validPembanding,
    };

    addTaksasi({
      id_user: user?.id || '',
      jenis_agunan: 'Kendaraan',
      nama_nasabah: formData.nama_nasabah,
      alamat: formData.alamat,
      nilai_pasar: hasil.rata_rata,
      nilai_taksasi: hasil.nilai_taksasi_pembulatan,
      nilai_likuidasi: hasil.nilai_likuidasi,
      status_otorisasi: 'Menunggu',
      detail_agunan: detailAgunan,
      tanggal: new Date().toISOString().split('T')[0],
      petugas: user?.nama || '',
    });

    toast({
      title: 'Taksasi berhasil disimpan',
      description: 'Data taksasi kendaraan telah disimpan dan menunggu otorisasi',
    });

    navigate('/dashboard');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Formulir Taksasi Kendaraan"
        description="Penilaian agunan berupa kendaraan bermotor"
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
            Data Nasabah & Lokasi
          </h3>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="nama_nasabah">Nama Nasabah</Label>
              <Input
                id="nama_nasabah"
                name="nama_nasabah"
                placeholder="Masukkan nama nasabah"
                value={formData.nama_nasabah}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea
                id="alamat"
                name="alamat"
                placeholder="Masukkan alamat nasabah"
                value={formData.alamat}
                onChange={handleChange}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Data Kendaraan */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Car size={18} className="text-warning" />
            Data Kendaraan
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jenis">Jenis Kendaraan</Label>
              <Input
                id="jenis"
                name="jenis"
                placeholder="Sepeda Motor / Mobil"
                value={formData.jenis}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="merk">Merk</Label>
              <Input
                id="merk"
                name="merk"
                placeholder="Honda, Toyota, dll"
                value={formData.merk}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="model">Model / Type</Label>
              <Input
                id="model"
                name="model"
                placeholder="CBR 150, Avanza, dll"
                value={formData.model}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="tahun">Tahun Pembuatan</Label>
              <Input
                id="tahun"
                name="tahun"
                type="number"
                placeholder="2020"
                value={formData.tahun}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="nomor_polisi">Nomor Polisi</Label>
              <Input
                id="nomor_polisi"
                name="nomor_polisi"
                placeholder="KT 1234 AB"
                value={formData.nomor_polisi}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="nomor_mesin">Nomor Mesin</Label>
              <Input
                id="nomor_mesin"
                name="nomor_mesin"
                placeholder="Nomor mesin"
                value={formData.nomor_mesin}
                onChange={handleChange}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="nomor_rangka">Nomor Rangka</Label>
              <Input
                id="nomor_rangka"
                name="nomor_rangka"
                placeholder="Nomor rangka"
                value={formData.nomor_rangka}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Harga Pembanding */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <LinkIcon size={18} className="text-accent" />
              Harga Pembanding (Data Pasar)
            </h3>
            {hargaPembanding.length < 5 && (
              <Button variant="ghost" size="sm" onClick={addPembanding}>
                <Plus size={16} className="mr-1" />
                Tambah
              </Button>
            )}
          </div>
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
                    <Label className="text-xs">Sumber</Label>
                    <Input
                      placeholder="Marketplace, OLX, dll"
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

        {/* Hasil Perhitungan */}
        {hasil && (
          <div className="rounded-xl border bg-card p-6 shadow-card animate-scale-up">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-success" />
              Hasil Perhitungan
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Rata-rata Harga Pasar</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(hasil.rata_rata)}</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground mb-1">Nilai Taksasi (Pembulatan)</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(hasil.nilai_taksasi_pembulatan)}</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-success/10">
              <p className="text-sm text-muted-foreground mb-1">Nilai Likuidasi (Safety Margin 25%)</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(hasil.nilai_likuidasi)}</p>
              <p className="text-xs text-muted-foreground mt-1">= Nilai Taksasi × 75%</p>
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

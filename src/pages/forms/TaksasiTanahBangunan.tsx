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
import { FORMULAS, formatCurrency, DetailAgunanTB } from '@/types';
import { Calculator, Save, ArrowLeft, MapPin, Building2, Home, DollarSign } from 'lucide-react';

export default function TaksasiTanahBangunan() {
  const { user } = useAuth();
  const { addTaksasi } = useTaksasi();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nama_nasabah: '',
    alamat: '',
    luas_tanah: '',
    harga_tanah_per_meter: '',
    luas_bangunan: '',
    harga_bangunan_per_meter: '',
  });

  const [hasil, setHasil] = useState<{
    nilai_tanah: number;
    nilai_bangunan: number;
    nilai_taksasi: number;
    nilai_likuidasi: number;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setHasil(null);
  };

  const handleHitung = () => {
    const luasTanah = parseFloat(formData.luas_tanah) || 0;
    const hargaTanahPerMeter = parseFloat(formData.harga_tanah_per_meter) || 0;
    const luasBangunan = parseFloat(formData.luas_bangunan) || 0;
    const hargaBangunanPerMeter = parseFloat(formData.harga_bangunan_per_meter) || 0;

    if (luasTanah <= 0 || hargaTanahPerMeter <= 0) {
      toast({
        title: 'Data tidak valid',
        description: 'Data tanah harus diisi dengan benar',
        variant: 'destructive',
      });
      return;
    }

    const nilaiTanah = luasTanah * hargaTanahPerMeter;
    const nilaiBangunan = luasBangunan * hargaBangunanPerMeter;
    const nilaiTaksasi = FORMULAS.tanahBangunan.calculateTaksasi(
      luasTanah,
      hargaTanahPerMeter,
      luasBangunan,
      hargaBangunanPerMeter
    );
    const nilaiLikuidasi = nilaiTaksasi * FORMULAS.tanahBangunan.likuidasiRatio;

    setHasil({
      nilai_tanah: nilaiTanah,
      nilai_bangunan: nilaiBangunan,
      nilai_taksasi: nilaiTaksasi,
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

    if (!formData.nama_nasabah || !formData.alamat) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Nama nasabah dan alamat wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    const detailAgunan: DetailAgunanTB = {
      luas_tanah: parseFloat(formData.luas_tanah),
      harga_tanah_per_meter: parseFloat(formData.harga_tanah_per_meter),
      luas_bangunan: parseFloat(formData.luas_bangunan) || 0,
      harga_bangunan_per_meter: parseFloat(formData.harga_bangunan_per_meter) || 0,
    };

    addTaksasi({
      id_user: user?.id || '',
      jenis_agunan: 'Tanah & Bangunan',
      nama_nasabah: formData.nama_nasabah,
      alamat: formData.alamat,
      nilai_pasar: hasil.nilai_taksasi,
      nilai_taksasi: hasil.nilai_taksasi,
      nilai_likuidasi: hasil.nilai_likuidasi,
      status_otorisasi: 'Menunggu',
      detail_agunan: detailAgunan,
      tanggal: new Date().toISOString().split('T')[0],
      petugas: user?.nama || '',
    });

    toast({
      title: 'Taksasi berhasil disimpan',
      description: 'Data taksasi tanah & bangunan telah disimpan dan menunggu otorisasi',
    });

    navigate('/dashboard');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
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
              <Label htmlFor="alamat">Alamat Lokasi Agunan</Label>
              <Textarea
                id="alamat"
                name="alamat"
                placeholder="Masukkan alamat lengkap lokasi agunan"
                value={formData.alamat}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Data Tanah */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Home size={18} className="text-success" />
            Data Tanah
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="luas_tanah">Luas Tanah (m²)</Label>
              <Input
                id="luas_tanah"
                name="luas_tanah"
                type="number"
                placeholder="0"
                value={formData.luas_tanah}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="harga_tanah_per_meter">Harga Tanah per m²</Label>
              <Input
                id="harga_tanah_per_meter"
                name="harga_tanah_per_meter"
                type="number"
                placeholder="0"
                value={formData.harga_tanah_per_meter}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Data Bangunan */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-primary" />
            Data Bangunan
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="luas_bangunan">Luas Bangunan (m²)</Label>
              <Input
                id="luas_bangunan"
                name="luas_bangunan"
                type="number"
                placeholder="0"
                value={formData.luas_bangunan}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="harga_bangunan_per_meter">Harga Bangunan per m²</Label>
              <Input
                id="harga_bangunan_per_meter"
                name="harga_bangunan_per_meter"
                type="number"
                placeholder="0"
                value={formData.harga_bangunan_per_meter}
                onChange={handleChange}
              />
            </div>
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
                <p className="text-sm text-muted-foreground mb-1">Nilai Tanah</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(hasil.nilai_tanah)}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Nilai Bangunan</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(hasil.nilai_bangunan)}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="text-sm text-muted-foreground mb-1">Total Nilai Taksasi</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(hasil.nilai_taksasi)}</p>
                <p className="text-xs text-muted-foreground mt-1">= Nilai Tanah + Nilai Bangunan</p>
              </div>
              <div className="p-4 rounded-lg bg-success/10">
                <p className="text-sm text-muted-foreground mb-1">Nilai Likuidasi (80%)</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(hasil.nilai_likuidasi)}</p>
                <p className="text-xs text-muted-foreground mt-1">= Nilai Taksasi × 80%</p>
              </div>
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

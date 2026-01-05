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
import { FORMULAS, formatCurrency, formatTerbilang, generateNomorDokumen, DetailAgunanTanahSimple } from '@/types';
import { Calculator, Save, ArrowLeft, MapPin, Ruler, DollarSign, User, Building } from 'lucide-react';

export default function TaksasiTanah() {
  const { user } = useAuth();
  const { addTaksasi } = useTaksasi();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nama_nasabah: '',
    alamat: '',
    luas_tanah: '',
    harga_per_meter: '',
    kantor_cabang: 'KANTOR CABANG PEMBANTU TELIHAN',
    alamat_cabang: 'JL.S.PARMAN NO.14-15 KEL.GN.TELIHAN KEC.BONTANG BARAT-75383',
    pimpinan: '',
    jabatan_pimpinan: 'Pemimpin Capem',
  });

  const [hasil, setHasil] = useState<{
    nilai_taksasi: number;
    nilai_likuidasi: number;
    terbilang: string;
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
    const hargaPerMeter = parseFloat(formData.harga_per_meter) || 0;

    if (luasTanah <= 0 || hargaPerMeter <= 0) {
      toast({
        title: 'Data tidak valid',
        description: 'Luas tanah dan harga per meter harus lebih dari 0',
        variant: 'destructive',
      });
      return;
    }

    const nilaiTaksasi = FORMULAS.tanah.calculateTaksasi(luasTanah, hargaPerMeter);
    const nilaiLikuidasi = nilaiTaksasi * FORMULAS.tanah.likuidasiRatio;

    setHasil({
      nilai_taksasi: nilaiTaksasi,
      nilai_likuidasi: nilaiLikuidasi,
      terbilang: formatTerbilang(nilaiTaksasi),
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

    const detailAgunan: DetailAgunanTanahSimple = {
      luas_tanah: parseFloat(formData.luas_tanah),
      harga_per_meter: parseFloat(formData.harga_per_meter),
    };

    addTaksasi({
      id_user: user?.id || '',
      nomor_dokumen: generateNomorDokumen('TLH'),
      jenis_agunan: 'Tanah',
      nama_nasabah: formData.nama_nasabah,
      alamat: formData.alamat,
      nilai_pasar: hasil.nilai_taksasi,
      nilai_taksasi: hasil.nilai_taksasi,
      nilai_taksasi_pembulatan: hasil.nilai_taksasi,
      nilai_likuidasi: hasil.nilai_likuidasi,
      nilai_likuidasi_pembulatan: hasil.nilai_likuidasi,
      safety_margin: FORMULAS.tanah.safetyMargin,
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
    });

    toast({
      title: 'Taksasi berhasil disimpan',
      description: 'Data taksasi tanah telah disimpan dan menunggu otorisasi',
    });

    navigate('/riwayat');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
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
            <Ruler size={18} className="text-primary" />
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
              <Label htmlFor="harga_per_meter">Harga Tanah per m²</Label>
              <Input
                id="harga_per_meter"
                name="harga_per_meter"
                type="number"
                placeholder="0"
                value={formData.harga_per_meter}
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

        {/* TIM PENILAI */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.15s' }}>
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
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
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

        {/* Hasil Perhitungan */}
        {hasil && (
          <div className="rounded-xl border bg-card p-6 shadow-card animate-scale-up">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-success" />
              Hasil Perhitungan
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Nilai Taksasi</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(hasil.nilai_taksasi)}</p>
                <p className="text-xs text-muted-foreground mt-1">= Luas × Harga/m²</p>
              </div>
              <div className="p-4 rounded-lg bg-success/10">
                <p className="text-sm text-muted-foreground mb-1">Nilai Likuidasi (80%)</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(hasil.nilai_likuidasi)}</p>
                <p className="text-xs text-muted-foreground mt-1">= Nilai Taksasi × 80%</p>
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

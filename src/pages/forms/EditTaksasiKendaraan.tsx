import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTaksasi } from '@/context/TaksasiContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { LabeledImageUploader, LabeledImage } from '@/components/shared/LabeledImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  formatCurrency, 
  formatTerbilang,
  DetailAgunanKendaraan,
  FORMULAS 
} from '@/types';
import { 
  Calculator, 
  Save, 
  ArrowLeft, 
  Car, 
  DollarSign, 
  User,
  Camera,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditTaksasiKendaraan() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getTaksasiById, updateTaksasi } = useTaksasi();
  const navigate = useNavigate();
  const { toast } = useToast();

  const existingTaksasi = getTaksasiById(id || '');

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
    buatan: 'Jepang',
    bukti_kepemilikan: 'BPKB',
    nomor_bukti_kepemilikan: '',
    tanggal_bukti_kepemilikan: '',
    nama_kepemilikan: '',
    kondisi_unit: 'Terawat',
    harga_pembanding_1: '',
    sumber_1: '',
    harga_pembanding_2: '',
    sumber_2: '',
    harga_pembanding_3: '',
    sumber_3: '',
    keterangan: '',
    kantor_cabang: 'KANTOR CABANG PEMBANTU TELIHAN',
    alamat_cabang: 'JL.S.PARMAN NO.14-15 KEL.GN.TELIHAN KEC.BONTANG BARAT-75383',
    pimpinan: '',
    jabatan_pimpinan: 'Pemimpin Capem',
  });

  const [hasil, setHasil] = useState<{
    harga_pasar: number;
    nilai_taksasi: number;
    nilai_likuidasi: number;
    terbilang: string;
  } | null>(null);

  const [dokumentasi, setDokumentasi] = useState<LabeledImage[]>([]);

  // Load existing data
  useEffect(() => {
    if (existingTaksasi) {
      const detail = existingTaksasi.detail_agunan as DetailAgunanKendaraan;
      setFormData({
        nama_nasabah: existingTaksasi.nama_nasabah,
        alamat: existingTaksasi.alamat,
        jenis: detail?.jenis || '',
        merk: detail?.merk || '',
        model: detail?.model || '',
        tahun: detail?.tahun?.toString() || '',
        nomor_polisi: detail?.nomor_polisi || '',
        nomor_mesin: detail?.nomor_mesin || '',
        nomor_rangka: detail?.nomor_rangka || '',
        buatan: detail?.buatan || 'Jepang',
        bukti_kepemilikan: detail?.bukti_kepemilikan || 'BPKB',
        nomor_bukti_kepemilikan: detail?.nomor_bukti_kepemilikan || '',
        tanggal_bukti_kepemilikan: detail?.tanggal_bukti_kepemilikan || '',
        nama_kepemilikan: detail?.nama_kepemilikan || '',
        kondisi_unit: detail?.kondisi_unit || 'Terawat',
        harga_pembanding_1: detail?.harga_pembanding?.[0]?.harga?.toString() || '',
        sumber_1: detail?.harga_pembanding?.[0]?.sumber || '',
        harga_pembanding_2: detail?.harga_pembanding?.[1]?.harga?.toString() || '',
        sumber_2: detail?.harga_pembanding?.[1]?.sumber || '',
        harga_pembanding_3: detail?.harga_pembanding?.[2]?.harga?.toString() || '',
        sumber_3: detail?.harga_pembanding?.[2]?.sumber || '',
        keterangan: detail?.keterangan?.join('\n') || '',
        kantor_cabang: existingTaksasi.kantor_cabang || 'KANTOR CABANG PEMBANTU TELIHAN',
        alamat_cabang: existingTaksasi.alamat_cabang || '',
        pimpinan: existingTaksasi.pimpinan || '',
        jabatan_pimpinan: existingTaksasi.jabatan_pimpinan || 'Pemimpin Capem',
      });

      // Load existing dokumentasi
      const defaultLabels = [
        'Tampak Depan',
        'Tampak Belakang',
        'Tampak Samping Kiri',
        'Tampak Samping Kanan',
        'Speedometer',
        'Nomor Rangka',
        'Nomor Mesin',
      ];
      
      const urls = detail?.dokumentasi_urls || [];
      const labels = detail?.dokumentasi_labels || [];
      const loadedDokumentasi: LabeledImage[] = urls.map((url, index) => ({
        url,
        label: labels[index] || defaultLabels[index] || `Foto ${index + 1}`,
      }));
      setDokumentasi(loadedDokumentasi);
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
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setHasil(null);
  };

  const handleHitung = () => {
    const hargaList = [
      parseFloat(formData.harga_pembanding_1) || 0,
      parseFloat(formData.harga_pembanding_2) || 0,
      parseFloat(formData.harga_pembanding_3) || 0,
    ].filter(h => h > 0);

    if (hargaList.length === 0) {
      toast({ title: 'Data tidak valid', description: 'Minimal satu harga pembanding harus diisi', variant: 'destructive' });
      return;
    }

    const hargaPasar = hargaList.reduce((a, b) => a + b, 0) / hargaList.length;
    const nilaiTaksasi = hargaPasar;
    const nilaiLikuidasi = nilaiTaksasi * FORMULAS.kendaraan.likuidasiRatio;

    setHasil({
      harga_pasar: hargaPasar,
      nilai_taksasi: nilaiTaksasi,
      nilai_likuidasi: nilaiLikuidasi,
      terbilang: formatTerbilang(nilaiTaksasi),
    });
  };

  const handleUpdate = () => {
    if (!hasil) {
      toast({ title: 'Hitung terlebih dahulu', variant: 'destructive' });
      return;
    }

    const detailAgunan: DetailAgunanKendaraan = {
      jenis: formData.jenis,
      merk: formData.merk,
      model: formData.model,
      tahun: parseInt(formData.tahun) || 0,
      nomor_polisi: formData.nomor_polisi,
      nomor_mesin: formData.nomor_mesin,
      nomor_rangka: formData.nomor_rangka,
      buatan: formData.buatan,
      bukti_kepemilikan: formData.bukti_kepemilikan,
      nomor_bukti_kepemilikan: formData.nomor_bukti_kepemilikan,
      tanggal_bukti_kepemilikan: formData.tanggal_bukti_kepemilikan,
      nama_kepemilikan: formData.nama_kepemilikan,
      kondisi_unit: formData.kondisi_unit as 'Terawat' | 'Tidak Terawat',
      harga_pasar: hasil.harga_pasar,
      harga_pembanding: [
        { harga: parseFloat(formData.harga_pembanding_1) || 0, sumber: formData.sumber_1 },
        { harga: parseFloat(formData.harga_pembanding_2) || 0, sumber: formData.sumber_2 },
        { harga: parseFloat(formData.harga_pembanding_3) || 0, sumber: formData.sumber_3 },
      ].filter(h => h.harga > 0),
      keterangan: formData.keterangan.split('\n').filter(k => k.trim()),
      dokumentasi_urls: dokumentasi.map(d => d.url),
      dokumentasi_labels: dokumentasi.map(d => d.label),
    };

    updateTaksasi(id!, {
      nama_nasabah: formData.nama_nasabah,
      alamat: formData.alamat,
      nilai_pasar: hasil.harga_pasar,
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
    });

    toast({ title: 'Taksasi berhasil diupdate' });
    navigate('/riwayat');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Edit Taksasi Kendaraan"
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
          <h3 className="font-semibold mb-4">Data Nasabah</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Nama Nasabah</Label>
              <Input name="nama_nasabah" value={formData.nama_nasabah} onChange={handleChange} />
            </div>
            <div className="sm:col-span-2">
              <Label>Alamat</Label>
              <Textarea name="alamat" value={formData.alamat} onChange={handleChange} rows={2} />
            </div>
          </div>
        </div>

        {/* Data Kendaraan */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Car size={18} className="text-primary" />
            Data Kendaraan
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Jenis Kendaraan</Label>
              <Input name="jenis" value={formData.jenis} onChange={handleChange} placeholder="KENDARAAN RODA 2 / RODA 4" />
            </div>
            <div>
              <Label>Merk</Label>
              <Input name="merk" value={formData.merk} onChange={handleChange} />
            </div>
            <div>
              <Label>Model</Label>
              <Input name="model" value={formData.model} onChange={handleChange} />
            </div>
            <div>
              <Label>Tahun</Label>
              <Input name="tahun" type="number" value={formData.tahun} onChange={handleChange} />
            </div>
            <div>
              <Label>Nomor Polisi</Label>
              <Input name="nomor_polisi" value={formData.nomor_polisi} onChange={handleChange} />
            </div>
            <div>
              <Label>Nomor Mesin</Label>
              <Input name="nomor_mesin" value={formData.nomor_mesin} onChange={handleChange} />
            </div>
            <div>
              <Label>Nomor Rangka</Label>
              <Input name="nomor_rangka" value={formData.nomor_rangka} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Harga Pembanding */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold mb-4">Harga Pembanding</h3>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Harga Pembanding 1</Label>
                <Input name="harga_pembanding_1" type="number" value={formData.harga_pembanding_1} onChange={handleChange} />
              </div>
              <div>
                <Label>Sumber 1</Label>
                <Input name="sumber_1" value={formData.sumber_1} onChange={handleChange} placeholder="URL/Keterangan" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Harga Pembanding 2</Label>
                <Input name="harga_pembanding_2" type="number" value={formData.harga_pembanding_2} onChange={handleChange} />
              </div>
              <div>
                <Label>Sumber 2</Label>
                <Input name="sumber_2" value={formData.sumber_2} onChange={handleChange} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Harga Pembanding 3</Label>
                <Input name="harga_pembanding_3" type="number" value={formData.harga_pembanding_3} onChange={handleChange} />
              </div>
              <div>
                <Label>Sumber 3</Label>
                <Input name="sumber_3" value={formData.sumber_3} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* TIM PENILAI */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User size={18} className="text-primary" />
            TIM PENILAI
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Nama Pimpinan</Label>
              <Input name="pimpinan" value={formData.pimpinan} onChange={handleChange} />
            </div>
            <div>
              <Label>Jabatan Pimpinan</Label>
              <Input name="jabatan_pimpinan" value={formData.jabatan_pimpinan} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* DOKUMENTASI AGUNAN */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Camera size={18} className="text-accent" />
            DOKUMENTASI JAMINAN
          </h3>
          <LabeledImageUploader
            images={dokumentasi}
            onChange={setDokumentasi}
            maxImages={8}
            title="Dokumentasi Jaminan"
          />
        </div>

        <Button variant="accent" onClick={handleHitung} className="w-full">
          <Calculator className="mr-2" size={16} />
          Hitung Ulang Taksasi
        </Button>

        {hasil && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-success" />
              Hasil Perhitungan
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Nilai Taksasi</p>
                <p className="text-2xl font-bold">{formatCurrency(hasil.nilai_taksasi)}</p>
              </div>
              <div className="p-4 rounded-lg bg-success/10">
                <p className="text-sm text-muted-foreground mb-1">Nilai Likuidasi (75%)</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(hasil.nilai_likuidasi)}</p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <p className="text-sm"><span className="font-medium">Terbilang: </span>{hasil.terbilang}</p>
            </div>
            <div className="mt-6">
              <Button variant="hero" onClick={handleUpdate} className="w-full">
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

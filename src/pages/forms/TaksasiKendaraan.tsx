import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTaksasi } from '@/context/TaksasiContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { CloudImageUploader, LabeledImage } from '@/components/shared/CloudImageUploader';
import { FormBertahap, Langkah } from '@/components/shared/FormBertahap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useDrafOtomatis } from '@/hooks/use-draf-otomatis';
import { kunciDraf, nomorUrutDari } from '@/lib/taksasiItem';
import {
  FORMULAS,
  formatCurrency,
  formatTerbilang,
  generateNomorDokumen,
  DetailAgunanKendaraan,
} from '@/types';
import {
  Save,
  ArrowLeft,
  Car,
  Plus,
  Trash2,
  DollarSign,
  Link as LinkIcon,
  FileText,
  Camera,
  User,
  Loader2,
  Calculator,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HargaPembanding {
  harga: string;
  sumber: string;
}

const LABEL_FOTO = [
  'Tampak Depan',
  'Tampak Belakang',
  'Tampak Samping Kiri',
  'Tampak Samping Kanan',
  'Speedometer',
  'Nomor Rangka',
  'Nomor Mesin',
  'BPKB/STNK',
];

const BULAN_ROMAWI = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const formAwal = () => ({
  nomor_dokumen: '',
  nama_nasabah: '',
  alamat: '',
  tanggal_penilaian: new Date().toISOString().split('T')[0],
  kategori_agunan: '',
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

type FormKendaraan = ReturnType<typeof formAwal>;

const pembandingAwal = (): HargaPembanding[] => [
  { harga: '', sumber: '' },
  { harga: '', sumber: '' },
  { harga: '', sumber: '' },
];

/**
 * Form penilaian agunan kendaraan — satu komponen untuk tambah (/taksasi/kendaraan/new)
 * dan edit (/taksasi/kendaraan/edit/:id), supaya rumus dan kolom yang disimpan
 * selalu sama.
 */
export default function TaksasiKendaraan() {
  const { id } = useParams<{ id: string }>();
  const modeEdit = Boolean(id);
  const { user } = useAuth();
  const { addTaksasi, updateTaksasi, getTaksasiById, isLoading } = useTaksasi();
  const navigate = useNavigate();
  const { toast } = useToast();

  const existing = id ? getTaksasiById(id) : undefined;

  const [formData, setFormData] = useState<FormKendaraan>(formAwal);
  const [dokumentasi, setDokumentasi] = useState<LabeledImage[]>([]);
  const [hargaPembanding, setHargaPembanding] = useState<HargaPembanding[]>(pembandingAwal);
  const [termuat, setTermuat] = useState(!modeEdit);
  const [menyimpan, setMenyimpan] = useState(false);

  // Mode edit: isi form dari data tersimpan
  useEffect(() => {
    if (!modeEdit || termuat || !existing) return;
    const d = existing.detail_agunan as DetailAgunanKendaraan & { kategori_agunan?: string };
    const ket = d?.keterangan || [];
    setFormData({
      ...formAwal(),
      nomor_dokumen: nomorUrutDari(existing.nomor_dokumen),
      tanggal_penilaian: existing.tanggal || formAwal().tanggal_penilaian,
      nama_nasabah: existing.nama_nasabah || '',
      alamat: existing.alamat || '',
      kategori_agunan: d?.kategori_agunan || '',
      jenis: d?.jenis || '',
      merk: d?.merk || '',
      model: d?.model || '',
      tahun: d?.tahun ? String(d.tahun) : '',
      nomor_polisi: d?.nomor_polisi || '',
      nomor_mesin: d?.nomor_mesin || '',
      nomor_rangka: d?.nomor_rangka || '',
      buatan: d?.buatan || '',
      bukti_kepemilikan: d?.bukti_kepemilikan || 'BPKB',
      nomor_bukti_kepemilikan: d?.nomor_bukti_kepemilikan || '',
      tanggal_bukti_kepemilikan: d?.tanggal_bukti_kepemilikan || '',
      nama_kepemilikan: d?.nama_kepemilikan || '',
      kondisi_unit: d?.kondisi_unit || 'Terawat',
      keterangan_1: ket[0] || '',
      keterangan_2: ket[1] || '',
      keterangan_3: ket[2] || '',
      keterangan_4: ket.slice(3).join('; '),
      kantor_cabang: existing.kantor_cabang || formAwal().kantor_cabang,
      alamat_cabang: existing.alamat_cabang || formAwal().alamat_cabang,
      pimpinan: existing.pimpinan || '',
      jabatan_pimpinan: existing.jabatan_pimpinan || 'Pemimpin Capem',
    });
    const pb = (d?.harga_pembanding || []).map((p) => ({ harga: String(p.harga || ''), sumber: p.sumber || '' }));
    setHargaPembanding(pb.length > 0 ? pb : pembandingAwal());
    const urls = d?.dokumentasi_urls || [];
    const labels = d?.dokumentasi_labels || [];
    setDokumentasi(urls.map((url, i) => ({ url, label: labels[i] || LABEL_FOTO[i] || `Foto ${i + 1}` })));
    setTermuat(true);
  }, [modeEdit, termuat, existing]);

  // Draf otomatis
  const dataDraf = useMemo(() => ({ formData, hargaPembanding, dokumentasi }), [formData, hargaPembanding, dokumentasi]);
  const draf = useDrafOtomatis(
    kunciDraf('kendaraan', user?.id, id),
    dataDraf,
    (d) => {
      setFormData({ ...formAwal(), ...d.formData });
      setHargaPembanding(d.hargaPembanding?.length ? d.hargaPembanding : pembandingAwal());
      setDokumentasi(d.dokumentasi || []);
    },
    termuat,
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormKendaraan, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePembandingChange = (index: number, field: keyof HargaPembanding, value: string) => {
    setHargaPembanding((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  // Hasil dihitung langsung dari isian — tidak perlu klik "Hitung" lagi
  const hasil = useMemo(() => {
    const hargaList = hargaPembanding.map((p) => parseFloat(p.harga)).filter((h) => !isNaN(h) && h > 0);
    if (hargaList.length === 0) return null;
    const rataRata = FORMULAS.kendaraan.calculateTaksasi(hargaList);
    const nilaiTaksasiPembulatan = FORMULAS.kendaraan.pembulatan(rataRata);
    // Safety margin 25% → nilai likuidasi 75% dari nilai taksasi (pembulatan)
    const nilaiLikuidasi = nilaiTaksasiPembulatan * FORMULAS.kendaraan.likuidasiRatio;
    const nilaiLikuidasiPembulatan = FORMULAS.kendaraan.pembulatanRatusan(nilaiLikuidasi);
    return {
      rata_rata: rataRata,
      nilai_taksasi: rataRata,
      nilai_taksasi_pembulatan: nilaiTaksasiPembulatan,
      nilai_likuidasi: nilaiLikuidasi,
      nilai_likuidasi_pembulatan: nilaiLikuidasiPembulatan,
      terbilang: formatTerbilang(nilaiTaksasiPembulatan),
    };
  }, [hargaPembanding]);

  const tglPenilaian = new Date(formData.tanggal_penilaian);
  const akhiranNomor = isNaN(tglPenilaian.getTime())
    ? ''
    : `/F-3/BPD-TLH/${BULAN_ROMAWI[tglPenilaian.getMonth()]}/${tglPenilaian.getFullYear()}`;

  const cekUmum = () =>
    [!formData.nama_nasabah.trim() && 'Nama calon debitur / debitur', !formData.alamat.trim() && 'Lokasi objek agunan'].filter(
      Boolean,
    ) as string[];
  const cekProfil = () => [!formData.merk.trim() && 'Merk', !formData.model.trim() && 'Model / type'].filter(Boolean) as string[];
  const cekPembanding = () => (hasil ? [] : ['Minimal satu harga pembanding']);

  const handleSimpan = async () => {
    const kurang = [...cekUmum(), ...cekProfil(), ...cekPembanding()];
    if (kurang.length > 0 || !hasil) {
      toast({ title: 'Data belum lengkap', description: kurang.join(', '), variant: 'destructive' });
      return;
    }

    const validPembanding = hargaPembanding
      .filter((p) => parseFloat(p.harga) > 0)
      .map((p) => ({ harga: parseFloat(p.harga), sumber: p.sumber }));

    const keterangan = [formData.keterangan_1, formData.keterangan_2, formData.keterangan_3, formData.keterangan_4].filter(
      (k) => k.trim() !== '',
    );

    const detailAgunan: DetailAgunanKendaraan & Record<string, unknown> = {
      kategori_agunan: formData.kategori_agunan,
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
      keterangan,
      dokumentasi_urls: dokumentasi.map((d) => d.url),
      dokumentasi_labels: dokumentasi.map((d) => d.label),
      dokumentasi_meta: dokumentasi.map((d) => ({ waktu: d.waktu ?? null, lat: d.lat ?? null, lng: d.lng ?? null })),
      // Dulu hilang setelah disimpan — sekarang ikut tersimpan
      nilai_taksasi_pembulatan: hasil.nilai_taksasi_pembulatan,
      nilai_likuidasi_pembulatan: hasil.nilai_likuidasi_pembulatan,
    };

    const nomorBaru = generateNomorDokumen('TLH', formData.nomor_dokumen, formData.tanggal_penilaian);

    const data = {
      nomor_dokumen:
        modeEdit && existing && nomorUrutDari(existing.nomor_dokumen) === formData.nomor_dokumen && existing.tanggal === formData.tanggal_penilaian
          ? existing.nomor_dokumen
          : nomorBaru,
      jenis_agunan: 'Kendaraan' as const,
      nama_nasabah: formData.nama_nasabah,
      alamat: formData.alamat,
      nilai_pasar: hasil.rata_rata,
      nilai_taksasi: hasil.nilai_taksasi,
      nilai_taksasi_pembulatan: hasil.nilai_taksasi_pembulatan,
      nilai_likuidasi: hasil.nilai_likuidasi,
      nilai_likuidasi_pembulatan: hasil.nilai_likuidasi_pembulatan,
      safety_margin: FORMULAS.kendaraan.safetyMargin,
      terbilang: hasil.terbilang,
      detail_agunan: detailAgunan as DetailAgunanKendaraan,
      tanggal: formData.tanggal_penilaian,
      kantor_cabang: formData.kantor_cabang,
      alamat_cabang: formData.alamat_cabang,
      pimpinan: formData.pimpinan,
      jabatan_pimpinan: formData.jabatan_pimpinan,
    };

    setMenyimpan(true);
    try {
      if (modeEdit && id) {
        await updateTaksasi(id, {
          ...data,
          tim_penilai: [
            { nama: formData.pimpinan, jabatan: formData.jabatan_pimpinan },
            { nama: existing?.petugas || user?.nama || '', jabatan: existing?.jabatan_petugas || 'Officer Relationship Kredit' },
          ],
        });
        toast({ title: 'Perubahan tersimpan' });
      } else {
        const ok = await addTaksasi({
          ...data,
          id_user: user?.id || '',
          status: 'draft',
          status_otorisasi: 'Draft',
          petugas: user?.nama || '',
          jabatan_petugas: 'Officer Relationship Kredit',
          tim_penilai: [
            { nama: formData.pimpinan, jabatan: formData.jabatan_pimpinan },
            { nama: user?.nama || '', jabatan: 'Officer Relationship Kredit' },
          ],
        });
        if (!ok) return; // pesan gagal sudah ditampilkan, isian tetap ada di draf
      }
      draf.hapusDraf();
      navigate('/taksasi');
    } catch {
      /* pesan gagal sudah ditampilkan oleh updateTaksasi */
    } finally {
      setMenyimpan(false);
    }
  };

  if (modeEdit && !existing) {
    return (
      <div className="text-center py-12">
        {isLoading ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        ) : (
          <>
            <p className="text-muted-foreground">Data taksasi tidak ditemukan</p>
            <Button variant="ghost" onClick={() => navigate('/taksasi')} className="mt-4">
              <ArrowLeft className="mr-2" size={16} /> Kembali
            </Button>
          </>
        )}
      </div>
    );
  }

  const kartu = 'rounded-xl border bg-card p-4 sm:p-6 shadow-card';

  const langkah: Langkah[] = [
    {
      judul: 'Umum',
      ikon: FileText,
      cek: cekUmum,
      isi: (
        <div className={kartu}>
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <FileText size={20} className="text-primary" /> I. UMUM
          </h3>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomor_dokumen">Nomor Dokumen</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="nomor_dokumen"
                    name="nomor_dokumen"
                    inputMode="numeric"
                    placeholder="001"
                    className="w-24"
                    value={formData.nomor_dokumen}
                    onChange={(e) => setFormData((p) => ({ ...p, nomor_dokumen: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                  />
                  <span className="text-sm text-muted-foreground truncate">{akhiranNomor}</span>
                </div>
              </div>
              <div>
                <Label htmlFor="tanggal_penilaian">Tanggal Penilaian</Label>
                <Input type="date" id="tanggal_penilaian" name="tanggal_penilaian" value={formData.tanggal_penilaian} onChange={handleChange} />
              </div>
            </div>
            <div>
              <Label htmlFor="kategori_agunan">Jenis Agunan</Label>
              <Input
                id="kategori_agunan"
                name="kategori_agunan"
                placeholder="BARANG BERGERAK / KENDARAAN RODA 2"
                value={formData.kategori_agunan}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-muted-foreground">Kosongkan untuk memakai isian Jenis Kendaraan.</p>
            </div>
            <div>
              <Label htmlFor="nama_nasabah">Nama Calon Debitur / Debitur *</Label>
              <Input id="nama_nasabah" name="nama_nasabah" placeholder="Nama sesuai KTP" value={formData.nama_nasabah} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="alamat">Lokasi Objek Agunan *</Label>
              <Textarea id="alamat" name="alamat" placeholder="Alamat lengkap lokasi kendaraan" value={formData.alamat} onChange={handleChange} rows={2} />
            </div>
          </div>
        </div>
      ),
    },
    {
      judul: 'Profil Kendaraan',
      ikon: Car,
      cek: cekProfil,
      isi: (
        <div className={kartu}>
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <Car size={20} className="text-warning" /> II. PROFIL AGUNAN
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="jenis">Jenis Kendaraan</Label>
              <Input id="jenis" name="jenis" placeholder="SEPEDA MOTOR" value={formData.jenis} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="merk">Merk *</Label>
              <Input id="merk" name="merk" placeholder="HONDA" value={formData.merk} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="model">Model / Type *</Label>
              <Input id="model" name="model" placeholder="SOLO / P5E02R22M1 M/T" value={formData.model} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="tahun">Tahun Pembuatan</Label>
              <Input id="tahun" name="tahun" inputMode="numeric" placeholder="2018" value={formData.tahun} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="nomor_polisi">Nomor Polisi</Label>
              <Input id="nomor_polisi" name="nomor_polisi" placeholder="KT 4329 QC" value={formData.nomor_polisi} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="nomor_mesin">Nomor Mesin</Label>
              <Input id="nomor_mesin" name="nomor_mesin" placeholder="KC91E-1204762" value={formData.nomor_mesin} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="nomor_rangka">Nomor Rangka</Label>
              <Input id="nomor_rangka" name="nomor_rangka" placeholder="MH1KC9116K212204" value={formData.nomor_rangka} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="buatan">Buatan</Label>
              <Input id="buatan" name="buatan" placeholder="Jepang" value={formData.buatan} onChange={handleChange} />
            </div>
            <div>
              <Label>Bukti Kepemilikan</Label>
              <Select value={formData.bukti_kepemilikan} onValueChange={(v) => handleSelectChange('bukti_kepemilikan', v)}>
                <SelectTrigger><SelectValue placeholder="Pilih bukti kepemilikan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BPKB">BPKB</SelectItem>
                  <SelectItem value="STNK">STNK</SelectItem>
                  <SelectItem value="Faktur">Faktur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nomor_bukti_kepemilikan">Nomor Bukti Kepemilikan</Label>
              <Input id="nomor_bukti_kepemilikan" name="nomor_bukti_kepemilikan" placeholder="N-10026971N" value={formData.nomor_bukti_kepemilikan} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="tanggal_bukti_kepemilikan">Tanggal Bukti Kepemilikan</Label>
              <Input id="tanggal_bukti_kepemilikan" name="tanggal_bukti_kepemilikan" type="date" value={formData.tanggal_bukti_kepemilikan} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="nama_kepemilikan">Nama Kepemilikan</Label>
              <Input id="nama_kepemilikan" name="nama_kepemilikan" placeholder="Nama pemilik di BPKB" value={formData.nama_kepemilikan} onChange={handleChange} />
            </div>
            <div>
              <Label>Kondisi Unit</Label>
              <Select value={formData.kondisi_unit} onValueChange={(v) => handleSelectChange('kondisi_unit', v)}>
                <SelectTrigger><SelectValue placeholder="Pilih kondisi unit" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Terawat">Terawat</SelectItem>
                  <SelectItem value="Tidak Terawat">Tidak Terawat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ),
    },
    {
      judul: 'Harga Pembanding',
      ikon: LinkIcon,
      cek: cekPembanding,
      isi: (
        <div className={kartu}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold flex items-center gap-2 text-lg">
              <LinkIcon size={20} className="text-accent" /> III. METODE PENILAIAN
            </h3>
            {hargaPembanding.length < 5 && (
              <Button variant="ghost" size="sm" onClick={() => setHargaPembanding((p) => [...p, { harga: '', sumber: '' }])}>
                <Plus size={16} className="mr-1" /> Tambah
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4">Harga pasar {formData.model || 'kendaraan'} dari minimal satu sumber (maks. 5).</p>
          <div className="space-y-3">
            {hargaPembanding.map((item, index) => (
              <div key={index} className="flex gap-3 items-start p-3 rounded-lg bg-muted/30">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{index + 1}</div>
                <div className="flex-1 grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Harga (Rp)</Label>
                    <CurrencyInput placeholder="0" value={item.harga} onChange={(val) => handlePembandingChange(index, 'harga', val)} />
                  </div>
                  <div>
                    <Label className="text-xs">Sumber / Link</Label>
                    <Input placeholder="https://…" value={item.sumber} onChange={(e) => handlePembandingChange(index, 'sumber', e.target.value)} />
                  </div>
                </div>
                {hargaPembanding.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Hapus pembanding ${index + 1}`}
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setHargaPembanding((p) => p.filter((_, i) => i !== index))}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {hasil && (
            <p className="mt-4 text-sm">
              Rata-rata: <strong>{formatCurrency(hasil.rata_rata)}</strong> → pembulatan{' '}
              <strong className="text-primary">{formatCurrency(hasil.nilai_taksasi_pembulatan)}</strong>
            </p>
          )}
        </div>
      ),
    },
    {
      judul: 'Keterangan & Penilai',
      ikon: User,
      isi: (
        <div className="grid gap-6">
          <div className={kartu}>
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <FileText size={20} className="text-muted-foreground" /> IV. KETERANGAN
            </h3>
            <div className="space-y-3">
              <Input name="keterangan_1" placeholder="Harga berdasarkan data pembanding: Marketplace Facebook" value={formData.keterangan_1} onChange={handleChange} />
              <Input name="keterangan_2" placeholder="Kendaraan hak milik debitur beserta surat-surat…" value={formData.keterangan_2} onChange={handleChange} />
              <Input name="keterangan_3" placeholder="Kendaraan dalam kondisi baik dan dapat berfungsi…" value={formData.keterangan_3} onChange={handleChange} />
              <Input name="keterangan_4" placeholder="Disarankan untuk dilakukan perikatan…" value={formData.keterangan_4} onChange={handleChange} />
            </div>
          </div>
          <div className={kartu}>
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <User size={20} className="text-primary" /> TIM PENILAI & KANTOR
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pimpinan">Nama Pimpinan</Label>
                <Input id="pimpinan" name="pimpinan" placeholder="Nama pimpinan cabang" value={formData.pimpinan} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="jabatan_pimpinan">Jabatan Pimpinan</Label>
                <Input id="jabatan_pimpinan" name="jabatan_pimpinan" value={formData.jabatan_pimpinan} onChange={handleChange} />
              </div>
              <div>
                <Label>Petugas Penilai</Label>
                <Input value={(modeEdit ? existing?.petugas : user?.nama) || ''} disabled className="bg-muted" />
              </div>
              <div>
                <Label>Jabatan Petugas</Label>
                <Input value="Officer Relationship Kredit" disabled className="bg-muted" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="kantor_cabang">Nama Kantor Cabang</Label>
                <Input id="kantor_cabang" name="kantor_cabang" value={formData.kantor_cabang} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="alamat_cabang">Alamat Kantor Cabang</Label>
                <Textarea id="alamat_cabang" name="alamat_cabang" value={formData.alamat_cabang} onChange={handleChange} rows={2} />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      judul: 'Foto',
      ikon: Camera,
      isi: (
        <div className={kartu}>
          <h3 className="font-semibold mb-1 flex items-center gap-2 text-lg">
            <Camera size={20} className="text-accent" /> DOKUMENTASI JAMINAN
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Maks. 8 foto. Foto otomatis dikompres dan diberi watermark waktu, nama petugas, dan lokasi GPS.
          </p>
          <CloudImageUploader images={dokumentasi} onChange={setDokumentasi} maxImages={8} defaultLabels={LABEL_FOTO} />
        </div>
      ),
    },
    {
      judul: 'Ringkasan',
      ikon: Calculator,
      isi: (
        <div className={kartu}>
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <DollarSign size={20} className="text-success" /> PERHITUNGAN NILAI TAKSASI
          </h3>
          {hasil ? (
            <>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted/40 p-3">
                  <dt className="text-muted-foreground">Nilai taksasi</dt>
                  <dd className="font-medium">{formatCurrency(hasil.nilai_taksasi)}</dd>
                </div>
                <div className="rounded-lg bg-primary/5 p-3">
                  <dt className="text-muted-foreground">Pembulatan</dt>
                  <dd className="font-semibold text-primary">{formatCurrency(hasil.nilai_taksasi_pembulatan)}</dd>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <dt className="text-muted-foreground">Nilai likuidasi ({100 - FORMULAS.kendaraan.safetyMargin}%)</dt>
                  <dd className="font-medium">{formatCurrency(hasil.nilai_likuidasi)}</dd>
                </div>
                <div className="rounded-lg bg-success/10 p-3">
                  <dt className="text-muted-foreground">Pembulatan</dt>
                  <dd className="font-semibold text-success">{formatCurrency(hasil.nilai_likuidasi_pembulatan)}</dd>
                </div>
              </dl>
              <p className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
                <span className="font-medium">Terbilang: </span>
                {hasil.terbilang}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Isi minimal satu harga pembanding untuk melihat hasil perhitungan.</p>
          )}
          <dl className="mt-4 grid gap-1 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Debitur</dt><dd className="text-right font-medium">{formData.nama_nasabah || '—'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Kendaraan</dt><dd className="text-right">{[formData.merk, formData.model, formData.tahun].filter(Boolean).join(' ') || '—'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Foto</dt><dd>{dokumentasi.length} foto</dd></div>
          </dl>
          <Button variant="hero" onClick={handleSimpan} className="mt-6 w-full" disabled={menyimpan}>
            {menyimpan ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Save className="mr-2" size={16} />}
            {modeEdit ? 'Simpan Perubahan' : 'Simpan Taksasi'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={modeEdit ? 'Edit Taksasi Kendaraan' : 'Penilaian Agunan Kendaraan'}
        description={modeEdit ? existing?.nomor_dokumen : 'Penilaian agunan berupa kendaraan bermotor sesuai format Bankaltimtara'}
        actions={
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2" size={16} /> Kembali
          </Button>
        }
      />
      <FormBertahap
        langkah={langkah}
        draf={{ tersedia: draf.drafTersedia, terakhirDisimpan: draf.terakhirDisimpan, pakai: draf.pakaiDraf, buang: draf.buangDraf }}
      />
    </div>
  );
}

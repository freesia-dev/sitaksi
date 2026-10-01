import React, { useEffect, useMemo, useState } from 'react';
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
  Hash,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { FormBertahap, Langkah } from '@/components/shared/FormBertahap';
import { useDrafOtomatis } from '@/hooks/use-draf-otomatis';
import {
  TanahItem,
  buatTanah,
  hitungTanah,
  tanahKeData,
  dataKeTanah,
  nomorUrutDari,
  kunciDraf,
} from '@/lib/taksasiItem';
import { Loader2, FileText, Scale, Users } from 'lucide-react';
import type { DetailAgunanTBSimple } from '@/types';


const LABEL_FOTO = ['Tampak Depan', 'Tampak Samping', 'Tampak Jalan', 'Surat Tanah'];

const formAwal = () => ({
  nomor_dokumen: '',
  nama_nasabah: '',
  tanggal_penilaian: new Date().toISOString().split('T')[0],
  kantor_cabang: 'KANTOR CABANG PEMBANTU TELIHAN',
  alamat_cabang: 'JL.S.PARMAN NO.14-15 KEL.GN.TELIHAN KEC.BONTANG BARAT-75383',
  pimpinan: '',
  jabatan_pimpinan: 'Pemimpin Capem',
  marketability: 'cukup_marketable',
  catatan_marketability_1: '',
  catatan_marketability_2: '',
  catatan_marketability_3: '',
});

type FormTanah = ReturnType<typeof formAwal>;

/**
 * Form penilaian agunan tanah kosong — satu komponen untuk tambah dan edit.
 * Rincian tiap bidang (sertifikat, batas, pembanding, safety margin) sekarang
 * ikut tersimpan di detail_agunan.tanah_list; dulu hanya luas total dan harga
 * rata-rata per m² yang tersimpan sehingga edit/cetak kehilangan rinciannya.
 */
export default function TaksasiTanah() {
  const { id } = useParams<{ id: string }>();
  const modeEdit = Boolean(id);
  const { user } = useAuth();
  const { addTaksasi, updateTaksasi, getTaksasiById, isLoading } = useTaksasi();
  const navigate = useNavigate();
  const { toast } = useToast();

  const existing = id ? getTaksasiById(id) : undefined;

  const [formData, setFormData] = useState<FormTanah>(formAwal);
  const [tanahList, setTanahList] = useState<TanahItem[]>(() => [buatTanah()]);
  const [dokumentasi, setDokumentasi] = useState<LabeledImage[]>([]);
  const [termuat, setTermuat] = useState(!modeEdit);
  const [menyimpan, setMenyimpan] = useState(false);
  const [dataLama, setDataLama] = useState(false);

  // Mode edit: isi form dari data tersimpan
  useEffect(() => {
    if (!modeEdit || termuat || !existing) return;
    const d = existing.detail_agunan as DetailAgunanTanahSimple & Partial<DetailAgunanTBSimple>;
    setFormData({
      ...formAwal(),
      nomor_dokumen: nomorUrutDari(existing.nomor_dokumen),
      tanggal_penilaian: existing.tanggal || formAwal().tanggal_penilaian,
      nama_nasabah: existing.nama_nasabah || '',
      kantor_cabang: existing.kantor_cabang || formAwal().kantor_cabang,
      alamat_cabang: existing.alamat_cabang || formAwal().alamat_cabang,
      pimpinan: existing.pimpinan || '',
      jabatan_pimpinan: existing.jabatan_pimpinan || 'Pemimpin Capem',
      marketability: existing.marketability || d?.marketability || 'cukup_marketable',
      catatan_marketability_1: existing.catatan_marketability?.[0] || '',
      catatan_marketability_2: existing.catatan_marketability?.[1] || '',
      catatan_marketability_3: existing.catatan_marketability?.[2] || '',
    });
    if (d?.tanah_list && d.tanah_list.length > 0) {
      setTanahList(d.tanah_list.map(dataKeTanah));
    } else {
      // Data lama: hanya luas total & harga rata-rata per m² yang tersimpan
      setTanahList([
        {
          ...buatTanah(),
          luas_tanah: d?.luas_tanah?.toString() || '',
          harga_pembanding_1: d?.harga_per_meter ? String(Math.round(d.harga_per_meter)) : '',
          lokasi: existing.alamat || '',
        },
      ]);
      setDataLama(true);
    }
    const urls = d?.dokumentasi_urls || [];
    const labels = d?.dokumentasi_labels || [];
    setDokumentasi(urls.map((url, i) => ({ url, label: labels[i] || LABEL_FOTO[i] || `Foto ${i + 1}` })));
    setTermuat(true);
  }, [modeEdit, termuat, existing]);

  // Draf otomatis
  const dataDraf = useMemo(() => ({ formData, tanahList, dokumentasi }), [formData, tanahList, dokumentasi]);
  const draf = useDrafOtomatis(
    kunciDraf('tanah', user?.id, id),
    dataDraf,
    (d) => {
      setFormData({ ...formAwal(), ...d.formData });
      setTanahList(d.tanahList?.length ? d.tanahList.map((t) => ({ ...buatTanah(), ...t })) : [buatTanah()]);
      setDokumentasi(d.dokumentasi || []);
    },
    termuat,
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateTanah = (index: number, field: keyof TanahItem, value: string | boolean | string[]) => {
    setTanahList((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const addTanah = () => setTanahList((prev) => [...prev, buatTanah()]);

  const removeTanah = (index: number) => {
    if (tanahList.length > 1) setTanahList((prev) => prev.filter((_, i) => i !== index));
  };

  // Hasil dihitung langsung dari isian
  const hasil = useMemo(() => {
    const detailTanah = tanahList.map(hitungTanah);
    const totalNilaiTanah = detailTanah.reduce((sum, d) => sum + d.nilai_pasar, 0);
    const nilaiLikuidasi = detailTanah.reduce((sum, d) => sum + d.nilai_likuidasi, 0);
    return {
      total_nilai_tanah: totalNilaiTanah,
      nilai_taksasi: totalNilaiTanah,
      nilai_likuidasi: nilaiLikuidasi,
      terbilang: formatTerbilang(totalNilaiTanah),
      detail_tanah: detailTanah,
    };
  }, [tanahList]);

  const label = (i: number) => (tanahList.length > 1 ? ` (tanah #${i + 1})` : '');
  const cekNasabah = () => (formData.nama_nasabah.trim() ? [] : ['Nama nasabah']);
  const cekProfil = () =>
    tanahList.flatMap((t, i) => [!(parseFloat(t.luas_tanah) > 0) && `Luas tanah${label(i)}`, !t.lokasi.trim() && `Lokasi${label(i)}`]).filter(Boolean) as string[];
  const cekNilai = () =>
    tanahList
      .map((t, i) => (hitungTanah(t).nilai_pasar > 0 ? null : `Minimal satu harga pembanding${label(i)}`))
      .filter(Boolean) as string[];

  const handleSimpan = async () => {
    const kurang = [...cekNasabah(), ...cekProfil(), ...cekNilai()];
    if (kurang.length > 0) {
      toast({ title: 'Data belum lengkap', description: kurang.join(', '), variant: 'destructive' });
      return;
    }

    const totalLuasTanah = tanahList.reduce((sum, t) => sum + (parseFloat(t.luas_tanah) || 0), 0);
    const avgHargaTanah = totalLuasTanah > 0 ? hasil.total_nilai_tanah / totalLuasTanah : 0;
    const catatan = [formData.catatan_marketability_1, formData.catatan_marketability_2, formData.catatan_marketability_3].filter((c) => c);

    const detailAgunan = {
      luas_tanah: totalLuasTanah,
      harga_per_meter: avgHargaTanah,
      dokumentasi_urls: dokumentasi.map((d) => d.url),
      dokumentasi_labels: dokumentasi.map((d) => d.label),
      dokumentasi_meta: dokumentasi.map((d) => ({ waktu: d.waktu ?? null, lat: d.lat ?? null, lng: d.lng ?? null })),
      tanah_list: tanahList.map(tanahKeData),
      marketability: formData.marketability,
      catatan_marketability: catatan,
    };

    const alamatGabungan = tanahList.map((t) => t.lokasi).filter((l) => l).join('; ') || 'Alamat tidak disebutkan';
    const nomorBaru = generateNomorDokumen('TLH', formData.nomor_dokumen, formData.tanggal_penilaian);

    const data = {
      nomor_dokumen:
        modeEdit && existing && nomorUrutDari(existing.nomor_dokumen) === formData.nomor_dokumen && existing.tanggal === formData.tanggal_penilaian
          ? existing.nomor_dokumen
          : nomorBaru,
      jenis_agunan: 'Tanah' as const,
      nama_nasabah: formData.nama_nasabah,
      alamat: alamatGabungan,
      nilai_pasar: hasil.nilai_taksasi,
      nilai_taksasi: hasil.nilai_taksasi,
      nilai_taksasi_pembulatan: hasil.nilai_taksasi,
      nilai_likuidasi: hasil.nilai_likuidasi,
      nilai_likuidasi_pembulatan: hasil.nilai_likuidasi,
      safety_margin: 20,
      terbilang: hasil.terbilang,
      detail_agunan: detailAgunan as DetailAgunanTanahSimple,
      tanggal: formData.tanggal_penilaian,
      kantor_cabang: formData.kantor_cabang,
      alamat_cabang: formData.alamat_cabang,
      pimpinan: formData.pimpinan,
      jabatan_pimpinan: formData.jabatan_pimpinan,
      marketability: formData.marketability,
      catatan_marketability: catatan,
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
        if (!ok) return;
      }
      draf.hapusDraf();
      navigate('/taksasi');
    } catch {
      /* pesan gagal sudah ditampilkan */
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

  const peringatanDataLama = dataLama && (
    <div className="flex gap-2 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm">
      <AlertCircle size={16} className="mt-0.5 shrink-0 text-warning-foreground" />
      <p>
        Taksasi ini dibuat dengan versi lama yang hanya menyimpan luas dan harga rata-rata per m². Rincian sertifikat,
        batas, pembanding, dan safety margin perlu diisi ulang, lalu disimpan agar ikut tercetak.
      </p>
    </div>
  );

  const langkah: Langkah[] = [
    {
      judul: 'Data Nasabah',
      ikon: FileText,
      cek: cekNasabah,
      isi: (
        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            Data Nasabah
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
                    /F-3/BPD-TLH/{['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][new Date(formData.tanggal_penilaian).getMonth()]}/{new Date(formData.tanggal_penilaian).getFullYear()}
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
        </div>
      ),
    },
    {
      judul: 'Profil Tanah',
      ikon: Home,
      cek: cekProfil,
      isi: (
        <div className="grid gap-6">
          {peringatanDataLama}
          {tanahList.map((tanah, index) => (
            <div key={tanah.id} className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
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
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground">A. PROFIL</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Bukti Kepemilikan</Label>
                    <Select value={tanah.bukti_kepemilikan} onValueChange={(v) => updateTanah(index, 'bukti_kepemilikan', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pelepasan_hak">Pelepasan Hak Atas Tanah</SelectItem>
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
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addTanah} className="w-full">
            <Plus className="mr-2" size={16} />
            Tambah Tanah
          </Button>
        </div>
      ),
    },
    {
      judul: 'Harga & Safety Margin',
      ikon: Scale,
      cek: cekNilai,
      isi: (
        <div className="grid gap-6">
          {tanahList.map((tanah, index) => (
            <div key={tanah.id} className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Scale size={18} className="text-primary" />
                Nilai Tanah {tanahList.length > 1 ? `#${index + 1}` : ''}
                {tanah.lokasi && <span className="font-normal text-muted-foreground truncate">· {tanah.lokasi}</span>}
              </h3>
              <div className="space-y-4">
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
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Nilai pasar</p>
                  <p className="font-semibold">{formatCurrency(hasil.detail_tanah[index]?.nilai_pasar || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Safety margin</p>
                  <p className="font-semibold">{(hasil.detail_tanah[index]?.avg_safety || 0).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Likuidasi</p>
                  <p className="font-semibold text-success">{formatCurrency(hasil.detail_tanah[index]?.nilai_likuidasi || 0)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      judul: 'Marketability',
      ikon: AlertCircle,
      isi: (
        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
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
      ),
    },
    {
      judul: 'Tim Penilai',
      ikon: Users,
      isi: (
        <div className="grid gap-6">
          <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
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
          <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
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
        </div>
      ),
    },
    {
      judul: 'Foto',
      ikon: Camera,
      isi: (
        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
          <CloudImageUploader
            images={dokumentasi}
            onChange={setDokumentasi}
            maxImages={8}
            title="Dokumentasi Foto (Max 8)"
            defaultLabels={['Tampak Depan', 'Tampak Samping', 'Tampak Jalan', 'Surat Tanah']}
          />
        </div>
      ),
    },
    {
      judul: 'Ringkasan',
      ikon: Calculator,
      isi: (
        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-success" />
            Hasil Perhitungan
          </h3>
          {hasil.detail_tanah.map((detail, index) => (
            <div key={index} className="mb-3 p-3 rounded-lg bg-muted/30">
              <p className="text-sm font-medium mb-2">
                Tanah #{index + 1}
                {tanahList[index]?.lokasi ? ` · ${tanahList[index].lokasi}` : ''}
              </p>
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
          <p className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
            <span className="font-medium">Terbilang: </span>
            {hasil.terbilang}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {formData.nama_nasabah || 'Nama nasabah belum diisi'} · {tanahList.length} bidang · {dokumentasi.length} foto
          </p>
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
        title={modeEdit ? 'Edit Taksasi Tanah' : 'Formulir Taksasi Tanah'}
        description={modeEdit ? existing?.nomor_dokumen : 'Penilaian agunan berupa tanah kosong'}
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

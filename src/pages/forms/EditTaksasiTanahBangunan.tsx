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
  DetailAgunanTBSimple,
  generateId 
} from '@/types';
import { 
  SAFETY_MARGIN_TANAH,
  SAFETY_MARGIN_BANGUNAN,
  getMarginByValue,
} from '@/lib/safetyMarginConfig';
import { 
  Calculator, 
  Save, 
  ArrowLeft, 
  MapPin, 
  Home, 
  Building2,
  DollarSign, 
  User, 
  Building,
  Plus,
  Trash2,
  Camera,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  safety_design: 'semi_modern',
  safety_umur: 'muda',
  safety_peruntukkan: 'non_produktif',
  safety_imb: 'tidak_ada_non_produktif',
  safety_kesesuaian: 'ideal',
  safety_permasalahan: 'aman',
};

export default function EditTaksasiTanahBangunan() {
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
      });

      const detail = existingTaksasi.detail_agunan as DetailAgunanTBSimple;
      if (detail) {
        // Load from tanah_list if available (rich data), fallback to simple fields
        if (detail.tanah_list && detail.tanah_list.length > 0) {
          const loadedTanah: TanahItem[] = detail.tanah_list.map((t, i) => ({
            ...defaultTanah,
            id: generateId(),
            bukti_kepemilikan: t.bukti_kepemilikan || 'hak_milik',
            nomor_bukti: t.nomor_bukti || '',
            tanggal_bukti: t.tanggal_bukti || '',
            masa_berlaku: t.masa_berlaku || '',
            nama_pemegang_hak: t.nama_pemegang_hak || '',
            hubungan_dengan_debitur: t.hubungan_dengan_debitur || 'milik_sendiri',
            nomor_gambar_situasi: t.nomor_gambar_situasi || '',
            nomor_induk_bidang: t.nomor_induk_bidang || '',
            luas_tanah: t.luas_tanah?.toString() || '',
            tempat_didaftarkan: t.tempat_didaftarkan || '',
            lokasi: t.lokasi || '',
            letak_tanah: t.letak_tanah || 'normal',
            bentuk_tanah: t.bentuk_tanah || 'beraturan',
            arah_menghadap: t.arah_menghadap || 'utara',
            lebar_jalan_depan: t.lebar_jalan_depan || '',
            bahan_jalan: t.bahan_jalan || 'aspal',
            batas_depan: t.batas_depan || '',
            batas_belakang: t.batas_belakang || '',
            batas_kanan: t.batas_kanan || '',
            batas_kiri: t.batas_kiri || '',
            kondisi_lalu_lintas: t.kondisi_lalu_lintas || '',
            kelas_jalan: t.kelas_jalan || 'kampung',
            listrik_pln: t.listrik_pln || '',
            air_bersih: t.air_bersih || 'ada',
            saluran_telepon: t.saluran_telepon || 'tidak_ada',
            fasilitas_penunjang: t.fasilitas_penunjang || [],
            harga_pembanding_1: t.harga_pembanding?.[0]?.harga?.toString() || '',
            sumber_1: t.harga_pembanding?.[0]?.sumber || '',
            harga_pembanding_2: t.harga_pembanding?.[1]?.harga?.toString() || '',
            sumber_2: t.harga_pembanding?.[1]?.sumber || '',
            harga_pembanding_3: t.harga_pembanding?.[2]?.harga?.toString() || '',
            sumber_3: t.harga_pembanding?.[2]?.sumber || '',
            safety_lokasi: t.safety_margins?.lokasi || 'cukup_strategis',
            safety_topography: t.safety_margins?.topography || 'datar',
            safety_ukuran: t.safety_margins?.ukuran || 'ideal',
            safety_bukti: t.safety_margins?.bukti || 'hak_milik',
            safety_lingkungan: t.safety_margins?.lingkungan || 'prospek_berkembang',
            safety_permasalahan: t.safety_margins?.permasalahan || 'aman',
          }));
          setTanahList(loadedTanah);
        } else {
          const loadedTanah: TanahItem = {
            ...defaultTanah,
            luas_tanah: detail.luas_tanah?.toString() || '',
            harga_pembanding_1: detail.harga_tanah_per_meter?.toString() || '',
            lokasi: existingTaksasi.alamat,
          };
          setTanahList([loadedTanah]);
        }

        if (detail.bangunan_list && detail.bangunan_list.length > 0) {
          const loadedBangunan: BangunanItem[] = detail.bangunan_list.map(b => ({
            ...defaultBangunan,
            id: generateId(),
            peruntukkan: b.peruntukkan || 'rumah_tinggal',
            imb_ada: b.imb_ada || false,
            nomor_imb: b.nomor_imb || '',
            tanggal_imb: b.tanggal_imb || '',
            nama_di_imb: b.nama_di_imb || '',
            luas_sesuai_imb: b.luas_sesuai_imb || '',
            tinggi_sesuai_imb: b.tinggi_sesuai_imb || '',
            konstruksi: b.konstruksi || 'permanent',
            pondasi: b.pondasi || 'beton',
            tinggi_lantai: b.tinggi_lantai || '1',
            atap: b.atap || 'genteng',
            dinding: b.dinding || 'batu_bata',
            plester_dinding: b.plester_dinding ?? true,
            plafon: b.plafon || 'gypsum',
            lantai: b.lantai || 'keramik',
            tiang: b.tiang || 'beton',
            luas_bangunan: b.luas_bangunan?.toString() || '',
            keterangan: b.keterangan || '',
            harga_pembanding_1: b.harga_pembanding?.[0]?.harga?.toString() || '',
            sumber_1: b.harga_pembanding?.[0]?.sumber || '',
            harga_pembanding_2: b.harga_pembanding?.[1]?.harga?.toString() || '',
            sumber_2: b.harga_pembanding?.[1]?.sumber || '',
            harga_pembanding_3: b.harga_pembanding?.[2]?.harga?.toString() || '',
            sumber_3: b.harga_pembanding?.[2]?.sumber || '',
            safety_design: b.safety_margins?.design || 'semi_modern',
            safety_umur: b.safety_margins?.umur || 'muda',
            safety_peruntukkan: b.safety_margins?.peruntukkan || 'non_produktif',
            safety_imb: b.safety_margins?.imb || 'tidak_ada_non_produktif',
            safety_kesesuaian: b.safety_margins?.kesesuaian || 'ideal',
            safety_permasalahan: b.safety_margins?.permasalahan || 'aman',
          }));
          setBangunanList(loadedBangunan);
        } else {
          const loadedBangunan: BangunanItem = {
            ...defaultBangunan,
            luas_bangunan: detail.luas_bangunan?.toString() || '',
            harga_pembanding_1: detail.harga_bangunan_per_meter?.toString() || '',
          };
          setBangunanList([loadedBangunan]);
        }

        // Load dokumentasi
        const defaultLabels = ['Tampak Depan', 'Tampak Samping', 'Interior', 'Surat Tanah'];
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

  const updateBangunan = (index: number, field: keyof BangunanItem, value: string | boolean) => {
    setBangunanList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setHasil(null);
  };

  const addTanah = () => setTanahList(prev => [...prev, { ...defaultTanah, id: generateId() }]);
  const removeTanah = (index: number) => {
    if (tanahList.length > 1) setTanahList(prev => prev.filter((_, i) => i !== index));
  };
  const addBangunan = () => setBangunanList(prev => [...prev, { ...defaultBangunan, id: generateId() }]);
  const removeBangunan = (index: number) => {
    if (bangunanList.length > 1) setBangunanList(prev => prev.filter((_, i) => i !== index));
  };

  const handleHitung = () => {
    const detailTanah = tanahList.map(t => {
      const hargaList = [parseFloat(t.harga_pembanding_1) || 0, parseFloat(t.harga_pembanding_2) || 0, parseFloat(t.harga_pembanding_3) || 0].filter(h => h > 0);
      const hargaRataRata = hargaList.length > 0 ? hargaList.reduce((a, b) => a + b, 0) / hargaList.length : 0;
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
      return { nilai_pasar: nilaiPasar, nilai_likuidasi: nilaiPasar * avgSafety, avg_safety: avgSafety * 100 };
    });

    const detailBangunan = bangunanList.map(b => {
      const hargaList = [parseFloat(b.harga_pembanding_1) || 0, parseFloat(b.harga_pembanding_2) || 0, parseFloat(b.harga_pembanding_3) || 0].filter(h => h > 0);
      const hargaRataRata = hargaList.length > 0 ? hargaList.reduce((a, b) => a + b, 0) / hargaList.length : 0;
      const luas = parseFloat(b.luas_bangunan) || 0;
      const nilaiPasar = luas * hargaRataRata;
      const safetyMargins = [
        getMarginByValue(SAFETY_MARGIN_BANGUNAN.design, b.safety_design),
        getMarginByValue(SAFETY_MARGIN_BANGUNAN.umur, b.safety_umur),
        getMarginByValue(SAFETY_MARGIN_BANGUNAN.peruntukkan, b.safety_peruntukkan),
        getMarginByValue(SAFETY_MARGIN_BANGUNAN.imb, b.safety_imb),
        getMarginByValue(SAFETY_MARGIN_BANGUNAN.kesesuaian_lahan, b.safety_kesesuaian),
        getMarginByValue(SAFETY_MARGIN_BANGUNAN.permasalahan, b.safety_permasalahan),
      ];
      const avgSafety = safetyMargins.reduce((a, b) => a + b, 0) / safetyMargins.length / 100;
      return { nilai_pasar: nilaiPasar, nilai_likuidasi: nilaiPasar * avgSafety, avg_safety: avgSafety * 100 };
    });

    const totalNilaiTanah = detailTanah.reduce((sum, d) => sum + d.nilai_pasar, 0);
    const totalNilaiBangunan = detailBangunan.reduce((sum, d) => sum + d.nilai_pasar, 0);
    const nilaiTaksasi = totalNilaiTanah + totalNilaiBangunan;
    const nilaiLikuidasi = detailTanah.reduce((sum, d) => sum + d.nilai_likuidasi, 0) + detailBangunan.reduce((sum, d) => sum + d.nilai_likuidasi, 0);

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

  const handleUpdate = () => {
    if (!hasil) {
      toast({ title: 'Hitung terlebih dahulu', variant: 'destructive' });
      return;
    }
    if (!formData.nama_nasabah) {
      toast({ title: 'Data tidak lengkap', description: 'Nama nasabah wajib diisi', variant: 'destructive' });
      return;
    }

    const totalLuasTanah = tanahList.reduce((sum, t) => sum + (parseFloat(t.luas_tanah) || 0), 0);
    const totalLuasBangunan = bangunanList.reduce((sum, b) => sum + (parseFloat(b.luas_bangunan) || 0), 0);
    const avgHargaTanah = totalLuasTanah > 0 ? hasil.total_nilai_tanah / totalLuasTanah : 0;
    const avgHargaBangunan = totalLuasBangunan > 0 ? hasil.total_nilai_bangunan / totalLuasBangunan : 0;

    const detailAgunan: DetailAgunanTBSimple = {
      luas_tanah: totalLuasTanah,
      harga_tanah_per_meter: avgHargaTanah,
      luas_bangunan: totalLuasBangunan,
      harga_bangunan_per_meter: avgHargaBangunan,
      dokumentasi_urls: dokumentasi.map(d => d.url),
      dokumentasi_labels: dokumentasi.map(d => d.label),
      tanah_list: tanahList.map(t => ({
        bukti_kepemilikan: t.bukti_kepemilikan || '',
        nomor_bukti: t.nomor_bukti || '',
        tanggal_bukti: t.tanggal_bukti || '',
        masa_berlaku: t.masa_berlaku || '',
        nama_pemegang_hak: t.nama_pemegang_hak || '',
        hubungan_dengan_debitur: t.hubungan_dengan_debitur || '',
        nomor_gambar_situasi: t.nomor_gambar_situasi || '',
        nomor_induk_bidang: t.nomor_induk_bidang || '',
        luas_tanah: parseFloat(t.luas_tanah) || 0,
        tempat_didaftarkan: t.tempat_didaftarkan || '',
        lokasi: t.lokasi || '',
        letak_tanah: t.letak_tanah || '',
        bentuk_tanah: t.bentuk_tanah || '',
        arah_menghadap: t.arah_menghadap || '',
        lebar_jalan_depan: t.lebar_jalan_depan || '',
        bahan_jalan: t.bahan_jalan || '',
        batas_depan: t.batas_depan || '',
        batas_belakang: t.batas_belakang || '',
        batas_kanan: t.batas_kanan || '',
        batas_kiri: t.batas_kiri || '',
        kondisi_lalu_lintas: t.kondisi_lalu_lintas || '',
        kelas_jalan: t.kelas_jalan || '',
        listrik_pln: t.listrik_pln || '',
        air_bersih: t.air_bersih || '',
        saluran_telepon: t.saluran_telepon || '',
        fasilitas_penunjang: t.fasilitas_penunjang || [],
        harga_pembanding: [
          { harga: parseFloat(t.harga_pembanding_1) || 0, sumber: t.sumber_1 || '' },
          { harga: parseFloat(t.harga_pembanding_2) || 0, sumber: t.sumber_2 || '' },
          { harga: parseFloat(t.harga_pembanding_3) || 0, sumber: t.sumber_3 || '' },
        ].filter(h => h.harga > 0),
        safety_margins: {
          lokasi: t.safety_lokasi,
          topography: t.safety_topography,
          ukuran: t.safety_ukuran,
          bukti: t.safety_bukti,
          lingkungan: t.safety_lingkungan,
          permasalahan: t.safety_permasalahan,
        },
      })),
      bangunan_list: bangunanList.map(b => ({
        peruntukkan: b.peruntukkan || '',
        imb_ada: b.imb_ada || false,
        nomor_imb: b.nomor_imb || '',
        tanggal_imb: b.tanggal_imb || '',
        nama_di_imb: b.nama_di_imb || '',
        luas_sesuai_imb: b.luas_sesuai_imb || '',
        tinggi_sesuai_imb: b.tinggi_sesuai_imb || '',
        konstruksi: b.konstruksi || '',
        pondasi: b.pondasi || '',
        tinggi_lantai: b.tinggi_lantai || '',
        atap: b.atap || '',
        dinding: b.dinding || '',
        plester_dinding: b.plester_dinding ?? true,
        plafon: b.plafon || '',
        lantai: b.lantai || '',
        tiang: b.tiang || '',
        luas_bangunan: parseFloat(b.luas_bangunan) || 0,
        keterangan: b.keterangan || '',
        harga_pembanding: [
          { harga: parseFloat(b.harga_pembanding_1) || 0, sumber: b.sumber_1 || '' },
          { harga: parseFloat(b.harga_pembanding_2) || 0, sumber: b.sumber_2 || '' },
          { harga: parseFloat(b.harga_pembanding_3) || 0, sumber: b.sumber_3 || '' },
        ].filter(h => h.harga > 0),
        safety_margins: {
          design: b.safety_design,
          umur: b.safety_umur,
          peruntukkan: b.safety_peruntukkan,
          imb: b.safety_imb,
          kesesuaian: b.safety_kesesuaian,
          permasalahan: b.safety_permasalahan,
        },
      })),
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
    });

    toast({ title: 'Taksasi berhasil diupdate' });
    navigate('/riwayat');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Edit Taksasi Tanah & Bangunan"
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
            <Input id="nama_nasabah" name="nama_nasabah" value={formData.nama_nasabah} onChange={handleChange} />
          </div>
        </div>

        {/* Data Tanah */}
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
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Luas Tanah (m²)</Label>
                <Input type="number" value={tanah.luas_tanah} onChange={(e) => updateTanah(index, 'luas_tanah', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>Lokasi Tanah</Label>
                <Textarea value={tanah.lokasi} onChange={(e) => updateTanah(index, 'lokasi', e.target.value)} rows={2} />
              </div>
              <div>
                <Label>Harga Pembanding 1 (Rp/m²)</Label>
                <CurrencyInput value={tanah.harga_pembanding_1} onChange={(val) => updateTanah(index, 'harga_pembanding_1', val)} />
              </div>
              <div>
                <Label>Sumber Pembanding 1</Label>
                <Input value={tanah.sumber_1} onChange={(e) => updateTanah(index, 'sumber_1', e.target.value)} placeholder="Contoh: OLX, Warga sekitar, dll" />
              </div>
              <div>
                <Label>Harga Pembanding 2 (Rp/m²)</Label>
                <CurrencyInput value={tanah.harga_pembanding_2} onChange={(val) => updateTanah(index, 'harga_pembanding_2', val)} />
              </div>
              <div>
                <Label>Sumber Pembanding 2</Label>
                <Input value={tanah.sumber_2} onChange={(e) => updateTanah(index, 'sumber_2', e.target.value)} placeholder="Contoh: OLX, Warga sekitar, dll" />
              </div>
              <div>
                <Label>Harga Pembanding 3 (Rp/m²)</Label>
                <CurrencyInput value={tanah.harga_pembanding_3} onChange={(val) => updateTanah(index, 'harga_pembanding_3', val)} />
              </div>
              <div>
                <Label>Sumber Pembanding 3</Label>
                <Input value={tanah.sumber_3} onChange={(e) => updateTanah(index, 'sumber_3', e.target.value)} placeholder="Contoh: OLX, Warga sekitar, dll" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Lokasi/Daerah</Label>
                <Select value={tanah.safety_lokasi} onValueChange={(v) => updateTanah(index, 'safety_lokasi', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SAFETY_MARGIN_TANAH.lokasi_daerah.map(item => (
                      <SelectItem key={item.value} value={item.value}>{item.label} ({item.margin}%)</SelectItem>
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
                      <SelectItem key={item.value} value={item.value}>{item.label} ({item.margin}%)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addTanah} className="w-full"><Plus className="mr-2" size={16} />Tambah Tanah</Button>

        {/* Data Bangunan */}
        {bangunanList.map((bangunan, index) => (
          <div key={bangunan.id} className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Building2 size={18} className="text-accent" />
                Data Bangunan {bangunanList.length > 1 ? `#${index + 1}` : ''}
              </h3>
              {bangunanList.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeBangunan(index)} className="text-destructive">
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Luas Bangunan (m²)</Label>
                <Input type="number" value={bangunan.luas_bangunan} onChange={(e) => updateBangunan(index, 'luas_bangunan', e.target.value)} />
              </div>
              <div>
                <Label>Harga Pembanding 1 (Rp/m²)</Label>
                <CurrencyInput value={bangunan.harga_pembanding_1} onChange={(val) => updateBangunan(index, 'harga_pembanding_1', val)} />
              </div>
              <div>
                <Label>Harga Pembanding 2 (Rp/m²)</Label>
                <CurrencyInput value={bangunan.harga_pembanding_2} onChange={(val) => updateBangunan(index, 'harga_pembanding_2', val)} />
              </div>
              <div>
                <Label>Harga Pembanding 3 (Rp/m²)</Label>
                <CurrencyInput value={bangunan.harga_pembanding_3} onChange={(val) => updateBangunan(index, 'harga_pembanding_3', val)} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Design Bangunan</Label>
                <Select value={bangunan.safety_design} onValueChange={(v) => updateBangunan(index, 'safety_design', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SAFETY_MARGIN_BANGUNAN.design.map(item => (
                      <SelectItem key={item.value} value={item.value}>{item.label} ({item.margin}%)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Umur Bangunan</Label>
                <Select value={bangunan.safety_umur} onValueChange={(v) => updateBangunan(index, 'safety_umur', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SAFETY_MARGIN_BANGUNAN.umur.map(item => (
                      <SelectItem key={item.value} value={item.value}>{item.label} ({item.margin}%)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addBangunan} className="w-full"><Plus className="mr-2" size={16} />Tambah Bangunan</Button>

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

        {/* KANTOR CABANG */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Building size={18} className="text-primary" />
            KANTOR CABANG
          </h3>
          <div className="grid gap-4">
            <div>
              <Label>Nama Kantor Cabang</Label>
              <Input name="kantor_cabang" value={formData.kantor_cabang} onChange={handleChange} />
            </div>
            <div>
              <Label>Alamat Kantor Cabang</Label>
              <Textarea name="alamat_cabang" value={formData.alamat_cabang} onChange={handleChange} rows={2} />
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
            defaultLabels={['Tampak Depan', 'Tampak Samping', 'Interior', 'Surat Tanah']}
            taksasiId={id}
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
                <p className="text-sm text-muted-foreground mb-1">Nilai Taksasi Total</p>
                <p className="text-2xl font-bold">{formatCurrency(hasil.nilai_taksasi)}</p>
              </div>
              <div className="p-4 rounded-lg bg-success/10">
                <p className="text-sm text-muted-foreground mb-1">Nilai Likuidasi Total</p>
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

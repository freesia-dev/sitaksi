import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaksasi } from '@/context/TaksasiContext';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { 
  formatCurrency, 
  formatDate, 
  formatDateWithDay,
  DetailAgunanKendaraan,
  DetailAgunanTanah,
  DetailAgunanTB
} from '@/types';
import { 
  ArrowLeft, 
  FileText, 
  Download,
  Eye,
  Car,
  MapPin,
  Building,
  User,
  DollarSign,
  Printer
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportCover } from '@/components/export/ExportCover';
import { ExportFormTaksasi } from '@/components/export/ExportFormTaksasi';
import { ExportBeritaAcara } from '@/components/export/ExportBeritaAcara';
import { ExportDokumentasi } from '@/components/export/ExportDokumentasi';
import logoBankaltimtara from '@/assets/logo-bankaltimtara.png';

export default function DetailTaksasi() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTaksasiById } = useTaksasi();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('cover');

  const taksasi = getTaksasiById(id || '');

  if (!taksasi) {
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

  const isKendaraan = taksasi.jenis_agunan === 'Kendaraan';
  const detail = taksasi.detail_agunan as DetailAgunanKendaraan;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    // For now, use browser print to PDF
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Taksasi Agunan"
        description={`${taksasi.jenis_agunan} - ${taksasi.nama_nasabah}`}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2" size={16} />
              Kembali
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2" size={16} />
              Print
            </Button>
            <Button variant="accent" onClick={handleExportPDF}>
              <Download className="mr-2" size={16} />
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Summary Card */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex flex-wrap gap-6 justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Nomor Dokumen</p>
            <p className="font-semibold">{taksasi.nomor_dokumen}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tanggal</p>
            <p className="font-semibold">{formatDate(taksasi.tanggal)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nilai Taksasi</p>
            <p className="font-semibold text-primary">{formatCurrency(taksasi.nilai_taksasi_pembulatan)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nilai Likuidasi</p>
            <p className="font-semibold text-success">{formatCurrency(taksasi.nilai_likuidasi_pembulatan)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <StatusBadge status={taksasi.status_otorisasi} />
          </div>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cover" className="flex items-center gap-2">
            <FileText size={16} />
            Cover
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <FileText size={16} />
            Form Taksasi
          </TabsTrigger>
          <TabsTrigger value="berita-acara" className="flex items-center gap-2">
            <FileText size={16} />
            Berita Acara
          </TabsTrigger>
          <TabsTrigger value="dokumentasi" className="flex items-center gap-2">
            <Eye size={16} />
            Dokumentasi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cover">
          <ExportCover taksasi={taksasi} logo={logoBankaltimtara} />
        </TabsContent>

        <TabsContent value="form">
          <ExportFormTaksasi taksasi={taksasi} logo={logoBankaltimtara} />
        </TabsContent>

        <TabsContent value="berita-acara">
          <ExportBeritaAcara taksasi={taksasi} logo={logoBankaltimtara} />
        </TabsContent>

        <TabsContent value="dokumentasi">
          <ExportDokumentasi taksasi={taksasi} logo={logoBankaltimtara} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

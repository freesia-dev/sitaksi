import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaksasi } from '@/context/TaksasiContext';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { 
  formatCurrency, 
  formatDate, 
} from '@/types';
import { 
  ArrowLeft, 
  FileText, 
  Download,
  Eye,
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
  const printRef = useRef<HTMLDivElement>(null);

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

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Taksasi Agunan - ${taksasi.nama_nasabah}</title>
          <style>
            ${styles}
            @page {
              size: A4;
              margin: 15mm 10mm;
            }
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              margin: 0;
              padding: 20px;
              background: white !important;
            }
            .print-container {
              max-width: 210mm;
              margin: 0 auto;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #333 !important;
              padding: 8px;
            }
            .bg-muted {
              background: #f5f5f5 !important;
            }
            h1, h2, h3 {
              color: black !important;
            }
            p, span, td, th {
              color: black !important;
            }
            @media print {
              body { background: white !important; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleExportPDF = () => {
    handlePrint();
  };

  const getCurrentTabContent = () => {
    switch (activeTab) {
      case 'cover':
        return <ExportCover taksasi={taksasi} logo={logoBankaltimtara} />;
      case 'form':
        return <ExportFormTaksasi taksasi={taksasi} logo={logoBankaltimtara} />;
      case 'berita-acara':
        return <ExportBeritaAcara taksasi={taksasi} logo={logoBankaltimtara} />;
      case 'dokumentasi':
        return <ExportDokumentasi taksasi={taksasi} logo={logoBankaltimtara} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Taksasi Agunan"
        description={`${taksasi.jenis_agunan} - ${taksasi.nama_nasabah}`}
        actions={
          <div className="flex gap-2 no-print">
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
      <div className="rounded-xl border bg-card p-6 shadow-card no-print">
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
        <TabsList className="grid w-full grid-cols-4 no-print">
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

        {/* Hidden print area */}
        <div ref={printRef} className="print-area hidden">
          {getCurrentTabContent()}
        </div>

        {/* Visible content */}
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

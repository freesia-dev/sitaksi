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
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocker aktif. Mohon izinkan popup untuk mencetak.');
      return;
    }

    // Get the content to print from the visible active tab
    const activeContent = document.querySelector(`[data-state="active"][role="tabpanel"]`);
    if (!activeContent) return;

    // Write the print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Taksasi Agunan - ${taksasi.nama_nasabah}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm 10mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 11pt;
              line-height: 1.4;
              color: #000;
              background: #fff;
              padding: 0;
            }
            .print-container {
              max-width: 190mm;
              margin: 0 auto;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #333;
              padding: 6px 8px;
              text-align: left;
              font-size: 10pt;
            }
            th {
              background: #f0f0f0;
              font-weight: 600;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .text-primary { color: #0066cc; }
            h1, h2, h3, h4 { margin-bottom: 8px; }
            h1 { font-size: 14pt; }
            h2 { font-size: 13pt; }
            h3 { font-size: 12pt; }
            p { margin-bottom: 4px; }
            img { max-width: 100%; height: auto; }
            .cover-image {
              max-width: 300px;
              max-height: 200px;
              object-fit: cover;
              border: 1px solid #ccc;
              border-radius: 8px;
            }
            .space-y-2 > * + * { margin-top: 8px; }
            .space-y-4 > * + * { margin-top: 16px; }
            .space-y-6 > * + * { margin-top: 24px; }
            .space-y-8 > * + * { margin-top: 32px; }
            .py-4 { padding-top: 16px; padding-bottom: 16px; }
            .py-6 { padding-top: 24px; padding-bottom: 24px; }
            .py-8 { padding-top: 32px; padding-bottom: 32px; }
            .pt-4 { padding-top: 16px; }
            .pt-8 { padding-top: 32px; }
            .mt-4 { margin-top: 16px; }
            .mt-8 { margin-top: 32px; }
            .mb-4 { margin-bottom: 16px; }
            .ml-4 { margin-left: 16px; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .border-t { border-top: 1px solid #ccc; }
            .rounded-lg { border-radius: 8px; }
            .bg-muted { background: #f5f5f5; }
            .whitespace-pre-line { white-space: pre-line; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .gap-4 { gap: 16px; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .col-span-2 { grid-column: span 2; }
            @media print {
              body { 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${activeContent.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 300);
    };
    
    // Fallback if onload doesn't fire
    setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.print();
        printWindow.close();
      }
    }, 1000);
  };

  const handleExportPDF = () => {
    handlePrint();
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

        {/* Visible content - these will be printed */}
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

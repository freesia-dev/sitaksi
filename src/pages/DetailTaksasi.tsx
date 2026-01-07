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

    // Clone the content to avoid modifying the original
    const contentClone = activeContent.cloneNode(true) as HTMLElement;
    
    // Remove any elements we don't want to print
    contentClone.querySelectorAll('.no-print, button').forEach(el => el.remove());

    // Write the print document with proper styling that matches preview
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Taksasi Agunan - ${taksasi.nama_nasabah}</title>
          <style>
            @page {
              size: A4;
              margin: 12mm 10mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 10pt;
              line-height: 1.4;
              color: #000;
              background: #fff;
              padding: 0;
            }
            .print-container {
              max-width: 190mm;
              margin: 0 auto;
              padding: 0;
            }
            
            /* Reset card styling for print */
            .bg-white, [class*="bg-card"], [class*="rounded-xl"] {
              background: white !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              padding: 0 !important;
            }
            
            /* Logo styling - proportional size */
            img[alt="Bankaltimtara"] {
              height: 48px !important;
              width: auto !important;
              max-width: 180px !important;
            }
            
            /* Cover image for agunan */
            .cover-image, img[alt="Tampak Depan Agunan"] {
              max-width: 280px !important;
              max-height: 180px !important;
              object-fit: cover !important;
              border: 1px solid #ccc !important;
              border-radius: 4px !important;
            }
            
            /* Tables */
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 8px 0;
            }
            th, td {
              border: 1px solid #333;
              padding: 4px 6px;
              text-align: left;
              font-size: 9pt;
              vertical-align: top;
            }
            th {
              background: #f0f0f0 !important;
              font-weight: 600;
            }
            
            /* Text utilities */
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            .font-bold { font-weight: bold !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-medium { font-weight: 500 !important; }
            
            /* Typography */
            h1 { font-size: 13pt; margin-bottom: 6px; }
            h2 { font-size: 12pt; margin-bottom: 5px; }
            h3 { font-size: 11pt; margin-bottom: 4px; }
            h4 { font-size: 10pt; margin-bottom: 3px; }
            p { margin-bottom: 3px; font-size: 10pt; }
            
            /* Spacing */
            .space-y-2 > * + * { margin-top: 6px; }
            .space-y-4 > * + * { margin-top: 12px; }
            .space-y-6 > * + * { margin-top: 18px; }
            .space-y-8 > * + * { margin-top: 24px; }
            .py-4 { padding-top: 12px; padding-bottom: 12px; }
            .py-6 { padding-top: 18px; padding-bottom: 18px; }
            .py-8 { padding-top: 24px; padding-bottom: 24px; }
            .pt-4 { padding-top: 12px; }
            .pt-8 { padding-top: 24px; }
            .mt-4 { margin-top: 12px; }
            .mt-8 { margin-top: 24px; }
            .mb-4 { margin-bottom: 12px; }
            .mb-2 { margin-bottom: 6px; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .gap-4 { gap: 12px; }
            
            /* Layout */
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .items-center { align-items: center; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .col-span-2 { grid-column: span 2; }
            
            /* Borders */
            .border-t { border-top: 1px solid #ccc; }
            .border-b { border-bottom: 1px solid #ccc; }
            
            /* Documentation photos grid */
            .aspect-video {
              aspect-ratio: 16/9;
              background: #f5f5f5;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              border: 1px solid #ddd;
            }
            .aspect-video img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            
            /* Page breaks */
            .page-break { page-break-before: always; }
            table { page-break-inside: avoid; }
            
            /* Hide placeholder boxes for missing photos */
            .border-dashed { display: none; }
            
            /* Muted text color for print */
            .text-muted-foreground { color: #666 !important; }
            .text-primary { color: #1a365d !important; }
            .text-success { color: #166534 !important; }
            
            /* Remove any background colors except for table headers */
            [class*="bg-muted"], [class*="bg-success"], [class*="rounded-lg"] {
              background: transparent !important;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${contentClone.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for images to load, then print
    const images = printWindow.document.querySelectorAll('img');
    let loadedCount = 0;
    const totalImages = images.length;
    
    const triggerPrint = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 200);
    };

    if (totalImages === 0) {
      triggerPrint();
    } else {
      images.forEach(img => {
        if (img.complete) {
          loadedCount++;
          if (loadedCount === totalImages) triggerPrint();
        } else {
          img.onload = () => {
            loadedCount++;
            if (loadedCount === totalImages) triggerPrint();
          };
          img.onerror = () => {
            loadedCount++;
            if (loadedCount === totalImages) triggerPrint();
          };
        }
      });
      
      // Fallback timeout
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.print();
          printWindow.close();
        }
      }, 2000);
    }
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

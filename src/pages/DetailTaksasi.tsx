import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaksasi } from '@/context/TaksasiContext';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { A4PageWrapper } from '@/components/shared/A4PageWrapper';
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
  Printer,
  Pencil,
  PencilOff
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportCover } from '@/components/export/ExportCover';
import { ExportFormTaksasi } from '@/components/export/ExportFormTaksasi';
import { ExportBeritaAcara } from '@/components/export/ExportBeritaAcara';
import { ExportDokumentasi } from '@/components/export/ExportDokumentasi';
import logoBankaltimtara from '@/assets/logo-bankaltimtara.png';
import { useToast } from '@/hooks/use-toast';

export default function DetailTaksasi() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTaksasiById } = useTaksasi();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('cover');
  const [isEditing, setIsEditing] = useState(false);
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
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocker aktif. Mohon izinkan popup untuk mencetak.');
      return;
    }

    // Get the A4 content inside the active tab
    const activePanel = document.querySelector(`[data-state="active"][role="tabpanel"]`);
    if (!activePanel) return;

    // Get the A4 wrapper content
    const a4Content = activePanel.querySelector('.a4-print-content');
    const contentClone = (a4Content || activePanel).cloneNode(true) as HTMLElement;
    
    contentClone.querySelectorAll('.no-print, button').forEach(el => el.remove());
    // Remove contentEditable attributes for print
    contentClone.querySelectorAll('[contenteditable]').forEach(el => {
      el.removeAttribute('contenteditable');
    });

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
            
            .bg-white, [class*="bg-card"], [class*="rounded-xl"] {
              background: white !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
            
            img[alt="Bankaltimtara"] {
              height: 48px !important;
              width: auto !important;
              max-width: 180px !important;
            }

            img {
              max-width: 100% !important;
              height: auto !important;
            }

            .cover-image, img[alt="Tampak Depan Agunan"] {
              max-width: 280px !important;
              max-height: 180px !important;
              object-fit: cover !important;
              border: 1px solid #ccc !important;
              border-radius: 4px !important;
            }

            .export-cover-photo, img[alt="Foto Agunan"] {
              display: block !important;
              margin: 0 auto !important;
              max-width: 120mm !important;
              max-height: 80mm !important;
              width: auto !important;
              height: auto !important;
              object-fit: contain !important;
              border: 1px solid #ccc !important;
              border-radius: 6px !important;
            }
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
            
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            .font-bold { font-weight: bold !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-medium { font-weight: 500 !important; }
            
            h1 { font-size: 13pt; margin-bottom: 6px; }
            h2 { font-size: 12pt; margin-bottom: 5px; }
            h3 { font-size: 11pt; margin-bottom: 4px; }
            h4 { font-size: 10pt; margin-bottom: 3px; }
            p { margin-bottom: 3px; font-size: 10pt; }
            
            .space-y-2 > * + * { margin-top: 6px; }
            .space-y-4 > * + * { margin-top: 12px; }
            .space-y-6 > * + * { margin-top: 18px; }
            .space-y-8 > * + * { margin-top: 24px; }
            .py-4 { padding-top: 12px; padding-bottom: 12px; }
            .py-6 { padding-top: 18px; padding-bottom: 18px; }
            .py-8 { padding-top: 24px; padding-bottom: 24px; }
            .pt-4 { padding-top: 12px; }
            .pt-8 { padding-top: 24px; }
            .mt-2 { margin-top: 6px; }
            .mt-3 { margin-top: 9px; }
            .mt-4 { margin-top: 12px; }
            .mt-8 { margin-top: 24px; }
            .mb-1 { margin-bottom: 3px; }
            .mb-2 { margin-bottom: 6px; }
            .mb-3 { margin-bottom: 9px; }
            .mb-4 { margin-bottom: 12px; }
            .mb-8 { margin-bottom: 24px; }
            .ml-4 { margin-left: 12px; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .mt-auto { margin-top: auto; }
            .max-w-2xl { max-width: 42rem; }
            .max-w-4xl { max-width: 56rem; }
            .p-2 { padding: 6px; }
            .p-4 { padding: 12px; }
            .p-6 { padding: 18px; }
            .p-8 { padding: 24px; }
            .px-3 { padding-left: 9px; padding-right: 9px; }
            .pr-3 { padding-right: 9px; }
            .pr-4 { padding-right: 12px; }
            .pr-6 { padding-right: 18px; }
            .pl-6 { padding-left: 18px; }
            .pb-2 { padding-bottom: 6px; }
            .pb-4 { padding-bottom: 12px; }
            
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .flex-1 { flex: 1 1 0%; }
            .flex-wrap { flex-wrap: wrap; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .gap-2 { gap: 6px; }
            .gap-4 { gap: 12px; }
            .gap-6 { gap: 18px; }
            .min-h-full { min-height: 100%; }
            .w-full { width: 100%; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .col-span-2 { grid-column: span 2; }
            .whitespace-pre-line { white-space: pre-line; }
            .break-all { word-break: break-all; }
            .capitalize { text-transform: capitalize; }
            .italic { font-style: italic; }
            .overflow-hidden { overflow: hidden; }
            .relative { position: relative; }
            .block { display: block; }
            
            .border-t { border-top: 1px solid #ccc; }
            .border-b { border-bottom: 1px solid #ccc; }
            
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
            
            .page-break { page-break-before: always; }
            table { page-break-inside: avoid; }
            
            .border-dashed { display: none; }
            
            .text-muted-foreground { color: #666 !important; }
            .text-primary { color: #1a365d !important; }
            .text-success { color: #166534 !important; }
            
            [class*="bg-muted"], [class*="bg-success"], [class*="rounded-lg"] {
              background: transparent !important;
            }

            /* Editable highlight removal for print */
            [data-editable] {
              outline: none !important;
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

  const toggleEditing = () => {
    if (isEditing) {
      toast({
        title: 'Mode edit dimatikan',
        description: 'Perubahan teks pada preview hanya berlaku saat cetak/export (tidak disimpan ke database).',
      });
    } else {
      toast({
        title: 'Mode edit aktif',
        description: 'Klik langsung pada teks di preview A4 untuk mengedit. Perubahan berlaku saat cetak.',
      });
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Taksasi Agunan"
        description={`${taksasi.jenis_agunan} - ${taksasi.nama_nasabah}`}
        actions={
          <div className="flex gap-2 no-print flex-wrap">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2" size={16} />
              Kembali
            </Button>
            <Button 
              variant={isEditing ? "warning" : "outline"} 
              onClick={toggleEditing}
            >
              {isEditing ? (
                <>
                  <PencilOff className="mr-2" size={16} />
                  Selesai Edit
                </>
              ) : (
                <>
                  <Pencil className="mr-2" size={16} />
                  Edit Preview
                </>
              )}
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

      {/* Editing indicator */}
      {isEditing && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-sm text-warning-foreground flex items-center gap-2">
          <Pencil size={14} className="text-warning shrink-0" />
          <span>
            <strong>Mode Edit Aktif</strong> — Klik langsung pada teks di preview A4 untuk mengubah. 
            Perubahan hanya berlaku saat cetak/export, tidak disimpan ke database.
          </span>
        </div>
      )}

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

      {/* Tabs for different views - A4 Preview */}
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

        {/* A4 Preview content */}
        <div className="bg-muted/30 rounded-xl p-4 print:bg-transparent print:p-0 print:rounded-none">
          <TabsContent value="cover" className="mt-0">
            <A4PageWrapper isEditing={isEditing}>
              <div className="a4-print-content" contentEditable={isEditing} suppressContentEditableWarning>
                <ExportCover taksasi={taksasi} logo={logoBankaltimtara} />
              </div>
            </A4PageWrapper>
          </TabsContent>

          <TabsContent value="form" className="mt-0">
            <A4PageWrapper isEditing={isEditing}>
              <div className="a4-print-content" contentEditable={isEditing} suppressContentEditableWarning>
                <ExportFormTaksasi taksasi={taksasi} logo={logoBankaltimtara} />
              </div>
            </A4PageWrapper>
          </TabsContent>

          <TabsContent value="berita-acara" className="mt-0">
            <A4PageWrapper isEditing={isEditing}>
              <div className="a4-print-content" contentEditable={isEditing} suppressContentEditableWarning>
                <ExportBeritaAcara taksasi={taksasi} logo={logoBankaltimtara} />
              </div>
            </A4PageWrapper>
          </TabsContent>

          <TabsContent value="dokumentasi" className="mt-0">
            <A4PageWrapper isEditing={isEditing}>
              <div className="a4-print-content" contentEditable={isEditing} suppressContentEditableWarning>
                <ExportDokumentasi taksasi={taksasi} logo={logoBankaltimtara} />
              </div>
            </A4PageWrapper>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

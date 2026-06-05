import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { A4PageWrapper } from '@/components/shared/A4PageWrapper';
import { ArrowLeft, Printer, Download, Pencil, PencilOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ExportBeritaAcaraKunjungan } from '@/components/export/ExportBeritaAcaraKunjungan';
import { MonitoringKunjungan } from '@/types/monitoring';
import logoBankaltimtara from '@/assets/logo-bankaltimtara.png';

export default function MonitoringDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<MonitoringKunjungan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: row, error } = await supabase.from('monitoring_kunjungan').select('*').eq('id', id).maybeSingle();
      if (error || !row) {
        toast({ title: 'Data tidak ditemukan', variant: 'destructive' });
        navigate('/monitoring');
        return;
      }
      setData(row as MonitoringKunjungan);
      setLoading(false);
    })();
  }, [id, navigate, toast]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocker aktif. Mohon izinkan popup untuk mencetak.');
      return;
    }
    const a4 = document.querySelector('.a4-print-content');
    if (!a4) return;
    const clone = a4.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.no-print, button').forEach(el => el.remove());
    clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Berita Acara - ${data?.nama_debitur || ''}</title>
      <style>
        @page { size: A4; margin: 12mm 10mm; }
        * { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 10pt; line-height:1.4; color:#000; background:#fff; }
        .print-container { max-width: 190mm; margin:0 auto; }
        img { max-width:100%; height:auto; }
        img[alt="Bankaltimtara"], img[alt="BPD"] { height: 56px !important; width:auto !important; }
        .border-b-\\[3px\\] { border-bottom: 3px solid #1d4ed8 !important; }
        .border-\\[\\#1d4ed8\\] { border-color: #1d4ed8 !important; }
        .bg-\\[\\#1d4ed8\\] { background-color: #1d4ed8 !important; }
        .bg-\\[\\#f59e0b\\] { background-color: #f59e0b !important; }
        .text-\\[9pt\\] { font-size: 9pt; } .text-\\[11pt\\] { font-size: 11pt; } .text-\\[12pt\\] { font-size: 12pt; }
        .tracking-wide { letter-spacing: 0.025em; }
        .leading-tight { line-height: 1.2; }
        .items-start { align-items: flex-start; } .pt-1 { padding-top: 4px; } .gap-3 { gap: 9px; }
        .shrink-0 { flex-shrink: 0; } .object-contain { object-fit: contain; }
        .relative { position: relative; } .absolute { position: absolute; }
        .left-0 { left:0; } .right-0 { right:0; } .bottom-0 { bottom:0; }
        .h-3 { height: 0.75rem; } .h-6 { height: 1.5rem; }
        .w-\\[72\\%\\] { width: 72%; } .w-\\[28\\%\\] { width: 28%; }
        .rounded-tr-\\[40px\\] { border-top-right-radius: 40px; }
        .rounded-tl-\\[40px\\] { border-top-left-radius: 40px; }
        .pb-14 { padding-bottom: 3.5rem; } .pointer-events-none { pointer-events: none; }
        table { border-collapse: collapse; width: 100%; }
        td { vertical-align: top; padding: 2px 4px; font-size: 9pt; }
        h1 { font-size: 12pt; } h2 { font-size: 11pt; } h3 { font-size: 10pt; }
        .flex { display:flex; } .flex-col { flex-direction: column; } .flex-1 { flex:1 1 0%; }
        .items-center { align-items:center; } .gap-4 { gap:12px; } .text-center { text-align:center; }
        .text-justify { text-align:justify; } .font-bold { font-weight:bold; } .font-semibold { font-weight:600; }
        .underline { text-decoration: underline; } .uppercase { text-transform: uppercase; }
        .border-b-2 { border-bottom: 2px solid #000; } .border { border: 1px solid #999; }
        .pb-3 { padding-bottom: 9px; } .pt-4 { padding-top:12px; } .p-1 { padding:4px; } .p-4 { padding:12px; }
        .mb-1 { margin-bottom:3px; } .mb-3 { margin-bottom:9px; } .mb-4 { margin-bottom:12px; } .mb-8 { margin-bottom:24px; }
        .mt-1 { margin-top:3px; } .mt-2 { margin-top:6px; } .mt-4 { margin-top:12px; } .mt-auto { margin-top:auto; }
        .grid { display:grid; } .grid-cols-2 { grid-template-columns: repeat(2,1fr); } .gap-3 { gap:9px; } .gap-8 { gap:24px; }
        .w-48 { width: 12rem; } .h-20 { height: 5rem; } .h-40 { height: 10rem; }
        .object-cover { object-fit: cover; } .w-full { width: 100%; }
        .text-xs { font-size: 8pt; } .text-sm { font-size: 9pt; } .text-base { font-size: 10pt; }
        .min-h-full { min-height: 100%; }
      </style></head><body><div class="print-container">${clone.innerHTML}</div></body></html>
    `);
    printWindow.document.close();
    const imgs = printWindow.document.querySelectorAll('img');
    const trigger = () => setTimeout(() => { printWindow.print(); printWindow.close(); }, 200);
    if (imgs.length === 0) trigger();
    else {
      let loaded = 0;
      imgs.forEach(img => {
        const done = () => { loaded++; if (loaded === imgs.length) trigger(); };
        if (img.complete) done();
        else { img.onload = done; img.onerror = done; }
      });
      setTimeout(() => { if (!printWindow.closed) { printWindow.print(); printWindow.close(); } }, 2500);
    }
  };

  if (loading || !data) return <div className="p-8 text-center text-muted-foreground">Memuat...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Berita Acara Kunjungan"
        description={`${data.nama_debitur} • ${data.nomor_ba || ''}`}
        actions={
          <div className="flex gap-2 no-print flex-wrap">
            <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2" size={16} />Kembali</Button>
            <Button variant={isEditing ? 'warning' : 'outline'} onClick={() => setIsEditing(v => !v)}>
              {isEditing ? <><PencilOff className="mr-2" size={16} />Selesai Edit</> : <><Pencil className="mr-2" size={16} />Edit Preview</>}
            </Button>
            <Button variant="outline" onClick={handlePrint}><Printer className="mr-2" size={16} />Print</Button>
            <Button variant="accent" onClick={handlePrint}><Download className="mr-2" size={16} />Export PDF</Button>
          </div>
        }
      />

      {isEditing && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-sm">
          <strong>Mode Edit Aktif</strong> — Klik teks pada preview untuk mengubah. Perubahan hanya berlaku saat cetak.
        </div>
      )}

      <div className="bg-muted/30 rounded-xl p-4 print:bg-transparent print:p-0">
        <A4PageWrapper isEditing={isEditing}>
          <div className="a4-print-content min-h-full" contentEditable={isEditing} suppressContentEditableWarning>
            <ExportBeritaAcaraKunjungan data={data} logo={logoBankaltimtara} />
          </div>
        </A4PageWrapper>
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Upload, Edit, Trash2, FileSpreadsheet, FileText, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { periodeLabel, parseMlfFile, exportPlNplToExcel, exportPlNplToPdf, formatTanggalLengkap, type PlNplItemRow } from '@/lib/rkoExport';

interface LaporanRow {
  id: string;
  periode: string;
  mlf_jobdate: string | null;
  tanggal_laporan: string;
  item_count: number;
}

export default function PlNplList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState<LaporanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mlfInfo, setMlfInfo] = useState<{ jobdate: string | null; count: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pl_to_npl_laporan')
      .select('id, periode, mlf_jobdate, tanggal_laporan, pl_to_npl_item(id)')
      .order('periode', { ascending: false });
    if (error) toast({ title: 'Gagal memuat', description: error.message, variant: 'destructive' });
    else setRows((data || []).map((r: any) => ({
      id: r.id, periode: r.periode, mlf_jobdate: r.mlf_jobdate, tanggal_laporan: r.tanggal_laporan,
      item_count: r.pl_to_npl_item?.length || 0,
    })));

    const { count, data: latest } = await supabase
      .from('mlf_snapshot').select('jobdate', { count: 'exact' }).order('jobdate', { ascending: false }).limit(1);
    setMlfInfo({ jobdate: latest?.[0]?.jobdate || null, count: count || 0 });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      toast({ title: 'Memproses file MLF...', description: 'Tunggu sebentar.' });
      const rows = await parseMlfFile(file);
      if (rows.length === 0) throw new Error('File kosong / sheet Master_Loan_Filter tidak berisi data.');

      // Wipe existing snapshot
      await supabase.from('mlf_snapshot').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const toIso = (v: any): string | null => {
        if (!v) return null;
        if (v instanceof Date) return v.toISOString().substring(0, 10);
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d.toISOString().substring(0, 10);
      };
      const toNum = (v: any): number | null => {
        if (v === null || v === undefined || v === '') return null;
        const n = Number(v);
        return isNaN(n) ? null : n;
      };
      const records = rows.map((r) => ({
        jobdate: toIso(r.JOBDATE),
        brname: r.BRNAME || null,
        kol: r.kol !== null && r.kol !== undefined ? String(r.kol) : null,
        lytitl: r.LYTITL || null,
        l0lnno: r.L0LNNO ? String(r.L0LNNO) : null,
        l0name: r.L0NAME || null,
        l0narr: r.L0NARR ? String(r.L0NARR) : null,
        date_mulai: toIso(r.DATE),
        date_mature: toIso(r.DATE1),
        l0rstl: r.L0RSTL ? String(r.L0RSTL) : null,
        pla: toNum(r.PLA),
        baki: toNum(r.BAKI),
        tungpk: toNum(r.TUNGPK),
        tungbg: toNum(r.TUNGBG),
        uploaded_by: user.id,
      }));

      // Insert in chunks of 500
      for (let i = 0; i < records.length; i += 500) {
        const chunk = records.slice(i, i + 500);
        const { error } = await supabase.from('mlf_snapshot').insert(chunk);
        if (error) throw error;
      }
      toast({ title: 'MLF berhasil di-upload', description: `${records.length} debitur tersimpan.` });
      await load();
    } catch (e: any) {
      toast({ title: 'Gagal upload MLF', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const fetchExportData = async (id: string): Promise<{ lap: any; items: PlNplItemRow[] } | null> => {
    const { data: lap } = await supabase.from('pl_to_npl_laporan').select('*').eq('id', id).single();
    const { data: items } = await supabase.from('pl_to_npl_item').select('*').eq('laporan_id', id).order('urutan');
    if (!lap) return null;
    const mapped: PlNplItemRow[] = (items || []).map((it, idx) => ({
        no: idx + 1,
        no_loan: it.no_loan || '', kolektabilitas: it.kolektabilitas || '',
        nama_debitur: it.nama_debitur || '', no_pk: it.no_pk || '',
        tanggal_mulai: it.tanggal_mulai, tanggal_mature: it.tanggal_mature,
        no_rekening: it.no_rekening || '',
        plafon: Number(it.plafon || 0), baki_debet: Number(it.baki_debet || 0),
        tunggakan_pokok: Number(it.tunggakan_pokok || 0), tunggakan_bunga: Number(it.tunggakan_bunga || 0),
        proyeksi_tw: it.proyeksi_tw || '', jenis_kredit: it.jenis_kredit || '',
        alasan_npl: it.alasan_npl || '',
    }));
    return { lap, items: mapped };
  };

  const handleExportExcel = async (id: string) => {
    const d = await fetchExportData(id);
    if (!d) return;
    await exportPlNplToExcel({ periode: d.lap.periode, mlfJobdate: d.lap.mlf_jobdate, items: d.items });
  };
  const handleExportPdf = async (id: string) => {
    const d = await fetchExportData(id);
    if (!d) return;
    exportPlNplToPdf({ periode: d.lap.periode, mlfJobdate: d.lap.mlf_jobdate, items: d.items });
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    const { error } = await supabase.from('pl_to_npl_laporan').delete().eq('id', confirmId);
    if (error) toast({ title: 'Gagal hapus', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Laporan dihapus' });
      setRows((p) => p.filter((r) => r.id !== confirmId));
    }
    setConfirmId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan PL to NPL"
        description="Laporan proyeksi Performing Loan yang berpotensi masuk Non-Performing Loan."
        actions={
          <>
            <input ref={fileRef} type="file" accept=".xls,.xlsx" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            <Button variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />{uploading ? 'Mengupload...' : 'Upload MLF'}
            </Button>
            <Button onClick={() => navigate('/laporan-rko/pl-to-npl/new')} disabled={!mlfInfo?.count}>
              <Plus className="mr-2 h-4 w-4" />Buat Laporan
            </Button>
          </>
        }
      />

      <Card className="p-4 bg-muted/30">
        <div className="flex items-center gap-3 text-sm">
          <Database className="h-5 w-5 text-primary" />
          {mlfInfo?.count ? (
            <span>
              Data MLF aktif: <strong>{mlfInfo.count.toLocaleString('id-ID')}</strong> debitur
              {mlfInfo.jobdate && <> • per <strong>{formatTanggalLengkap(mlfInfo.jobdate)}</strong></>}
            </span>
          ) : (
            <span className="text-muted-foreground">Belum ada data MLF. Upload file MLF (.xls/.xlsx) terlebih dahulu untuk mulai membuat laporan.</span>
          )}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Periode</TableHead>
              <TableHead>Data MLF</TableHead>
              <TableHead className="text-center">Jumlah Debitur</TableHead>
              <TableHead className="w-[220px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Memuat...</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada laporan.</TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{periodeLabel(r.periode)}</TableCell>
                <TableCell className="text-sm">{r.mlf_jobdate ? formatTanggalLengkap(r.mlf_jobdate) : '-'}</TableCell>
                <TableCell className="text-center">{r.item_count}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleExportExcel(r.id)} title="Export Excel">
                      <FileSpreadsheet className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleExportPdf(r.id)} title="Export PDF">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" asChild title="Edit">
                      <Link to={`/laporan-rko/pl-to-npl/edit/${r.id}`}><Edit className="h-4 w-4" /></Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmId(r.id)} title="Hapus">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus laporan?</AlertDialogTitle>
            <AlertDialogDescription>Semua item laporan ini akan terhapus.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
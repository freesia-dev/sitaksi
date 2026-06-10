import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, FileSpreadsheet, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
import { periodeLabel, exportSubrogasiToExcel, exportSubrogasiToPdf, type SubrogasiItemRow } from '@/lib/rkoExport';

interface LaporanRow {
  id: string;
  periode: string;
  nama_kantor: string;
  tanggal_laporan: string;
  item_count: number;
  total_sisa: number;
}

export default function SubrogasiList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<LaporanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subrogasi_laporan')
      .select('id, periode, nama_kantor, tanggal_laporan, subrogasi_laporan_item(sisa_subrogasi)')
      .order('periode', { ascending: false });
    if (error) {
      toast({ title: 'Gagal memuat', description: error.message, variant: 'destructive' });
    } else {
      const mapped: LaporanRow[] = (data || []).map((r: any) => ({
        id: r.id,
        periode: r.periode,
        nama_kantor: r.nama_kantor,
        tanggal_laporan: r.tanggal_laporan,
        item_count: r.subrogasi_laporan_item?.length || 0,
        total_sisa: (r.subrogasi_laporan_item || []).reduce(
          (s: number, it: any) => s + Number(it.sisa_subrogasi || 0), 0
        ),
      }));
      setRows(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!confirmId) return;
    const { error } = await supabase.from('subrogasi_laporan').delete().eq('id', confirmId);
    if (error) toast({ title: 'Gagal hapus', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Laporan dihapus' });
      setRows((prev) => prev.filter((r) => r.id !== confirmId));
    }
    setConfirmId(null);
  };

  const fetchExportData = async (id: string): Promise<{ lap: any; items: SubrogasiItemRow[] } | null> => {
    const { data: lap, error: e1 } = await supabase
      .from('subrogasi_laporan').select('*').eq('id', id).single();
    if (e1 || !lap) { toast({ title: 'Gagal export', description: e1?.message, variant: 'destructive' }); return null; }
    const { data: items, error: e2 } = await supabase
      .from('subrogasi_laporan_item')
      .select('*, subrogasi_debitur(*)')
      .eq('laporan_id', id)
      .order('urutan');
    if (e2) { toast({ title: 'Gagal export', description: e2.message, variant: 'destructive' }); return null; }
    const mapped: SubrogasiItemRow[] = (items || []).map((it: any, idx: number) => ({
        no: idx + 1,
        asuransi: (it.subrogasi_debitur?.asuransi || 'askrida') as 'askrida' | 'jamkrindo',
        nama_debitur: it.subrogasi_debitur?.nama_debitur || '',
        no_loan: it.subrogasi_debitur?.no_loan || '',
        produk: it.subrogasi_debitur?.produk || '',
        nik: it.subrogasi_debitur?.nik || '',
        no_premi_asuransi: it.subrogasi_debitur?.no_premi_asuransi || '',
        no_perjanjian_kredit: it.subrogasi_debitur?.no_perjanjian_kredit || '',
        nilai_subrogasi: Number(it.subrogasi_debitur?.nilai_subrogasi || 0),
        tahun_pencairan: it.subrogasi_debitur?.tahun_pencairan || null,
        tanggal_pembayaran: it.tanggal_pembayaran,
        akumulasi_pembayaran: Number(it.akumulasi_pembayaran || 0),
        sisa_subrogasi: Number(it.sisa_subrogasi || 0),
        nama_cabang: it.subrogasi_debitur?.nama_cabang || '',
        konfirmasi_asuransi: it.konfirmasi_asuransi || '',
        konfirmasi_cabang: it.konfirmasi_cabang || '',
        hasil_kesepakatan: it.hasil_kesepakatan || '',
    }));
    return { lap, items: mapped };
  };

  const handleExportExcel = async (id: string) => {
    const d = await fetchExportData(id);
    if (!d) return;
    await exportSubrogasiToExcel({ periode: d.lap.periode, namaKantor: d.lap.nama_kantor, tanggalLaporan: d.lap.tanggal_laporan, namaPemimpin: d.lap.nama_pemimpin || '', items: d.items });
  };
  const handleExportPdf = async (id: string) => {
    const d = await fetchExportData(id);
    if (!d) return;
    exportSubrogasiToPdf({ periode: d.lap.periode, namaKantor: d.lap.nama_kantor, tanggalLaporan: d.lap.tanggal_laporan, namaPemimpin: d.lap.nama_pemimpin || '', items: d.items });
  };

  const fmtRp = (n: number) =>
    n ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n) : 'Rp 0';

  return (
    <div>
      <PageHeader
        title="Laporan Subrogasi"
        description="Laporan Subrogasi Asuransi (Askrida & Jamkrindo) per bulan."
        actions={
          <Button onClick={() => navigate('/laporan-rko/subrogasi/new')}>
            <Plus className="mr-2 h-4 w-4" />Buat Laporan
          </Button>
        }
      />
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Periode</TableHead>
              <TableHead>Kantor</TableHead>
              <TableHead className="text-center">Jumlah Debitur</TableHead>
              <TableHead className="text-right">Total Sisa Subrogasi</TableHead>
              <TableHead className="w-[220px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Memuat...</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada laporan. Klik "Buat Laporan" untuk memulai.</TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{periodeLabel(r.periode)}</TableCell>
                <TableCell className="text-sm">{r.nama_kantor}</TableCell>
                <TableCell className="text-center">{r.item_count}</TableCell>
                <TableCell className="text-right font-mono">{fmtRp(r.total_sisa)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleExportExcel(r.id)} title="Export Excel">
                      <FileSpreadsheet className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleExportPdf(r.id)} title="Export PDF">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" asChild title="Edit">
                      <Link to={`/laporan-rko/subrogasi/edit/${r.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
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
            <AlertDialogDescription>
              Item laporan akan ikut terhapus. Master data debitur tetap tersimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
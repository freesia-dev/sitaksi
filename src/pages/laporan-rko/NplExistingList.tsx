import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { FileSpreadsheet, FileText, Database, TrendingDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  exportNplExistingToExcel, exportNplExistingToPdf, formatTanggalLengkap, type NplExistingRow,
} from '@/lib/rkoExport';

const KOL_LABEL: Record<string, string> = {
  '3': 'Kurang Lancar', '4': 'Diragukan', '5': 'Macet',
};

const fmtRp = (n: number) => n
  ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
  : '-';

export default function NplExistingList() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NplExistingRow[]>([]);
  const [jobdate, setJobdate] = useState<string | null>(null);
  const [namaKantor, setNamaKantor] = useState('Kantor Cabang Pembantu Telihan Bontang');
  const [tanggalLaporan, setTanggalLaporan] = useState(() => new Date().toISOString().substring(0, 10));
  const [namaPemimpin, setNamaPemimpin] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('mlf_snapshot')
      .select('l0lnno, l0name, kol, l0narr, l0rstl, date_mulai, date_mature, pla, baki, tungpk, tungbg, lytitl, brname, jobdate')
      .in('kol', ['3', '4', '5'])
      .ilike('brname', '%telihan%')
      .order('kol', { ascending: false })
      .order('baki', { ascending: false });
    if (error) {
      toast({ title: 'Gagal memuat', description: error.message, variant: 'destructive' });
      setLoading(false); return;
    }
    const rows: NplExistingRow[] = (data || []).map((r, i) => ({
      no: i + 1,
      no_loan: r.l0lnno || '',
      nama_debitur: r.l0name || '',
      kolektabilitas: r.kol || '',
      no_pk: r.l0narr || '',
      no_rekening: r.l0rstl || '',
      tanggal_mulai: r.date_mulai,
      tanggal_mature: r.date_mature,
      plafon: Number(r.pla || 0),
      baki_debet: Number(r.baki || 0),
      tunggakan_pokok: Number(r.tungpk || 0),
      tunggakan_bunga: Number(r.tungbg || 0),
      jenis_kredit: r.lytitl || '',
      brname: r.brname || '',
    }));
    setItems(rows);
    setJobdate(data?.[0]?.jobdate || null);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const totalBaki = items.reduce((s, x) => s + x.baki_debet, 0);
  const totalTungPk = items.reduce((s, x) => s + x.tunggakan_pokok, 0);
  const totalTungBg = items.reduce((s, x) => s + x.tunggakan_bunga, 0);
  const byKol = items.reduce((acc, it) => {
    acc[it.kolektabilitas] = (acc[it.kolektabilitas] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const doExcel = () => exportNplExistingToExcel({
    mlfJobdate: jobdate, items, namaKantor, tanggalLaporan, namaPemimpin,
  });
  const doPdf = () => exportNplExistingToPdf({
    mlfJobdate: jobdate, items, namaKantor, tanggalLaporan, namaPemimpin,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan NPL Existing"
        description="Debitur KCP Telihan yang sudah berstatus NPL (Kol 3-5). Diambil langsung dari data MLF terakhir."
        actions={
          <>
            <Button variant="outline" onClick={doExcel} disabled={items.length === 0}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />Export Excel
            </Button>
            <Button onClick={doPdf} disabled={items.length === 0}>
              <FileText className="mr-2 h-4 w-4" />Export PDF
            </Button>
          </>
        }
      />

      <Card className="p-4 bg-muted/30">
        <div className="flex items-center gap-3 text-sm">
          <Database className="h-5 w-5 text-primary" />
          <span>
            Data MLF per: <strong>{jobdate ? formatTanggalLengkap(jobdate) : '-'}</strong>
            {' • '}Total NPL Telihan: <strong>{items.length}</strong> debitur
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total Baki Debet</p>
          <p className="text-xl font-bold">{fmtRp(totalBaki)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total Tunggakan Pokok</p>
          <p className="text-xl font-bold">{fmtRp(totalTungPk)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total Tunggakan Bunga</p>
          <p className="text-xl font-bold">{fmtRp(totalTungBg)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Sebaran Kolektabilitas</p>
          <div className="flex gap-3 pt-1 text-sm">
            <span>Kol 3: <strong>{byKol['3'] || 0}</strong></span>
            <span>Kol 4: <strong>{byKol['4'] || 0}</strong></span>
            <span>Kol 5: <strong>{byKol['5'] || 0}</strong></span>
          </div>
        </Card>
      </div>

      <Card className="p-4 space-y-4">
        <p className="text-sm font-medium flex items-center gap-2">
          <TrendingDown className="h-4 w-4" /> Data Ekspor
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Nama Kantor</Label>
            <Input value={namaKantor} onChange={(e) => setNamaKantor(e.target.value)} />
          </div>
          <div>
            <Label>Tanggal Laporan</Label>
            <Input type="date" value={tanggalLaporan} onChange={(e) => setTanggalLaporan(e.target.value)} />
          </div>
          <div>
            <Label>Nama Pemimpin</Label>
            <Input value={namaPemimpin} onChange={(e) => setNamaPemimpin(e.target.value)} placeholder="Opsional" />
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Nomor Loan</TableHead>
                <TableHead>Nama Debitur</TableHead>
                <TableHead>Kol</TableHead>
                <TableHead className="text-right">Baki Debet</TableHead>
                <TableHead className="text-right">Tungg. Pokok</TableHead>
                <TableHead className="text-right">Tungg. Bunga</TableHead>
                <TableHead>Jenis Kredit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Memuat...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Tidak ada debitur NPL di KCP Telihan pada MLF terakhir.</TableCell></TableRow>
              ) : items.map((it) => (
                <TableRow key={it.no_loan + it.no}>
                  <TableCell>{it.no}</TableCell>
                  <TableCell className="font-mono text-xs">{it.no_loan}</TableCell>
                  <TableCell className="font-medium">{it.nama_debitur}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-destructive/10 text-destructive">
                      {it.kolektabilitas}{KOL_LABEL[it.kolektabilitas] ? ` - ${KOL_LABEL[it.kolektabilitas]}` : ''}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{fmtRp(it.baki_debet)}</TableCell>
                  <TableCell className="text-right">{fmtRp(it.tunggakan_pokok)}</TableCell>
                  <TableCell className="text-right">{fmtRp(it.tunggakan_bunga)}</TableCell>
                  <TableCell className="text-xs">{it.jenis_kredit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
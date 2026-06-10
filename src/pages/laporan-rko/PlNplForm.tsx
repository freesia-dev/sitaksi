import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Check, ChevronsUpDown, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatTanggalLengkap } from '@/lib/rkoExport';

interface MlfRow {
  id: string;
  l0lnno: string | null;
  l0name: string | null;
  kol: string | null;
  l0narr: string | null;
  date_mulai: string | null;
  date_mature: string | null;
  l0rstl: string | null;
  pla: number | null;
  baki: number | null;
  tungpk: number | null;
  tungbg: number | null;
  lytitl: string | null;
  brname: string | null;
  jobdate: string | null;
}

interface Item {
  _localId: string;
  id?: string;
  no_loan: string;
  kolektabilitas: string;
  nama_debitur: string;
  no_pk: string;
  tanggal_mulai: string | null;
  tanggal_mature: string | null;
  no_rekening: string;
  plafon: number;
  baki_debet: number;
  tunggakan_pokok: number;
  tunggakan_bunga: number;
  jenis_kredit: string;
  cabang: string;
  proyeksi_tw: string;
  alasan_npl: string;
}

export default function PlNplForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const today = new Date().toISOString().substring(0, 10);
  const [periode, setPeriode] = useState(today.substring(0, 7));
  const [tanggalLaporan, setTanggalLaporan] = useState(today);
  const [mlfJobdate, setMlfJobdate] = useState<string | null>(null);
  const DEFAULT_KANTOR = 'Kantor Cabang Pembantu Telihan Bontang';
  const [namaKantor, setNamaKantor] = useState(DEFAULT_KANTOR);
  const [namaPemimpin, setNamaPemimpin] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [saving, setSaving] = useState(false);

  // MLF search state — fetch on demand (3526 rows OK in browser but search lazily)
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MlfRow[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Initial: get latest jobdate
  useEffect(() => {
    if (isEdit) return;
    supabase.from('mlf_snapshot').select('jobdate').order('jobdate', { ascending: false }).limit(1)
      .then(({ data }) => setMlfJobdate(data?.[0]?.jobdate || null));
  }, [isEdit]);

  // Load existing
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: lap } = await supabase.from('pl_to_npl_laporan').select('*').eq('id', id).single();
      if (lap) {
        setPeriode(lap.periode);
        setTanggalLaporan(lap.tanggal_laporan);
        setMlfJobdate(lap.mlf_jobdate);
        setNamaKantor((lap as any).nama_kantor || DEFAULT_KANTOR);
        setNamaPemimpin((lap as any).nama_pemimpin || '');
      }
      const { data: its } = await supabase.from('pl_to_npl_item').select('*').eq('laporan_id', id).order('urutan');
      if (its) setItems(its.map((it) => ({
        _localId: it.id, id: it.id,
        no_loan: it.no_loan || '', kolektabilitas: it.kolektabilitas || '',
        nama_debitur: it.nama_debitur || '', no_pk: it.no_pk || '',
        tanggal_mulai: it.tanggal_mulai, tanggal_mature: it.tanggal_mature,
        no_rekening: it.no_rekening || '',
        plafon: Number(it.plafon || 0), baki_debet: Number(it.baki_debet || 0),
        tunggakan_pokok: Number(it.tunggakan_pokok || 0), tunggakan_bunga: Number(it.tunggakan_bunga || 0),
        jenis_kredit: it.jenis_kredit || '', cabang: it.cabang || '',
        proyeksi_tw: it.proyeksi_tw || 'TW1', alasan_npl: it.alasan_npl || '',
      })));
    })();
  }, [id]);

  // Search MLF
  useEffect(() => {
    if (!popoverOpen) return;
    const q = query.trim();
    const run = async () => {
      let qb = supabase.from('mlf_snapshot').select('*').limit(40);
      if (q) {
        qb = qb.or(`l0name.ilike.%${q}%,l0lnno.ilike.%${q}%`);
      }
      const { data } = await qb;
      setSearchResults((data as MlfRow[]) || []);
    };
    const t = setTimeout(run, 200);
    return () => clearTimeout(t);
  }, [query, popoverOpen]);

  const addFromMlf = (m: MlfRow) => {
    if (items.some((it) => it.no_loan === m.l0lnno)) {
      toast({ title: 'Debitur sudah ada', variant: 'destructive' });
      return;
    }
    setItems((prev) => [...prev, {
      _localId: crypto.randomUUID(),
      no_loan: m.l0lnno || '',
      kolektabilitas: m.kol || '',
      nama_debitur: m.l0name || '',
      no_pk: m.l0narr || '',
      tanggal_mulai: m.date_mulai,
      tanggal_mature: m.date_mature,
      no_rekening: m.l0rstl || '',
      plafon: Number(m.pla || 0),
      baki_debet: Number(m.baki || 0),
      tunggakan_pokok: Number(m.tungpk || 0),
      tunggakan_bunga: Number(m.tungbg || 0),
      jenis_kredit: m.lytitl || '',
      cabang: m.brname || '',
      proyeksi_tw: 'TW1',
      alasan_npl: '',
    }]);
    setPopoverOpen(false);
    setQuery('');
  };

  const updateItem = (localId: string, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it) => it._localId === localId ? { ...it, ...patch } : it));
  const removeItem = (localId: string) =>
    setItems((prev) => prev.filter((it) => it._localId !== localId));

  const handleSave = async () => {
    if (!user) return;
    if (items.length === 0) {
      toast({ title: 'Tambahkan minimal satu debitur', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      let laporanId = id;
      if (!isEdit) {
        const { data, error } = await supabase.from('pl_to_npl_laporan').insert({
          periode, tanggal_laporan: tanggalLaporan, mlf_jobdate: mlfJobdate,
          nama_pemimpin: namaPemimpin || null, created_by: user.id,
        }).select().single();
        if (error) throw error;
        laporanId = data.id;
      } else {
        const { error } = await supabase.from('pl_to_npl_laporan')
          .update({ periode, tanggal_laporan: tanggalLaporan, mlf_jobdate: mlfJobdate, nama_pemimpin: namaPemimpin || null })
          .eq('id', id);
        if (error) throw error;
        await supabase.from('pl_to_npl_item').delete().eq('laporan_id', id);
      }
      const rows = items.map((it, idx) => ({
        laporan_id: laporanId,
        urutan: idx + 1,
        no_loan: it.no_loan, kolektabilitas: it.kolektabilitas,
        nama_debitur: it.nama_debitur, no_pk: it.no_pk,
        tanggal_mulai: it.tanggal_mulai, tanggal_mature: it.tanggal_mature,
        no_rekening: it.no_rekening, plafon: it.plafon, baki_debet: it.baki_debet,
        tunggakan_pokok: it.tunggakan_pokok, tunggakan_bunga: it.tunggakan_bunga,
        jenis_kredit: it.jenis_kredit, cabang: it.cabang,
        proyeksi_tw: it.proyeksi_tw, alasan_npl: it.alasan_npl || null,
      }));
      const { error: e2 } = await supabase.from('pl_to_npl_item').insert(rows);
      if (e2) throw e2;
      toast({ title: isEdit ? 'Laporan diperbarui' : 'Laporan disimpan' });
      navigate('/laporan-rko/pl-to-npl');
    } catch (e: any) {
      toast({ title: 'Gagal menyimpan', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const fmtRp = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Laporan PL to NPL' : 'Buat Laporan PL to NPL'}
        description="Ketik nama debitur atau no loan — data akan auto-fill dari MLF."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/laporan-rko/pl-to-npl')}>
              <ArrowLeft className="mr-2 h-4 w-4" />Kembali
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </>
        }
      />

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Periode</Label>
            <Input type="month" value={periode} onChange={(e) => setPeriode(e.target.value)} />
          </div>
          <div>
            <Label>Tanggal Laporan</Label>
            <Input type="date" value={tanggalLaporan} onChange={(e) => setTanggalLaporan(e.target.value)} />
          </div>
          <div>
            <Label>Data MLF per</Label>
            <Input value={mlfJobdate ? formatTanggalLengkap(mlfJobdate) : '-'} disabled />
          </div>
          <div className="md:col-span-3">
            <Label>Nama Pemimpin</Label>
            <Input
              value={namaPemimpin}
              onChange={(e) => setNamaPemimpin(e.target.value)}
              placeholder="cth: Budi Santoso, S.E. — akan tampil di kolom tanda tangan"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Debitur Diproyeksikan Masuk NPL ({items.length})</h2>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />Tambah Debitur dari MLF
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[480px] p-0" align="end">
              <Command shouldFilter={false}>
                <CommandInput placeholder="Ketik nama atau no loan..." value={query} onValueChange={setQuery} />
                <CommandList>
                  <CommandEmpty>{query ? 'Tidak ditemukan' : 'Ketik untuk mencari debitur'}</CommandEmpty>
                  <CommandGroup>
                    {searchResults.map((m) => (
                      <CommandItem key={m.id} value={m.id} onSelect={() => addFromMlf(m)}>
                        <div className="w-full">
                          <div className="font-medium">{m.l0name}</div>
                          <div className="text-xs text-muted-foreground">
                            {m.l0lnno} • Kol {m.kol} • {m.lytitl} • Baki {fmtRp(Number(m.baki || 0))}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {items.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">Belum ada debitur. Klik "Tambah Debitur dari MLF".</p>
        ) : (
          <div className="space-y-4">
            {items.map((it, idx) => (
              <Card key={it._localId} className="p-4 border-l-4 border-l-amber-500">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{idx + 1}. {it.nama_debitur}</p>
                    <p className="text-xs text-muted-foreground">
                      No Loan: {it.no_loan} • Kol: {it.kolektabilitas} • {it.jenis_kredit}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeItem(it._localId)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                  <div><span className="text-muted-foreground">No PK:</span><br />{it.no_pk || '-'}</div>
                  <div><span className="text-muted-foreground">No Rek:</span><br />{it.no_rekening || '-'}</div>
                  <div><span className="text-muted-foreground">Mulai:</span><br />{it.tanggal_mulai ? formatTanggalLengkap(it.tanggal_mulai) : '-'}</div>
                  <div><span className="text-muted-foreground">Mature:</span><br />{it.tanggal_mature ? formatTanggalLengkap(it.tanggal_mature) : '-'}</div>
                  <div><span className="text-muted-foreground">Plafon:</span><br />{fmtRp(it.plafon)}</div>
                  <div><span className="text-muted-foreground">Baki Debet:</span><br />{fmtRp(it.baki_debet)}</div>
                  <div><span className="text-muted-foreground">Tung. Pokok:</span><br />{fmtRp(it.tunggakan_pokok)}</div>
                  <div><span className="text-muted-foreground">Tung. Bunga:</span><br />{fmtRp(it.tunggakan_bunga)}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t">
                  <div>
                    <Label className="text-xs">Proyeksi Masuk NPL *</Label>
                    <Select value={it.proyeksi_tw} onValueChange={(v) => updateItem(it._localId, { proyeksi_tw: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TW1">TW1</SelectItem>
                        <SelectItem value="TW2">TW2</SelectItem>
                        <SelectItem value="TW3">TW3</SelectItem>
                        <SelectItem value="TW4">TW4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs">Alasan Masuk NPL</Label>
                    <Textarea rows={2} value={it.alasan_npl}
                      onChange={(e) => updateItem(it._localId, { alasan_npl: e.target.value })} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
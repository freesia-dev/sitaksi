import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Plus, Check, Trash2, CalendarClock, AlertCircle, ChevronsUpDown, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/types';
import { KATEGORI_LABEL, KATEGORI_COLOR, KategoriKunjungan, MonitoringJadwal, JadwalStatus } from '@/types/monitoring';
import { cn } from '@/lib/utils';

interface DebiturItem {
  nama_debitur: string;
  no_loan: string | null;
  kategori: KategoriKunjungan;
}

export default function MonitoringJadwalPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<MonitoringJadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [debiturOpen, setDebiturOpen] = useState(false);
  const [debiturList, setDebiturList] = useState<DebiturItem[]>([]);
  const [debiturLoading, setDebiturLoading] = useState(false);
  const [form, setForm] = useState({
    tanggal_rencana: new Date().toISOString().slice(0, 10),
    jam_rencana: '',
    nama_debitur: '',
    no_loan: '',
    kategori: 'aktif' as KategoriKunjungan,
    keterangan: '',
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('monitoring_jadwal')
      .select('*')
      .order('tanggal_rencana', { ascending: true });
    if (error) toast({ title: 'Gagal memuat', description: error.message, variant: 'destructive' });
    setItems((data || []) as MonitoringJadwal[]);
    setLoading(false);
  };

  const loadDebitur = async () => {
    setDebiturLoading(true);
    const { data, error } = await supabase
      .from('monitoring_kunjungan')
      .select('nama_debitur, no_loan, kategori, created_at')
      .order('created_at', { ascending: false });
    if (!error && data) {
      const seen = new Set<string>();
      const unique: DebiturItem[] = [];
      data.forEach((d: any) => {
        const key = d.nama_debitur?.toLowerCase().trim() || '';
        if (key && !seen.has(key)) {
          seen.add(key);
          unique.push({
            nama_debitur: d.nama_debitur,
            no_loan: d.no_loan,
            kategori: d.kategori as KategoriKunjungan,
          });
        }
      });
      setDebiturList(unique);
    }
    setDebiturLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (open) {
      loadDebitur();
    }
  }, [open]);

  const handleAdd = async () => {
    if (!user || !form.nama_debitur.trim()) return;
    const { error } = await supabase.from('monitoring_jadwal').insert({
      ...form,
      jam_rencana: form.jam_rencana || null,
      user_id: user.id,
    });
    if (error) {
      toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Jadwal ditambahkan' });
      setOpen(false);
      setForm({
        tanggal_rencana: new Date().toISOString().slice(0, 10),
        jam_rencana: '',
        nama_debitur: '',
        no_loan: '',
        kategori: 'aktif',
        keterangan: '',
      });
      load();
    }
  };

  const updateStatus = async (id: string, status: JadwalStatus) => {
    const { error } = await supabase.from('monitoring_jadwal').update({ status }).eq('id', id);
    if (error) toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
    else load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jadwal ini?')) return;
    await supabase.from('monitoring_jadwal').delete().eq('id', id);
    load();
  };

  const selectDebitur = (debitur: DebiturItem) => {
    setForm(prev => ({
      ...prev,
      nama_debitur: debitur.nama_debitur,
      no_loan: debitur.no_loan || '',
      kategori: debitur.kategori,
    }));
    setDebiturOpen(false);
  };

  const today = new Date().toISOString().slice(0, 10);

  const displayLabel = form.nama_debitur
    ? `${form.nama_debitur}${form.no_loan ? ` (${form.no_loan})` : ''}`
    : 'Cari atau ketik nama debitur…';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Kunjungan"
        description="Reminder dan rencana kunjungan ke debitur"
        actions={<Button onClick={() => setOpen(true)}><Plus className="mr-2" size={16} />Tambah Jadwal</Button>}
      />

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Jam</th>
                <th className="p-3">Debitur</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Keterangan</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Memuat...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Belum ada jadwal</td></tr>
              ) : items.map(j => {
                const overdue = j.status === 'scheduled' && j.tanggal_rencana < today;
                const istoday = j.tanggal_rencana === today;
                return (
                  <tr key={j.id} className={cn("border-t hover:bg-muted/30", overdue && "bg-red-50/50", istoday && "bg-amber-50/50")}>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {overdue && <AlertCircle size={14} className="text-destructive" />}
                        {istoday && <CalendarClock size={14} className="text-amber-600" />}
                        {formatDate(j.tanggal_rencana)}
                      </div>
                    </td>
                    <td className="p-3">{j.jam_rencana || '-'}</td>
                    <td className="p-3 font-medium">{j.nama_debitur}<div className="text-xs text-muted-foreground">{j.no_loan}</div></td>
                    <td className="p-3"><span className={cn("px-2 py-0.5 rounded-full text-xs border", KATEGORI_COLOR[j.kategori])}>{KATEGORI_LABEL[j.kategori]}</span></td>
                    <td className="p-3 max-w-xs">{j.keterangan || '-'}</td>
                    <td className="p-3">
                      <span className={cn("px-2 py-0.5 rounded text-xs",
                        j.status === 'done' && "bg-green-100 text-green-800",
                        j.status === 'scheduled' && "bg-blue-100 text-blue-800",
                        j.status === 'canceled' && "bg-gray-100 text-gray-700",
                      )}>{j.status === 'done' ? 'Selesai' : j.status === 'canceled' ? 'Dibatalkan' : 'Dijadwalkan'}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        {j.status !== 'done' && (
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(j.id, 'done')}><Check size={14} className="text-green-600" /></Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(j.id)}><Trash2 size={14} className="text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Tambah Jadwal Kunjungan</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Tanggal</Label><Input type="date" value={form.tanggal_rencana} onChange={e => setForm({ ...form, tanggal_rencana: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Jam</Label><Input type="time" value={form.jam_rencana} onChange={e => setForm({ ...form, jam_rencana: e.target.value })} /></div>
            </div>

            <div className="space-y-1.5">
              <Label>Nama Debitur *</Label>
              <Popover open={debiturOpen} onOpenChange={setDebiturOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={debiturOpen}
                    className="w-full justify-between font-normal h-10"
                  >
                    <span className={cn("truncate", !form.nama_debitur && "text-muted-foreground")}>
                      {displayLabel}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Cari nama debitur…" />
                    <CommandList>
                      <CommandEmpty>
                        {debiturLoading ? 'Memuat data…' : 'Tidak ditemukan'}
                      </CommandEmpty>
                      <CommandGroup>
                        {debiturList.map((d) => (
                          <CommandItem
                            key={d.nama_debitur}
                            value={d.nama_debitur}
                            onSelect={() => selectDebitur(d)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{d.nama_debitur}</span>
                              <span className="text-xs text-muted-foreground">
                                {d.no_loan || '—'} · {KATEGORI_LABEL[d.kategori]}
                              </span>
                            </div>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                form.nama_debitur === d.nama_debitur ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>No. Loan</Label><Input value={form.no_loan} onChange={e => setForm({ ...form, no_loan: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Select value={form.kategori} onValueChange={(v) => setForm({ ...form, kategori: v as KategoriKunjungan })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(KATEGORI_LABEL) as KategoriKunjungan[]).map(k => <SelectItem key={k} value={k}>{KATEGORI_LABEL[k]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Keterangan</Label><Textarea rows={2} value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleAdd}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

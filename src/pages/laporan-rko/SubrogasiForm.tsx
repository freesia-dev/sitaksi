import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Check, ChevronsUpDown, Save, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Debitur {
  id: string;
  nama_debitur: string;
  no_loan: string;
  produk: string | null;
  nik: string | null;
  no_premi_asuransi: string | null;
  no_perjanjian_kredit: string | null;
  nilai_subrogasi: number;
  tahun_pencairan: number | null;
  nama_cabang: string | null;
}

interface Item {
  id?: string;
  _localId: string;
  debitur: Debitur;
  tanggal_pembayaran: string;
  akumulasi_pembayaran: string;
  konfirmasi_asuransi: string;
  konfirmasi_cabang: string;
  hasil_kesepakatan: string;
}

const DEFAULT_KANTOR = 'Kantor Cabang Pembantu Telihan Bontang';

function blankDebiturForm(): Omit<Debitur, 'id'> & { id?: string } {
  return {
    nama_debitur: '', no_loan: '', produk: 'PERSONAL LOAN PNSD', nik: '',
    no_premi_asuransi: '', no_perjanjian_kredit: '', nilai_subrogasi: 0,
    tahun_pencairan: null, nama_cabang: 'PT. BPD Kaltim Kaltara Kantor Cabang Pembantu Telihan',
  };
}

export default function SubrogasiForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const today = new Date().toISOString().substring(0, 10);
  const currentPeriode = today.substring(0, 7);

  const [periode, setPeriode] = useState(currentPeriode);
  const [namaKantor, setNamaKantor] = useState(DEFAULT_KANTOR);
  const [tanggalLaporan, setTanggalLaporan] = useState(today);
  const [items, setItems] = useState<Item[]>([]);

  const [debiturList, setDebiturList] = useState<Debitur[]>([]);
  const [saving, setSaving] = useState(false);

  // Add-debitur dialog
  const [pickerOpen, setPickerOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [selectedDebitur, setSelectedDebitur] = useState<Debitur | null>(null);

  // New debitur form
  const [newDebiturOpen, setNewDebiturOpen] = useState(false);
  const [newDebitur, setNewDebitur] = useState(blankDebiturForm());

  // Load master debitur
  useEffect(() => {
    supabase.from('subrogasi_debitur').select('*').order('nama_debitur')
      .then(({ data }) => setDebiturList((data as Debitur[]) || []));
  }, []);

  // Load existing if editing
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: lap } = await supabase.from('subrogasi_laporan').select('*').eq('id', id).single();
      if (lap) {
        setPeriode(lap.periode);
        setNamaKantor(lap.nama_kantor);
        setTanggalLaporan(lap.tanggal_laporan);
      }
      const { data: its } = await supabase
        .from('subrogasi_laporan_item')
        .select('*, subrogasi_debitur(*)')
        .eq('laporan_id', id).order('urutan');
      if (its) {
        setItems(its.map((it: any) => ({
          id: it.id,
          _localId: it.id,
          debitur: it.subrogasi_debitur,
          tanggal_pembayaran: it.tanggal_pembayaran || '',
          akumulasi_pembayaran: String(it.akumulasi_pembayaran || 0),
          konfirmasi_asuransi: it.konfirmasi_asuransi || '',
          konfirmasi_cabang: it.konfirmasi_cabang || '',
          hasil_kesepakatan: it.hasil_kesepakatan || '',
        })));
      }
    })();
  }, [id]);

  const addItemFromExisting = () => {
    if (!selectedDebitur) return;
    if (items.some((it) => it.debitur.id === selectedDebitur.id)) {
      toast({ title: 'Debitur sudah ditambahkan', variant: 'destructive' });
      return;
    }
    setItems((prev) => [...prev, {
      _localId: crypto.randomUUID(),
      debitur: selectedDebitur,
      tanggal_pembayaran: '',
      akumulasi_pembayaran: '0',
      konfirmasi_asuransi: '',
      konfirmasi_cabang: '',
      hasil_kesepakatan: '',
    }]);
    setSelectedDebitur(null);
    setPickerOpen(false);
  };

  const saveNewDebitur = async () => {
    if (!newDebitur.nama_debitur || !newDebitur.no_loan) {
      toast({ title: 'Nama Debitur dan No Loan wajib diisi', variant: 'destructive' });
      return;
    }
    const { data, error } = await supabase.from('subrogasi_debitur').insert({
      ...newDebitur,
      nilai_subrogasi: Number(newDebitur.nilai_subrogasi || 0),
      created_by: user?.id,
    }).select().single();
    if (error || !data) {
      toast({ title: 'Gagal simpan debitur', description: error?.message, variant: 'destructive' });
      return;
    }
    setDebiturList((prev) => [...prev, data as Debitur].sort((a, b) => a.nama_debitur.localeCompare(b.nama_debitur)));
    setItems((prev) => [...prev, {
      _localId: crypto.randomUUID(),
      debitur: data as Debitur,
      tanggal_pembayaran: '',
      akumulasi_pembayaran: '0',
      konfirmasi_asuransi: '',
      konfirmasi_cabang: '',
      hasil_kesepakatan: '',
    }]);
    setNewDebiturOpen(false);
    setPickerOpen(false);
    setNewDebitur(blankDebiturForm());
    toast({ title: 'Debitur baru ditambahkan' });
  };

  const updateItem = (localId: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((it) => it._localId === localId ? { ...it, ...patch } : it));
  };
  const removeItem = (localId: string) => {
    setItems((prev) => prev.filter((it) => it._localId !== localId));
  };

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
        const { data, error } = await supabase.from('subrogasi_laporan').insert({
          periode, nama_kantor: namaKantor, tanggal_laporan: tanggalLaporan, created_by: user.id,
        }).select().single();
        if (error) throw error;
        laporanId = data.id;
      } else {
        const { error } = await supabase.from('subrogasi_laporan')
          .update({ periode, nama_kantor: namaKantor, tanggal_laporan: tanggalLaporan })
          .eq('id', id);
        if (error) throw error;
        // delete old items
        await supabase.from('subrogasi_laporan_item').delete().eq('laporan_id', id);
      }
      const rows = items.map((it, idx) => {
        const ak = Number(it.akumulasi_pembayaran || 0);
        const sisa = Number(it.debitur.nilai_subrogasi || 0) - ak;
        return {
          laporan_id: laporanId,
          debitur_id: it.debitur.id,
          urutan: idx + 1,
          tanggal_pembayaran: it.tanggal_pembayaran || null,
          akumulasi_pembayaran: ak,
          sisa_subrogasi: sisa,
          konfirmasi_asuransi: it.konfirmasi_asuransi || null,
          konfirmasi_cabang: it.konfirmasi_cabang || null,
          hasil_kesepakatan: it.hasil_kesepakatan || null,
        };
      });
      const { error: e2 } = await supabase.from('subrogasi_laporan_item').insert(rows);
      if (e2) throw e2;
      toast({ title: isEdit ? 'Laporan diperbarui' : 'Laporan disimpan' });
      navigate('/laporan-rko/subrogasi');
    } catch (e: any) {
      toast({ title: 'Gagal menyimpan', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const fmtRp = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const totalSisa = useMemo(() =>
    items.reduce((s, it) => s + (Number(it.debitur.nilai_subrogasi || 0) - Number(it.akumulasi_pembayaran || 0)), 0),
    [items]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Laporan Subrogasi' : 'Buat Laporan Subrogasi'}
        description={isEdit ? 'Perbarui data laporan.' : 'Pilih debitur dari master atau tambahkan baru.'}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/laporan-rko/subrogasi')}>
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
            <Label>Periode (Bulan)</Label>
            <Input type="month" value={periode} onChange={(e) => setPeriode(e.target.value)} />
          </div>
          <div>
            <Label>Tanggal Laporan</Label>
            <Input type="date" value={tanggalLaporan} onChange={(e) => setTanggalLaporan(e.target.value)} />
          </div>
          <div>
            <Label>Nama Kantor</Label>
            <Input value={namaKantor} onChange={(e) => setNamaKantor(e.target.value)} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Daftar Debitur ({items.length})</h2>
            <p className="text-sm text-muted-foreground">Total Sisa Subrogasi: <span className="font-mono">{fmtRp(totalSisa)}</span></p>
          </div>
          <Button onClick={() => setPickerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />Tambah Debitur
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">Belum ada debitur. Klik "Tambah Debitur".</p>
        ) : (
          <div className="space-y-4">
            {items.map((it, idx) => {
              const sisa = Number(it.debitur.nilai_subrogasi || 0) - Number(it.akumulasi_pembayaran || 0);
              return (
                <Card key={it._localId} className="p-4 border-l-4 border-l-primary">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{idx + 1}. {it.debitur.nama_debitur}</p>
                      <p className="text-xs text-muted-foreground">
                        No Loan: {it.debitur.no_loan} • Nilai: {fmtRp(Number(it.debitur.nilai_subrogasi))}
                        {it.debitur.tahun_pencairan && ` • Tahun: ${it.debitur.tahun_pencairan}`}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeItem(it._localId)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Tanggal Pembayaran</Label>
                      <Input type="date" value={it.tanggal_pembayaran}
                        onChange={(e) => updateItem(it._localId, { tanggal_pembayaran: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Akumulasi Pembayaran</Label>
                      <CurrencyInput value={it.akumulasi_pembayaran}
                        onChange={(v) => updateItem(it._localId, { akumulasi_pembayaran: v })} />
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-muted-foreground">
                        Sisa Subrogasi: <span className="font-mono font-semibold text-foreground">{fmtRp(sisa)}</span>
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs">Konfirmasi Asuransi</Label>
                      <Input value={it.konfirmasi_asuransi}
                        onChange={(e) => updateItem(it._localId, { konfirmasi_asuransi: e.target.value })}
                        placeholder="cth: Nilai Subrogasi Sesuai" />
                    </div>
                    <div>
                      <Label className="text-xs">Konfirmasi Kantor Cabang</Label>
                      <Input value={it.konfirmasi_cabang}
                        onChange={(e) => updateItem(it._localId, { konfirmasi_cabang: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Hasil Kesepakatan dengan Asuransi</Label>
                      <Textarea rows={2} value={it.hasil_kesepakatan}
                        onChange={(e) => updateItem(it._localId, { hasil_kesepakatan: e.target.value })} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Picker dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pilih Debitur</DialogTitle>
            <DialogDescription>Pilih dari master debitur atau tambahkan baru.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Popover open={comboOpen} onOpenChange={setComboOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {selectedDebitur ? (
                    <span className="truncate">{selectedDebitur.nama_debitur} — {selectedDebitur.no_loan}</span>
                  ) : 'Cari debitur...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Ketik nama atau no loan..." />
                  <CommandList>
                    <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {debiturList.map((d) => (
                        <CommandItem key={d.id} value={`${d.nama_debitur} ${d.no_loan}`} onSelect={() => {
                          setSelectedDebitur(d); setComboOpen(false);
                        }}>
                          <Check className={cn('mr-2 h-4 w-4', selectedDebitur?.id === d.id ? 'opacity-100' : 'opacity-0')} />
                          <div>
                            <div className="font-medium">{d.nama_debitur}</div>
                            <div className="text-xs text-muted-foreground">{d.no_loan} • {d.produk}</div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button variant="outline" className="w-full" onClick={() => setNewDebiturOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />Tambah Debitur Baru
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPickerOpen(false)}>Batal</Button>
            <Button onClick={addItemFromExisting} disabled={!selectedDebitur}>Tambahkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New debitur dialog */}
      <Dialog open={newDebiturOpen} onOpenChange={setNewDebiturOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Debitur Baru</DialogTitle>
            <DialogDescription>Data ini akan tersimpan dan bisa dipilih untuk laporan bulan berikutnya.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label>Nama Debitur *</Label>
              <Input value={newDebitur.nama_debitur} onChange={(e) => setNewDebitur({ ...newDebitur, nama_debitur: e.target.value })} />
            </div>
            <div>
              <Label>No Loan *</Label>
              <Input value={newDebitur.no_loan} onChange={(e) => setNewDebitur({ ...newDebitur, no_loan: e.target.value })} />
            </div>
            <div>
              <Label>Produk</Label>
              <Input value={newDebitur.produk || ''} onChange={(e) => setNewDebitur({ ...newDebitur, produk: e.target.value })} />
            </div>
            <div>
              <Label>NIK</Label>
              <Input value={newDebitur.nik || ''} onChange={(e) => setNewDebitur({ ...newDebitur, nik: e.target.value })} />
            </div>
            <div>
              <Label>No. Premi Asuransi</Label>
              <Input value={newDebitur.no_premi_asuransi || ''} onChange={(e) => setNewDebitur({ ...newDebitur, no_premi_asuransi: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>No. Perjanjian Kredit</Label>
              <Input value={newDebitur.no_perjanjian_kredit || ''} onChange={(e) => setNewDebitur({ ...newDebitur, no_perjanjian_kredit: e.target.value })} />
            </div>
            <div>
              <Label>Nilai Subrogasi</Label>
              <CurrencyInput value={String(newDebitur.nilai_subrogasi)} onChange={(v) => setNewDebitur({ ...newDebitur, nilai_subrogasi: Number(v) })} />
            </div>
            <div>
              <Label>Tahun Pencairan</Label>
              <Input type="number" value={newDebitur.tahun_pencairan || ''} onChange={(e) => setNewDebitur({ ...newDebitur, tahun_pencairan: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="md:col-span-2">
              <Label>Nama Cabang BPD/Capem</Label>
              <Input value={newDebitur.nama_cabang || ''} onChange={(e) => setNewDebitur({ ...newDebitur, nama_cabang: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDebiturOpen(false)}>Batal</Button>
            <Button onClick={saveNewDebitur}>Simpan Debitur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
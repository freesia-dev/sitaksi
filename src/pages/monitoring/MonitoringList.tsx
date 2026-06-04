import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, FileText, Trash2, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatCurrency } from '@/types';
import { KATEGORI_LABEL, KATEGORI_COLOR, MonitoringKunjungan, KategoriKunjungan } from '@/types/monitoring';
import { cn } from '@/lib/utils';

export default function MonitoringList() {
  const [items, setItems] = useState<MonitoringKunjungan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState<string>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('monitoring_kunjungan')
      .select('*')
      .order('tanggal_kunjungan', { ascending: false });
    if (error) {
      toast({ title: 'Gagal memuat data', description: error.message, variant: 'destructive' });
    } else {
      setItems((data || []) as MonitoringKunjungan[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter(i => {
    if (kategori !== 'all' && i.kategori !== kategori) return false;
    if (search && !`${i.nama_debitur} ${i.no_rekening || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [items, search, kategori]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data kunjungan ini?')) return;
    const { error } = await supabase.from('monitoring_kunjungan').delete().eq('id', id);
    if (error) {
      toast({ title: 'Gagal menghapus', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Dihapus' });
      load();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring Kunjungan Debitur"
        description="Catatan kunjungan ke calon debitur, debitur aktif, menunggak & restrukturisasi"
        actions={
          <Button onClick={() => navigate('/monitoring/new')}>
            <Plus className="mr-2" size={16} /> Tambah Kunjungan
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input className="pl-9" placeholder="Cari nama debitur / no. rekening..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={kategori} onValueChange={setKategori}>
          <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {(Object.keys(KATEGORI_LABEL) as KategoriKunjungan[]).map(k => (
              <SelectItem key={k} value={k}>{KATEGORI_LABEL[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Debitur</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">No. Rekening</th>
                <th className="p-3 text-right">Baki Debet</th>
                <th className="p-3 text-right">Tunggakan</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Memuat...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Belum ada data kunjungan</td></tr>
              ) : filtered.map(i => (
                <tr key={i.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 whitespace-nowrap">{formatDate(i.tanggal_kunjungan)}</td>
                  <td className="p-3 font-medium">{i.nama_debitur}</td>
                  <td className="p-3">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs border", KATEGORI_COLOR[i.kategori])}>
                      {KATEGORI_LABEL[i.kategori]}
                    </span>
                  </td>
                  <td className="p-3">{i.no_rekening || '-'}</td>
                  <td className="p-3 text-right">{formatCurrency(i.baki_debet || 0)}</td>
                  <td className="p-3 text-right text-destructive">{formatCurrency((i.tunggakan_pokok || 0) + (i.tunggakan_bunga || 0))}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button asChild size="sm" variant="ghost"><Link to={`/monitoring/${i.id}`}><FileText size={14} /></Link></Button>
                      <Button asChild size="sm" variant="ghost"><Link to={`/monitoring/edit/${i.id}`}><Pencil size={14} /></Link></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(i.id)}><Trash2 size={14} className="text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
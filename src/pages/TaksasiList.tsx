import React, { Suspense, lazy, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileClock,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTaksasi } from '@/context/TaksasiContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusToggle } from '@/components/shared/StatusToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatCurrency, Taksasi } from '@/types';
import { JENIS, KodeJenis, kodeJenis, labelJenis, urlEdit } from '@/lib/jenisAgunan';
import { daftarDraf, hapusDrafTersimpan } from '@/lib/drafTersimpan';

const ExportReport = lazy(() => import('@/pages/ExportReport'));

type Urutan = 'tanggal' | 'nomor_dokumen' | 'nama_nasabah' | 'nilai_taksasi';
const PER_HALAMAN = 20;

const tanggalPendek = (d: string) => {
  const t = new Date(d);
  return isNaN(t.getTime())
    ? '—'
    : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(t);
};
const jamRelatif = (iso: string) => {
  const t = new Date(iso);
  if (isNaN(t.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(t);
};
const nomorUrut = (no: string) => {
  const n = Number((no || '').split('/')[0]);
  return Number.isFinite(n) ? n : null;
};

/**
 * Satu halaman untuk semua taksasi (menggantikan daftar Tanah, Tanah & Bangunan,
 * Kendaraan, dan Riwayat yang terpisah). Filter jenis tersimpan di URL
 * (?jenis=tanah) supaya tautan lama dan tombol kembali tetap bekerja.
 * Di layar HP daftar tampil sebagai kartu, di layar lebar sebagai tabel.
 */
export default function TaksasiList() {
  const { user } = useAuth();
  const { taksasiList, deleteTaksasi, isLoading } = useTaksasi();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const isAdmin = user?.role === 'Admin';
  const isDemo = user?.role === 'Demo';

  const jenis = (params.get('jenis') as KodeJenis | null) || 'semua';
  const status = params.get('status') || 'semua';
  const [cari, setCari] = useState('');
  const [urutan, setUrutan] = useState<Urutan>('tanggal');
  const [naik, setNaik] = useState(false);
  const [halaman, setHalaman] = useState(1);
  const [drafList, setDrafList] = useState(() => daftarDraf(user?.id));

  const setFilter = (kunci: 'jenis' | 'status', nilai: string) => {
    const p = new URLSearchParams(params);
    if (nilai === 'semua') p.delete(kunci);
    else p.set(kunci, nilai);
    setParams(p, { replace: true });
    setHalaman(1);
  };

  const hitungJenis = useMemo(() => {
    const h: Record<string, number> = { semua: taksasiList.length };
    taksasiList.forEach((t) => {
      const k = kodeJenis(t.jenis_agunan);
      h[k] = (h[k] || 0) + 1;
    });
    return h;
  }, [taksasiList]);

  const daftar = useMemo(() => {
    const q = cari.trim().toLowerCase();
    const hasil = taksasiList.filter((t) => {
      if (jenis !== 'semua' && kodeJenis(t.jenis_agunan) !== jenis) return false;
      if (status !== 'semua' && (t.status || 'draft') !== status) return false;
      if (!q) return true;
      return [t.nama_nasabah, t.nomor_dokumen, t.alamat, t.petugas].some((v) => (v || '').toLowerCase().includes(q));
    });
    hasil.sort((a, b) => {
      let c = 0;
      if (urutan === 'tanggal') c = new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
      else if (urutan === 'nama_nasabah') c = a.nama_nasabah.localeCompare(b.nama_nasabah);
      else if (urutan === 'nilai_taksasi') c = a.nilai_taksasi - b.nilai_taksasi;
      else {
        const an = nomorUrut(a.nomor_dokumen);
        const bn = nomorUrut(b.nomor_dokumen);
        c = an !== null && bn !== null ? an - bn : a.nomor_dokumen.localeCompare(b.nomor_dokumen);
      }
      return naik ? c : -c;
    });
    return hasil;
  }, [taksasiList, jenis, status, cari, urutan, naik]);

  const totalHalaman = Math.max(1, Math.ceil(daftar.length / PER_HALAMAN));
  const hal = Math.min(halaman, totalHalaman);
  const tampil = daftar.slice((hal - 1) * PER_HALAMAN, hal * PER_HALAMAN);

  const totalNilai = daftar.reduce((s, t) => s + (t.nilai_taksasi || 0), 0);
  const totalLikuidasi = daftar.reduce((s, t) => s + (t.nilai_likuidasi || 0), 0);

  const tombolTambah = !isDemo && (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="mr-2" size={16} /> Taksasi Baru
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {JENIS.map((j) => (
          <DropdownMenuItem key={j.kode} onClick={() => navigate(j.baru)}>
            <j.ikon size={16} className="mr-2" /> {j.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const aksi = (t: Taksasi, kecil = false) => (
    <div className={cn('flex items-center gap-1', kecil ? 'justify-end' : 'justify-center')}>
      <Button variant="ghost" size="icon" onClick={() => navigate(`/taksasi/${t.id}`)} title="Lihat & cetak" aria-label="Lihat & cetak">
        <Eye size={16} />
      </Button>
      {!isDemo && (
        <Button variant="ghost" size="icon" onClick={() => navigate(urlEdit(t.jenis_agunan, t.id))} title="Edit" aria-label="Edit">
          <Pencil size={16} />
        </Button>
      )}
      {isAdmin && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Hapus" aria-label="Hapus">
              <Trash2 size={16} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus taksasi?</AlertDialogTitle>
              <AlertDialogDescription>
                Taksasi {t.nama_nasabah} ({t.nomor_dokumen}) akan dihapus permanen dan tidak bisa dikembalikan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteTaksasi(t.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Taksasi"
        description={isAdmin ? 'Semua penilaian agunan dari seluruh officer' : 'Penilaian agunan yang Anda buat'}
        actions={
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2" size={16} /> <span className="hidden sm:inline">Export Laporan</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Export Laporan Taksasi</DialogTitle>
                </DialogHeader>
                <Suspense fallback={<Loader2 className="mx-auto my-8 h-6 w-6 animate-spin text-primary" />}>
                  <ExportReport embedded />
                </Suspense>
              </DialogContent>
            </Dialog>
            {tombolTambah}
          </div>
        }
      />

      {/* Isian yang belum disimpan di perangkat ini */}
      {drafList.length > 0 && (
        <div className="rounded-xl border border-warning/50 bg-warning/5 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <FileClock size={16} className="text-warning-foreground" /> Isian yang belum disimpan
          </p>
          <ul className="divide-y">
            {drafList.map((d) => (
              <li key={d.kunci} className="flex items-center gap-2 py-2 text-sm">
                <Link
                  to={d.id ? `/taksasi/${d.jenis}/edit/${d.id}` : `/taksasi/${d.jenis}/new`}
                  className="flex-1 min-w-0 hover:underline"
                >
                  <span className="font-medium">{d.nama || 'Tanpa nama'}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    · {labelJenis(d.jenis)} · {d.id ? 'edit' : 'baru'} · {jamRelatif(d.waktu)}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Buang isian"
                  title="Buang isian"
                  onClick={() => {
                    hapusDrafTersimpan(d.kunci);
                    setDrafList(daftarDraf(user?.id));
                  }}
                >
                  <X size={14} />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filter jenis */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {[{ kode: 'semua', label: 'Semua' }, ...JENIS].map((j) => (
          <button
            key={j.kode}
            type="button"
            onClick={() => setFilter('jenis', j.kode)}
            className={cn(
              'whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors',
              jenis === j.kode ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted',
            )}
          >
            {j.label} <span className="opacity-70">({hitungJenis[j.kode] || 0})</span>
          </button>
        ))}
      </div>

      {/* Cari, status, urutan */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Cari nama, nomor dokumen, alamat, atau petugas…"
            value={cari}
            onChange={(e) => {
              setCari(e.target.value);
              setHalaman(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={status} onValueChange={(v) => setFilter('status', v)}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="disetujui">Disetujui</SelectItem>
              <SelectItem value="ditolak">Ditolak</SelectItem>
            </SelectContent>
          </Select>
          <Select value={urutan} onValueChange={(v) => setUrutan(v as Urutan)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tanggal">Tanggal</SelectItem>
              <SelectItem value="nomor_dokumen">Nomor dokumen</SelectItem>
              <SelectItem value="nama_nasabah">Nama nasabah</SelectItem>
              <SelectItem value="nilai_taksasi">Nilai taksasi</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => setNaik((n) => !n)}
            aria-label={naik ? 'Urutan naik' : 'Urutan turun'}
            title={naik ? 'Urutan naik' : 'Urutan turun'}
          >
            {naik ? <ArrowUpNarrowWide size={16} /> : <ArrowDownWideNarrow size={16} />}
          </Button>
        </div>
      </div>

      {isLoading && taksasiList.length === 0 ? (
        <div className="py-16 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        </div>
      ) : daftar.length === 0 ? (
        <div className="rounded-xl border bg-card py-14 text-center">
          <p className="text-muted-foreground">
            {cari || status !== 'semua' || jenis !== 'semua' ? 'Tidak ada taksasi yang cocok dengan filter.' : 'Belum ada taksasi.'}
          </p>
          {!cari && status === 'semua' && !isDemo && <div className="mt-4 inline-block">{tombolTambah}</div>}
        </div>
      ) : (
        <>
          {/* HP: kartu */}
          <ul className="space-y-3 md:hidden">
            {tampil.map((t) => (
              <li key={t.id} className="rounded-xl border bg-card p-4 shadow-card">
                <button type="button" className="block w-full text-left" onClick={() => navigate(`/taksasi/${t.id}`)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{t.nama_nasabah}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {t.jenis_agunan} · {tanggalPendek(t.tanggal)}
                      </p>
                    </div>
                    <p className="shrink-0 text-right text-sm font-semibold text-primary">{formatCurrency(t.nilai_taksasi)}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{t.alamat}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground truncate">{t.nomor_dokumen}</p>
                </button>
                <div className="mt-3 flex items-center justify-between border-t pt-2">
                  <StatusToggle taksasiId={t.id} currentStatus={t.status || 'draft'} disabled={isDemo} />
                  {aksi(t, true)}
                </div>
              </li>
            ))}
          </ul>

          {/* Layar lebar: tabel */}
          <div className="hidden md:block rounded-xl border bg-card shadow-card overflow-hidden">
            <div className="max-h-[70vh] overflow-auto custom-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_hsl(var(--border))]">
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nasabah</TableHead>
                    <TableHead>Jenis</TableHead>
                    {isAdmin && <TableHead>Petugas</TableHead>}
                    <TableHead className="text-right">Nilai Taksasi</TableHead>
                    <TableHead className="text-right">Likuidasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tampil.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">{tanggalPendek(t.tanggal)}</TableCell>
                      <TableCell className="max-w-[280px]">
                        <p className="font-medium truncate">{t.nama_nasabah}</p>
                        <p className="font-mono text-[11px] text-muted-foreground truncate">{t.nomor_dokumen}</p>
                        <p className="text-xs text-muted-foreground truncate">{t.alamat}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{t.jenis_agunan}</TableCell>
                      {isAdmin && <TableCell className="whitespace-nowrap">{t.petugas || '—'}</TableCell>}
                      <TableCell className="text-right font-semibold text-primary whitespace-nowrap">{formatCurrency(t.nilai_taksasi)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(t.nilai_likuidasi)}</TableCell>
                      <TableCell>
                        <StatusToggle taksasiId={t.id} currentStatus={t.status || 'draft'} disabled={isDemo} />
                      </TableCell>
                      <TableCell>{aksi(t)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Ringkasan & halaman */}
          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
              {daftar.length} taksasi · nilai {formatCurrency(totalNilai)} · likuidasi {formatCurrency(totalLikuidasi)}
            </p>
            {totalHalaman > 1 && (
              <div className="flex items-center gap-2 self-end">
                <Button variant="outline" size="icon" disabled={hal <= 1} onClick={() => setHalaman(hal - 1)} aria-label="Halaman sebelumnya">
                  <ChevronLeft size={16} />
                </Button>
                <span>
                  {hal} / {totalHalaman}
                </span>
                <Button variant="outline" size="icon" disabled={hal >= totalHalaman} onClick={() => setHalaman(hal + 1)} aria-label="Halaman berikutnya">
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

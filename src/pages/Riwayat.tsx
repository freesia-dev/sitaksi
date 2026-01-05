import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTaksasi } from '@/context/TaksasiContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatDate, JenisAgunan, StatusOtorisasi } from '@/types';
import { Search, Filter, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DetailAgunanKendaraan, DetailAgunanTanah, DetailAgunanTB } from '@/types';

export default function Riwayat() {
  const { user } = useAuth();
  const { taksasiList, getTaksasiByUser } = useTaksasi();

  const isPimpinan = user?.role === 'Pimpinan';
  const displayList = isPimpinan ? taksasiList : getTaksasiByUser(user?.id || '');

  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTaksasi, setSelectedTaksasi] = useState<typeof displayList[0] | null>(null);

  const filteredList = displayList.filter(t => {
    const matchSearch = t.nama_nasabah.toLowerCase().includes(search.toLowerCase()) ||
      t.alamat.toLowerCase().includes(search.toLowerCase());
    const matchJenis = filterJenis === 'all' || t.jenis_agunan === filterJenis;
    const matchStatus = filterStatus === 'all' || t.status_otorisasi === filterStatus;
    return matchSearch && matchJenis && matchStatus;
  });

  const renderDetailAgunan = () => {
    if (!selectedTaksasi) return null;

    if (selectedTaksasi.jenis_agunan === 'Tanah') {
      const detail = selectedTaksasi.detail_agunan as DetailAgunanTanah;
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Luas Tanah</p>
            <p className="font-semibold">{detail.luas_tanah} m²</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Harga per m²</p>
            <p className="font-semibold">{formatCurrency(detail.harga_per_meter)}</p>
          </div>
        </div>
      );
    }

    if (selectedTaksasi.jenis_agunan === 'Tanah & Bangunan') {
      const detail = selectedTaksasi.detail_agunan as DetailAgunanTB;
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Luas Tanah</p>
            <p className="font-semibold">{detail.luas_tanah} m²</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Harga Tanah/m²</p>
            <p className="font-semibold">{formatCurrency(detail.harga_tanah_per_meter)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Luas Bangunan</p>
            <p className="font-semibold">{detail.luas_bangunan} m²</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Harga Bangunan/m²</p>
            <p className="font-semibold">{formatCurrency(detail.harga_bangunan_per_meter)}</p>
          </div>
        </div>
      );
    }

    if (selectedTaksasi.jenis_agunan === 'Kendaraan') {
      const detail = selectedTaksasi.detail_agunan as DetailAgunanKendaraan;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Merk</p>
              <p className="font-semibold">{detail.merk}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Model</p>
              <p className="font-semibold">{detail.model}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Tahun</p>
              <p className="font-semibold">{detail.tahun}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">No. Polisi</p>
              <p className="font-semibold">{detail.nomor_polisi}</p>
            </div>
          </div>
          {detail.harga_pembanding && detail.harga_pembanding.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Harga Pembanding:</p>
              <div className="space-y-2">
                {detail.harga_pembanding.map((p, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded bg-muted/30 text-sm">
                    <span className="text-muted-foreground">{p.sumber || `Pembanding ${i + 1}`}</span>
                    <span className="font-medium">{formatCurrency(p.harga)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat Taksasi"
        description="Daftar seluruh penilaian agunan yang telah dilakukan"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama nasabah atau alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          <Select value={filterJenis} onValueChange={setFilterJenis}>
            <SelectTrigger className="w-[160px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Jenis Agunan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value="Tanah">Tanah</SelectItem>
              <SelectItem value="Tanah & Bangunan">Tanah & Bangunan</SelectItem>
              <SelectItem value="Kendaraan">Kendaraan</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Menunggu">Menunggu</SelectItem>
              <SelectItem value="Disetujui">Disetujui</SelectItem>
              <SelectItem value="Ditolak">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nasabah</TableHead>
              <TableHead>Jenis Agunan</TableHead>
              <TableHead>Nilai Taksasi</TableHead>
              <TableHead>Nilai Likuidasi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredList.map((taksasi) => (
              <TableRow key={taksasi.id}>
                <TableCell className="text-muted-foreground">{formatDate(taksasi.tanggal)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{taksasi.nama_nasabah}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{taksasi.alamat}</p>
                  </div>
                </TableCell>
                <TableCell>{taksasi.jenis_agunan}</TableCell>
                <TableCell className="font-medium">{formatCurrency(taksasi.nilai_taksasi)}</TableCell>
                <TableCell className="text-success font-medium">{formatCurrency(taksasi.nilai_likuidasi)}</TableCell>
                <TableCell>
                  <StatusBadge status={taksasi.status_otorisasi} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTaksasi(taksasi)}
                  >
                    <Eye size={16} className="mr-1" />
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredList.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Tidak ada data taksasi yang ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedTaksasi} onOpenChange={() => setSelectedTaksasi(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Taksasi</DialogTitle>
          </DialogHeader>
          {selectedTaksasi && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedTaksasi.status_otorisasi} />
                <span className="text-sm text-muted-foreground">{formatDate(selectedTaksasi.tanggal)}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nasabah</p>
                  <p className="font-semibold">{selectedTaksasi.nama_nasabah}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alamat</p>
                  <p className="text-sm">{selectedTaksasi.alamat}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jenis Agunan</p>
                  <p className="font-semibold">{selectedTaksasi.jenis_agunan}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Detail Agunan:</p>
                {renderDetailAgunan()}
              </div>

              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <p className="text-xs text-muted-foreground">Nilai Taksasi</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(selectedTaksasi.nilai_taksasi)}</p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <p className="text-xs text-muted-foreground">Nilai Likuidasi</p>
                  <p className="text-lg font-bold text-success">{formatCurrency(selectedTaksasi.nilai_likuidasi)}</p>
                </div>
              </div>

              {selectedTaksasi.catatan_pimpinan && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Catatan Pimpinan:</p>
                  <p className="mt-1 p-3 rounded-lg bg-muted/50 text-sm">{selectedTaksasi.catatan_pimpinan}</p>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Petugas: {selectedTaksasi.petugas}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

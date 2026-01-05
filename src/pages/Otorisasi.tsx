import React, { useState } from 'react';
import { useTaksasi } from '@/context/TaksasiContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate, DetailAgunanKendaraan, DetailAgunanTanah, DetailAgunanTB } from '@/types';
import { CheckCircle2, XCircle, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function Otorisasi() {
  const { getTaksasiByStatus, approveTaksasi, rejectTaksasi, getTaksasiById } = useTaksasi();
  const { toast } = useToast();

  const pendingList = getTaksasiByStatus('Menunggu');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'view' | null>(null);
  const [catatan, setCatatan] = useState('');

  const selectedTaksasi = selectedId ? getTaksasiById(selectedId) : null;

  const handleAction = (id: string, type: 'approve' | 'reject' | 'view') => {
    setSelectedId(id);
    setActionType(type);
    setCatatan('');
  };

  const handleConfirm = () => {
    if (!selectedId) return;

    if (actionType === 'approve') {
      approveTaksasi(selectedId, catatan || undefined);
      toast({
        title: 'Taksasi Disetujui',
        description: 'Penilaian agunan telah disetujui',
      });
    } else if (actionType === 'reject') {
      if (!catatan.trim()) {
        toast({
          title: 'Catatan diperlukan',
          description: 'Silakan berikan alasan penolakan',
          variant: 'destructive',
        });
        return;
      }
      rejectTaksasi(selectedId, catatan);
      toast({
        title: 'Taksasi Ditolak',
        description: 'Penilaian agunan telah ditolak',
        variant: 'destructive',
      });
    }

    setSelectedId(null);
    setActionType(null);
  };

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
        title="Otorisasi Taksasi"
        description="Daftar penilaian agunan yang menunggu persetujuan"
      />

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
              <TableHead>Petugas</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingList.map((taksasi) => (
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
                <TableCell className="text-muted-foreground">{taksasi.petugas}</TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(taksasi.id, 'view')}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-success hover:bg-success/10"
                      onClick={() => handleAction(taksasi.id, 'approve')}
                    >
                      <CheckCircle2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleAction(taksasi.id, 'reject')}
                    >
                      <XCircle size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {pendingList.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Tidak ada taksasi yang menunggu otorisasi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!selectedId && !!actionType} onOpenChange={() => { setSelectedId(null); setActionType(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'view' && 'Detail Taksasi'}
              {actionType === 'approve' && 'Setujui Taksasi'}
              {actionType === 'reject' && 'Tolak Taksasi'}
            </DialogTitle>
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

              {(actionType === 'approve' || actionType === 'reject') && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium mb-2 block">
                    Catatan {actionType === 'reject' && <span className="text-destructive">*</span>}
                  </label>
                  <Textarea
                    placeholder={actionType === 'reject' ? 'Masukkan alasan penolakan...' : 'Catatan (opsional)'}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          {(actionType === 'approve' || actionType === 'reject') && (
            <DialogFooter>
              <Button variant="ghost" onClick={() => { setSelectedId(null); setActionType(null); }}>
                Batal
              </Button>
              <Button
                variant={actionType === 'approve' ? 'success' : 'destructive'}
                onClick={handleConfirm}
              >
                {actionType === 'approve' ? 'Setujui' : 'Tolak'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

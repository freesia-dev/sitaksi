import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTaksasi } from '@/context/TaksasiContext';
import { PageHeader } from '@/components/shared/PageHeader';
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
import { formatCurrency, formatDate, DetailAgunanKendaraan } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Eye, 
  Pencil, 
  Trash2, 
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Filter
} from 'lucide-react';
import { StatusToggle } from '@/components/shared/StatusToggle';

type SortField = 'tanggal' | 'nama_nasabah' | 'nilai_taksasi';
type SortOrder = 'asc' | 'desc';

export default function TaksasiKendaraanList() {
  const { user } = useAuth();
  const { taksasiList, deleteTaksasi } = useTaksasi();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('tanggal');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const isAdmin = user?.role === 'Admin';
  const isDemo = user?.role === 'Demo';

  // Filter only Kendaraan type
  const kendaraanList = useMemo(() => {
    let filtered = taksasiList.filter(t => t.jenis_agunan === 'Kendaraan');
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(t => {
        const detail = t.detail_agunan as DetailAgunanKendaraan;
        return t.nama_nasabah.toLowerCase().includes(search) ||
          t.nomor_dokumen.toLowerCase().includes(search) ||
          (detail?.merk?.toLowerCase().includes(search)) ||
          (detail?.model?.toLowerCase().includes(search)) ||
          (detail?.nomor_polisi?.toLowerCase().includes(search));
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'tanggal':
          comparison = new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
          break;
        case 'nama_nasabah':
          comparison = a.nama_nasabah.localeCompare(b.nama_nasabah);
          break;
        case 'nilai_taksasi':
          comparison = a.nilai_taksasi - b.nilai_taksasi;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [taksasiList, searchTerm, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = (id: string) => {
    deleteTaksasi(id);
    toast({
      title: 'Berhasil dihapus',
      description: 'Data taksasi telah dihapus',
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
    return sortOrder === 'asc' ? 
      <SortAsc size={14} className="ml-1" /> : 
      <SortDesc size={14} className="ml-1" />;
  };

  const getKendaraanInfo = (detail: DetailAgunanKendaraan) => {
    return `${detail.merk || ''} ${detail.model || ''} (${detail.tahun || '-'})`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Taksasi Kendaraan"
        description="Daftar penilaian agunan berupa kendaraan"
        actions={
          !isDemo && (
            <Button onClick={() => navigate('/taksasi/kendaraan/new')}>
              <Plus className="mr-2" size={16} />
              Tambah Taksasi
            </Button>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Cari nama, nomor polisi, merk, atau model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
          <SelectTrigger className="w-[180px]">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tanggal">Tanggal</SelectItem>
            <SelectItem value="nama_nasabah">Nama Nasabah</SelectItem>
            <SelectItem value="nilai_taksasi">Nilai Taksasi</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('tanggal')}
              >
                <div className="flex items-center">
                  Tanggal
                  <SortIcon field="tanggal" />
                </div>
              </TableHead>
              <TableHead>No. Dokumen</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('nama_nasabah')}
              >
                <div className="flex items-center">
                  Nama Nasabah
                  <SortIcon field="nama_nasabah" />
                </div>
              </TableHead>
              <TableHead>Kendaraan</TableHead>
              <TableHead>No. Polisi</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-right"
                onClick={() => handleSort('nilai_taksasi')}
              >
                <div className="flex items-center justify-end">
                  Nilai Taksasi
                  <SortIcon field="nilai_taksasi" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kendaraanList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Tidak ada hasil yang ditemukan' : 'Belum ada data taksasi kendaraan'}
                </TableCell>
              </TableRow>
            ) : (
              kendaraanList.map((taksasi, index) => {
                const detail = taksasi.detail_agunan as DetailAgunanKendaraan;
                return (
                  <TableRow key={taksasi.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{formatDate(taksasi.tanggal)}</TableCell>
                    <TableCell className="font-mono text-xs">{taksasi.nomor_dokumen}</TableCell>
                    <TableCell className="font-medium">{taksasi.nama_nasabah}</TableCell>
                    <TableCell>{getKendaraanInfo(detail)}</TableCell>
                    <TableCell className="font-mono">{detail?.nomor_polisi || '-'}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {formatCurrency(taksasi.nilai_taksasi)}
                    </TableCell>
                    <TableCell>
                      <StatusToggle 
                        taksasiId={taksasi.id} 
                        currentStatus={taksasi.status || 'draft'} 
                        disabled={isDemo}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/taksasi/${taksasi.id}`)}
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </Button>
                        {!isDemo && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/taksasi/kendaraan/edit/${taksasi.id}`)}
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </Button>
                        )}
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Taksasi?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tindakan ini tidak dapat dibatalkan. Data taksasi {taksasi.nama_nasabah} akan dihapus permanen.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(taksasi.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {kendaraanList.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Menampilkan {kendaraanList.length} data taksasi kendaraan
        </div>
      )}
    </div>
  );
}

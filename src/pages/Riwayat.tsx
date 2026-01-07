import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { formatCurrency, formatDate } from '@/types';
import { Search, Filter, Eye, Download, Edit } from 'lucide-react';

export default function Riwayat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { taksasiList, getTaksasiByUser } = useTaksasi();

  const isPimpinan = user?.role === 'Pimpinan';
  const displayList = isPimpinan ? taksasiList : getTaksasiByUser(user?.id || '');

  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredList = displayList.filter(t => {
    const matchSearch = t.nama_nasabah.toLowerCase().includes(search.toLowerCase()) ||
      t.alamat.toLowerCase().includes(search.toLowerCase());
    const matchJenis = filterJenis === 'all' || t.jenis_agunan === filterJenis;
    const matchStatus = filterStatus === 'all' || t.status_otorisasi === filterStatus;
    return matchSearch && matchJenis && matchStatus;
  });

  const handleEdit = (taksasi: typeof taksasiList[0]) => {
    // Navigate to edit page based on jenis_agunan
    if (taksasi.jenis_agunan === 'Tanah') {
      navigate(`/taksasi/tanah/edit/${taksasi.id}`);
    } else if (taksasi.jenis_agunan === 'Tanah & Bangunan') {
      navigate(`/taksasi/tanah-bangunan/edit/${taksasi.id}`);
    } else if (taksasi.jenis_agunan === 'Kendaraan') {
      navigate(`/taksasi/kendaraan/edit/${taksasi.id}`);
    }
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
              <TableHead>No. Dokumen</TableHead>
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
                <TableCell className="text-xs">{taksasi.nomor_dokumen}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{taksasi.nama_nasabah}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{taksasi.alamat}</p>
                  </div>
                </TableCell>
                <TableCell>{taksasi.jenis_agunan}</TableCell>
                <TableCell className="font-medium">{formatCurrency(taksasi.nilai_taksasi_pembulatan)}</TableCell>
                <TableCell className="text-success font-medium">{formatCurrency(taksasi.nilai_likuidasi_pembulatan)}</TableCell>
                <TableCell>
                  <StatusBadge status={taksasi.status_otorisasi} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    {taksasi.status_otorisasi === 'Menunggu' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(taksasi)}
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/taksasi/${taksasi.id}`)}
                    >
                      <Eye size={16} className="mr-1" />
                      Lihat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/taksasi/${taksasi.id}`)}
                    >
                      <Download size={16} className="mr-1" />
                      Export
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredList.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  Tidak ada data taksasi yang ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

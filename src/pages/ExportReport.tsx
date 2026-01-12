import React, { useState, useMemo } from 'react';
import { useTaksasi } from '@/context/TaksasiContext';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency, formatDate, Taksasi } from '@/types';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Building2, 
  Car, 
  MapPin,
  Filter,
  CheckCircle2,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react';
import { toast } from 'sonner';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { cn } from '@/lib/utils';

interface ExportReportProps {
  embedded?: boolean;
}

export default function ExportReport({ embedded = false }: ExportReportProps) {
  const { taksasiList } = useTaksasi();
  const { user } = useAuth();

  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterJenis, setFilterJenis] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCabang, setFilterCabang] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Get unique cabang list
  const cabangList = useMemo(() => {
    const unique = [...new Set(taksasiList.map(t => t.kantor_cabang).filter(Boolean))];
    return unique.sort();
  }, [taksasiList]);

  // Filter data
  const filteredList = useMemo(() => {
    return taksasiList.filter(t => {
      const matchDate = (!dateFrom || new Date(t.tanggal) >= new Date(dateFrom)) &&
                       (!dateTo || new Date(t.tanggal) <= new Date(dateTo));
      const matchJenis = filterJenis === 'all' || t.jenis_agunan === filterJenis;
      const matchStatus = filterStatus === 'all' || t.status === filterStatus;
      const matchCabang = filterCabang === 'all' || t.kantor_cabang === filterCabang;
      return matchDate && matchJenis && matchStatus && matchCabang;
    });
  }, [taksasiList, dateFrom, dateTo, filterJenis, filterStatus, filterCabang]);

  // Calculate summary
  const summary = useMemo(() => {
    const data = selectedIds.length > 0 
      ? filteredList.filter(t => selectedIds.includes(t.id))
      : filteredList;
    
    return {
      total: data.length,
      totalTaksasi: data.reduce((acc, t) => acc + (t.nilai_taksasi_pembulatan || 0), 0),
      totalLikuidasi: data.reduce((acc, t) => acc + (t.nilai_likuidasi_pembulatan || 0), 0),
      byJenis: {
        tanah: data.filter(t => t.jenis_agunan === 'Tanah').length,
        tanahBangunan: data.filter(t => t.jenis_agunan === 'Tanah & Bangunan').length,
        kendaraan: data.filter(t => t.jenis_agunan === 'Kendaraan').length,
      },
      byStatus: {
        selesai: data.filter(t => t.status === 'selesai').length,
        draft: data.filter(t => t.status === 'draft').length,
      }
    };
  }, [filteredList, selectedIds]);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredList.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle individual select
  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  // Export handlers
  const handleExportExcel = () => {
    const dataToExport = selectedIds.length > 0 
      ? filteredList.filter(t => selectedIds.includes(t.id))
      : filteredList;

    if (dataToExport.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    try {
      const filename = exportToExcel(dataToExport, {
        title: 'Laporan Rekap Taksasi Agunan',
        dateRange: dateFrom && dateTo ? { start: dateFrom, end: dateTo } : undefined,
      });
      toast.success(`File ${filename} berhasil diunduh`);
    } catch (error) {
      console.error('Export Excel error:', error);
      toast.error('Gagal mengeksport ke Excel');
    }
  };

  const handleExportPDF = () => {
    const dataToExport = selectedIds.length > 0 
      ? filteredList.filter(t => selectedIds.includes(t.id))
      : filteredList;

    if (dataToExport.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    try {
      const filename = exportToPDF(dataToExport, {
        title: 'Laporan Rekap Taksasi Agunan',
        dateRange: dateFrom && dateTo ? { start: dateFrom, end: dateTo } : undefined,
      });
      toast.success(`File ${filename} berhasil diunduh`);
    } catch (error) {
      console.error('Export PDF error:', error);
      toast.error('Gagal mengeksport ke PDF');
    }
  };

  // Reset filters
  const resetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setFilterJenis('all');
    setFilterStatus('all');
    setFilterCabang('all');
    setSelectedIds([]);
  };

  // Quick date presets
  const setDatePreset = (preset: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const now = new Date();
    const from = new Date();
    
    switch (preset) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        break;
      case 'week':
        from.setDate(now.getDate() - 7);
        break;
      case 'month':
        from.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        from.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        from.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(now.toISOString().split('T')[0]);
  };

  return (
    <div className={cn("space-y-6", embedded && "pt-2")}>
      {!embedded && (
        <PageHeader
          title="Export Laporan"
          description="Export data taksasi dalam format Excel atau PDF untuk laporan bulanan"
        />
      )}

      <Tabs defaultValue="filter" className="space-y-6">
        <TabsList className={cn("grid w-full grid-cols-2", !embedded && "max-w-md")}>
          <TabsTrigger value="filter" className="flex items-center gap-2">
            <Filter size={16} />
            Filter & Export
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Preview Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="filter" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Data</p>
                    <p className="text-2xl font-bold text-primary">{summary.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nilai Taksasi</p>
                    <p className="text-lg font-bold text-accent">{formatCurrency(summary.totalTaksasi)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nilai Likuidasi</p>
                    <p className="text-lg font-bold text-success">{formatCurrency(summary.totalLikuidasi)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <PieChart className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Terpilih</p>
                    <p className="text-2xl font-bold text-warning">{selectedIds.length || summary.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Data
              </CardTitle>
              <CardDescription>
                Filter data berdasarkan tanggal, jenis agunan, status, dan kantor cabang
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Date Presets */}
              <div className="space-y-2">
                <Label>Preset Periode</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setDatePreset('today')}>
                    Hari Ini
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDatePreset('week')}>
                    7 Hari Terakhir
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDatePreset('month')}>
                    1 Bulan Terakhir
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDatePreset('quarter')}>
                    3 Bulan Terakhir
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDatePreset('year')}>
                    1 Tahun Terakhir
                  </Button>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">Dari Tanggal</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">Sampai Tanggal</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              {/* Other Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Jenis Agunan</Label>
                  <Select value={filterJenis} onValueChange={setFilterJenis}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenis</SelectItem>
                      <SelectItem value="Tanah">Tanah</SelectItem>
                      <SelectItem value="Tanah & Bangunan">Tanah & Bangunan</SelectItem>
                      <SelectItem value="Kendaraan">Kendaraan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kantor Cabang</Label>
                  <Select value={filterCabang} onValueChange={setFilterCabang}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Cabang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Cabang</SelectItem>
                      {cabangList.map(cabang => (
                        <SelectItem key={cabang} value={cabang || 'unknown'}>
                          {cabang || 'Tidak diketahui'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="ghost" onClick={resetFilters}>
                  Reset Filter
                </Button>
                <p className="text-sm text-muted-foreground">
                  {filteredList.length} data ditemukan
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown by Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                    <MapPin className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tanah</p>
                    <p className="text-2xl font-bold">{summary.byJenis.tanah}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tanah & Bangunan</p>
                    <p className="text-2xl font-bold">{summary.byJenis.tanahBangunan}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                    <Car className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kendaraan</p>
                    <p className="text-2xl font-bold">{summary.byJenis.kendaraan}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Buttons */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Data
              </CardTitle>
              <CardDescription>
                Pilih format export untuk mengunduh laporan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleExportExcel}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <FileSpreadsheet className="mr-2 h-5 w-5" />
                  Export ke Excel (.xlsx)
                </Button>
                <Button 
                  onClick={handleExportPDF}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Export ke PDF
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                {selectedIds.length > 0 
                  ? `${selectedIds.length} data terpilih akan diekspor`
                  : `Semua ${filteredList.length} data akan diekspor`}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preview Data Export</CardTitle>
                  <CardDescription>
                    Pilih data yang ingin diekspor dengan mencentang checkbox
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExportExcel}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExportPDF}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>No. Dokumen</TableHead>
                      <TableHead>Nasabah</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead className="text-right">Nilai Taksasi</TableHead>
                      <TableHead className="text-right">Nilai Likuidasi</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredList.slice(0, 50).map((taksasi) => (
                      <TableRow 
                        key={taksasi.id}
                        className={selectedIds.includes(taksasi.id) ? 'bg-primary/5' : ''}
                      >
                        <TableCell>
                          <Checkbox 
                            checked={selectedIds.includes(taksasi.id)}
                            onCheckedChange={(checked) => handleSelect(taksasi.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(taksasi.tanggal)}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {taksasi.nomor_dokumen}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{taksasi.nama_nasabah}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {taksasi.kantor_cabang}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {taksasi.jenis_agunan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(taksasi.nilai_taksasi_pembulatan)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-success">
                          {formatCurrency(taksasi.nilai_likuidasi_pembulatan)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={taksasi.status === 'selesai' ? 'default' : 'secondary'}
                            className={taksasi.status === 'selesai' 
                              ? 'bg-success/10 text-success border-success/20' 
                              : ''}
                          >
                            {taksasi.status === 'selesai' ? (
                              <><CheckCircle2 className="mr-1 h-3 w-3" /> Selesai</>
                            ) : (
                              <><Clock className="mr-1 h-3 w-3" /> Draft</>
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredList.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                          Tidak ada data yang sesuai dengan filter
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredList.length > 50 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Menampilkan 50 dari {filteredList.length} data. Export akan menyertakan semua data.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

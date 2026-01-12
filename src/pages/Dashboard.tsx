import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTaksasi } from '@/context/TaksasiContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StorageMonitor } from '@/components/shared/StorageMonitor';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  FileText,
  Home,
  Building2,
  Car,
  ArrowRight,
  Wallet,
  Mail,
  Loader2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const { taksasiList, getTaksasiByUser } = useTaksasi();

  const isPimpinan = user?.role === 'Pimpinan';
  const isDemo = user?.role === 'Demo';
  const isAdmin = user?.role === 'Admin';
  const isOfficerOrAdmin = user?.role === 'Officer' || user?.role === 'Admin';

  const [isSendingReport, setIsSendingReport] = useState(false);

  // Data based on role
  const displayList = isPimpinan ? taksasiList : getTaksasiByUser(user?.id || '');
  const totalNilai = displayList.reduce((acc, t) => acc + t.nilai_taksasi, 0);
  const totalLikuidasi = displayList.reduce((acc, t) => acc + t.nilai_likuidasi, 0);

  // Chart data
  const pieData = [
    { name: 'Tanah', value: displayList.filter(t => t.jenis_agunan === 'Tanah').length, color: 'hsl(175, 65%, 40%)' },
    { name: 'Tanah & Bangunan', value: displayList.filter(t => t.jenis_agunan === 'Tanah & Bangunan').length, color: 'hsl(215, 75%, 25%)' },
    { name: 'Kendaraan', value: displayList.filter(t => t.jenis_agunan === 'Kendaraan').length, color: 'hsl(40, 95%, 50%)' },
  ].filter(d => d.value > 0);

  const recentTaksasi = displayList.slice(0, 5);

  // Send monthly report handler
  const handleSendMonthlyReport = async () => {
    setIsSendingReport(true);
    try {
      // Get last month's date range
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0);

      const { data, error } = await supabase.functions.invoke('send-monthly-report', {
        body: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Laporan berhasil dikirim ke ${data.recipientCount} admin!`);
      } else {
        toast.error(data?.message || 'Gagal mengirim laporan');
      }
    } catch (error: any) {
      console.error('Error sending report:', error);
      toast.error(error.message || 'Gagal mengirim laporan bulanan');
    } finally {
      setIsSendingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Selamat Datang, ${user?.nama}`}
        description="Dashboard Sistem Taksasi Agunan"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Taksasi"
          value={displayList.length}
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="Tanah"
          value={displayList.filter(t => t.jenis_agunan === 'Tanah').length}
          icon={Home}
          variant="success"
        />
        <StatCard
          title="Tanah & Bangunan"
          value={displayList.filter(t => t.jenis_agunan === 'Tanah & Bangunan').length}
          icon={Building2}
        />
        <StatCard
          title="Kendaraan"
          value={displayList.filter(t => t.jenis_agunan === 'Kendaraan').length}
          icon={Car}
          variant="accent"
        />
        <StatCard
          title="Total Nilai Taksasi"
          value={formatCurrency(totalNilai)}
          icon={Wallet}
          variant="warning"
        />
      </div>

      {/* Storage Monitor & Report Button for Admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StorageMonitor />
          <div className="p-5 rounded-xl border bg-card shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Laporan Bulanan</h3>
                <p className="text-sm text-muted-foreground">Kirim rekap taksasi via email</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Kirim laporan rekap taksasi bulan lalu ke semua email admin yang terdaftar.
            </p>
            <Button 
              onClick={handleSendMonthlyReport} 
              disabled={isSendingReport}
              className="w-full"
            >
              {isSendingReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Kirim Laporan Bulan Lalu
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Quick Actions for Officer - hidden for Demo */}
      {isOfficerOrAdmin && !isDemo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/taksasi/tanah/new" className="group">
            <div className="p-5 rounded-xl border bg-card shadow-card hover:shadow-elevated transition-all duration-200 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10 text-success group-hover:scale-110 transition-transform">
                <Home size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Taksasi Tanah</h3>
                <p className="text-sm text-muted-foreground">Buat penilaian baru</p>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link to="/taksasi/tanah-bangunan/new" className="group">
            <div className="p-5 rounded-xl border bg-card shadow-card hover:shadow-elevated transition-all duration-200 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Building2 size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Taksasi Tanah & Bangunan</h3>
                <p className="text-sm text-muted-foreground">Buat penilaian baru</p>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link to="/taksasi/kendaraan/new" className="group">
            <div className="p-5 rounded-xl border bg-card shadow-card hover:shadow-elevated transition-all duration-200 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10 text-warning group-hover:scale-110 transition-transform">
                <Car size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Taksasi Kendaraan</h3>
                <p className="text-sm text-muted-foreground">Buat penilaian baru</p>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      )}

      {/* Charts Section - for Pimpinan */}
      {isPimpinan && pieData.length > 0 && (
        <div className="p-5 rounded-xl border bg-card shadow-card">
          <h3 className="font-semibold mb-4">Distribusi Jenis Agunan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Taksasi Table */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="font-semibold">Taksasi Terbaru</h3>
          <Link to="/riwayat">
            <Button variant="ghost" size="sm">
              Lihat Semua <ArrowRight className="ml-1" size={16} />
            </Button>
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nasabah</TableHead>
              <TableHead>Jenis Agunan</TableHead>
              <TableHead>Nilai Taksasi</TableHead>
              <TableHead>Nilai Likuidasi</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTaksasi.map((taksasi) => (
              <TableRow key={taksasi.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">{taksasi.nama_nasabah}</TableCell>
                <TableCell>{taksasi.jenis_agunan}</TableCell>
                <TableCell>{formatCurrency(taksasi.nilai_taksasi)}</TableCell>
                <TableCell className="text-success font-medium">{formatCurrency(taksasi.nilai_likuidasi)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(taksasi.tanggal)}</TableCell>
              </TableRow>
            ))}
            {recentTaksasi.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Belum ada data taksasi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

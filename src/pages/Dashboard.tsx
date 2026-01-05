import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTaksasi } from '@/context/TaksasiContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/types';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Home,
  Building2,
  Car,
  ArrowRight,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const { taksasiList, getTaksasiByUser, getTaksasiByStatus } = useTaksasi();

  const isPimpinan = user?.role === 'Pimpinan';
  const isOfficerOrAdmin = user?.role === 'Officer' || user?.role === 'Admin';

  // Data based on role
  const displayList = isPimpinan ? taksasiList : getTaksasiByUser(user?.id || '');
  const pendingCount = displayList.filter(t => t.status_otorisasi === 'Menunggu').length;
  const approvedCount = displayList.filter(t => t.status_otorisasi === 'Disetujui').length;
  const rejectedCount = displayList.filter(t => t.status_otorisasi === 'Ditolak').length;
  const totalNilai = displayList.reduce((acc, t) => acc + t.nilai_taksasi, 0);

  // Chart data
  const pieData = [
    { name: 'Tanah', value: displayList.filter(t => t.jenis_agunan === 'Tanah').length, color: 'hsl(175, 65%, 40%)' },
    { name: 'Tanah & Bangunan', value: displayList.filter(t => t.jenis_agunan === 'Tanah & Bangunan').length, color: 'hsl(215, 75%, 25%)' },
    { name: 'Kendaraan', value: displayList.filter(t => t.jenis_agunan === 'Kendaraan').length, color: 'hsl(40, 95%, 50%)' },
  ].filter(d => d.value > 0);

  const barData = [
    { status: 'Menunggu', count: pendingCount },
    { status: 'Disetujui', count: approvedCount },
    { status: 'Ditolak', count: rejectedCount },
  ];

  const recentTaksasi = displayList.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Selamat Datang, ${user?.nama}`}
        description={isPimpinan ? 'Dashboard Otorisasi Taksasi Agunan' : 'Dashboard Officer Taksasi Agunan'}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Taksasi"
          value={displayList.length}
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="Menunggu Otorisasi"
          value={pendingCount}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Disetujui"
          value={approvedCount}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Total Nilai Taksasi"
          value={formatCurrency(totalNilai)}
          icon={Wallet}
        />
      </div>

      {/* Quick Actions for Officer */}
      {isOfficerOrAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/taksasi/tanah" className="group">
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
          <Link to="/taksasi/tanah-bangunan" className="group">
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
          <Link to="/taksasi/kendaraan" className="group">
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
      {isPimpinan && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 rounded-xl border bg-card shadow-card">
            <h3 className="font-semibold mb-4">Status Otorisasi</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="status" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Taksasi Table */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="font-semibold">
            {isPimpinan ? 'Taksasi Menunggu Otorisasi' : 'Taksasi Terbaru'}
          </h3>
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
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isPimpinan ? getTaksasiByStatus('Menunggu').slice(0, 5) : recentTaksasi).map((taksasi) => (
              <TableRow key={taksasi.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">{taksasi.nama_nasabah}</TableCell>
                <TableCell>{taksasi.jenis_agunan}</TableCell>
                <TableCell>{formatCurrency(taksasi.nilai_taksasi)}</TableCell>
                <TableCell>
                  <StatusBadge status={taksasi.status_otorisasi} />
                </TableCell>
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

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ClipboardCheck, AlertTriangle, CalendarCheck, Wallet } from 'lucide-react';
import { formatCurrency } from '@/types';
import { KATEGORI_LABEL, KategoriKunjungan, MonitoringKunjungan } from '@/types/monitoring';

const COLORS: Record<KategoriKunjungan, string> = {
  prospek: '#3b82f6',
  aktif: '#10b981',
  menunggak: '#ef4444',
  restrukturisasi: '#f59e0b',
};

export default function MonitoringDashboard() {
  const [items, setItems] = useState<MonitoringKunjungan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('monitoring_kunjungan').select('*');
      setItems((data || []) as MonitoringKunjungan[]);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = items.filter(i => {
      const d = new Date(i.tanggal_kunjungan);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const menunggak = items.filter(i => i.kategori === 'menunggak');
    const komitmen = items.reduce((acc, i) => acc + Number(i.komitmen_bayar_nominal || 0), 0);
    return {
      total: items.length,
      thisMonth: thisMonth.length,
      menunggak: menunggak.length,
      komitmen,
    };
  }, [items]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(k, 0);
    }
    items.forEach(i => {
      const d = new Date(i.tanggal_kunjungan);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (map.has(k)) map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).map(([k, v]) => ({ bulan: k.slice(5), total: v }));
  }, [items]);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(i => { counts[i.kategori] = (counts[i.kategori] || 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({ name: KATEGORI_LABEL[k as KategoriKunjungan], value: v, kategori: k as KategoriKunjungan }));
  }, [items]);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Monitoring" description="Statistik kunjungan debitur" />

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Memuat...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Kunjungan" value={String(stats.total)} icon={ClipboardCheck} />
            <StatCard title="Bulan Ini" value={String(stats.thisMonth)} icon={CalendarCheck} />
            <StatCard title="Debitur Menunggak" value={String(stats.menunggak)} icon={AlertTriangle} />
            <StatCard title="Komitmen Bayar" value={formatCurrency(stats.komitmen)} icon={Wallet} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold mb-4">Kunjungan per Bulan (12 bulan)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="bulan" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold mb-4">Distribusi Kategori</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {pieData.map((d, i) => <Cell key={i} fill={COLORS[d.kategori]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
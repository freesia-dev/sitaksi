import React, { useState, useEffect } from 'react';
import { getStorageStats, StorageStats } from '@/lib/storage';
import { Progress } from '@/components/ui/progress';
import { HardDrive, RefreshCw, FileImage, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function StorageMonitor() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStorageStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load storage stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="p-5 rounded-xl border bg-card shadow-card">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <HardDrive className="text-primary animate-pulse" size={24} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Cloud Storage</p>
            <p className="text-sm text-muted-foreground">Memuat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-xl border bg-card shadow-card">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-destructive/10">
            <AlertTriangle className="text-destructive" size={24} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Cloud Storage</p>
            <p className="text-sm text-destructive">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchStats}>
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>
    );
  }

  const percentage = stats?.percentage || 0;
  const isWarning = percentage > 80;
  const isCritical = percentage > 95;

  return (
    <div className="p-5 rounded-xl border bg-card shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-lg",
            isCritical ? "bg-destructive/10" : isWarning ? "bg-warning/10" : "bg-primary/10"
          )}>
            <HardDrive className={cn(
              isCritical ? "text-destructive" : isWarning ? "text-warning" : "text-primary"
            )} size={24} />
          </div>
          <div>
            <p className="font-semibold">Cloud Storage</p>
            <p className="text-sm text-muted-foreground">Kapasitas dokumentasi foto</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchStats}
          disabled={loading}
        >
          <RefreshCw size={16} className={cn(loading && "animate-spin")} />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Penggunaan</span>
          <span className={cn(
            "font-semibold",
            isCritical ? "text-destructive" : isWarning ? "text-warning" : "text-foreground"
          )}>
            {stats?.used_mb.toFixed(1)} MB / {stats?.total_mb} MB
          </span>
        </div>
        
        <Progress 
          value={percentage} 
          className={cn(
            "h-2",
            isCritical && "[&>div]:bg-destructive",
            isWarning && !isCritical && "[&>div]:bg-warning"
          )} 
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{percentage.toFixed(1)}% terpakai</span>
          <span>{((stats?.total_mb || 1024) - (stats?.used_mb || 0)).toFixed(1)} MB tersisa</span>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t">
          <div className="flex items-center gap-2 text-xs">
            <FileImage size={14} className="text-muted-foreground" />
            <span>{stats?.total_files || 0} file total</span>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="text-warning">{stats?.draft_files || 0} draft</span>
            {' / '}
            <span className="text-success">{stats?.selesai_files || 0} selesai</span>
          </div>
        </div>

        {isCritical && (
          <div className="p-2 rounded bg-destructive/10 text-xs text-destructive">
            ⚠️ Storage hampir penuh! Foto dari taksasi "selesai" terlama akan otomatis dihapus saat upload baru.
          </div>
        )}
      </div>
    </div>
  );
}

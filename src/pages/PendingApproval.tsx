import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import logoSitaksi from '@/assets/logo-sitaksi-fix.png';

export default function PendingApproval() {
  const { user, logout } = useAuth();
  
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoSitaksi} alt="SITAKSI" className="h-12" />
          </div>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-warning/10">
              <Clock className="h-12 w-12 text-warning" />
            </div>
          </div>
          <CardTitle className="text-xl">Menunggu Persetujuan</CardTitle>
          <CardDescription className="text-base">
            Akun Anda sedang menunggu persetujuan dari Admin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Nama:</span>{' '}
              <span className="font-medium">{user?.nama}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Email:</span>{' '}
              <span className="font-medium">{user?.email}</span>
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Silakan hubungi Admin untuk mempercepat proses verifikasi akun Anda.
            Setelah disetujui, Anda dapat mengakses semua fitur aplikasi.
          </p>

          <div className="flex flex-col gap-2">
            <Button onClick={handleRefresh} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
            <Button onClick={logout} variant="ghost" className="w-full text-destructive hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

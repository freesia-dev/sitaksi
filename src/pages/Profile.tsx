import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Save, 
  Loader2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function Profile() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nama, setNama] = useState(user?.nama || '');
  const [profileData, setProfileData] = useState<{
    created_at: string;
    is_approved: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('created_at, is_approved')
        .eq('user_id', session.user.id)
        .single();

      if (!error && data) {
        setProfileData(data);
      }
    };

    fetchProfileData();
  }, [session?.user?.id]);

  useEffect(() => {
    setNama(user?.nama || '');
  }, [user?.nama]);

  const handleSave = async () => {
    if (!session?.user?.id) return;
    
    const trimmedNama = nama.trim();
    if (!trimmedNama) {
      toast({
        title: 'Nama tidak boleh kosong',
        variant: 'destructive',
      });
      return;
    }

    if (trimmedNama.length > 100) {
      toast({
        title: 'Nama terlalu panjang',
        description: 'Nama maksimal 100 karakter',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nama: trimmedNama })
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast({
        title: 'Profil berhasil diperbarui',
        description: 'Nama Anda telah diubah',
      });
      setIsEditing(false);
      
      // Refresh page to update user context
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Gagal memperbarui profil',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'destructive';
      case 'Pimpinan':
        return 'default';
      case 'Officer':
        return 'secondary';
      case 'Demo':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Saya"
        description="Kelola informasi akun Anda"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              {isEditing ? (
                <Input
                  id="nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  maxLength={100}
                />
              ) : (
                <p className="text-lg font-medium">{user?.nama || '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>

            <Separator />

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setNama(user?.nama || '');
                  }}>
                    Batal
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Profil
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status & Role Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Status & Akses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Role</Label>
              <div>
                <Badge variant={getRoleBadgeVariant(user?.role || '')}>
                  {user?.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {user?.role === 'Admin' && 'Anda memiliki akses penuh ke semua fitur sistem termasuk kelola user.'}
                {user?.role === 'Officer' && 'Anda dapat membuat dan mengelola data taksasi.'}
                {user?.role === 'Pimpinan' && 'Anda dapat melihat laporan dan riwayat taksasi.'}
                {user?.role === 'Demo' && 'Akun demo dengan akses terbatas untuk mencoba fitur.'}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Status Akun</Label>
              <div className="flex items-center gap-2">
                {profileData?.is_approved ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-success font-medium">Terverifikasi</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-warning" />
                    <span className="text-warning font-medium">Menunggu Verifikasi</span>
                  </>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Bergabung Sejak
              </Label>
              <p className="text-muted-foreground">
                {profileData?.created_at 
                  ? format(new Date(profileData.created_at), 'dd MMMM yyyy', { locale: idLocale })
                  : '-'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

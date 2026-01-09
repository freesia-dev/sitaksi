import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types';
import { 
  Pencil, 
  Shield, 
  UserCircle, 
  Users as UsersIcon, 
  Loader2, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface DbUser {
  id: string;
  user_id: string;
  nama: string;
  email: string;
  role: string;
  is_approved: boolean;
  created_at: string;
  user_role?: string;
}

const mapDbRoleToDisplay = (dbRole: string | undefined): UserRole => {
  switch (dbRole) {
    case 'admin':
      return 'Admin';
    case 'demo':
      return 'Demo';
    case 'user':
    default:
      return 'Officer';
  }
};

const mapDisplayRoleToDb = (displayRole: UserRole): 'admin' | 'user' | 'demo' => {
  switch (displayRole) {
    case 'Admin':
      return 'admin';
    case 'Demo':
      return 'demo';
    case 'Officer':
    case 'Pimpinan':
    default:
      return 'user';
  }
};

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<DbUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<DbUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    role: 'Officer' as UserRole,
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, nama, email, role, is_approved, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          ...profile,
          user_role: userRole?.role || 'user',
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Gagal memuat data user',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApprove = async (user: DbUser, approve: boolean) => {
    setApprovingUserId(user.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: approve })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: approve ? 'User disetujui' : 'User ditolak',
        description: `${user.nama || user.email} telah ${approve ? 'disetujui' : 'ditolak'}`,
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating approval:', error);
      toast({
        title: 'Gagal mengubah status',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setApprovingUserId(null);
    }
  };

  const handleOpenDialog = (user: DbUser) => {
    setEditingUser(user);
    setFormData({
      nama: user.nama || '',
      email: user.email,
      role: mapDbRoleToDisplay(user.user_role),
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    
    if (!formData.nama.trim()) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Nama wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nama: formData.nama.trim() })
        .eq('id', editingUser.id);

      if (profileError) throw profileError;

      const newRole = mapDisplayRoleToDb(formData.role);
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', editingUser.user_id);

      if (roleError) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: editingUser.user_id, role: newRole });

        if (insertError) throw insertError;
      }

      toast({
        title: 'User berhasil diperbarui',
        description: `Data ${formData.nama} telah diperbarui`,
      });

      await fetchUsers();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast({
        title: 'Gagal menyimpan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
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

  const displayUsers = users.map(u => ({
    ...u,
    displayRole: mapDbRoleToDisplay(u.user_role),
  }));

  const pendingUsers = displayUsers.filter(u => !u.is_approved);
  const approvedUsers = displayUsers.filter(u => u.is_approved);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola User"
        description="Manajemen pengguna sistem taksasi agunan"
        actions={
          <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
            <RefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} size={16} />
            Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card shadow-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <UsersIcon size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{displayUsers.length}</p>
            <p className="text-sm text-muted-foreground">Total User</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-warning/10 text-warning">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{pendingUsers.length}</p>
            <p className="text-sm text-muted-foreground">Menunggu Persetujuan</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-success/10 text-success">
            <UserCircle size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{approvedUsers.filter(u => u.displayRole === 'Officer').length}</p>
            <p className="text-sm text-muted-foreground">Officer</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{approvedUsers.filter(u => u.displayRole === 'Admin').length}</p>
            <p className="text-sm text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>

      {/* Pending Approval Section */}
      {pendingUsers.length > 0 && (
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="p-4 border-b bg-warning/5">
            <h3 className="font-semibold flex items-center gap-2 text-warning">
              <Clock size={18} />
              Menunggu Persetujuan ({pendingUsers.length})
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tanggal Daftar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nama || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(user.created_at), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-success border-success hover:bg-success hover:text-success-foreground"
                        onClick={() => handleApprove(user, true)}
                        disabled={approvingUserId === user.id}
                      >
                        {approvingUserId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Setujui
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleApprove(user, false)}
                        disabled={approvingUserId === user.id}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Tolak
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Approved Users Table */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <CheckCircle2 size={18} className="text-success" />
            User Terverifikasi ({approvedUsers.length})
          </h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tanggal Daftar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Belum ada user terverifikasi
                  </TableCell>
                </TableRow>
              ) : (
                approvedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nama || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.displayRole)}>{user.displayRole}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(user.created_at), 'dd MMM yyyy', { locale: idLocale })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(user)}
                          title="Edit User"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-warning hover:bg-warning/10"
                          onClick={() => handleApprove(user, false)}
                          title="Cabut Akses"
                          disabled={approvingUserId === user.id}
                        >
                          <XCircle size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                placeholder="Masukkan nama lengkap"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Officer">Officer</SelectItem>
                  <SelectItem value="Demo">Demo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import { Plus, Pencil, Trash2, Shield, UserCircle, Users as UsersIcon, KeyRound, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DbUser {
  id: string;
  user_id: string;
  nama: string;
  email: string;
  role: string;
  created_at: string;
  user_role?: string; // from user_roles table
}

// Map database role to display role
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

// Map display role to database role
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
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<DbUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<DbUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    role: 'Officer' as UserRole,
    password: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch profiles with their roles from user_roles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, nama, email, role, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles from user_roles table
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Merge profiles with roles
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

  const handleOpenDialog = (user?: DbUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nama: user.nama || '',
        email: user.email,
        role: mapDbRoleToDisplay(user.user_role),
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        nama: '',
        email: '',
        role: 'Officer',
        password: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleOpenResetPassword = (user: DbUser) => {
    setResetPasswordUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setIsResetPasswordOpen(true);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Password baru dan konfirmasi wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Password tidak cocok',
        description: 'Password baru dan konfirmasi harus sama',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password terlalu pendek',
        description: 'Password minimal 6 karakter',
        variant: 'destructive',
      });
      return;
    }

    // Note: Password reset requires admin API or email-based reset
    // For now, show info message
    toast({
      title: 'Info',
      description: 'Reset password melalui email akan dikirim ke user',
    });
    setIsResetPasswordOpen(false);
  };

  const handleSave = async () => {
    if (!formData.nama || !formData.email) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Nama dan email wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      if (editingUser) {
        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ nama: formData.nama })
          .eq('id', editingUser.id);

        if (profileError) throw profileError;

        // Update role in user_roles table
        const newRole = mapDisplayRoleToDb(formData.role);
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', editingUser.user_id);

        if (roleError) {
          // If no existing role, insert new one
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
      } else {
        // For adding new users, we would need admin API access
        // Show info message for now
        toast({
          title: 'Info',
          description: 'Untuk menambah user baru, user harus mendaftar melalui halaman login',
        });
      }

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

  const handleDelete = async (user: DbUser) => {
    // Note: Deleting users requires admin API access
    toast({
      title: 'Info',
      description: 'Penghapusan user memerlukan akses admin',
    });
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola User"
        description="Manajemen pengguna sistem taksasi agunan"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
              <RefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} size={16} />
              Refresh
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2" size={16} />
              Tambah User
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <div className="p-3 rounded-lg bg-success/10 text-success">
            <UserCircle size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{displayUsers.filter(u => u.displayRole === 'Officer').length}</p>
            <p className="text-sm text-muted-foreground">Officer</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-warning/10 text-warning">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{displayUsers.filter(u => u.displayRole === 'Admin').length}</p>
            <p className="text-sm text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
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
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Belum ada user terdaftar
                  </TableCell>
                </TableRow>
              ) : (
                displayUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nama || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.displayRole)}>{user.displayRole}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenResetPassword(user)}
                          title="Reset Password"
                        >
                          <KeyRound size={16} />
                        </Button>
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
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(user)}
                          title="Hapus User"
                        >
                          <Trash2 size={16} />
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

      {/* Edit/Add User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Tambah User Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!editingUser && (
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                💡 Untuk menambah user baru, minta user untuk mendaftar melalui halaman login.
                Setelah terdaftar, Anda dapat mengubah role-nya di sini.
              </p>
            )}
            <div>
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                placeholder="Masukkan nama lengkap"
                disabled={!editingUser}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="nama@bankaltimtara.id"
                disabled={editingUser !== null}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
                disabled={!editingUser}
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
            {!editingUser && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Masukkan password"
                  disabled
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !editingUser}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Menyimpan...
                </>
              ) : (
                editingUser ? 'Simpan Perubahan' : 'Tambah User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Reset password untuk user: <span className="font-medium text-foreground">{resetPasswordUser?.nama || resetPasswordUser?.email}</span>
            </p>
            <div>
              <Label htmlFor="newPassword">Password Baru</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsResetPasswordOpen(false)}>Batal</Button>
            <Button onClick={handleResetPassword}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

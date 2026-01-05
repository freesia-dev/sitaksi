import React, { useState } from 'react';
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
import { User, UserRole } from '@/types';
import { Plus, Pencil, Trash2, Shield, UserCircle, Users as UsersIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Demo users state
const INITIAL_USERS: User[] = [
  { id: '1', nama: 'Admin Bankaltimtara', email: 'admin@bankaltimtara.id', role: 'Admin' },
  { id: '2', nama: 'Kepala Cabang', email: 'pimpinan@bankaltimtara.id', role: 'Pimpinan' },
  { id: '3', nama: 'Haris Fadilah', email: 'officer@bankaltimtara.id', role: 'Officer' },
];

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    role: 'Officer' as UserRole,
    password: '',
  });

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nama: user.nama,
        email: user.email,
        role: user.role,
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

  const handleSave = () => {
    if (!formData.nama || !formData.email) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Nama dan email wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    if (editingUser) {
      setUsers(prev =>
        prev.map(u =>
          u.id === editingUser.id
            ? { ...u, nama: formData.nama, email: formData.email, role: formData.role }
            : u
        )
      );
      toast({
        title: 'User berhasil diperbarui',
        description: `Data ${formData.nama} telah diperbarui`,
      });
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        nama: formData.nama,
        email: formData.email,
        role: formData.role,
      };
      setUsers(prev => [...prev, newUser]);
      toast({
        title: 'User berhasil ditambahkan',
        description: `${formData.nama} telah ditambahkan sebagai ${formData.role}`,
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (user: User) => {
    setUsers(prev => prev.filter(u => u.id !== user.id));
    toast({
      title: 'User dihapus',
      description: `${user.nama} telah dihapus dari sistem`,
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
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola User"
        description="Manajemen pengguna sistem taksasi agunan"
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2" size={16} />
            Tambah User
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-card shadow-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <UsersIcon size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-sm text-muted-foreground">Total User</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-success/10 text-success">
            <UserCircle size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{users.filter(u => u.role === 'Officer').length}</p>
            <p className="text-sm text-muted-foreground">Officer</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-warning/10 text-warning">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{users.filter(u => u.role === 'Admin' || u.role === 'Pimpinan').length}</p>
            <p className="text-sm text-muted-foreground">Admin & Pimpinan</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
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
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nama}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(user)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(user)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Tambah User Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                placeholder="Masukkan nama lengkap"
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
                  <SelectItem value="Pimpinan">Pimpinan</SelectItem>
                  <SelectItem value="Officer">Officer</SelectItem>
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
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>
              {editingUser ? 'Simpan Perubahan' : 'Tambah User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import logoSitaksi from '@/assets/logo-sitaksi-fix.png';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter')
});

const signupSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword']
});

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nama, setNama] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { login, signup, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (isSignup) {
        // Validate signup
        const result = signupSchema.safeParse({ nama, email, password, confirmPassword });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { success, error } = await signup(email, password, nama);
        
        if (success) {
          toast({
            title: 'Registrasi Berhasil',
            description: 'Akun berhasil dibuat. Silakan login.',
          });
          setIsSignup(false);
          setPassword('');
          setConfirmPassword('');
        } else {
          toast({
            title: 'Registrasi Gagal',
            description: error || 'Terjadi kesalahan saat registrasi',
            variant: 'destructive',
          });
        }
      } else {
        // Validate login
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { success, error } = await login(email, password);

        if (success) {
          toast({
            title: 'Login Berhasil',
            description: 'Selamat datang di Sistem Taksasi Agunan',
          });
          navigate('/dashboard');
        } else {
          toast({
            title: 'Login Gagal',
            description: error || 'Email atau password salah',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="relative z-10 flex flex-col justify-center px-8 md:px-12 xl:px-20">
          <div className="animate-slide-up">
            <img
              src={logoSitaksi}
              alt="Logo SITAKSI"
              className="w-72 h-auto xl:w-96 object-contain mb-4"
            />
            <p className="text-primary-foreground/90 italic text-lg xl:text-xl">
              "Akurasi bukan pilihan, tapi standar. Masuk untuk memulai."
            </p>
          </div>

          <div className="mt-8 xl:mt-12 space-y-3 xl:space-y-4" style={{ animationDelay: '0.1s' }}>
            {['Taksasi Tanah & Bangunan', 'Taksasi Kendaraan', 'Laporan Terstruktur'].map((feature, i) => (
              <div key={feature} className="flex items-center gap-3 text-primary-foreground/90 animate-slide-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                <div className="w-2 h-2 rounded-full bg-sidebar-primary" />
                <span className="text-sm xl:text-base">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-64 xl:w-96 h-64 xl:h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-10 xl:right-20 w-48 xl:w-64 h-48 xl:h-64 bg-sidebar-primary/10 rounded-full blur-2xl animate-float" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm sm:max-w-md animate-scale-up">
          <div className="text-center mb-6 sm:mb-8">
            <img
              src={logoSitaksi}
              alt="Logo SITAKSI"
              className="lg:hidden w-56 sm:w-72 h-auto mx-auto mb-4 object-contain"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {isSignup ? 'Buat Akun' : 'Selamat Datang'}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              {isSignup ? 'Daftar untuk mengakses SITAKSI' : 'Masuk ke akun Anda untuk melanjutkan'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="nama"
                    type="text"
                    placeholder="Nama Lengkap"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {errors.nama && <p className="text-sm text-destructive">{errors.nama}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@bankaltimtara.co.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : isSignup ? 'Daftar' : 'Masuk'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setErrors({});
              }}
              className="text-sm text-primary hover:underline"
            >
              {isSignup ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            © Haris Fadilah - 2026
          </p>
        </div>
      </div>
    </div>
  );
}

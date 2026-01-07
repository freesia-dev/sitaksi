import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import logoBankaltimtara from '@/assets/logo-bankaltimtara.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);

    if (success) {
      toast({
        title: 'Login Berhasil',
        description: 'Selamat datang di Sistem Taksasi Agunan',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Login Gagal',
        description: 'Email atau password salah',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="relative z-10 flex flex-col justify-center px-8 md:px-12 xl:px-20">
          <div className="animate-slide-up">
            <img
              src={logoBankaltimtara}
              alt="Logo Bankaltimtara"
              className="w-24 h-24 xl:w-28 xl:h-28 object-contain mb-6"
              style={{ filter: "drop-shadow(0 0 2px hsl(var(--background) / 0.9))" }}
            />
            <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold text-primary-foreground leading-tight mb-4">
              Sistem Taksasi<br />Agunan
            </h1>
            <p className="text-base xl:text-lg text-primary-foreground/80 max-w-md">
              Platform digital untuk penilaian agunan kredit yang akurat, cepat, dan terintegrasi.
            </p>
          </div>

          <div className="mt-8 xl:mt-12 space-y-3 xl:space-y-4" style={{ animationDelay: '0.1s' }}>
            {['Taksasi Tanah & Bangunan', 'Taksasi Kendaraan', 'Laporan Otomatis'].map((feature, i) => (
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
              src={logoBankaltimtara}
              alt="Logo Bankaltimtara"
              className="lg:hidden w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 object-contain"
              style={{ filter: "drop-shadow(0 0 2px hsl(var(--background) / 0.9))" }}
            />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Selamat Datang</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@bankaltimtara.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
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
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>


          <p className="text-center text-xs text-muted-foreground mt-6">
            © 2025 PT. Bank Pembangunan Daerah Kalimantan Timur dan Kalimantan Utara
          </p>
        </div>
      </div>
    </div>
  );
}

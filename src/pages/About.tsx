import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Linkedin, Instagram, Code, Building, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoBankaltimtara from '@/assets/logo-bankaltimtara.png';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Tentang Aplikasi"
        description="Informasi tentang Sistem Taksasi Agunan"
        actions={
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2" size={16} />
            Kembali
          </Button>
        }
      />

      <div className="grid gap-6">
        {/* About App */}
        <div className="rounded-xl border bg-card p-8 shadow-card animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <img 
              src={logoBankaltimtara} 
              alt="Bankaltimtara" 
              className="h-20 w-20 object-contain"
            />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Sistem Taksasi Agunan</h2>
              <p className="text-muted-foreground">PT Bank Pembangunan Daerah Kaltim Kaltara</p>
            </div>
          </div>

          <div className="space-y-4 text-muted-foreground">
            <p>
              Sistem Taksasi Agunan adalah aplikasi yang dirancang khusus untuk membantu proses 
              penilaian agunan/jaminan kredit di Bank Pembangunan Daerah Kalimantan Timur dan 
              Kalimantan Utara (Bankaltimtara).
            </p>
            
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Building className="mx-auto mb-2 text-primary" size={32} />
                <h3 className="font-semibold text-foreground">Tanah & Bangunan</h3>
                <p className="text-sm">Penilaian properti dengan analisis lengkap</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <FileText className="mx-auto mb-2 text-primary" size={32} />
                <h3 className="font-semibold text-foreground">Dokumentasi</h3>
                <p className="text-sm">Export laporan dalam format PDF/Excel</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Code className="mx-auto mb-2 text-primary" size={32} />
                <h3 className="font-semibold text-foreground">Otomatis</h3>
                <p className="text-sm">Perhitungan nilai taksasi otomatis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Info */}
        <div className="rounded-xl border bg-card p-8 shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-xl font-semibold mb-4 text-foreground">Dikembangkan Oleh</h3>
          
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-3xl font-bold">
              HF
            </div>
            <div>
              <h4 className="text-2xl font-bold text-foreground">Haris Fadilah</h4>
              <p className="text-muted-foreground mb-4">Software Developer</p>
              
              <div className="flex gap-3">
                <a 
                  href="https://www.linkedin.com/in/haris-fadilah" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0077B5] text-white hover:bg-[#006399] transition-colors"
                >
                  <Linkedin size={18} />
                  LinkedIn
                </a>
                <a 
                  href="https://www.instagram.com/harisfadilah_" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white hover:opacity-90 transition-opacity"
                >
                  <Instagram size={18} />
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Versi Aplikasi: 1.0.0</span>
            <span>© 2025 Bankaltimtara. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

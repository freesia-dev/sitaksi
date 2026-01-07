import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Linkedin, Instagram, Code, Building, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoSitaksi from '@/assets/logo-sitaksi.png';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Tentang Aplikasi"
        description="Informasi tentang SITAKSI - Sistem TAKSasi telIhan"
        actions={
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2" size={16} />
            Kembali
          </Button>
        }
      />

      <div className="grid gap-6">
        {/* About App */}
        <div className="rounded-xl border bg-card p-4 sm:p-8 shadow-card animate-slide-up">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 text-center sm:text-left">
            <img 
              src={logoSitaksi} 
              alt="SITAKSI" 
              className="h-20 w-20 sm:h-24 sm:w-24 object-contain"
            />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">SITAKSI</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Sistem TAKSasi telIhan</p>
              <p className="text-xs text-primary font-medium mt-1">Appraisal Cepat, Valid, dan Terstandar.</p>
            </div>
          </div>

          <div className="space-y-4 text-muted-foreground text-sm sm:text-base">
            <p>
              SITAKSI (SIstem TAKSasi telIhan) adalah platform digital internal yang dirancang untuk mendukung proses taksasi agunan secara cepat, akurat, dan terdokumentasi. Sistem ini membantu Officer, Pimpinan, dan Admin dalam melakukan penilaian agunan, memvalidasi data, serta menghasilkan output laporan yang terstruktur dan terstandar.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
              <div className="p-3 sm:p-4 rounded-lg bg-muted/50 text-center">
                <Building className="mx-auto mb-2 text-primary" size={28} />
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Tanah & Bangunan</h3>
                <p className="text-xs sm:text-sm">Penilaian properti dengan analisis lengkap</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-muted/50 text-center">
                <FileText className="mx-auto mb-2 text-primary" size={28} />
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Dokumentasi</h3>
                <p className="text-xs sm:text-sm">Export laporan dalam format PDF/Excel</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-muted/50 text-center">
                <Code className="mx-auto mb-2 text-primary" size={28} />
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Otomatis</h3>
                <p className="text-xs sm:text-sm">Perhitungan nilai taksasi otomatis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Info */}
        <div className="rounded-xl border bg-card p-4 sm:p-8 shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-foreground">Dikembangkan Oleh</h3>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-2xl sm:text-3xl font-bold flex-shrink-0">
              HF
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-bold text-foreground">Haris Fadilah</h4>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">Software Developer</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                <a 
                  href="https://www.linkedin.com/in/haris-fadilah" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-[#0077B5] text-white hover:bg-[#006399] transition-colors text-sm"
                >
                  <Linkedin size={16} />
                  LinkedIn
                </a>
                <a 
                  href="https://www.instagram.com/harisfadilah_" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white hover:opacity-90 transition-opacity text-sm"
                >
                  <Instagram size={16} />
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            <span>Versi Aplikasi: 1.0.0</span>
            <span>© Haris Fadilah - 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

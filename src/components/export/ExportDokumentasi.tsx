import React, { useState } from 'react';
import { 
  Taksasi, 
  DetailAgunanKendaraan, 
  formatDate 
} from '@/types';
import { ImageOff } from 'lucide-react';

interface ExportDokumentasiProps {
  taksasi: Taksasi;
  logo: string;
}

interface ImageWithFallbackProps {
  src: string;
  alt: string;
}

function ImageWithFallback({ src, alt }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  const cacheBustedSrc = attempt === 0 ? src : `${src}${src.includes('?') ? '&' : '?'}_cb=${attempt}`;

  if (hasError) {
    return (
      <div className="text-muted-foreground text-sm text-center p-4 flex flex-col items-center justify-center h-full">
        <ImageOff size={32} className="mb-2 opacity-50" />
        <p>Gagal memuat foto</p>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Memuat...</span>
        </div>
      )}
      <img 
        src={cacheBustedSrc} 
        alt={alt} 
        className="w-full h-full object-cover"
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (attempt < 1) {
            setAttempt((v) => v + 1);
            return;
          }
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </>
  );
}

export function ExportDokumentasi({ taksasi, logo }: ExportDokumentasiProps) {
  const jenisLower = taksasi.jenis_agunan.toLowerCase();
  const isKendaraan = jenisLower === 'kendaraan';
  const detail = taksasi.detail_agunan as Record<string, any>;

  // Get documentation data from detail_agunan (works for all types)
  const dokumentasiUrls: string[] = detail?.dokumentasi_urls || [];
  const savedLabels: string[] = detail?.dokumentasi_labels || [];
  
  const defaultLabels = isKendaraan
    ? ['Tampak Depan', 'Tampak Belakang', 'Tampak Samping Kiri', 'Tampak Samping Kanan', 'Speedometer', 'Nomor Rangka', 'Nomor Mesin']
    : ['Tampak Depan', 'Tampak Samping', 'Interior', 'Surat Tanah'];

  // Build items array from available images
  const dokumentasiItems = dokumentasiUrls.map((url, index) => ({
    url,
    label: savedLabels[index] || defaultLabels[index] || `Foto ${index + 1}`,
  }));


  return (
    <div className="bg-white rounded-xl border shadow-card p-8 print:shadow-none print:border-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <img src={logo} alt="Bankaltimtara" className="h-16" />
          <h1 className="text-xl font-bold">DOKUMENTASI JAMINAN</h1>
        </div>

        {/* Info Debitur */}
        <div className="text-sm space-y-2 border-b pb-4">
          <p>
            <span className="font-medium">Debitur: </span>
            {taksasi.nama_nasabah}
          </p>
          {isKendaraan && detailKendaraan && (
            <p>
              <span className="font-medium">Bukti Kepemilikan: </span>
              {detailKendaraan.bukti_kepemilikan} No. {detailKendaraan.nomor_bukti_kepemilikan} Tanggal {formatDate(detailKendaraan.tanggal_bukti_kepemilikan)} An. {detailKendaraan.nama_kepemilikan}
            </p>
          )}
          <p>
            <span className="font-medium">Lokasi: </span>
            {taksasi.alamat}
          </p>
        </div>

        {/* Grid Foto */}
        {dokumentasiItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {dokumentasiItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center border relative">
                  <ImageWithFallback src={item.url} alt={item.label} />
                </div>
                <p className="text-center text-sm font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ImageOff size={48} className="mx-auto mb-2 opacity-50" />
            <p>Belum ada dokumentasi</p>
          </div>
        )}

        {/* Speedometer Reading */}
        {isKendaraan && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>* Pastikan foto speedometer menunjukkan kilometer kendaraan dengan jelas</p>
          </div>
        )}
      </div>
    </div>
  );
}

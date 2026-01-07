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
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover"
        onLoad={() => setIsLoading(false)}
        onError={() => {
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
  const detailKendaraan = isKendaraan ? taksasi.detail_agunan as DetailAgunanKendaraan : null;

  // Check both dokumentasi object and dokumentasi_urls array
  const dokumentasiObj = detailKendaraan?.dokumentasi;
  const dokumentasiUrls = detailKendaraan?.dokumentasi_urls || [];

  const dokumentasiLabels = [
    'Tampak Depan',
    'Tampak Belakang',
    'Tampak Samping Kiri',
    'Tampak Samping Kanan',
    'Speedometer',
    'Nomor Rangka',
    'Nomor Mesin',
  ];

  const dokumentasiKeys = [
    'tampak_depan',
    'tampak_belakang',
    'tampak_samping_kiri',
    'tampak_samping_kanan',
    'speedometer',
    'nomor_rangka',
    'nomor_mesin',
  ];

  // Get image URL from either dokumentasi object or dokumentasi_urls array
  const getImageUrl = (index: number, key: string): string | undefined => {
    // First check dokumentasi object
    if (dokumentasiObj && dokumentasiObj[key as keyof typeof dokumentasiObj]) {
      return dokumentasiObj[key as keyof typeof dokumentasiObj] as string;
    }
    // Fallback to dokumentasi_urls array
    if (dokumentasiUrls.length > index) {
      return dokumentasiUrls[index];
    }
    return undefined;
  };

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
        <div className="grid grid-cols-2 gap-4">
          {dokumentasiLabels.map((label, index) => {
            const imageUrl = getImageUrl(index, dokumentasiKeys[index]);
            return (
              <div key={index} className="space-y-2">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center border relative">
                  {imageUrl ? (
                    <ImageWithFallback src={imageUrl} alt={label} />
                  ) : (
                    <div className="text-muted-foreground text-sm text-center p-4 flex flex-col items-center justify-center">
                      <ImageOff size={32} className="mb-2 opacity-50" />
                      <p>Foto tidak tersedia</p>
                    </div>
                  )}
                </div>
                <p className="text-center text-sm font-medium">{label}</p>
              </div>
            );
          })}
        </div>

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

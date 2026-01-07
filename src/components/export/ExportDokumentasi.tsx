import React from 'react';
import { 
  Taksasi, 
  DetailAgunanKendaraan, 
  formatDate 
} from '@/types';

interface ExportDokumentasiProps {
  taksasi: Taksasi;
  logo: string;
}

export function ExportDokumentasi({ taksasi, logo }: ExportDokumentasiProps) {
  const jenisLower = taksasi.jenis_agunan.toLowerCase();
  const isKendaraan = jenisLower === 'kendaraan';
  const detailKendaraan = isKendaraan ? taksasi.detail_agunan as DetailAgunanKendaraan : null;

  const dokumentasi = detailKendaraan?.dokumentasi;

  const dokumentasiItems = [
    { key: 'tampak_depan', label: 'Tampak Depan' },
    { key: 'tampak_belakang', label: 'Tampak Belakang' },
    { key: 'tampak_samping_kiri', label: 'Tampak Samping' },
    { key: 'tampak_samping_kanan', label: 'Tampak Samping' },
    { key: 'speedometer', label: 'Speedometer' },
    { key: 'nomor_rangka', label: 'Nomor Rangka' },
    { key: 'nomor_mesin', label: 'Nomor Mesin' },
  ];

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
          {dokumentasiItems.map(({ key, label }) => {
            const imageUrl = dokumentasi?.[key as keyof typeof dokumentasi] as string | undefined;
            return (
              <div key={key} className="space-y-2">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center border">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={label} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground text-sm text-center p-4">
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

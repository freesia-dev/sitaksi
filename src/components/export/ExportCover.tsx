import React from 'react';
import { Taksasi, DetailAgunanKendaraan, DetailAgunanTBSimple, DetailAgunanTanahSimple, formatDate } from '@/types';

interface ExportCoverProps {
  taksasi: Taksasi;
  logo: string;
}

export function ExportCover({ taksasi, logo }: ExportCoverProps) {
  const jenisLower = taksasi.jenis_agunan.toLowerCase();
  const isKendaraan = jenisLower === 'kendaraan';
  const isTanah = jenisLower === 'tanah';
  const isTanahBangunan = jenisLower === 'tanah & bangunan' || jenisLower === 'tanah_bangunan';
  
  const detailKendaraan = isKendaraan ? taksasi.detail_agunan as DetailAgunanKendaraan : null;
  const detailTanah = isTanah ? taksasi.detail_agunan as DetailAgunanTanahSimple : null;
  const detailTB = isTanahBangunan ? taksasi.detail_agunan as DetailAgunanTBSimple : null;

  // Get the first photo from dokumentasi_urls
  const getFirstPhoto = (): string | undefined => {
    // Check new format with dokumentasi_urls array
    if (detailKendaraan?.dokumentasi_urls?.[0]) {
      return detailKendaraan.dokumentasi_urls[0];
    }
    if (detailTanah?.dokumentasi_urls?.[0]) {
      return detailTanah.dokumentasi_urls[0];
    }
    if (detailTB?.dokumentasi_urls?.[0]) {
      return detailTB.dokumentasi_urls[0];
    }
    // Fallback to old format
    if (taksasi.dokumentasi?.tampak_depan) {
      return taksasi.dokumentasi.tampak_depan;
    }
    if (isKendaraan && detailKendaraan?.dokumentasi?.tampak_depan) {
      return detailKendaraan.dokumentasi.tampak_depan;
    }
    return undefined;
  };

  const frontPhoto = getFirstPhoto();

  const getJenisAgunanTitle = () => {
    if (isKendaraan && detailKendaraan) {
      return 'KENDARAAN BERMOTOR';
    }
    if (isTanahBangunan) {
      return 'TANAH DAN BANGUNAN';
    }
    return 'TANAH';
  };

  return (
    <div className="bg-white rounded-xl border shadow-card print:shadow-none print:border-none min-h-[297mm] relative flex flex-col">
      <div className="max-w-2xl mx-auto text-center p-8 flex-1">
        {/* Header with Logo */}
        <div className="space-y-2">
          <img src={logo} alt="Bankaltimtara" className="h-20 mx-auto" />
          <h1 className="text-lg font-bold text-primary">
            PT.BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA
          </h1>
          <h2 className="text-base font-semibold">{taksasi.kantor_cabang}</h2>
        </div>

        {/* Jenis Agunan */}
        <div className="py-8 space-y-4">
          <h3 className="text-xl font-bold">{getJenisAgunanTitle()}</h3>
          
          {isKendaraan && detailKendaraan && (
            <>
              <p className="text-lg font-semibold">{detailKendaraan.jenis}</p>
              <p className="text-base">
                {detailKendaraan.bukti_kepemilikan} No. {detailKendaraan.nomor_bukti_kepemilikan} Tanggal {formatDate(detailKendaraan.tanggal_bukti_kepemilikan)} An. {detailKendaraan.nama_kepemilikan}
              </p>
              <p className="text-2xl font-bold text-primary mt-4">
                {detailKendaraan.nomor_polisi}
              </p>
            </>
          )}

          {(isTanah || isTanahBangunan) && (
            <>
              <p className="text-base">{taksasi.alamat}</p>
            </>
          )}

          {/* Front Photo - Center of document - larger size for print */}
          {frontPhoto && (
            <div className="py-6">
              <img 
                src={frontPhoto} 
                alt="Foto Agunan" 
                className="cover-image mx-auto w-full max-w-[500px] h-auto object-contain rounded-lg border shadow-md print:max-w-[180mm] print:max-h-[120mm]"
              />
            </div>
          )}

          {/* Placeholder if no photo */}
          {!frontPhoto && (
            <div className="py-6">
              <div className="mx-auto w-[400px] h-[280px] bg-muted/30 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Foto Agunan</p>
              </div>
            </div>
          )}
        </div>

        {/* Tim Penilai */}
        <div className="py-6">
          <h4 className="font-bold mb-4">TIM PENILAI :</h4>
          <table className="mx-auto text-left">
            <tbody>
              {taksasi.tim_penilai.map((tim, index) => (
                <tr key={index}>
                  <td className="py-1 pr-4">{index + 1}.</td>
                  <td className="py-1 pr-8 font-medium">{tim.nama}</td>
                  <td className="py-1">{tim.jabatan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="border-t space-y-1 text-sm text-center py-4 px-8 mt-auto">
        <p className="font-semibold">
          PT.BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA
        </p>
        <p className="font-semibold">{taksasi.kantor_cabang}</p>
        <p>{taksasi.alamat_cabang}</p>
      </div>
    </div>
  );
}

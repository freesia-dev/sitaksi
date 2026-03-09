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

  // Get legality info for tanah/tanah & bangunan
  const getLegalitasInfo = (): string | undefined => {
    if (isKendaraan && detailKendaraan) {
      if (detailKendaraan.bukti_kepemilikan && detailKendaraan.nomor_bukti_kepemilikan) {
        const tgl = detailKendaraan.tanggal_bukti_kepemilikan ? ` Tanggal ${formatDate(detailKendaraan.tanggal_bukti_kepemilikan)}` : '';
        return `${detailKendaraan.bukti_kepemilikan} Nomor ${detailKendaraan.nomor_bukti_kepemilikan}${tgl}`;
      }
      return undefined;
    }
    // For Tanah & Bangunan - get from tanah_list
    if (isTanahBangunan && detailTB) {
      const tb = detailTB as any;
      if (tb.tanah_list?.[0]) {
        const t = tb.tanah_list[0];
        if (t.bukti_kepemilikan && t.nomor_bukti) {
          const tgl = t.tanggal_bukti ? ` Tanggal ${formatDate(t.tanggal_bukti)}` : '';
          return `${t.bukti_kepemilikan} Nomor ${t.nomor_bukti}${tgl}`;
        }
      }
      return undefined;
    }
    // For Tanah
    if (isTanah && detailTanah) {
      const dt = detailTanah as any;
      if (dt.bukti_kepemilikan && dt.nomor_bukti) {
        const tgl = dt.tanggal_bukti ? ` Tanggal ${formatDate(dt.tanggal_bukti)}` : '';
        return `${dt.bukti_kepemilikan} Nomor ${dt.nomor_bukti}${tgl}`;
      }
      return undefined;
    }
    return undefined;
  };

  const legalitasInfo = getLegalitasInfo();

  return (
    <div className="export-cover-page bg-white print:shadow-none print:border-none print:h-[297mm] print:min-h-[297mm] print:flex print:flex-col">
      <div className="max-w-2xl mx-auto text-center p-6 print:p-4 print:flex-1 print:flex print:flex-col">
        {/* Header with Logo */}
        <div className="space-y-1 mb-4">
          <img src={logo} alt="Bankaltimtara" className="h-16 mx-auto print:h-14" />
          <h1 className="text-base font-bold text-primary print:text-black">
            PT.BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA
          </h1>
          <h2 className="text-sm font-semibold print:text-black">{taksasi.kantor_cabang}</h2>
        </div>

        {/* Jenis Agunan + Legalitas */}
        <div className="py-3 space-y-1">
          <h3 className="text-lg font-bold print:text-black">{getJenisAgunanTitle()}</h3>
          
          {legalitasInfo && (
            <p className="text-sm font-semibold text-primary print:text-black">{legalitasInfo}</p>
          )}

          {isKendaraan && detailKendaraan && (
            <>
              <p className="text-base font-semibold print:text-black">{detailKendaraan.jenis}</p>
              <p className="text-sm print:text-black">
                An. {detailKendaraan.nama_kepemilikan}
              </p>
              <p className="text-xl font-bold text-primary print:text-black mt-1">
                {detailKendaraan.nomor_polisi}
              </p>
            </>
          )}

          {(isTanah || isTanahBangunan) && (
            <p className="text-sm font-semibold text-primary print:text-black">{taksasi.alamat}</p>
          )}
        </div>

        {/* Front Photo - Large */}
        {frontPhoto && (
          <div className="py-3 flex-1 flex items-center justify-center">
            <img 
              src={frontPhoto} 
              alt="Foto Agunan" 
              className="export-cover-photo mx-auto w-full max-w-[480px] h-auto max-h-[300px] object-contain border print:max-w-[150mm] print:max-h-[100mm]"
            />
          </div>
        )}

        {/* Placeholder if no photo */}
        {!frontPhoto && (
          <div className="py-3 flex-1 flex items-center justify-center">
            <div className="mx-auto w-[480px] h-[300px] bg-muted/30 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Foto Agunan</p>
            </div>
          </div>
        )}

        {/* Tim Penilai */}
        <div className="py-4">
          <h4 className="font-bold mb-3 print:text-black">TIM PENILAI :</h4>
          <table className="mx-auto text-left text-sm">
            <tbody>
              {taksasi.tim_penilai.map((tim, index) => (
                <tr key={index}>
                  <td className="py-1 pr-3 print:text-black">{index + 1}.</td>
                  <td className="py-1 pr-6 font-medium print:text-black">{tim.nama}</td>
                  <td className="py-1 print:text-black">{tim.jabatan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Spacer - empty rows to push footer down for print */}
        <div className="flex-1"></div>
        <div className="h-[80px] print:h-[50mm]">&nbsp;</div>

        {/* Footer - Always at bottom */}
        <div className="border-t space-y-1 text-xs text-center py-3">
          <p className="font-semibold print:text-black">
            PT.BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA
          </p>
          <p className="font-semibold print:text-black">{taksasi.kantor_cabang}</p>
          <p className="print:text-black">{taksasi.alamat_cabang}</p>
        </div>
      </div>
    </div>
  );
}

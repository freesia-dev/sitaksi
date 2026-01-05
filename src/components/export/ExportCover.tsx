import React from 'react';
import { Taksasi, DetailAgunanKendaraan, formatDate } from '@/types';

interface ExportCoverProps {
  taksasi: Taksasi;
  logo: string;
}

export function ExportCover({ taksasi, logo }: ExportCoverProps) {
  const isKendaraan = taksasi.jenis_agunan === 'Kendaraan';
  const detail = taksasi.detail_agunan as DetailAgunanKendaraan;

  return (
    <div className="bg-white rounded-xl border shadow-card p-8 print:shadow-none print:border-none">
      <div className="max-w-2xl mx-auto space-y-8 text-center">
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
          <h3 className="text-xl font-bold">KENDARAAN BERMOTOR</h3>
          {isKendaraan && (
            <>
              <p className="text-lg font-semibold">{detail.jenis}</p>
              <p className="text-base">
                {detail.bukti_kepemilikan} No. {detail.nomor_bukti_kepemilikan} Tanggal {formatDate(detail.tanggal_bukti_kepemilikan)} An. {detail.nama_kepemilikan}
              </p>
              <p className="text-2xl font-bold text-primary mt-4">
                {detail.nomor_polisi}
              </p>
            </>
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

        {/* Footer */}
        <div className="pt-8 border-t space-y-2 text-sm">
          <p className="font-semibold">
            PT.BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA
          </p>
          <p>{taksasi.kantor_cabang}</p>
          <p>{taksasi.alamat_cabang}</p>
        </div>
      </div>
    </div>
  );
}

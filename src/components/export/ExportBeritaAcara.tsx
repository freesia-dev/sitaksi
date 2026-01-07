import React from 'react';
import { 
  Taksasi, 
  DetailAgunanKendaraan, 
  formatCurrency, 
  formatDate,
  formatDateWithDay 
} from '@/types';

interface ExportBeritaAcaraProps {
  taksasi: Taksasi;
  logo: string;
}

export function ExportBeritaAcara({ taksasi, logo }: ExportBeritaAcaraProps) {
  const isKendaraan = taksasi.jenis_agunan === 'Kendaraan';
  const detailKendaraan = isKendaraan ? taksasi.detail_agunan as DetailAgunanKendaraan : null;

  const getJaminanDescription = () => {
    if (isKendaraan && detailKendaraan) {
      return `Kendaraan Roda Dua
Jenis : ${detailKendaraan.jenis}
Model / Type : ${detailKendaraan.model}
Merk : ${detailKendaraan.merk}
Nomor Mesin : ${detailKendaraan.nomor_mesin}
Nomor Rangka : ${detailKendaraan.nomor_rangka}
Nomor Polisi / Nomor Plat : ${detailKendaraan.nomor_polisi}`;
    }
    return taksasi.jenis_agunan;
  };

  return (
    <div className="bg-white rounded-xl border shadow-card p-8 print:shadow-none print:border-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <img src={logo} alt="Bankaltimtara" className="h-16" />
          <h1 className="text-xl font-bold">FORMULIR BERITA ACARA PENILAIAN AGUNAN</h1>
        </div>

        {/* Opening */}
        <div className="text-sm space-y-4">
          <p>
            Pada hari ini, {formatDateWithDay(taksasi.tanggal)} saya yang bertanda tangan dibawah ini :
          </p>
          <table className="ml-4">
            <tbody>
              <tr>
                <td className="py-1 pr-4">1.</td>
                <td className="py-1 pr-4">Nama</td>
                <td className="py-1 pr-4">:</td>
                <td className="py-1 font-medium">{taksasi.petugas}</td>
              </tr>
              <tr>
                <td className="py-1"></td>
                <td className="py-1 pr-4">Jabatan</td>
                <td className="py-1 pr-4">:</td>
                <td className="py-1">{taksasi.jabatan_petugas}</td>
              </tr>
            </tbody>
          </table>
          <p>
            Telah melakukan penilaian terhadap barang yang menjadi jaminan debitur <span className="font-semibold">{taksasi.nama_nasabah}</span> sebagai berikut :
          </p>
        </div>

        {/* Table Jaminan */}
        <table className="w-full text-sm border">
          <thead className="bg-muted">
            <tr>
              <th className="border p-2 w-12">No.</th>
              <th className="border p-2">Jenis Jaminan</th>
              <th className="border p-2 text-right">Nilai Pasar</th>
              <th className="border p-2 text-right">Nilai Likuidasi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 text-center align-top">1.</td>
              <td className="border p-2 whitespace-pre-line">{getJaminanDescription()}</td>
              <td className="border p-2 text-right align-top">{formatCurrency(taksasi.nilai_taksasi_pembulatan)}</td>
              <td className="border p-2 text-right align-top">{formatCurrency(taksasi.nilai_likuidasi_pembulatan)}</td>
            </tr>
            <tr className="font-semibold bg-muted/50">
              <td className="border p-2 text-center" colSpan={2}>Jumlah</td>
              <td className="border p-2 text-right">{formatCurrency(taksasi.nilai_taksasi_pembulatan)}</td>
              <td className="border p-2 text-right">{formatCurrency(taksasi.nilai_likuidasi_pembulatan)}</td>
            </tr>
          </tbody>
        </table>

        <p className="text-sm">
          Demikian berita acara ini dibuat untuk dipergunakan sebagaimana mestinya.
        </p>

        {/* Tanda Tangan */}
        <div className="mt-8 pt-4">
          <div className="flex justify-between">
            <div className="text-sm text-center">
              <div className="h-24"></div>
              <div className="border-b border-black w-48 mx-auto"></div>
              <p className="font-bold mt-1">{taksasi.petugas}</p>
              <p>{taksasi.jabatan_petugas}</p>
            </div>
            <div className="text-sm text-center">
              <p>Bontang, {formatDate(taksasi.tanggal)}</p>
              <p className="font-medium">PT BANK PEMBANGUNAN DAERAH</p>
              <p className="font-medium">KALIMANTAN TIMUR DAN KALIMANTAN UTARA</p>
              <p>{taksasi.kantor_cabang.replace('KANTOR ', '')}</p>
              <p className="italic mt-2">{taksasi.jabatan_pimpinan}</p>
              <div className="h-16"></div>
              <div className="border-b border-black w-48 mx-auto"></div>
              <p className="font-bold mt-1">{taksasi.pimpinan}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { 
  Taksasi, 
  DetailAgunanKendaraan, 
  DetailAgunanTanahSimple,
  DetailAgunanTBSimple,
  formatCurrency, 
  formatCurrencyWithDecimals,
  formatDate 
} from '@/types';

interface ExportFormTaksasiProps {
  taksasi: Taksasi;
  logo: string;
}

export function ExportFormTaksasi({ taksasi, logo }: ExportFormTaksasiProps) {
  const isKendaraan = taksasi.jenis_agunan === 'Kendaraan';
  const isTanah = taksasi.jenis_agunan === 'Tanah';
  const isTB = taksasi.jenis_agunan === 'Tanah & Bangunan';
  
  const detailKendaraan = isKendaraan ? taksasi.detail_agunan as DetailAgunanKendaraan : null;
  const detailTanah = isTanah ? taksasi.detail_agunan as DetailAgunanTanahSimple : null;
  const detailTB = isTB ? taksasi.detail_agunan as DetailAgunanTBSimple : null;

  return (
    <div className="bg-white rounded-xl border shadow-card p-8 print:shadow-none print:border-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <img src={logo} alt="Bankaltimtara" className="h-16" />
          <div className="text-right">
            <h1 className="text-xl font-bold">FORMULIR PENILAIAN AGUNAN</h1>
            <div className="text-sm mt-2 space-y-1">
              <p><span className="font-medium">Nomor</span> : {taksasi.nomor_dokumen}</p>
              <p><span className="font-medium">Tanggal</span> : {formatDate(taksasi.tanggal)}</p>
            </div>
          </div>
        </div>

        {/* I. UMUM */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg border-b pb-2">I. UMUM</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 w-1/3">Jenis Agunan</td>
                <td className="py-1 w-4">:</td>
                <td className="py-1 font-medium">{isKendaraan ? detailKendaraan?.jenis : taksasi.jenis_agunan.toUpperCase()}</td>
              </tr>
              <tr>
                <td className="py-1">Petugas Yang Melakukan Penilaian</td>
                <td className="py-1">:</td>
                <td className="py-1 font-medium">{taksasi.petugas} <span className="text-muted-foreground ml-4">{taksasi.jabatan_petugas}</span></td>
              </tr>
              <tr>
                <td className="py-1">Tanggal Penilaian</td>
                <td className="py-1">:</td>
                <td className="py-1 font-medium">{formatDate(taksasi.tanggal)}</td>
              </tr>
              <tr>
                <td className="py-1">Nama Calon Debitur / Debitur</td>
                <td className="py-1">:</td>
                <td className="py-1 font-medium">{taksasi.nama_nasabah}</td>
              </tr>
              <tr>
                <td className="py-1">Lokasi Objek Agunan</td>
                <td className="py-1">:</td>
                <td className="py-1 font-medium">{taksasi.alamat}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* II. PROFIL AGUNAN */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg border-b pb-2">II. PROFIL AGUNAN</h2>
          <table className="w-full text-sm">
            <tbody>
              {isKendaraan && detailKendaraan && (
                <>
                  <tr><td className="py-1 w-1/3">Jenis</td><td className="py-1 w-4">:</td><td className="py-1">{detailKendaraan.jenis}</td></tr>
                  <tr><td className="py-1">Model / Type</td><td className="py-1">:</td><td className="py-1">{detailKendaraan.model}</td></tr>
                  <tr><td className="py-1">Merk</td><td className="py-1">:</td><td className="py-1">{detailKendaraan.merk}</td></tr>
                  <tr><td className="py-1">Tahun Pembuatan</td><td className="py-1">:</td><td className="py-1">{detailKendaraan.tahun}</td></tr>
                  <tr><td className="py-1">Nomor Polisi</td><td className="py-1">:</td><td className="py-1">{detailKendaraan.nomor_polisi}</td></tr>
                  <tr><td className="py-1">Nomor Mesin</td><td className="py-1">:</td><td className="py-1">{detailKendaraan.nomor_mesin}</td></tr>
                  <tr><td className="py-1">Nomor Rangka</td><td className="py-1">:</td><td className="py-1">{detailKendaraan.nomor_rangka}</td></tr>
                  <tr><td className="py-1">Buatan</td><td className="py-1">:</td><td className="py-1">{detailKendaraan.buatan}</td></tr>
                  <tr><td className="py-1">Bukti Kepemilikan</td><td className="py-1">:</td><td className="py-1">{detailKendaraan.bukti_kepemilikan}</td></tr>
                  <tr><td className="py-1">Nomor Bukti Kepemilikan</td><td className="py-1">:</td><td className="py-1">{detailKendaraan.nomor_bukti_kepemilikan}</td></tr>
                  <tr><td className="py-1">Tanggal Bukti Kepemilikan</td><td className="py-1">:</td><td className="py-1">{formatDate(detailKendaraan.tanggal_bukti_kepemilikan)}</td></tr>
                  <tr><td className="py-1">Nama Kepemilikan</td><td className="py-1">:</td><td className="py-1">{detailKendaraan.nama_kepemilikan}</td></tr>
                  <tr><td className="py-1">Kondisi Unit</td><td className="py-1">:</td><td className="py-1">{detailKendaraan.kondisi_unit}</td></tr>
                </>
              )}
              {isTanah && detailTanah && (
                <>
                  <tr><td className="py-1 w-1/3">Luas Tanah</td><td className="py-1 w-4">:</td><td className="py-1">{detailTanah.luas_tanah} m²</td></tr>
                  <tr><td className="py-1">Harga per m²</td><td className="py-1">:</td><td className="py-1">{formatCurrency(detailTanah.harga_per_meter)}</td></tr>
                </>
              )}
              {isTB && detailTB && (
                <>
                  <tr><td className="py-1 w-1/3">Luas Tanah</td><td className="py-1 w-4">:</td><td className="py-1">{detailTB.luas_tanah} m²</td></tr>
                  <tr><td className="py-1">Harga Tanah per m²</td><td className="py-1">:</td><td className="py-1">{formatCurrency(detailTB.harga_tanah_per_meter)}</td></tr>
                  <tr><td className="py-1">Luas Bangunan</td><td className="py-1">:</td><td className="py-1">{detailTB.luas_bangunan} m²</td></tr>
                  <tr><td className="py-1">Harga Bangunan per m²</td><td className="py-1">:</td><td className="py-1">{formatCurrency(detailTB.harga_bangunan_per_meter)}</td></tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* III. METODE PENILAIAN */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg border-b pb-2">III. METODE PENILAIAN</h2>
          
          {isKendaraan && detailKendaraan && (
            <>
              <p className="text-sm font-medium">Informasi Harga {detailKendaraan.model}</p>
              <table className="w-full text-sm border">
                <thead className="bg-muted">
                  <tr>
                    <th className="border p-2 w-12">No</th>
                    <th className="border p-2 text-right">Harga</th>
                    <th className="border p-2">Sumber</th>
                  </tr>
                </thead>
                <tbody>
                  {detailKendaraan.harga_pembanding.map((hp, index) => (
                    <tr key={index}>
                      <td className="border p-2 text-center">{index + 1}</td>
                      <td className="border p-2 text-right">{formatCurrencyWithDecimals(hp.harga)}</td>
                      <td className="border p-2 text-xs break-all">{hp.sumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-sm mt-2">
                <span className="font-medium">Nilai Rata-Rata : </span>
                {formatCurrencyWithDecimals(taksasi.nilai_pasar)}
              </p>
            </>
          )}

          {/* Perhitungan Nilai Taksasi */}
          <p className="text-sm font-medium mt-4">Perhitungan Nilai Taksasi</p>
          <table className="w-full text-sm border">
            <thead className="bg-muted">
              <tr>
                <th className="border p-2">Model</th>
                <th className="border p-2 text-right">Nilai Taksasi</th>
                <th className="border p-2 text-right">Pembulatan</th>
                <th className="border p-2 text-right">Safety Margin</th>
                <th className="border p-2 text-right">Nilai Likuidasi</th>
                <th className="border p-2 text-right">Pembulatan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">{isKendaraan ? detailKendaraan?.model : taksasi.jenis_agunan}</td>
                <td className="border p-2 text-right">{formatCurrencyWithDecimals(taksasi.nilai_taksasi)}</td>
                <td className="border p-2 text-right font-semibold">{formatCurrencyWithDecimals(taksasi.nilai_taksasi_pembulatan)}</td>
                <td className="border p-2 text-right">{taksasi.safety_margin}%</td>
                <td className="border p-2 text-right">{formatCurrencyWithDecimals(taksasi.nilai_likuidasi)}</td>
                <td className="border p-2 text-right font-semibold">{formatCurrencyWithDecimals(taksasi.nilai_likuidasi_pembulatan)}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm mt-2">
            <span className="font-medium">Terbilang : </span>
            {taksasi.terbilang}
          </p>
        </div>

        {/* IV. KETERANGAN */}
        {isKendaraan && detailKendaraan && detailKendaraan.keterangan && detailKendaraan.keterangan.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-lg border-b pb-2">IV. KETERANGAN</h2>
            <ul className="text-sm space-y-1">
              {detailKendaraan.keterangan.map((k, index) => (
                <li key={index}>{k}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tanda Tangan */}
        <div className="mt-8 pt-4 border-t">
          {/* Petugas Table */}
          <p className="text-sm font-medium mb-2">Petugas Yang Melakukan Penilaian :</p>
          <table className="w-full text-sm border mb-8">
            <thead>
              <tr>
                <th className="border p-2 text-center bg-muted/30">Nama</th>
                <th className="border p-2 text-center bg-muted/30">Jabatan</th>
                <th className="border p-2 text-center bg-muted/30">Tanda Tangan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 text-center font-bold">{taksasi.petugas}</td>
                <td className="border p-2 text-center">{taksasi.jabatan_petugas}</td>
                <td className="border p-2 h-16"></td>
              </tr>
            </tbody>
          </table>

          {/* Pimpinan Signature */}
          <div className="text-center">
            <p>PT Bank Pembangunan Daerah</p>
            <p>Kalimantan Timur dan Kalimantan Utara</p>
            <p>{taksasi.kantor_cabang}</p>
            <div className="mt-16 print:mt-20">
              <div className="border-b border-black w-48 mx-auto mb-1"></div>
              <p className="font-bold">{taksasi.pimpinan}</p>
              <p className="italic">{taksasi.jabatan_pimpinan}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

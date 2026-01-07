import React from 'react';
import { Taksasi, formatCurrency, formatDate } from '@/types';

interface ExportRekapTaksasiProps {
  taksasiList: Taksasi[];
  logo: string;
}

export function ExportRekapTaksasi({ taksasiList, logo }: ExportRekapTaksasiProps) {
  const totalNilaiTaksasi = taksasiList.reduce((acc, t) => acc + t.nilai_taksasi_pembulatan, 0);
  const totalNilaiLikuidasi = taksasiList.reduce((acc, t) => acc + t.nilai_likuidasi_pembulatan, 0);

  return (
    <div className="bg-white p-8 print:p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 border-b pb-4">
          <img src={logo} alt="Bankaltimtara" className="h-16" />
          <div>
            <h1 className="text-xl font-bold">REKAP DATA TAKSASI AGUNAN</h1>
            <p className="text-sm text-muted-foreground">Dicetak: {formatDate(new Date().toISOString())}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Total Data</p>
            <p className="text-xl font-bold">{taksasiList.length}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Total Nilai Taksasi</p>
            <p className="text-xl font-bold">{formatCurrency(totalNilaiTaksasi)}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Total Nilai Likuidasi</p>
            <p className="text-xl font-bold text-success">{formatCurrency(totalNilaiLikuidasi)}</p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">No</th>
              <th className="border p-2 text-left">Tanggal</th>
              <th className="border p-2 text-left">No. Dokumen</th>
              <th className="border p-2 text-left">Nasabah</th>
              <th className="border p-2 text-left">Jenis</th>
              <th className="border p-2 text-right">Nilai Taksasi</th>
              <th className="border p-2 text-right">Nilai Likuidasi</th>
              <th className="border p-2 text-left">Petugas</th>
            </tr>
          </thead>
          <tbody>
            {taksasiList.map((t, index) => (
              <tr key={t.id}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{formatDate(t.tanggal)}</td>
                <td className="border p-2">{t.nomor_dokumen}</td>
                <td className="border p-2">{t.nama_nasabah}</td>
                <td className="border p-2">{t.jenis_agunan}</td>
                <td className="border p-2 text-right">{formatCurrency(t.nilai_taksasi_pembulatan)}</td>
                <td className="border p-2 text-right">{formatCurrency(t.nilai_likuidasi_pembulatan)}</td>
                <td className="border p-2">{t.petugas}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-muted/50">
              <td className="border p-2" colSpan={5}>TOTAL</td>
              <td className="border p-2 text-right">{formatCurrency(totalNilaiTaksasi)}</td>
              <td className="border p-2 text-right">{formatCurrency(totalNilaiLikuidasi)}</td>
              <td className="border p-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

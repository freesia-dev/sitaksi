import React from 'react';
import { formatDate, formatCurrency } from '@/types';
import { KATEGORI_LABEL, MonitoringKunjungan } from '@/types/monitoring';

interface Props {
  data: MonitoringKunjungan;
  logo: string;
}

export function ExportBeritaAcaraKunjungan({ data, logo }: Props) {
  const totalTunggakan = (data.tunggakan_pokok || 0) + (data.tunggakan_bunga || 0);

  return (
    <div className="bg-white p-8 print:p-4 text-sm flex flex-col min-h-full">
      {/* KOP */}
      <div className="flex items-center gap-4 border-b-2 border-black pb-3 mb-4">
        <img src={logo} alt="Bankaltimtara" className="h-16 print:h-14" />
        <div className="flex-1 text-center">
          <h1 className="text-base font-bold print:text-black uppercase">
            PT. Bank Pembangunan Daerah Kalimantan Timur dan Kalimantan Utara
          </h1>
          <h2 className="text-sm font-semibold print:text-black">{data.kantor_cabang || 'KCP TELIHAN'}</h2>
          <p className="text-xs print:text-black">Jl. Mulawarman, Telihan, Balikpapan</p>
        </div>
      </div>

      {/* Judul */}
      <div className="text-center mb-4">
        <h2 className="text-base font-bold underline print:text-black">BERITA ACARA KUNJUNGAN DEBITUR</h2>
        {data.nomor_ba && <p className="text-sm mt-1 print:text-black">Nomor: {data.nomor_ba}</p>}
      </div>

      <p className="text-justify mb-3 print:text-black">
        Pada hari ini, {formatDate(data.tanggal_kunjungan)}
        {data.jam_kunjungan && ` pukul ${data.jam_kunjungan} WITA`}, telah dilaksanakan kunjungan kepada debitur dengan kategori{' '}
        <strong>{KATEGORI_LABEL[data.kategori]}</strong> dengan rincian sebagai berikut:
      </p>

      {/* Identitas Debitur */}
      <SectionTitle>A. Identitas Debitur</SectionTitle>
      <table className="w-full mb-3 text-xs">
        <tbody>
          <Row label="Nama Debitur" value={data.nama_debitur} />
          <Row label="No. Rekening" value={data.no_rekening || '-'} />
          <Row label="No. Handphone" value={data.no_hp || '-'} />
          <Row label="Alamat" value={data.alamat || '-'} />
        </tbody>
      </table>

      {/* Data Kredit */}
      <SectionTitle>B. Data Kredit</SectionTitle>
      <table className="w-full mb-3 text-xs">
        <tbody>
          <Row label="Plafond" value={formatCurrency(data.plafond || 0)} />
          <Row label="Baki Debet" value={formatCurrency(data.baki_debet || 0)} />
          <Row label="Tunggakan Pokok" value={formatCurrency(data.tunggakan_pokok || 0)} />
          <Row label="Tunggakan Bunga" value={formatCurrency(data.tunggakan_bunga || 0)} />
          <Row label="Total Tunggakan" value={formatCurrency(totalTunggakan)} bold />
          <Row label="Hari Tunggakan" value={`${data.hari_tunggakan || 0} hari`} />
        </tbody>
      </table>

      {/* Hasil Kunjungan */}
      <SectionTitle>C. Hasil Kunjungan & Kondisi</SectionTitle>
      <table className="w-full mb-3 text-xs">
        <tbody>
          <Row label="Tujuan Kunjungan" value={data.tujuan_kunjungan || '-'} />
          <Row label="Kondisi Usaha" value={data.kondisi_usaha || '-'} />
          <Row label="Kondisi Agunan" value={data.kondisi_agunan || '-'} />
          <Row label="Hasil / Catatan" value={data.hasil_kunjungan || '-'} />
        </tbody>
      </table>

      {/* Tindak Lanjut */}
      <SectionTitle>D. Rencana Tindak Lanjut & Komitmen Bayar</SectionTitle>
      <table className="w-full mb-3 text-xs">
        <tbody>
          <Row label="Rencana Tindak Lanjut" value={data.rencana_tindak_lanjut || '-'} />
          <Row label="Komitmen Bayar" value={data.komitmen_bayar_nominal ? formatCurrency(data.komitmen_bayar_nominal) : '-'} />
          <Row label="Tanggal Komitmen" value={data.komitmen_bayar_tanggal ? formatDate(data.komitmen_bayar_tanggal) : '-'} />
        </tbody>
      </table>

      {/* Foto Dokumentasi */}
      {data.foto_kunjungan && data.foto_kunjungan.length > 0 && (
        <>
          <SectionTitle>E. Foto Dokumentasi Kunjungan</SectionTitle>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {data.foto_kunjungan.map((url, i) => (
              <div key={i} className="border p-1">
                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-40 object-cover" />
                <p className="text-xs text-center mt-1 print:text-black">Foto {i + 1}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-justify mt-4 mb-8 print:text-black">
        Demikian Berita Acara Kunjungan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.
      </p>

      {/* TTD */}
      <div className="mt-auto grid grid-cols-2 gap-8 pt-4 text-center text-xs">
        <div>
          <p className="print:text-black">Officer Relationship Kredit</p>
          <div className="h-20" />
          <p className="font-bold underline print:text-black">{data.officer_nama || '(.......................)'}</p>
        </div>
        <div>
          <p className="print:text-black">Pimpinan {data.kantor_cabang || 'KCP Telihan'}</p>
          <div className="h-20" />
          <p className="font-bold underline print:text-black">{data.pimpinan_nama || '(.......................)'}</p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold mb-1 mt-2 print:text-black">{children}</h3>;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr>
      <td className="w-48 align-top py-1 pr-2 print:text-black">{label}</td>
      <td className="align-top py-1 pr-2 print:text-black">:</td>
      <td className={`align-top py-1 print:text-black ${bold ? 'font-bold' : ''}`}>{value}</td>
    </tr>
  );
}
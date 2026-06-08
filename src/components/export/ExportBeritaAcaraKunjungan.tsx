import React from 'react';
import { formatDate, formatCurrency } from '@/types';
import { MonitoringKunjungan } from '@/types/monitoring';
import bpdLogoAsset from '@/assets/logo-asbanda.png.asset.json';

interface Props {
  data: MonitoringKunjungan;
  logo: string;
}

export function ExportBeritaAcaraKunjungan({ data, logo }: Props) {
  const totalTunggakan = (data.tunggakan_pokok || 0) + (data.tunggakan_bunga || 0);
  const photos = data.foto_kunjungan || [];
  const photoRows = chunkArray(photos, 2);

  return (
    <div className="ba-document bg-white p-8 print:p-0 text-sm min-h-full">
      <table className="ba-page-table w-full border-collapse">
        <thead className="ba-repeat-header">
          <tr>
            <td>
              <KopHeader logo={logo} />
            </td>
          </tr>
        </thead>
        <tbody>
          <DocumentRow>
            <div className="text-center mb-4" data-pdf-section>
              <h2 className="text-base font-bold underline print:text-black">BERITA ACARA KUNJUNGAN DEBITUR</h2>
              {data.nomor_ba && <p className="text-sm mt-1 print:text-black">Nomor: {data.nomor_ba}</p>}
            </div>
          </DocumentRow>

          <DocumentRow>
            <p className="text-justify mb-3 print:text-black" data-pdf-section>
              Pada hari ini, {formatDate(data.tanggal_kunjungan)}
              {data.jam_kunjungan && ` pukul ${data.jam_kunjungan} WITA`}, telah dilaksanakan kunjungan kepada debitur dengan rincian sebagai berikut:
            </p>
          </DocumentRow>

          <DocumentRow>
            <section data-pdf-section>
              <SectionTitle>A. Identitas Debitur</SectionTitle>
              <table className="w-full mb-3 text-xs">
                <tbody>
                  <Row label="Nama Debitur" value={data.nama_debitur} />
                  <Row label="No. Loan" value={data.no_loan || '-'} />
                  <Row label="No. Handphone" value={data.no_hp || '-'} />
                  <Row label="Alamat" value={data.alamat || '-'} />
                </tbody>
              </table>
            </section>
          </DocumentRow>

          <DocumentRow>
            <section data-pdf-section>
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
            </section>
          </DocumentRow>

          <DocumentRow>
            <section data-pdf-section>
              <SectionTitle>C. Hasil Kunjungan & Kondisi</SectionTitle>
              <table className="w-full mb-3 text-xs">
                <tbody>
                  <Row label="Tujuan Kunjungan" value={data.tujuan_kunjungan || '-'} />
                  <Row label="Kondisi Usaha" value={data.kondisi_usaha || '-'} />
                  <Row label="Kondisi Agunan" value={data.kondisi_agunan || '-'} />
                  <Row label="Hasil / Catatan" value={data.hasil_kunjungan || '-'} />
                </tbody>
              </table>
            </section>
          </DocumentRow>

          <DocumentRow>
            <section data-pdf-section>
              <SectionTitle>D. Rencana Tindak Lanjut & Komitmen Bayar</SectionTitle>
              <table className="w-full mb-3 text-xs">
                <tbody>
                  <Row label="Rencana Tindak Lanjut" value={data.rencana_tindak_lanjut || '-'} />
                  <Row label="Komitmen Bayar" value={data.komitmen_bayar_nominal ? formatCurrency(data.komitmen_bayar_nominal) : '-'} />
                  <Row label="Tanggal Komitmen" value={data.komitmen_bayar_tanggal ? formatDate(data.komitmen_bayar_tanggal) : '-'} />
                </tbody>
              </table>
            </section>
          </DocumentRow>

          {photoRows.map((row, rowIndex) => (
            <DocumentRow>
              <section data-pdf-section>
                {rowIndex === 0 && <SectionTitle>E. Foto Dokumentasi Kunjungan</SectionTitle>}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {row.map((url, i) => {
                    const photoNumber = rowIndex * 2 + i + 1;
                    return (
                    <div key={url} className="border p-1 break-inside-avoid">
                      <img src={url} alt={`Foto ${photoNumber}`} className="w-full h-40 object-cover" />
                      <p className="text-xs text-center mt-1 print:text-black">Foto {photoNumber}</p>
                    </div>
                    );
                  })}
                </div>
              </section>
            </DocumentRow>
          ))}

          <DocumentRow>
            <section data-pdf-section>
              <p className="text-justify mt-4 mb-8 print:text-black">
                Demikian Berita Acara Kunjungan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.
              </p>

              <div className="grid grid-cols-2 gap-8 pt-4 text-center text-xs">
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
            </section>
          </DocumentRow>
        </tbody>
        <tfoot className="ba-repeat-footer">
          <tr>
            <td>
              <KopFooter />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function DocumentRow({ children }: { children: React.ReactNode }) {
  return (
    <tr data-pdf-section>
      <td>
        <div className="ba-content">{children}</div>
      </td>
    </tr>
  );
}

function KopHeader({ logo }: { logo: string }) {
  return (
    <div className="ba-kop-header flex items-start gap-3 pb-3 mb-4 border-b-[3px] border-[#1d4ed8]">
      <img src={logo} alt="Bankaltimtara" className="ba-kop-logo h-16 print:h-14 object-contain shrink-0" />
      <div className="flex-1 text-center pt-1">
        <p className="text-[10pt] print:text-black leading-tight">PT Bank Pembangunan Daerah Kalimantan Timur dan Kalimantan Utara</p>
        <h1 className="text-[12pt] font-bold print:text-black uppercase tracking-wide">
          KANTOR CABANG PEMBANTU TELIHAN
        </h1>
        <p className="text-[9pt] print:text-black leading-tight">Jl. Letjend S. Parman No.14-15 – Kota Bontang 75383</p>
        <p className="text-[9pt] print:text-black leading-tight">Telp: 0548 - 26567</p>
        <p className="text-[9pt] print:text-black leading-tight">
          Email: <span className="underline">kcp.telihan@bankaltimtara.co.id</span> · www.bankaltimtara.co.id
        </p>
      </div>
      <img src={bpdLogoAsset.url} alt="ASBANDA" className="ba-kop-logo h-16 print:h-14 object-contain shrink-0" />
    </div>
  );
}

function KopFooter() {
  return (
    <div className="kop-footer-banner relative h-6 pointer-events-none mt-4">
      <div className="absolute left-0 bottom-0 h-3 w-[72%] bg-[#1d4ed8] rounded-tr-[40px]" />
      <div className="absolute right-0 bottom-0 h-3 w-[28%] bg-[#f59e0b] rounded-tl-[40px]" />
    </div>
  );
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
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
import React from 'react';
import { 
  Taksasi, 
  DetailAgunanKendaraan, 
  DetailAgunanTanahSimple,
  DetailAgunanTBSimple,
  TanahItemData,
  BangunanItemData,
  formatCurrency, 
  formatCurrencyWithDecimals,
  formatDate 
} from '@/types';
import {
  SAFETY_MARGIN_TANAH,
  SAFETY_MARGIN_BANGUNAN,
  getLabelByValue,
  getMarginByValue,
} from '@/lib/safetyMarginConfig';

interface ExportFormTaksasiProps {
  taksasi: Taksasi;
  logo: string;
}

const buktiKepemilikanLabels: Record<string, string> = {
  pelepasan_hak: 'Pelepasan Hak Atas Tanah',
  hak_milik: 'Hak Milik',
  hgb: 'HGB',
  hgu: 'HGU',
  hak_pakai: 'Hak Pakai',
  girik: 'Girik',
  letter_c: 'Letter C',
  skgr: 'SKGR',
  skt: 'SKT',
};

const formatBuktiKepemilikan = (val: string) => buktiKepemilikanLabels[val] || val;

export function ExportFormTaksasi({ taksasi, logo }: ExportFormTaksasiProps) {
  const jenisLower = taksasi.jenis_agunan.toLowerCase();
  const isKendaraan = jenisLower === 'kendaraan';
  const isTanah = jenisLower === 'tanah';
  const isTB = jenisLower === 'tanah & bangunan' || jenisLower === 'tanah_bangunan';
  
  const detailKendaraan = isKendaraan ? taksasi.detail_agunan as DetailAgunanKendaraan : null;
  const detailTanah = isTanah ? taksasi.detail_agunan as DetailAgunanTanahSimple : null;
  const detailTB = isTB ? taksasi.detail_agunan as DetailAgunanTBSimple : null;

  const tanahList: TanahItemData[] = detailTB?.tanah_list || [];
  const bangunanList: BangunanItemData[] = detailTB?.bangunan_list || [];

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
              {isTB && detailTB && tanahList.length > 0 && tanahList.map((t, idx) => (
                <React.Fragment key={idx}>
                  {tanahList.length > 1 && (
                    <tr><td colSpan={3} className="py-2 font-bold text-primary">Data Tanah #{idx + 1}</td></tr>
                  )}
                  <tr><td className="py-1 w-1/3">Bukti Kepemilikan</td><td className="py-1 w-4">:</td><td className="py-1">{formatBuktiKepemilikan(t.bukti_kepemilikan)}</td></tr>
                  {t.nomor_bukti && <tr><td className="py-1">Nomor Bukti</td><td className="py-1">:</td><td className="py-1">{t.nomor_bukti}</td></tr>}
                  {t.tanggal_bukti && <tr><td className="py-1">Tanggal Bukti</td><td className="py-1">:</td><td className="py-1">{formatDate(t.tanggal_bukti)}</td></tr>}
                  {t.masa_berlaku && <tr><td className="py-1">Masa Berlaku</td><td className="py-1">:</td><td className="py-1">{formatDate(t.masa_berlaku)}</td></tr>}
                  {t.nama_pemegang_hak && <tr><td className="py-1">Nama Pemegang Hak</td><td className="py-1">:</td><td className="py-1">{t.nama_pemegang_hak}</td></tr>}
                  {t.hubungan_dengan_debitur && <tr><td className="py-1">Hubungan dengan Debitur</td><td className="py-1">:</td><td className="py-1">{t.hubungan_dengan_debitur === 'milik_sendiri' ? 'Milik Sendiri' : t.hubungan_dengan_debitur}</td></tr>}
                  {t.nomor_gambar_situasi && <tr><td className="py-1">Nomor Gambar Situasi</td><td className="py-1">:</td><td className="py-1">{t.nomor_gambar_situasi}</td></tr>}
                  {t.nomor_induk_bidang && <tr><td className="py-1">Nomor Induk Bidang (NIB)</td><td className="py-1">:</td><td className="py-1">{t.nomor_induk_bidang}</td></tr>}
                  <tr><td className="py-1">Luas Tanah</td><td className="py-1">:</td><td className="py-1">{t.luas_tanah} m²</td></tr>
                  {t.tempat_didaftarkan && <tr><td className="py-1">Tempat Didaftarkan</td><td className="py-1">:</td><td className="py-1">{t.tempat_didaftarkan}</td></tr>}
                  {t.lokasi && <tr><td className="py-1">Lokasi</td><td className="py-1">:</td><td className="py-1">{t.lokasi}</td></tr>}
                  {t.letak_tanah && <tr><td className="py-1">Letak Tanah</td><td className="py-1">:</td><td className="py-1">{t.letak_tanah}</td></tr>}
                  {t.bentuk_tanah && <tr><td className="py-1">Bentuk Tanah</td><td className="py-1">:</td><td className="py-1">{t.bentuk_tanah}</td></tr>}
                  {t.arah_menghadap && <tr><td className="py-1">Arah Menghadap</td><td className="py-1">:</td><td className="py-1 capitalize">{t.arah_menghadap}</td></tr>}
                  {t.lebar_jalan_depan && <tr><td className="py-1">Lebar Jalan Depan</td><td className="py-1">:</td><td className="py-1">{t.lebar_jalan_depan} m</td></tr>}
                  {t.bahan_jalan && <tr><td className="py-1">Bahan Jalan</td><td className="py-1">:</td><td className="py-1 capitalize">{t.bahan_jalan}</td></tr>}
                  {(t.batas_depan || t.batas_belakang || t.batas_kanan || t.batas_kiri) && (
                    <>
                      <tr><td className="py-1 font-medium" colSpan={3}>Batas-Batas:</td></tr>
                      {t.batas_depan && <tr><td className="py-1 pl-4">Depan</td><td className="py-1">:</td><td className="py-1">{t.batas_depan}</td></tr>}
                      {t.batas_belakang && <tr><td className="py-1 pl-4">Belakang</td><td className="py-1">:</td><td className="py-1">{t.batas_belakang}</td></tr>}
                      {t.batas_kanan && <tr><td className="py-1 pl-4">Kanan</td><td className="py-1">:</td><td className="py-1">{t.batas_kanan}</td></tr>}
                      {t.batas_kiri && <tr><td className="py-1 pl-4">Kiri</td><td className="py-1">:</td><td className="py-1">{t.batas_kiri}</td></tr>}
                    </>
                  )}
                  {t.kelas_jalan && <tr><td className="py-1">Kelas Jalan</td><td className="py-1">:</td><td className="py-1 capitalize">{t.kelas_jalan.replace('_', ' ')}</td></tr>}
                  {t.listrik_pln && <tr><td className="py-1">Listrik PLN</td><td className="py-1">:</td><td className="py-1">{t.listrik_pln} Watt</td></tr>}
                  {t.air_bersih && <tr><td className="py-1">Air Bersih</td><td className="py-1">:</td><td className="py-1 capitalize">{t.air_bersih === 'ada' ? 'Ada' : 'Tidak Ada'}</td></tr>}
                </React.Fragment>
              ))}
              {isTB && detailTB && tanahList.length === 0 && (
                <>
                  <tr><td className="py-1 w-1/3">Luas Tanah</td><td className="py-1 w-4">:</td><td className="py-1">{detailTB.luas_tanah} m²</td></tr>
                  <tr><td className="py-1">Harga Tanah per m²</td><td className="py-1">:</td><td className="py-1">{formatCurrency(detailTB.harga_tanah_per_meter)}</td></tr>
                  <tr><td className="py-1">Luas Bangunan</td><td className="py-1">:</td><td className="py-1">{detailTB.luas_bangunan} m²</td></tr>
                  <tr><td className="py-1">Harga Bangunan per m²</td><td className="py-1">:</td><td className="py-1">{formatCurrency(detailTB.harga_bangunan_per_meter)}</td></tr>
                </>
              )}
            </tbody>
          </table>

          {/* Bangunan detail for TB */}
          {isTB && bangunanList.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-base border-b pb-1 mb-2">Data Bangunan</h3>
              {bangunanList.map((b, idx) => (
                <table key={idx} className="w-full text-sm mb-4">
                  <tbody>
                    {bangunanList.length > 1 && (
                      <tr><td colSpan={3} className="py-2 font-bold text-primary">Bangunan #{idx + 1}</td></tr>
                    )}
                    <tr><td className="py-1 w-1/3">Luas Bangunan</td><td className="py-1 w-4">:</td><td className="py-1">{b.luas_bangunan} m²</td></tr>
                    {b.peruntukkan && <tr><td className="py-1">Peruntukkan</td><td className="py-1">:</td><td className="py-1 capitalize">{b.peruntukkan.replace('_', ' ')}</td></tr>}
                    {b.konstruksi && <tr><td className="py-1">Konstruksi</td><td className="py-1">:</td><td className="py-1 capitalize">{b.konstruksi.replace('_', ' ')}</td></tr>}
                    {b.pondasi && <tr><td className="py-1">Pondasi</td><td className="py-1">:</td><td className="py-1 capitalize">{b.pondasi.replace('_', ' ')}</td></tr>}
                    {b.atap && <tr><td className="py-1">Atap</td><td className="py-1">:</td><td className="py-1 capitalize">{b.atap.replace('_', ' ')}</td></tr>}
                    {b.dinding && <tr><td className="py-1">Dinding</td><td className="py-1">:</td><td className="py-1 capitalize">{b.dinding.replace('_', ' ')}{b.plester_dinding ? ' (Diplester)' : ''}</td></tr>}
                    {b.plafon && <tr><td className="py-1">Plafon</td><td className="py-1">:</td><td className="py-1 capitalize">{b.plafon.replace('_', ' ')}</td></tr>}
                    {b.lantai && <tr><td className="py-1">Lantai</td><td className="py-1">:</td><td className="py-1 capitalize">{b.lantai.replace('_', ' ')}</td></tr>}
                    {b.tiang && <tr><td className="py-1">Tiang</td><td className="py-1">:</td><td className="py-1 capitalize">{b.tiang.replace('_', ' ')}</td></tr>}
                    {b.tinggi_lantai && <tr><td className="py-1">Tinggi Lantai</td><td className="py-1">:</td><td className="py-1">{b.tinggi_lantai} Lantai</td></tr>}
                    {b.imb_ada && (
                      <>
                        <tr><td className="py-1">IMB</td><td className="py-1">:</td><td className="py-1">Ada</td></tr>
                        {b.nomor_imb && <tr><td className="py-1 pl-4">Nomor IMB</td><td className="py-1">:</td><td className="py-1">{b.nomor_imb}</td></tr>}
                        {b.tanggal_imb && <tr><td className="py-1 pl-4">Tanggal IMB</td><td className="py-1">:</td><td className="py-1">{formatDate(b.tanggal_imb)}</td></tr>}
                        {b.nama_di_imb && <tr><td className="py-1 pl-4">Nama di IMB</td><td className="py-1">:</td><td className="py-1">{b.nama_di_imb}</td></tr>}
                        {b.luas_sesuai_imb && <tr><td className="py-1 pl-4">Luas Sesuai IMB</td><td className="py-1">:</td><td className="py-1">{b.luas_sesuai_imb} m²</td></tr>}
                      </>
                    )}
                    {!b.imb_ada && <tr><td className="py-1">IMB</td><td className="py-1">:</td><td className="py-1">Tidak Ada</td></tr>}
                    {b.keterangan && <tr><td className="py-1">Keterangan</td><td className="py-1">:</td><td className="py-1">{b.keterangan}</td></tr>}
                  </tbody>
                </table>
              ))}
            </div>
          )}
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

          {/* TB Harga Pembanding Tables */}
          {isTB && tanahList.length > 0 && (
            <>
              {tanahList.map((t, idx) => (
                t.harga_pembanding && t.harga_pembanding.length > 0 && (
                  <div key={`tanah-hp-${idx}`} className="mb-4">
                    <p className="text-sm font-medium">Harga Pembanding Tanah {tanahList.length > 1 ? `#${idx + 1}` : ''} (Luas: {t.luas_tanah} m²)</p>
                    <table className="w-full text-sm border mt-1">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border p-2 w-12">No</th>
                          <th className="border p-2 text-right">Harga/m²</th>
                          <th className="border p-2">Sumber</th>
                        </tr>
                      </thead>
                      <tbody>
                        {t.harga_pembanding.map((hp, i) => (
                          <tr key={i}>
                            <td className="border p-2 text-center">{i + 1}</td>
                            <td className="border p-2 text-right">{formatCurrency(hp.harga)}</td>
                            <td className="border p-2 text-xs break-all">{hp.sumber}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ))}
              {bangunanList.map((b, idx) => (
                b.harga_pembanding && b.harga_pembanding.length > 0 && (
                  <div key={`bangunan-hp-${idx}`} className="mb-4">
                    <p className="text-sm font-medium">Harga Pembanding Bangunan {bangunanList.length > 1 ? `#${idx + 1}` : ''} (Luas: {b.luas_bangunan} m²)</p>
                    <table className="w-full text-sm border mt-1">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border p-2 w-12">No</th>
                          <th className="border p-2 text-right">Harga/m²</th>
                          <th className="border p-2">Sumber</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.harga_pembanding.map((hp, i) => (
                          <tr key={i}>
                            <td className="border p-2 text-center">{i + 1}</td>
                            <td className="border p-2 text-right">{formatCurrency(hp.harga)}</td>
                            <td className="border p-2 text-xs break-all">{hp.sumber}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ))}
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
            <p className="text-sm mb-2">{formatDate(taksasi.tanggal)}</p>
            <p>PT BANK PEMBANGUNAN DAERAH</p>
            <p>KALIMANTAN TIMUR DAN KALIMANTAN UTARA</p>
            <p>{taksasi.kantor_cabang.toUpperCase()}</p>

            {/* Area tanda tangan - 4 baris space */}
            <div className="mt-4">
              <br /><br /><br /><br />
              <div className="border-b border-black w-48 mx-auto"></div>
            </div>

            <p className="font-bold">{taksasi.pimpinan}</p>
            <p className="italic">{taksasi.jabatan_pimpinan}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

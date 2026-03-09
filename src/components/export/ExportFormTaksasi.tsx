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

// Helper to render a row
const Row = ({ label, value, indent }: { label: string; value: React.ReactNode; indent?: boolean }) => {
  if (!value || value === '' || value === '0' || value === 0) return null;
  return (
    <tr>
      <td className={`py-1 w-1/3 ${indent ? 'pl-6' : ''}`}>{label}</td>
      <td className="py-1 w-4">:</td>
      <td className="py-1">{value}</td>
    </tr>
  );
};

function SafetyMarginTable({ label, items }: { label: string; items: { kategori: string; kondisi: string; margin: number }[] }) {
  const avgMargin = items.length > 0 
    ? Math.round(items.reduce((s, i) => s + i.margin, 0) / items.length) 
    : 0;
  return (
    <div className="mb-4">
      <p className="text-sm font-medium mb-1">{label}</p>
      <table className="w-full text-sm border">
        <thead className="bg-muted">
          <tr>
            <th className="border p-2 text-left">Kategori</th>
            <th className="border p-2 text-left">Kondisi</th>
            <th className="border p-2 text-right w-24">Margin (%)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td className="border p-2">{item.kategori}</td>
              <td className="border p-2">{item.kondisi}</td>
              <td className="border p-2 text-right">{item.margin}%</td>
            </tr>
          ))}
          <tr className="font-bold bg-muted/50">
            <td className="border p-2" colSpan={2}>Rata-rata Safety Margin</td>
            <td className="border p-2 text-right">{avgMargin}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

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

  // Build safety margin items for tanah
  const buildTanahSafetyItems = (sm: TanahItemData['safety_margins']) => {
    if (!sm) return [];
    return [
      { kategori: 'Lokasi/Daerah', kondisi: getLabelByValue(SAFETY_MARGIN_TANAH.lokasi_daerah, sm.lokasi), margin: getMarginByValue(SAFETY_MARGIN_TANAH.lokasi_daerah, sm.lokasi) },
      { kategori: 'Topography', kondisi: getLabelByValue(SAFETY_MARGIN_TANAH.topography, sm.topography), margin: getMarginByValue(SAFETY_MARGIN_TANAH.topography, sm.topography) },
      { kategori: 'Ukuran/Bentuk', kondisi: getLabelByValue(SAFETY_MARGIN_TANAH.ukuran_bentuk, sm.ukuran), margin: getMarginByValue(SAFETY_MARGIN_TANAH.ukuran_bentuk, sm.ukuran) },
      { kategori: 'Bukti Kepemilikan', kondisi: getLabelByValue(SAFETY_MARGIN_TANAH.bukti_kepemilikan, sm.bukti), margin: getMarginByValue(SAFETY_MARGIN_TANAH.bukti_kepemilikan, sm.bukti) },
      { kategori: 'Lingkungan Sekitar', kondisi: getLabelByValue(SAFETY_MARGIN_TANAH.lingkungan_sekitar, sm.lingkungan), margin: getMarginByValue(SAFETY_MARGIN_TANAH.lingkungan_sekitar, sm.lingkungan) },
      { kategori: 'Permasalahan', kondisi: getLabelByValue(SAFETY_MARGIN_TANAH.permasalahan, sm.permasalahan), margin: getMarginByValue(SAFETY_MARGIN_TANAH.permasalahan, sm.permasalahan) },
    ].filter(i => i.kondisi && i.kondisi !== sm.lokasi); // filter out unresolved values
  };

  const buildBangunanSafetyItems = (sm: BangunanItemData['safety_margins']) => {
    if (!sm) return [];
    return [
      { kategori: 'Design/Model', kondisi: getLabelByValue(SAFETY_MARGIN_BANGUNAN.design, sm.design), margin: getMarginByValue(SAFETY_MARGIN_BANGUNAN.design, sm.design) },
      { kategori: 'Umur Efektif', kondisi: getLabelByValue(SAFETY_MARGIN_BANGUNAN.umur, sm.umur), margin: getMarginByValue(SAFETY_MARGIN_BANGUNAN.umur, sm.umur) },
      { kategori: 'Peruntukkan', kondisi: getLabelByValue(SAFETY_MARGIN_BANGUNAN.peruntukkan, sm.peruntukkan), margin: getMarginByValue(SAFETY_MARGIN_BANGUNAN.peruntukkan, sm.peruntukkan) },
      { kategori: 'IMB', kondisi: getLabelByValue(SAFETY_MARGIN_BANGUNAN.imb, sm.imb), margin: getMarginByValue(SAFETY_MARGIN_BANGUNAN.imb, sm.imb) },
      { kategori: 'Kesesuaian Lahan', kondisi: getLabelByValue(SAFETY_MARGIN_BANGUNAN.kesesuaian_lahan, sm.kesesuaian), margin: getMarginByValue(SAFETY_MARGIN_BANGUNAN.kesesuaian_lahan, sm.kesesuaian) },
      { kategori: 'Permasalahan', kondisi: getLabelByValue(SAFETY_MARGIN_BANGUNAN.permasalahan, sm.permasalahan), margin: getMarginByValue(SAFETY_MARGIN_BANGUNAN.permasalahan, sm.permasalahan) },
    ].filter(i => i.kondisi && i.kondisi !== sm.design);
  };

  // Check if we have real resolved safety margin labels
  const hasTanahSafety = tanahList.some(t => t.safety_margins?.lokasi);
  const hasBangunanSafety = bangunanList.some(b => b.safety_margins?.design);

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
              <Row label="Jenis Agunan" value={isKendaraan ? detailKendaraan?.jenis : taksasi.jenis_agunan.toUpperCase()} />
              <Row label="Petugas Yang Melakukan Penilaian" value={<>{taksasi.petugas} <span className="text-muted-foreground ml-4">{taksasi.jabatan_petugas}</span></>} />
              <Row label="Tanggal Penilaian" value={formatDate(taksasi.tanggal)} />
              <Row label="Nama Calon Debitur / Debitur" value={taksasi.nama_nasabah} />
              <Row label="Lokasi Objek Agunan" value={taksasi.alamat} />
              {taksasi.kantor_cabang && <Row label="Kantor Cabang" value={taksasi.kantor_cabang} />}
            </tbody>
          </table>
        </div>

        {/* II. PROFIL AGUNAN */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg border-b pb-2">II. PROFIL AGUNAN</h2>

          {/* === KENDARAAN === */}
          {isKendaraan && detailKendaraan && (
            <table className="w-full text-sm">
              <tbody>
                <Row label="Jenis" value={detailKendaraan.jenis} />
                <Row label="Model / Type" value={detailKendaraan.model} />
                <Row label="Merk" value={detailKendaraan.merk} />
                <Row label="Tahun Pembuatan" value={detailKendaraan.tahun} />
                <Row label="Nomor Polisi" value={detailKendaraan.nomor_polisi} />
                <Row label="Nomor Mesin" value={detailKendaraan.nomor_mesin} />
                <Row label="Nomor Rangka" value={detailKendaraan.nomor_rangka} />
                <Row label="Buatan" value={detailKendaraan.buatan} />
                <Row label="Bukti Kepemilikan" value={detailKendaraan.bukti_kepemilikan} />
                <Row label="Nomor Bukti Kepemilikan" value={detailKendaraan.nomor_bukti_kepemilikan} />
                <Row label="Tanggal Bukti Kepemilikan" value={formatDate(detailKendaraan.tanggal_bukti_kepemilikan)} />
                <Row label="Nama Kepemilikan" value={detailKendaraan.nama_kepemilikan} />
                <Row label="Kondisi Unit" value={detailKendaraan.kondisi_unit} />
              </tbody>
            </table>
          )}

          {/* === TANAH ONLY === */}
          {isTanah && detailTanah && (
            <table className="w-full text-sm">
              <tbody>
                <Row label="Luas Tanah" value={`${detailTanah.luas_tanah} m²`} />
                <Row label="Harga per m²" value={formatCurrency(detailTanah.harga_per_meter)} />
              </tbody>
            </table>
          )}

          {/* === TANAH & BANGUNAN - Rich Data === */}
          {isTB && tanahList.length > 0 && (
            <>
              {tanahList.map((t, idx) => (
                <div key={idx} className="mb-4">
                  {tanahList.length > 1 && (
                    <h3 className="font-bold text-primary mb-2">Data Tanah #{idx + 1}</h3>
                  )}
                  {tanahList.length === 1 && (
                    <h3 className="font-bold mb-2">A. Data Tanah</h3>
                  )}
                  
                   {/* Data Legalitas */}
                   <p className="text-sm font-semibold mt-2 mb-1 text-muted-foreground">Data Legalitas</p>
                   <table className="w-full text-sm">
                     <tbody>
                       <Row label="Bukti Kepemilikan" value={formatBuktiKepemilikan(t.bukti_kepemilikan)} />
                       <Row label="Nomor Sertifikat/Bukti" value={t.nomor_bukti} />
                       <Row label="Tanggal Sertifikat/Bukti" value={t.tanggal_bukti ? formatDate(t.tanggal_bukti) : null} />
                       <Row label="Masa Berlaku" value={t.masa_berlaku ? formatDate(t.masa_berlaku) : null} />
                       <Row label="Nama Pemegang Hak" value={t.nama_pemegang_hak} />
                       <Row label="Hubungan dengan Debitur" value={t.hubungan_dengan_debitur === 'milik_sendiri' ? 'Milik Sendiri' : t.hubungan_dengan_debitur} />
                       <Row label="Nomor Gambar Situasi/Surat Ukur" value={t.nomor_gambar_situasi} />
                       <Row label="Nomor Induk Bidang (NIB)" value={t.nomor_induk_bidang} />
                       <Row label="Luas Tanah (Sertifikat)" value={t.luas_tanah ? `${t.luas_tanah} m²` : null} />
                       <Row label="Tempat Didaftarkan" value={t.tempat_didaftarkan} />
                     </tbody>
                   </table>

                  {/* Hasil Pemeriksaan Fisik */}
                  <p className="text-sm font-semibold mt-3 mb-1 text-muted-foreground">Hasil Pemeriksaan Fisik</p>
                  <table className="w-full text-sm">
                    <tbody>
                      <Row label="Lokasi" value={t.lokasi} />
                      <Row label="Letak Tanah" value={t.letak_tanah} />
                      <Row label="Bentuk Tanah" value={t.bentuk_tanah} />
                      <Row label="Arah Menghadap" value={t.arah_menghadap ? <span className="capitalize">{t.arah_menghadap}</span> : null} />
                      <Row label="Lebar Jalan Depan" value={t.lebar_jalan_depan ? `${t.lebar_jalan_depan} m` : null} />
                      <Row label="Bahan Jalan" value={t.bahan_jalan ? <span className="capitalize">{t.bahan_jalan}</span> : null} />
                      <Row label="Kelas Jalan" value={t.kelas_jalan ? <span className="capitalize">{t.kelas_jalan.replace(/_/g, ' ')}</span> : null} />
                    </tbody>
                  </table>

                  {/* Batas-Batas */}
                  {(t.batas_depan || t.batas_belakang || t.batas_kanan || t.batas_kiri) && (
                    <>
                      <p className="text-sm font-semibold mt-3 mb-1 text-muted-foreground">Batas-Batas</p>
                      <table className="w-full text-sm">
                        <tbody>
                          <Row label="Depan" value={t.batas_depan} />
                          <Row label="Belakang" value={t.batas_belakang} />
                          <Row label="Kanan" value={t.batas_kanan} />
                          <Row label="Kiri" value={t.batas_kiri} />
                        </tbody>
                      </table>
                    </>
                  )}

                  {/* Analisa Lingkungan */}
                  {(t.kondisi_lalu_lintas || t.listrik_pln || t.air_bersih || t.saluran_telepon || (t.fasilitas_penunjang && t.fasilitas_penunjang.length > 0)) && (
                    <>
                      <p className="text-sm font-semibold mt-3 mb-1 text-muted-foreground">Analisa Lingkungan</p>
                      <table className="w-full text-sm">
                        <tbody>
                          <Row label="Kondisi Lalu Lintas" value={t.kondisi_lalu_lintas ? <span className="capitalize">{t.kondisi_lalu_lintas.replace(/_/g, ' ')}</span> : null} />
                          <Row label="Listrik PLN" value={t.listrik_pln ? `${t.listrik_pln} Watt` : null} />
                          <Row label="Air Bersih" value={t.air_bersih === 'ada' ? 'Ada' : t.air_bersih === 'tidak_ada' ? 'Tidak Ada' : t.air_bersih} />
                          <Row label="Saluran Telepon" value={t.saluran_telepon === 'ada' ? 'Ada' : t.saluran_telepon === 'tidak_ada' ? 'Tidak Ada' : t.saluran_telepon} />
                          {t.fasilitas_penunjang && t.fasilitas_penunjang.length > 0 && (
                            <Row label="Fasilitas Penunjang" value={t.fasilitas_penunjang.map(f => <span key={f} className="capitalize">{f.replace(/_/g, ' ')}</span>).reduce((prev, curr, i) => <>{prev}{i > 0 ? ', ' : ''}{curr}</>, <></> as any)} />
                          )}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              ))}

              {/* Data Bangunan */}
              {bangunanList.length > 0 && (
                <div className="mt-4">
                  {bangunanList.map((b, idx) => (
                    <div key={idx} className="mb-4">
                      {bangunanList.length > 1 ? (
                        <h3 className="font-bold text-primary mb-2">Data Bangunan #{idx + 1}</h3>
                      ) : (
                        <h3 className="font-bold mb-2">B. Data Bangunan</h3>
                      )}

                      <p className="text-sm font-semibold mt-2 mb-1 text-muted-foreground">Spesifikasi Bangunan</p>
                      <table className="w-full text-sm">
                        <tbody>
                          <Row label="Luas Bangunan" value={`${b.luas_bangunan} m²`} />
                          <Row label="Peruntukkan" value={b.peruntukkan ? <span className="capitalize">{b.peruntukkan.replace(/_/g, ' ')}</span> : null} />
                          <Row label="Konstruksi" value={b.konstruksi ? <span className="capitalize">{b.konstruksi.replace(/_/g, ' ')}</span> : null} />
                          <Row label="Pondasi" value={b.pondasi ? <span className="capitalize">{b.pondasi.replace(/_/g, ' ')}</span> : null} />
                          <Row label="Tinggi Lantai" value={b.tinggi_lantai ? `${b.tinggi_lantai} Lantai` : null} />
                          <Row label="Atap" value={b.atap ? <span className="capitalize">{b.atap.replace(/_/g, ' ')}</span> : null} />
                          <Row label="Dinding" value={b.dinding ? <span className="capitalize">{b.dinding.replace(/_/g, ' ')}{b.plester_dinding ? ' (Diplester)' : ''}</span> : null} />
                          <Row label="Plafon" value={b.plafon ? <span className="capitalize">{b.plafon.replace(/_/g, ' ')}</span> : null} />
                          <Row label="Lantai" value={b.lantai ? <span className="capitalize">{b.lantai.replace(/_/g, ' ')}</span> : null} />
                          <Row label="Tiang" value={b.tiang ? <span className="capitalize">{b.tiang.replace(/_/g, ' ')}</span> : null} />
                        </tbody>
                      </table>

                      {/* IMB */}
                      <p className="text-sm font-semibold mt-3 mb-1 text-muted-foreground">Izin Mendirikan Bangunan (IMB)</p>
                      <table className="w-full text-sm">
                        <tbody>
                          <Row label="Status IMB" value={b.imb_ada ? 'Ada' : 'Tidak Ada'} />
                          {b.imb_ada && (
                            <>
                              <Row label="Nomor IMB" value={b.nomor_imb} />
                              <Row label="Tanggal IMB" value={b.tanggal_imb ? formatDate(b.tanggal_imb) : null} />
                              <Row label="Nama di IMB" value={b.nama_di_imb} />
                              <Row label="Luas Sesuai IMB" value={b.luas_sesuai_imb ? `${b.luas_sesuai_imb} m²` : null} />
                            </>
                          )}
                        </tbody>
                      </table>

                      {b.keterangan && (
                        <table className="w-full text-sm mt-2">
                          <tbody>
                            <Row label="Keterangan" value={b.keterangan} />
                          </tbody>
                        </table>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TB Legacy fallback (no rich data) */}
          {isTB && detailTB && tanahList.length === 0 && (
            <table className="w-full text-sm">
              <tbody>
                <Row label="Luas Tanah" value={`${detailTB.luas_tanah} m²`} />
                <Row label="Harga Tanah per m²" value={formatCurrency(detailTB.harga_tanah_per_meter)} />
                <Row label="Luas Bangunan" value={`${detailTB.luas_bangunan} m²`} />
                <Row label="Harga Bangunan per m²" value={formatCurrency(detailTB.harga_bangunan_per_meter)} />
              </tbody>
            </table>
          )}
        </div>

        {/* III. METODE PENILAIAN */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg border-b pb-2">III. METODE PENILAIAN</h2>
          
          {/* Kendaraan: Harga Pembanding */}
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

          {/* TB: Harga Pembanding Tables */}
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
            {formatTerbilang(taksasi.nilai_taksasi_pembulatan || taksasi.nilai_taksasi)}
          </p>
        </div>

        {/* IV. SAFETY MARGIN DETAIL (TB) */}
        {isTB && (hasTanahSafety || hasBangunanSafety) && (
          <div className="space-y-3">
            <h2 className="font-bold text-lg border-b pb-2">IV. ANALISA SAFETY MARGIN</h2>
            {tanahList.map((t, idx) => {
              const items = buildTanahSafetyItems(t.safety_margins);
              if (items.length === 0) return null;
              return (
                <SafetyMarginTable
                  key={`sm-tanah-${idx}`}
                  label={`Safety Margin Tanah${tanahList.length > 1 ? ` #${idx + 1}` : ''}`}
                  items={items}
                />
              );
            })}
            {bangunanList.map((b, idx) => {
              const items = buildBangunanSafetyItems(b.safety_margins);
              if (items.length === 0) return null;
              return (
                <SafetyMarginTable
                  key={`sm-bangunan-${idx}`}
                  label={`Safety Margin Bangunan${bangunanList.length > 1 ? ` #${idx + 1}` : ''}`}
                  items={items}
                />
              );
            })}
          </div>
        )}

        {/* V. MARKETABILITY (TB) */}
        {isTB && detailTB?.marketability && (
          <div className="space-y-3">
            <h2 className="font-bold text-lg border-b pb-2">{hasTanahSafety || hasBangunanSafety ? 'V' : 'IV'}. MARKETABILITY</h2>
            <table className="w-full text-sm">
              <tbody>
                <Row label="Tingkat Marketability" value={<span className="capitalize font-medium">{detailTB.marketability.replace(/_/g, ' ')}</span>} />
              </tbody>
            </table>
            {detailTB.catatan_marketability && detailTB.catatan_marketability.filter(c => c).length > 0 && (
              <div className="text-sm">
                <p className="font-medium mb-1">Catatan:</p>
                <ul className="list-disc pl-6 space-y-1">
                  {detailTB.catatan_marketability.filter(c => c).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* KETERANGAN (Kendaraan) */}
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

          <div className="text-center">
            <p className="text-sm mb-2">{formatDate(taksasi.tanggal)}</p>
            <p>PT BANK PEMBANGUNAN DAERAH</p>
            <p>KALIMANTAN TIMUR DAN KALIMANTAN UTARA</p>
            <p>{taksasi.kantor_cabang?.toUpperCase()}</p>
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

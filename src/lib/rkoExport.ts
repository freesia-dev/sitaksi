import * as XLSX from 'xlsx';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function periodeLabel(periode: string): string {
  // periode: YYYY-MM
  const [y, m] = periode.split('-');
  const idx = Math.max(0, Math.min(11, parseInt(m, 10) - 1));
  return `${MONTHS[idx]} ${y}`;
}

export function formatTanggalLengkap(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export interface SubrogasiItemRow {
  no: number;
  asuransi?: 'askrida' | 'jamkrindo';
  nama_debitur: string;
  no_loan: string;
  produk: string;
  nik: string;
  no_premi_asuransi: string;
  no_perjanjian_kredit: string;
  nilai_subrogasi: number;
  tahun_pencairan: number | null;
  tanggal_pembayaran: string | null;
  akumulasi_pembayaran: number;
  sisa_subrogasi: number;
  nama_cabang: string;
  konfirmasi_asuransi: string;
  konfirmasi_cabang: string;
  hasil_kesepakatan: string;
}

export function exportSubrogasiToExcel(opts: {
  periode: string;
  namaKantor: string;
  tanggalLaporan: string;
  items: SubrogasiItemRow[];
}) {
  const { periode, namaKantor, tanggalLaporan, items } = opts;
  const periodeLbl = periodeLabel(periode);

  const headerRow = [
    'No', 'Nama Debitur', 'No Loan', 'Produk', 'NIK',
    'No. Premi Asuransi', 'No. Perjanjian Kredit', 'Nilai Subrogasi',
    'Tanggal Pencairan Subrogasi (Tahun)', 'Tanggal Pembayaran Subrogasi',
    'Akumulasi Pembayaran', 'Sisa Subrogasi', 'Nama Cabang BPD/Capem',
    'Konfirmasi Asuransi', 'Konfirmasi Kantor Cabang',
    'Hasil Kesepakatan dengan Asuransi',
  ];

  const aoa: (string | number | null)[][] = [];

  const askrida = items.filter((it) => (it.asuransi || 'askrida') === 'askrida');
  const jamkrindo = items.filter((it) => it.asuransi === 'jamkrindo');

  const pushSection = (title: string, rows: SubrogasiItemRow[]) => {
    aoa.push([title]);
    aoa.push(['PT. BPD KALTIM KALTARA']);
    aoa.push([namaKantor]);
    aoa.push([`Periode Data ${periodeLbl}`]);
    aoa.push([]);
    aoa.push(headerRow);
    rows.forEach((it, i) => {
      aoa.push([
        i + 1,
        it.nama_debitur,
        it.no_loan,
        it.produk,
        it.nik,
        it.no_premi_asuransi,
        it.no_perjanjian_kredit,
        it.nilai_subrogasi || null,
        it.tahun_pencairan,
        it.tanggal_pembayaran ? formatTanggalLengkap(it.tanggal_pembayaran) : '',
        it.akumulasi_pembayaran || null,
        it.sisa_subrogasi || null,
        it.nama_cabang,
        it.konfirmasi_asuransi,
        it.konfirmasi_cabang,
        it.hasil_kesepakatan,
      ]);
    });
    aoa.push([]);
    aoa.push([]);
  };

  pushSection('Data Subrogasi Asuransi Askrida', askrida);
  pushSection('Data Subrogasi Asuransi Jamkrindo', jamkrindo);

  // Footer (signature block at column L = index 11)
  const footerCol = 11;
  const padded = (text: string) => {
    const r: (string | number | null)[] = new Array(footerCol).fill('');
    r.push(text);
    return r;
  };
  aoa.push(padded(`Bontang, ${formatTanggalLengkap(tanggalLaporan)}`));
  aoa.push(padded('PT. BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA'));
  aoa.push(padded(namaKantor.toUpperCase()));
  aoa.push(padded('Pemimpin,'));

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  // Column widths
  ws['!cols'] = [
    { wch: 5 }, { wch: 30 }, { wch: 14 }, { wch: 20 }, { wch: 20 },
    { wch: 24 }, { wch: 28 }, { wch: 16 }, { wch: 14 }, { wch: 16 },
    { wch: 18 }, { wch: 16 }, { wch: 38 }, { wch: 26 }, { wch: 26 },
    { wch: 50 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, periodeLbl.toUpperCase());
  XLSX.writeFile(wb, `Laporan_Subrogasi_${periodeLbl.replace(' ', '_')}.xlsx`);
}

export interface PlNplItemRow {
  no: number;
  no_loan: string;
  kolektabilitas: string;
  nama_debitur: string;
  no_pk: string;
  tanggal_mulai: string | null;
  tanggal_mature: string | null;
  no_rekening: string;
  plafon: number;
  baki_debet: number;
  tunggakan_pokok: number;
  tunggakan_bunga: number;
  proyeksi_tw: string;
  jenis_kredit: string;
  alasan_npl: string;
}

export function exportPlNplToExcel(opts: {
  periode: string;
  mlfJobdate?: string | null;
  items: PlNplItemRow[];
}) {
  const { periode, mlfJobdate, items } = opts;
  const periodeLbl = periodeLabel(periode);
  const header = [
    'No', 'Nomor Loan', 'Kolektabilitas', 'Nama Debitur', 'Nomor PK',
    'Tanggal Mulai', 'Tanggal Mature', 'Nomor Rekening', 'Plafon Kredit',
    'Baki Debet', 'Tunggakan Pokok', 'Tunggakan Bunga',
    'Proyeksi Masuk NPL', 'Jenis Kredit', 'Alasan Masuk NPL',
  ];
  const aoa: (string | number | null)[][] = [
    ['Laporan Proyeksi PL to NPL'],
    ['PT. BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA'],
    [`Periode: ${periodeLbl}`],
    [`Data MLF per: ${mlfJobdate ? formatTanggalLengkap(mlfJobdate) : '-'}`],
    [],
    header,
  ];
  items.forEach((it) => {
    aoa.push([
      it.no, it.no_loan, it.kolektabilitas, it.nama_debitur, it.no_pk,
      it.tanggal_mulai ? formatTanggalLengkap(it.tanggal_mulai) : '',
      it.tanggal_mature ? formatTanggalLengkap(it.tanggal_mature) : '',
      it.no_rekening, it.plafon || null, it.baki_debet || null,
      it.tunggakan_pokok || null, it.tunggakan_bunga || null,
      it.proyeksi_tw, it.jenis_kredit, it.alasan_npl,
    ]);
  });
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [
    { wch: 5 }, { wch: 14 }, { wch: 8 }, { wch: 32 }, { wch: 28 },
    { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
    { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 24 }, { wch: 40 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `PL-NPL ${periodeLbl}`);
  XLSX.writeFile(wb, `Laporan_PL_to_NPL_${periodeLbl.replace(' ', '_')}.xlsx`);
}

/** Parse MLF .xls/.xlsx and return Master_Loan_Filter rows */
export async function parseMlfFile(file: File): Promise<any[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array', cellDates: true });
  const sheetName = wb.SheetNames.find((s) => s.toLowerCase().includes('master_loan_filter'))
    || wb.SheetNames.find((s) => s.toLowerCase().includes('master'))
    || wb.SheetNames[0];
  if (!sheetName) throw new Error('Sheet Master_Loan_Filter tidak ditemukan');
  const ws = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<any>(ws, { defval: null, raw: true });
}
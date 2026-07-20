import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

function fmtRp(n: number): string {
  if (!n) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(n);
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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

export async function exportSubrogasiToExcel(opts: {
  periode: string;
  namaKantor: string;
  tanggalLaporan: string;
  items: SubrogasiItemRow[];
  namaPemimpin?: string;
}) {
  const { periode, namaKantor, tanggalLaporan, items, namaPemimpin } = opts;
  const periodeLbl = periodeLabel(periode);
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SiTaksi';
  wb.created = new Date();
  const ws = wb.addWorksheet(periodeLbl.toUpperCase(), {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 } },
  });
  const widths = [5, 28, 14, 20, 20, 24, 26, 18, 14, 18, 18, 18, 36, 24, 24, 40];
  ws.columns = widths.map((w) => ({ width: w }));
  const COLS = 16;
  const lastCol = String.fromCharCode(64 + COLS); // P

  const headerCols = [
    'No', 'Nama Debitur', 'No Loan', 'Produk', 'NIK',
    'No. Premi Asuransi', 'No. Perjanjian Kredit', 'Nilai Subrogasi',
    'Tahun Pencairan', 'Tanggal Pembayaran',
    'Akumulasi Pembayaran', 'Sisa Subrogasi', 'Nama Cabang BPD/Capem',
    'Konfirmasi Asuransi', 'Konfirmasi Kantor Cabang',
    'Hasil Kesepakatan dengan Asuransi',
  ];

  const askrida = items.filter((it) => (it.asuransi || 'askrida') === 'askrida');
  const jamkrindo = items.filter((it) => it.asuransi === 'jamkrindo');

  const titleFill = (asuransi: 'askrida' | 'jamkrindo'): ExcelJS.FillPattern => ({
    type: 'pattern', pattern: 'solid',
    fgColor: { argb: asuransi === 'askrida' ? 'FF1E3A8A' : 'FF065F46' },
  });

  const writeSection = (title: string, rows: SubrogasiItemRow[], asuransi: 'askrida' | 'jamkrindo') => {
    // Title block
    const titleRow = ws.addRow([title]);
    ws.mergeCells(`A${titleRow.number}:${lastCol}${titleRow.number}`);
    titleRow.height = 26;
    const tc = ws.getCell(`A${titleRow.number}`);
    tc.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    tc.alignment = { horizontal: 'center', vertical: 'middle' };
    tc.fill = titleFill(asuransi);

    const r2 = ws.addRow(['PT. BPD KALTIM KALTARA']);
    ws.mergeCells(`A${r2.number}:${lastCol}${r2.number}`);
    ws.getCell(`A${r2.number}`).font = { bold: true, size: 11 };
    ws.getCell(`A${r2.number}`).alignment = { horizontal: 'center' };

    const r3 = ws.addRow([namaKantor]);
    ws.mergeCells(`A${r3.number}:${lastCol}${r3.number}`);
    ws.getCell(`A${r3.number}`).alignment = { horizontal: 'center' };

    const r4 = ws.addRow([`Periode Data ${periodeLbl}`]);
    ws.mergeCells(`A${r4.number}:${lastCol}${r4.number}`);
    ws.getCell(`A${r4.number}`).font = { italic: true };
    ws.getCell(`A${r4.number}`).alignment = { horizontal: 'center' };

    ws.addRow([]);

    // Header
    const headerRow = ws.addRow(headerCols);
    headerRow.height = 32;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid',
        fgColor: { argb: asuransi === 'askrida' ? 'FF3B82F6' : 'FF10B981' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      };
    });

    rows.forEach((it, i) => {
      const r = ws.addRow([
        i + 1, it.nama_debitur, it.no_loan, it.produk, it.nik,
        it.no_premi_asuransi, it.no_perjanjian_kredit,
        Number(it.nilai_subrogasi) || 0,
        it.tahun_pencairan,
        it.tanggal_pembayaran ? formatTanggalLengkap(it.tanggal_pembayaran) : '',
        Number(it.akumulasi_pembayaran) || 0,
        Number(it.sisa_subrogasi) || 0,
        it.nama_cabang, it.konfirmasi_asuransi, it.konfirmasi_cabang, it.hasil_kesepakatan,
      ]);
      r.eachCell({ includeEmpty: true }, (cell, colNum) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        };
        cell.alignment = { vertical: 'middle', wrapText: true };
        if (i % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
        }
        if (colNum === 1 || colNum === 9) {
          cell.alignment = { ...cell.alignment, horizontal: 'center' };
        }
        if (colNum === 8 || colNum === 11 || colNum === 12) {
          cell.numFmt = '"Rp"#,##0;[Red]("Rp"#,##0);"-"';
          cell.alignment = { ...cell.alignment, horizontal: 'right' };
        }
      });
      r.height = 36;
    });

    // Section total
    if (rows.length > 0) {
      const totalNilai = rows.reduce((s, x) => s + Number(x.nilai_subrogasi || 0), 0);
      const totalAk = rows.reduce((s, x) => s + Number(x.akumulasi_pembayaran || 0), 0);
      const totalSisa = rows.reduce((s, x) => s + Number(x.sisa_subrogasi || 0), 0);
      const tr = ws.addRow(['', 'TOTAL', '', '', '', '', '', totalNilai, '', '', totalAk, totalSisa, '', '', '', '']);
      tr.eachCell({ includeEmpty: true }, (cell, colNum) => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
        cell.border = { top: { style: 'medium' }, bottom: { style: 'medium' } };
        if (colNum === 8 || colNum === 11 || colNum === 12) {
          cell.numFmt = '"Rp"#,##0;[Red]("Rp"#,##0);"-"';
          cell.alignment = { horizontal: 'right' };
        }
        if (colNum === 2) cell.alignment = { horizontal: 'right' };
      });
    }

    ws.addRow([]);
    ws.addRow([]);
  };

  if (askrida.length > 0) writeSection('Data Subrogasi Asuransi Askrida', askrida, 'askrida');
  if (jamkrindo.length > 0) writeSection('Data Subrogasi Asuransi Jamkrindo', jamkrindo, 'jamkrindo');

  // Footer signature block
  const addSig = (text: string, opts: { bold?: boolean; italic?: boolean } = {}) => {
    const r = ws.addRow([]);
    ws.mergeCells(`A${r.number}:${lastCol}${r.number}`);
    const c = ws.getCell(`A${r.number}`);
    c.value = text;
    c.alignment = { horizontal: 'center' };
    c.font = { bold: opts.bold, italic: opts.italic, size: 10 };
  };
  addSig(`Bontang, ${formatTanggalLengkap(tanggalLaporan)}`, { italic: true });
  addSig('PT. BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA', { bold: true });
  addSig(namaKantor.toUpperCase(), { bold: true });
  addSig('Pemimpin,');
  ws.addRow([]); ws.addRow([]); ws.addRow([]);
  addSig(namaPemimpin ? namaPemimpin : '(_________________________)', { bold: true });

  const buf = await wb.xlsx.writeBuffer();
  saveBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `Laporan_Subrogasi_${periodeLbl.replace(' ', '_')}.xlsx`);
}

/** Subrogasi PDF (A4 landscape, multi-section) */
export function exportSubrogasiToPdf(opts: {
  periode: string;
  namaKantor: string;
  tanggalLaporan: string;
  items: SubrogasiItemRow[];
  namaPemimpin?: string;
}) {
  const { periode, namaKantor, tanggalLaporan, items, namaPemimpin } = opts;
  const periodeLbl = periodeLabel(periode);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const askrida = items.filter((it) => (it.asuransi || 'askrida') === 'askrida');
  const jamkrindo = items.filter((it) => it.asuransi === 'jamkrindo');

  const drawHeader = (title: string, color: [number, number, number]) => {
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(10, 10, pageW - 20, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(title, pageW / 2, 17, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PT. BPD KALTIM KALTARA', pageW / 2, 25, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(namaKantor, pageW / 2, 30, { align: 'center' });
    doc.setFont('helvetica', 'italic');
    doc.text(`Periode Data ${periodeLbl}`, pageW / 2, 35, { align: 'center' });
  };

  const drawSection = (title: string, rows: SubrogasiItemRow[], color: [number, number, number], isFirst: boolean) => {
    if (!isFirst) doc.addPage();
    drawHeader(title, color);
    const body = rows.map((it, i) => [
      i + 1,
      it.nama_debitur,
      it.no_loan,
      it.produk,
      it.no_premi_asuransi,
      it.no_perjanjian_kredit,
      fmtRp(Number(it.nilai_subrogasi)),
      it.tahun_pencairan || '-',
      it.tanggal_pembayaran ? formatTanggalLengkap(it.tanggal_pembayaran) : '-',
      fmtRp(Number(it.akumulasi_pembayaran)),
      fmtRp(Number(it.sisa_subrogasi)),
      it.konfirmasi_asuransi || '-',
      it.konfirmasi_cabang || '-',
      it.hasil_kesepakatan || '-',
    ]);
    const totalNilai = rows.reduce((s, x) => s + Number(x.nilai_subrogasi || 0), 0);
    const totalAk = rows.reduce((s, x) => s + Number(x.akumulasi_pembayaran || 0), 0);
    const totalSisa = rows.reduce((s, x) => s + Number(x.sisa_subrogasi || 0), 0);
    autoTable(doc, {
      startY: 40,
      head: [['No', 'Nama Debitur', 'No Loan', 'Produk', 'No. Premi', 'No. PK',
        'Nilai Subrogasi', 'Thn', 'Tgl Bayar', 'Akumulasi', 'Sisa',
        'Konf. Asuransi', 'Konf. Cabang', 'Hasil Kesepakatan']],
      body,
      foot: [['', 'TOTAL', '', '', '', '', fmtRp(totalNilai), '', '', fmtRp(totalAk), fmtRp(totalSisa), '', '', '']],
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.5, valign: 'middle', overflow: 'linebreak' },
      headStyles: { fillColor: color, textColor: 255, fontStyle: 'bold', halign: 'center', fontSize: 7.5 },
      footStyles: { fillColor: [229, 231, 235], textColor: 0, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { cellWidth: 30 },
        2: { cellWidth: 16 },
        3: { cellWidth: 22 },
        4: { cellWidth: 22 },
        5: { cellWidth: 26 },
        6: { halign: 'right', cellWidth: 22 },
        7: { halign: 'center', cellWidth: 10 },
        8: { halign: 'center', cellWidth: 18 },
        9: { halign: 'right', cellWidth: 20 },
        10: { halign: 'right', cellWidth: 22 },
        11: { cellWidth: 22 },
        12: { cellWidth: 22 },
        13: { cellWidth: 30 },
      },
      margin: { left: 10, right: 10 },
    });

    // Footer signature
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    const pageH = doc.internal.pageSize.getHeight();
    const pageW = doc.internal.pageSize.getWidth();
    let y = finalY + 8;
    if (y > pageH - 40) {
      doc.addPage();
      y = 20;
    }
    const cx = pageW / 2;
    doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
    doc.text(`Bontang, ${formatTanggalLengkap(tanggalLaporan)}`, cx, y, { align: 'center' });
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('PT. BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA', cx, y, { align: 'center' });
    y += 4;
    doc.text(namaKantor.toUpperCase(), cx, y, { align: 'center' });
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.text('Pemimpin,', cx, y, { align: 'center' });
    y += 20;
    doc.setFont('helvetica', 'bold');
    if (namaPemimpin) {
      doc.text(namaPemimpin, cx, y, { align: 'center' });
      const w = doc.getTextWidth(namaPemimpin);
      doc.setLineWidth(0.3);
      doc.line(cx - w / 2 - 2, y + 1.5, cx + w / 2 + 2, y + 1.5);
    } else {
      doc.text('(_________________________)', cx, y, { align: 'center' });
    }
  };

  let isFirst = true;
  if (askrida.length > 0) { drawSection('Data Subrogasi Asuransi Askrida', askrida, [30, 58, 138], isFirst); isFirst = false; }
  if (jamkrindo.length > 0) { drawSection('Data Subrogasi Asuransi Jamkrindo', jamkrindo, [6, 95, 70], isFirst); isFirst = false; }
  if (isFirst) drawHeader('Data Subrogasi Asuransi', [30, 58, 138]);

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(120, 120, 120);
    doc.text(`Hal ${i} dari ${pageCount}`, pageW / 2, pageH - 5, { align: 'center' });
  }
  doc.save(`Laporan_Subrogasi_${periodeLbl.replace(' ', '_')}.pdf`);
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

export async function exportPlNplToExcel(opts: {
  periode: string;
  mlfJobdate?: string | null;
  items: PlNplItemRow[];
  namaKantor?: string;
  tanggalLaporan?: string;
  namaPemimpin?: string;
}) {
  const { periode, mlfJobdate, items, namaKantor, tanggalLaporan, namaPemimpin } = opts;
  const periodeLbl = periodeLabel(periode);
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SiTaksi';
  const ws = wb.addWorksheet(`PL-NPL ${periodeLbl}`, {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  const widths = [5, 14, 10, 30, 28, 14, 14, 18, 18, 18, 16, 16, 14, 22, 36];
  ws.columns = widths.map((w) => ({ width: w }));
  const COLS = 15;
  const lastCol = String.fromCharCode(64 + COLS); // O

  // Title block
  const t1 = ws.addRow(['LAPORAN PROYEKSI PL TO NPL']);
  ws.mergeCells(`A${t1.number}:${lastCol}${t1.number}`);
  t1.height = 28;
  const c1 = ws.getCell(`A${t1.number}`);
  c1.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  c1.alignment = { horizontal: 'center', vertical: 'middle' };
  c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C2D12' } };

  const t2 = ws.addRow(['PT. BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA']);
  ws.mergeCells(`A${t2.number}:${lastCol}${t2.number}`);
  ws.getCell(`A${t2.number}`).font = { bold: true };
  ws.getCell(`A${t2.number}`).alignment = { horizontal: 'center' };

  const t3 = ws.addRow([`Periode: ${periodeLbl}   •   Data MLF per: ${mlfJobdate ? formatTanggalLengkap(mlfJobdate) : '-'}`]);
  ws.mergeCells(`A${t3.number}:${lastCol}${t3.number}`);
  ws.getCell(`A${t3.number}`).font = { italic: true };
  ws.getCell(`A${t3.number}`).alignment = { horizontal: 'center' };
  ws.addRow([]);

  const headerCols = [
    'No', 'Nomor Loan', 'Kol.', 'Nama Debitur', 'Nomor PK',
    'Tgl Mulai', 'Tgl Mature', 'Nomor Rekening', 'Plafon Kredit',
    'Baki Debet', 'Tunggakan Pokok', 'Tunggakan Bunga',
    'Proyeksi', 'Jenis Kredit', 'Alasan Masuk NPL',
  ];
  const hRow = ws.addRow(headerCols);
  hRow.height = 30;
  hRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEA580C' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  items.forEach((it, i) => {
    const r = ws.addRow([
      i + 1, it.no_loan, it.kolektabilitas, it.nama_debitur, it.no_pk,
      it.tanggal_mulai ? formatTanggalLengkap(it.tanggal_mulai) : '',
      it.tanggal_mature ? formatTanggalLengkap(it.tanggal_mature) : '',
      it.no_rekening,
      Number(it.plafon) || 0, Number(it.baki_debet) || 0,
      Number(it.tunggakan_pokok) || 0, Number(it.tunggakan_bunga) || 0,
      it.proyeksi_tw, it.jenis_kredit, it.alasan_npl,
    ]);
    r.height = 32;
    r.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
      cell.alignment = { vertical: 'middle', wrapText: true };
      if (i % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7ED' } };
      if ([1, 3, 13].includes(colNum)) cell.alignment = { ...cell.alignment, horizontal: 'center' };
      if ([9, 10, 11, 12].includes(colNum)) {
        cell.numFmt = '"Rp"#,##0;[Red]("Rp"#,##0);"-"';
        cell.alignment = { ...cell.alignment, horizontal: 'right' };
      }
    });
  });

  // Total row
  if (items.length > 0) {
    const sum = (k: keyof PlNplItemRow) => items.reduce((s, x) => s + Number((x[k] as number) || 0), 0);
    const tr = ws.addRow(['', 'TOTAL', '', '', '', '', '', '',
      sum('plafon'), sum('baki_debet'), sum('tunggakan_pokok'), sum('tunggakan_bunga'), '', '', '']);
    tr.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
      cell.border = { top: { style: 'medium' }, bottom: { style: 'medium' } };
      if ([9, 10, 11, 12].includes(colNum)) {
        cell.numFmt = '"Rp"#,##0;[Red]("Rp"#,##0);"-"';
        cell.alignment = { horizontal: 'right' };
      }
      if (colNum === 2) cell.alignment = { horizontal: 'right' };
    });
  }

  // Signature block (centered)
  ws.addRow([]); ws.addRow([]);
  const addSig = (text: string, sopts: { bold?: boolean; italic?: boolean } = {}) => {
    const r = ws.addRow([]);
    ws.mergeCells(`A${r.number}:${lastCol}${r.number}`);
    const c = ws.getCell(`A${r.number}`);
    c.value = text;
    c.alignment = { horizontal: 'center' };
    c.font = { bold: sopts.bold, italic: sopts.italic, size: 10 };
  };
  if (tanggalLaporan) addSig(`Bontang, ${formatTanggalLengkap(tanggalLaporan)}`, { italic: true });
  addSig('PT. BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA', { bold: true });
  if (namaKantor) addSig(namaKantor.toUpperCase(), { bold: true });
  addSig('Pemimpin,');
  ws.addRow([]); ws.addRow([]); ws.addRow([]);
  addSig(namaPemimpin ? namaPemimpin : '(_________________________)', { bold: true });

  const buf = await wb.xlsx.writeBuffer();
  saveBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `Laporan_PL_to_NPL_${periodeLbl.replace(' ', '_')}.xlsx`);
}

export function exportPlNplToPdf(opts: {
  periode: string;
  mlfJobdate?: string | null;
  items: PlNplItemRow[];
  namaKantor?: string;
  tanggalLaporan?: string;
  namaPemimpin?: string;
}) {
  const { periode, mlfJobdate, items, namaKantor, tanggalLaporan, namaPemimpin } = opts;
  const periodeLbl = periodeLabel(periode);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(124, 45, 18);
  doc.rect(10, 10, pageW - 20, 10, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text('LAPORAN PROYEKSI PL TO NPL', pageW / 2, 17, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('PT. BPD KALTIM KALTARA — KALIMANTAN TIMUR DAN KALIMANTAN UTARA', pageW / 2, 25, { align: 'center' });
  doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
  doc.text(`Periode: ${periodeLbl}   •   Data MLF per: ${mlfJobdate ? formatTanggalLengkap(mlfJobdate) : '-'}`,
    pageW / 2, 31, { align: 'center' });

  const body = items.map((it, i) => [
    i + 1, it.no_loan, it.kolektabilitas, it.nama_debitur, it.no_pk,
    it.tanggal_mulai ? formatTanggalLengkap(it.tanggal_mulai) : '-',
    it.tanggal_mature ? formatTanggalLengkap(it.tanggal_mature) : '-',
    it.no_rekening,
    fmtRp(Number(it.plafon)), fmtRp(Number(it.baki_debet)),
    fmtRp(Number(it.tunggakan_pokok)), fmtRp(Number(it.tunggakan_bunga)),
    it.proyeksi_tw, it.jenis_kredit, it.alasan_npl || '-',
  ]);

  const sum = (k: keyof PlNplItemRow) => items.reduce((s, x) => s + Number((x[k] as number) || 0), 0);

  autoTable(doc, {
    startY: 36,
    head: [['No', 'Nomor Loan', 'Kol', 'Nama Debitur', 'Nomor PK', 'Tgl Mulai', 'Tgl Mature',
      'No Rekening', 'Plafon', 'Baki Debet', 'Tungg. Pokok', 'Tungg. Bunga', 'Proy', 'Jenis Kredit', 'Alasan NPL']],
    body,
    foot: items.length > 0 ? [['', 'TOTAL', '', '', '', '', '', '',
      fmtRp(sum('plafon')), fmtRp(sum('baki_debet')), fmtRp(sum('tunggakan_pokok')), fmtRp(sum('tunggakan_bunga')),
      '', '', '']] : undefined,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.3, valign: 'middle', overflow: 'linebreak' },
    headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold', halign: 'center' },
    footStyles: { fillColor: [229, 231, 235], textColor: 0, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [255, 247, 237] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 7 },
      1: { cellWidth: 17 },
      2: { halign: 'center', cellWidth: 8 },
      3: { cellWidth: 30 },
      4: { cellWidth: 26 },
      5: { halign: 'center', cellWidth: 16 },
      6: { halign: 'center', cellWidth: 16 },
      7: { cellWidth: 18 },
      8: { halign: 'right', cellWidth: 20 },
      9: { halign: 'right', cellWidth: 20 },
      10: { halign: 'right', cellWidth: 18 },
      11: { halign: 'right', cellWidth: 18 },
      12: { halign: 'center', cellWidth: 10 },
      13: { cellWidth: 22 },
      14: { cellWidth: 30 },
    },
    margin: { left: 10, right: 10 },
  });

  // Centered signature block
  {
    const finalY = (doc as any).lastAutoTable?.finalY || 40;
    const pageH = doc.internal.pageSize.getHeight();
    let y = finalY + 8;
    if (y > pageH - 40) { doc.addPage(); y = 20; }
    const cx = pageW / 2;
    doc.setTextColor(0, 0, 0);
    if (tanggalLaporan) {
      doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
      doc.text(`Bontang, ${formatTanggalLengkap(tanggalLaporan)}`, cx, y, { align: 'center' });
      y += 5;
    }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text('PT. BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA', cx, y, { align: 'center' });
    y += 4;
    if (namaKantor) { doc.text(namaKantor.toUpperCase(), cx, y, { align: 'center' }); y += 4; }
    doc.setFont('helvetica', 'normal');
    doc.text('Pemimpin,', cx, y, { align: 'center' });
    y += 20;
    doc.setFont('helvetica', 'bold');
    if (namaPemimpin) {
      doc.text(namaPemimpin, cx, y, { align: 'center' });
      const w = doc.getTextWidth(namaPemimpin);
      doc.setLineWidth(0.3);
      doc.line(cx - w / 2 - 2, y + 1.5, cx + w / 2 + 2, y + 1.5);
    } else {
      doc.text('(_________________________)', cx, y, { align: 'center' });
    }
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(120, 120, 120);
    doc.text(`Hal ${i} dari ${pageCount}`, pageW / 2, pageH - 5, { align: 'center' });
  }
  doc.save(`Laporan_PL_to_NPL_${periodeLbl.replace(' ', '_')}.pdf`);
}

/** Parse MLF .xls/.xlsx and return Master_Loan_Filter rows */
export async function parseMlfFile(file: File): Promise<any[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array', cellDates: true, cellNF: false });
  const sheetName = wb.SheetNames.find((s) => s.toLowerCase().includes('master_loan_filter'))
    || wb.SheetNames.find((s) => s.toLowerCase().includes('master'))
    || wb.SheetNames[0];
  if (!sheetName) throw new Error('Sheet Master_Loan_Filter tidak ditemukan');
  const ws = wb.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<any>(ws, { defval: null, raw: false });
  // Normalize keys: UPPERCASE + trimmed + collapse spaces so callers can use canonical names
  return raw.map((row) => {
    const norm: Record<string, any> = {};
    for (const k of Object.keys(row)) {
      const nk = k.toString().trim().toUpperCase().replace(/\s+/g, '');
      norm[nk] = row[k];
    }
    return norm;
  });
}

/** Convert MLF date cell (Date obj, Excel serial number, "YYYYMMDD" int, or string) to ISO YYYY-MM-DD */
export function mlfDateToIso(v: any): string | null {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return null;
    return v.toISOString().substring(0, 10);
  }
  if (typeof v === 'number') {
    // "YYYYMMDD" as integer (common in MLF): e.g. 20260609
    if (v > 19000101 && v < 21001231 && Number.isInteger(v)) {
      const s = String(v);
      return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
    }
    // Excel serial date (days since 1899-12-30)
    if (v > 20000 && v < 80000) {
      const ms = Math.round((v - 25569) * 86400 * 1000);
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d.toISOString().substring(0, 10);
    }
    return null;
  }
  if (typeof v === 'string') {
    const s = v.trim();
    if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d.toISOString().substring(0, 10);
  }
  return null;
}

/** NPL Existing export types & fns */
export interface NplExistingRow {
  no: number;
  no_loan: string;
  nama_debitur: string;
  kolektabilitas: string;
  no_pk: string;
  no_rekening: string;
  tanggal_mulai: string | null;
  tanggal_mature: string | null;
  plafon: number;
  baki_debet: number;
  tunggakan_pokok: number;
  tunggakan_bunga: number;
  jenis_kredit: string;
  brname: string;
}

const KOL_LABEL: Record<string, string> = {
  '3': 'Kurang Lancar', '4': 'Diragukan', '5': 'Macet',
};

export async function exportNplExistingToExcel(opts: {
  mlfJobdate?: string | null;
  items: NplExistingRow[];
  namaKantor?: string;
  tanggalLaporan?: string;
  namaPemimpin?: string;
}) {
  const { mlfJobdate, items, namaKantor, tanggalLaporan, namaPemimpin } = opts;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SiTaksi';
  const ws = wb.addWorksheet('NPL Existing', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  const widths = [5, 14, 30, 16, 24, 18, 14, 14, 18, 18, 18, 18, 22];
  ws.columns = widths.map((w) => ({ width: w }));
  const COLS = widths.length;
  const lastCol = String.fromCharCode(64 + COLS);

  const t1 = ws.addRow(['LAPORAN NPL EXISTING']);
  ws.mergeCells(`A${t1.number}:${lastCol}${t1.number}`);
  t1.height = 28;
  const c1 = ws.getCell(`A${t1.number}`);
  c1.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  c1.alignment = { horizontal: 'center', vertical: 'middle' };
  c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } };

  const t2 = ws.addRow(['PT. BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA']);
  ws.mergeCells(`A${t2.number}:${lastCol}${t2.number}`);
  ws.getCell(`A${t2.number}`).font = { bold: true };
  ws.getCell(`A${t2.number}`).alignment = { horizontal: 'center' };

  if (namaKantor) {
    const tk = ws.addRow([namaKantor]);
    ws.mergeCells(`A${tk.number}:${lastCol}${tk.number}`);
    ws.getCell(`A${tk.number}`).alignment = { horizontal: 'center' };
  }
  const t3 = ws.addRow([`Data MLF per: ${mlfJobdate ? formatTanggalLengkap(mlfJobdate) : '-'}   •   Jumlah: ${items.length} debitur`]);
  ws.mergeCells(`A${t3.number}:${lastCol}${t3.number}`);
  ws.getCell(`A${t3.number}`).font = { italic: true };
  ws.getCell(`A${t3.number}`).alignment = { horizontal: 'center' };
  ws.addRow([]);

  const headerCols = ['No', 'Nomor Loan', 'Nama Debitur', 'Kol.', 'Nomor PK', 'Nomor Rekening',
    'Tgl Mulai', 'Tgl Mature', 'Plafon', 'Baki Debet', 'Tunggakan Pokok', 'Tunggakan Bunga', 'Jenis Kredit'];
  const hRow = ws.addRow(headerCols);
  hRow.height = 30;
  hRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  items.forEach((it, i) => {
    const kolTxt = it.kolektabilitas + (KOL_LABEL[it.kolektabilitas] ? ` - ${KOL_LABEL[it.kolektabilitas]}` : '');
    const r = ws.addRow([
      i + 1, it.no_loan, it.nama_debitur, kolTxt, it.no_pk, it.no_rekening,
      it.tanggal_mulai ? formatTanggalLengkap(it.tanggal_mulai) : '',
      it.tanggal_mature ? formatTanggalLengkap(it.tanggal_mature) : '',
      Number(it.plafon) || 0, Number(it.baki_debet) || 0,
      Number(it.tunggakan_pokok) || 0, Number(it.tunggakan_bunga) || 0,
      it.jenis_kredit,
    ]);
    r.height = 30;
    r.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };
      cell.alignment = { vertical: 'middle', wrapText: true };
      if (i % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
      if ([1, 4].includes(colNum)) cell.alignment = { ...cell.alignment, horizontal: 'center' };
      if ([9, 10, 11, 12].includes(colNum)) {
        cell.numFmt = '"Rp"#,##0;[Red]("Rp"#,##0);"-"';
        cell.alignment = { ...cell.alignment, horizontal: 'right' };
      }
    });
  });

  if (items.length > 0) {
    const sum = (k: keyof NplExistingRow) => items.reduce((s, x) => s + Number((x[k] as number) || 0), 0);
    const tr = ws.addRow(['', 'TOTAL', '', '', '', '', '', '',
      sum('plafon'), sum('baki_debet'), sum('tunggakan_pokok'), sum('tunggakan_bunga'), '']);
    tr.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
      cell.border = { top: { style: 'medium' }, bottom: { style: 'medium' } };
      if ([9, 10, 11, 12].includes(colNum)) {
        cell.numFmt = '"Rp"#,##0;[Red]("Rp"#,##0);"-"';
        cell.alignment = { horizontal: 'right' };
      }
      if (colNum === 2) cell.alignment = { horizontal: 'right' };
    });
  }

  ws.addRow([]); ws.addRow([]);
  const addSig = (text: string, so: { bold?: boolean; italic?: boolean } = {}) => {
    const r = ws.addRow([]);
    ws.mergeCells(`A${r.number}:${lastCol}${r.number}`);
    const c = ws.getCell(`A${r.number}`);
    c.value = text;
    c.alignment = { horizontal: 'center' };
    c.font = { bold: so.bold, italic: so.italic, size: 10 };
  };
  if (tanggalLaporan) addSig(`Bontang, ${formatTanggalLengkap(tanggalLaporan)}`, { italic: true });
  addSig('PT. BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA', { bold: true });
  if (namaKantor) addSig(namaKantor.toUpperCase(), { bold: true });
  addSig('Pemimpin,');
  ws.addRow([]); ws.addRow([]); ws.addRow([]);
  addSig(namaPemimpin ? namaPemimpin : '(_________________________)', { bold: true });

  const buf = await wb.xlsx.writeBuffer();
  saveBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `Laporan_NPL_Existing_${new Date().toISOString().substring(0, 10)}.xlsx`);
}

export function exportNplExistingToPdf(opts: {
  mlfJobdate?: string | null;
  items: NplExistingRow[];
  namaKantor?: string;
  tanggalLaporan?: string;
  namaPemimpin?: string;
}) {
  const { mlfJobdate, items, namaKantor, tanggalLaporan, namaPemimpin } = opts;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(153, 27, 27);
  doc.rect(10, 10, pageW - 20, 10, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text('LAPORAN NPL EXISTING', pageW / 2, 17, { align: 'center' });
  doc.setTextColor(0, 0, 0); doc.setFontSize(10);
  doc.text('PT. BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA', pageW / 2, 25, { align: 'center' });
  if (namaKantor) { doc.setFontSize(9); doc.text(namaKantor, pageW / 2, 30, { align: 'center' }); }
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
  doc.text(`Data MLF per: ${mlfJobdate ? formatTanggalLengkap(mlfJobdate) : '-'}   •   Jumlah: ${items.length} debitur`, pageW / 2, 35, { align: 'center' });

  const body = items.map((it, i) => [
    i + 1, it.no_loan, it.nama_debitur,
    it.kolektabilitas + (KOL_LABEL[it.kolektabilitas] ? ` - ${KOL_LABEL[it.kolektabilitas]}` : ''),
    it.no_pk, it.no_rekening,
    it.tanggal_mulai ? formatTanggalLengkap(it.tanggal_mulai) : '-',
    it.tanggal_mature ? formatTanggalLengkap(it.tanggal_mature) : '-',
    fmtRp(Number(it.plafon)), fmtRp(Number(it.baki_debet)),
    fmtRp(Number(it.tunggakan_pokok)), fmtRp(Number(it.tunggakan_bunga)),
    it.jenis_kredit,
  ]);
  const sum = (k: keyof NplExistingRow) => items.reduce((s, x) => s + Number((x[k] as number) || 0), 0);

  autoTable(doc, {
    startY: 40,
    head: [['No', 'No Loan', 'Nama Debitur', 'Kol', 'No PK', 'No Rek', 'Tgl Mulai', 'Tgl Mature',
      'Plafon', 'Baki Debet', 'Tungg. Pokok', 'Tungg. Bunga', 'Jenis Kredit']],
    body,
    foot: items.length > 0 ? [['', 'TOTAL', '', '', '', '', '', '',
      fmtRp(sum('plafon')), fmtRp(sum('baki_debet')), fmtRp(sum('tunggakan_pokok')), fmtRp(sum('tunggakan_bunga')), '']] : undefined,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.3, valign: 'middle', overflow: 'linebreak' },
    headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold', halign: 'center' },
    footStyles: { fillColor: [254, 226, 226], textColor: 0, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [254, 242, 242] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 18 },
      2: { cellWidth: 34 },
      3: { halign: 'center', cellWidth: 20 },
      4: { cellWidth: 24 },
      5: { cellWidth: 22 },
      6: { halign: 'center', cellWidth: 18 },
      7: { halign: 'center', cellWidth: 18 },
      8: { halign: 'right', cellWidth: 22 },
      9: { halign: 'right', cellWidth: 22 },
      10: { halign: 'right', cellWidth: 20 },
      11: { halign: 'right', cellWidth: 20 },
      12: { cellWidth: 22 },
    },
    margin: { left: 10, right: 10 },
  });

  {
    const finalY = (doc as any).lastAutoTable?.finalY || 45;
    const pageH = doc.internal.pageSize.getHeight();
    let y = finalY + 8;
    if (y > pageH - 40) { doc.addPage(); y = 20; }
    const cx = pageW / 2;
    doc.setTextColor(0, 0, 0);
    if (tanggalLaporan) {
      doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
      doc.text(`Bontang, ${formatTanggalLengkap(tanggalLaporan)}`, cx, y, { align: 'center' });
      y += 5;
    }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text('PT. BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA', cx, y, { align: 'center' });
    y += 4;
    if (namaKantor) { doc.text(namaKantor.toUpperCase(), cx, y, { align: 'center' }); y += 4; }
    doc.setFont('helvetica', 'normal');
    doc.text('Pemimpin,', cx, y, { align: 'center' });
    y += 20;
    doc.setFont('helvetica', 'bold');
    if (namaPemimpin) {
      doc.text(namaPemimpin, cx, y, { align: 'center' });
      const w = doc.getTextWidth(namaPemimpin);
      doc.setLineWidth(0.3);
      doc.line(cx - w / 2 - 2, y + 1.5, cx + w / 2 + 2, y + 1.5);
    } else {
      doc.text('(_________________________)', cx, y, { align: 'center' });
    }
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(120, 120, 120);
    doc.text(`Hal ${i} dari ${pageCount}`, pageW / 2, pageH - 5, { align: 'center' });
  }
  doc.save(`Laporan_NPL_Existing_${new Date().toISOString().substring(0, 10)}.pdf`);
}
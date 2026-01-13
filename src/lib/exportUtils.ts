import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Taksasi, formatCurrency, formatDate } from '@/types';

// Extended jsPDF type for autoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export interface ExportOptions {
  title: string;
  subtitle?: string;
  dateRange?: { start: string; end: string };
  includeDetails?: boolean;
}

// Helper to format number for Excel
const formatNumber = (value: number): number => value || 0;

// Export to Excel with beautiful formatting
export const exportToExcel = (
  taksasiList: Taksasi[],
  options: ExportOptions
) => {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Summary data
  const totalNilaiTaksasi = taksasiList.reduce((acc, t) => acc + (t.nilai_taksasi_pembulatan || 0), 0);
  const totalNilaiLikuidasi = taksasiList.reduce((acc, t) => acc + (t.nilai_likuidasi_pembulatan || 0), 0);

  // Group by jenis agunan
  const byJenis = taksasiList.reduce((acc, t) => {
    const jenis = t.jenis_agunan || 'Lainnya';
    if (!acc[jenis]) acc[jenis] = { count: 0, taksasi: 0, likuidasi: 0 };
    acc[jenis].count++;
    acc[jenis].taksasi += t.nilai_taksasi_pembulatan || 0;
    acc[jenis].likuidasi += t.nilai_likuidasi_pembulatan || 0;
    return acc;
  }, {} as Record<string, { count: number; taksasi: number; likuidasi: number }>);

  // Summary Sheet
  const summaryData = [
    ['LAPORAN REKAP TAKSASI AGUNAN'],
    ['PT BANK PEMBANGUNAN DAERAH KALIMANTAN TIMUR DAN KALIMANTAN UTARA'],
    [''],
    ['Periode:', options.dateRange ? `${formatDate(options.dateRange.start)} - ${formatDate(options.dateRange.end)}` : 'Semua Data'],
    ['Tanggal Cetak:', formatDate(new Date().toISOString())],
    [''],
    ['RINGKASAN'],
    ['Total Data Taksasi', taksasiList.length],
    ['Total Nilai Taksasi', totalNilaiTaksasi],
    ['Total Nilai Likuidasi', totalNilaiLikuidasi],
    [''],
    ['BREAKDOWN PER JENIS AGUNAN'],
    ['Jenis Agunan', 'Jumlah', 'Nilai Taksasi', 'Nilai Likuidasi'],
    ...Object.entries(byJenis).map(([jenis, data]) => [
      jenis,
      data.count,
      data.taksasi,
      data.likuidasi
    ]),
    ['TOTAL', taksasiList.length, totalNilaiTaksasi, totalNilaiLikuidasi]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

  // Set column widths
  wsSummary['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 }
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  // Detail Sheet
  const detailHeaders = [
    'No',
    'Tanggal',
    'No. Dokumen',
    'Nama Nasabah',
    'Alamat',
    'Jenis Agunan',
    'Kantor Cabang',
    'Nilai Pasar',
    'Nilai Taksasi',
    'Nilai Likuidasi',
    'Safety Margin (%)',
    'Status',
    'Petugas'
  ];

  const detailData = taksasiList.map((t, index) => [
    index + 1,
    formatDate(t.tanggal),
    t.nomor_dokumen,
    t.nama_nasabah,
    t.alamat,
    t.jenis_agunan,
    t.kantor_cabang,
    formatNumber(t.nilai_pasar),
    formatNumber(t.nilai_taksasi_pembulatan),
    formatNumber(t.nilai_likuidasi_pembulatan),
    formatNumber(t.safety_margin),
    t.status === 'disetujui' ? 'Selesai' : 'Draft',
    t.petugas
  ]);

  const wsDetail = XLSX.utils.aoa_to_sheet([
    ['DETAIL DATA TAKSASI AGUNAN'],
    [''],
    detailHeaders,
    ...detailData
  ]);

  // Set column widths for detail sheet
  wsDetail['!cols'] = [
    { wch: 5 },   // No
    { wch: 15 },  // Tanggal
    { wch: 25 },  // No. Dokumen
    { wch: 25 },  // Nama Nasabah
    { wch: 35 },  // Alamat
    { wch: 18 },  // Jenis Agunan
    { wch: 15 },  // Kantor Cabang
    { wch: 18 },  // Nilai Pasar
    { wch: 18 },  // Nilai Taksasi
    { wch: 18 },  // Nilai Likuidasi
    { wch: 15 },  // Safety Margin
    { wch: 10 },  // Status
    { wch: 20 }   // Petugas
  ];

  XLSX.utils.book_append_sheet(wb, wsDetail, 'Detail Data');

  // Create sheets per jenis agunan
  const jenisAgunanList = ['Tanah', 'Tanah & Bangunan', 'Kendaraan'];
  jenisAgunanList.forEach(jenis => {
    const filteredData = taksasiList.filter(t => t.jenis_agunan === jenis);
    if (filteredData.length === 0) return;

    const sheetData = filteredData.map((t, index) => [
      index + 1,
      formatDate(t.tanggal),
      t.nomor_dokumen,
      t.nama_nasabah,
      t.kantor_cabang,
      formatNumber(t.nilai_taksasi_pembulatan),
      formatNumber(t.nilai_likuidasi_pembulatan),
      t.status === 'disetujui' ? 'Selesai' : 'Draft'
    ]);

    const totalTaksasi = filteredData.reduce((acc, t) => acc + (t.nilai_taksasi_pembulatan || 0), 0);
    const totalLikuidasi = filteredData.reduce((acc, t) => acc + (t.nilai_likuidasi_pembulatan || 0), 0);

    const wsJenis = XLSX.utils.aoa_to_sheet([
      [`DATA TAKSASI - ${jenis.toUpperCase()}`],
      [''],
      ['No', 'Tanggal', 'No. Dokumen', 'Nama Nasabah', 'Kantor Cabang', 'Nilai Taksasi', 'Nilai Likuidasi', 'Status'],
      ...sheetData,
      ['', '', '', '', 'TOTAL', totalTaksasi, totalLikuidasi, '']
    ]);

    wsJenis['!cols'] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 18 },
      { wch: 18 },
      { wch: 10 }
    ];

    const sheetName = jenis.replace('&', 'dan').substring(0, 31);
    XLSX.utils.book_append_sheet(wb, wsJenis, sheetName);
  });

  // Generate filename
  const now = new Date();
  const filename = `Laporan_Taksasi_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}.xlsx`;

  // Write file
  XLSX.writeFile(wb, filename);

  return filename;
};

// Export to PDF with beautiful formatting
export const exportToPDF = (
  taksasiList: Taksasi[],
  options: ExportOptions,
  logoBase64?: string
) => {
  const doc = new jsPDF('landscape', 'mm', 'a4') as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryColor: [number, number, number] = [26, 54, 93]; // Deep blue
  const accentColor: [number, number, number] = [51, 153, 137]; // Teal
  const grayColor: [number, number, number] = [128, 128, 128];

  // Summary calculations
  const totalNilaiTaksasi = taksasiList.reduce((acc, t) => acc + (t.nilai_taksasi_pembulatan || 0), 0);
  const totalNilaiLikuidasi = taksasiList.reduce((acc, t) => acc + (t.nilai_likuidasi_pembulatan || 0), 0);

  // Group by jenis agunan
  const byJenis = taksasiList.reduce((acc, t) => {
    const jenis = t.jenis_agunan || 'Lainnya';
    if (!acc[jenis]) acc[jenis] = { count: 0, taksasi: 0, likuidasi: 0 };
    acc[jenis].count++;
    acc[jenis].taksasi += t.nilai_taksasi_pembulatan || 0;
    acc[jenis].likuidasi += t.nilai_likuidasi_pembulatan || 0;
    return acc;
  }, {} as Record<string, { count: number; taksasi: number; likuidasi: number }>);

  // === COVER PAGE ===
  // Header gradient simulation (rectangle)
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Accent bar
  doc.setFillColor(...accentColor);
  doc.rect(0, 45, pageWidth, 3, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN REKAP TAKSASI AGUNAN', pageWidth / 2, 25, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('PT Bank Pembangunan Daerah Kalimantan Timur dan Kalimantan Utara', pageWidth / 2, 36, { align: 'center' });

  // Period info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  const periodText = options.dateRange 
    ? `Periode: ${formatDate(options.dateRange.start)} - ${formatDate(options.dateRange.end)}`
    : 'Periode: Semua Data';
  doc.text(periodText, pageWidth / 2, 60, { align: 'center' });
  doc.text(`Tanggal Cetak: ${formatDate(new Date().toISOString())}`, pageWidth / 2, 68, { align: 'center' });

  // Summary boxes
  const boxY = 85;
  const boxWidth = 80;
  const boxHeight = 35;
  const gap = 15;
  const startX = (pageWidth - (boxWidth * 3 + gap * 2)) / 2;

  // Box 1 - Total Data
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(startX, boxY, boxWidth, boxHeight, 3, 3, 'F');
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(startX, boxY, boxWidth, boxHeight, 3, 3, 'S');
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.text('Total Data Taksasi', startX + boxWidth / 2, boxY + 12, { align: 'center' });
  doc.setTextColor(...primaryColor);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(taksasiList.length.toString(), startX + boxWidth / 2, boxY + 27, { align: 'center' });

  // Box 2 - Nilai Taksasi
  const box2X = startX + boxWidth + gap;
  doc.setFillColor(240, 255, 250);
  doc.roundedRect(box2X, boxY, boxWidth, boxHeight, 3, 3, 'F');
  doc.setDrawColor(...accentColor);
  doc.roundedRect(box2X, boxY, boxWidth, boxHeight, 3, 3, 'S');
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Nilai Taksasi', box2X + boxWidth / 2, boxY + 12, { align: 'center' });
  doc.setTextColor(...accentColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(totalNilaiTaksasi), box2X + boxWidth / 2, boxY + 27, { align: 'center' });

  // Box 3 - Nilai Likuidasi
  const box3X = box2X + boxWidth + gap;
  doc.setFillColor(255, 250, 240);
  doc.roundedRect(box3X, boxY, boxWidth, boxHeight, 3, 3, 'F');
  doc.setDrawColor(200, 150, 50);
  doc.roundedRect(box3X, boxY, boxWidth, boxHeight, 3, 3, 'S');
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Nilai Likuidasi', box3X + boxWidth / 2, boxY + 12, { align: 'center' });
  doc.setTextColor(180, 130, 30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(totalNilaiLikuidasi), box3X + boxWidth / 2, boxY + 27, { align: 'center' });

  // Breakdown table
  doc.setFont('helvetica', 'normal');
  autoTable(doc, {
    startY: 135,
    head: [['Jenis Agunan', 'Jumlah', 'Nilai Taksasi', 'Nilai Likuidasi', 'Persentase']],
    body: Object.entries(byJenis).map(([jenis, data]) => [
      jenis,
      data.count.toString(),
      formatCurrency(data.taksasi),
      formatCurrency(data.likuidasi),
      `${((data.count / taksasiList.length) * 100).toFixed(1)}%`
    ]),
    foot: [['TOTAL', taksasiList.length.toString(), formatCurrency(totalNilaiTaksasi), formatCurrency(totalNilaiLikuidasi), '100%']],
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 10,
      halign: 'center'
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    margin: { left: 40, right: 40 }
  });

  // === DETAIL PAGE ===
  doc.addPage();

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DETAIL DATA TAKSASI AGUNAN', pageWidth / 2, 13, { align: 'center' });

  // Detail table
  autoTable(doc, {
    startY: 30,
    head: [['No', 'Tanggal', 'No. Dokumen', 'Nama Nasabah', 'Jenis', 'Nilai Taksasi', 'Nilai Likuidasi', 'Status']],
    body: taksasiList.map((t, index) => [
      (index + 1).toString(),
      formatDate(t.tanggal),
      t.nomor_dokumen,
      t.nama_nasabah,
      t.jenis_agunan,
      formatCurrency(t.nilai_taksasi_pembulatan),
      formatCurrency(t.nilai_likuidasi_pembulatan),
      t.status === 'disetujui' ? 'Selesai' : 'Draft'
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'center', cellWidth: 25 },
      2: { cellWidth: 45 },
      3: { cellWidth: 50 },
      4: { halign: 'center', cellWidth: 30 },
      5: { halign: 'right', cellWidth: 35 },
      6: { halign: 'right', cellWidth: 35 },
      7: { halign: 'center', cellWidth: 20 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 10, right: 10 },
    didDrawPage: (data) => {
      // Footer on each page
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      const pageNumber = doc.getCurrentPageInfo().pageNumber;
      doc.text(
        `Halaman ${pageNumber}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        'Dicetak dari Sistem Taksasi Agunan - Bankaltimtara',
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }
  });

  // Generate filename
  const now = new Date();
  const filename = `Laporan_Taksasi_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}.pdf`;

  // Save
  doc.save(filename);

  return filename;
};

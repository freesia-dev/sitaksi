// Safety Margin Configuration based on Excel penjelasan sheet

export interface SafetyMarginOption {
  value: string;
  label: string;
  margin: number;
  description: string;
}

// TANAH Safety Margins
export const SAFETY_MARGIN_TANAH = {
  lokasi_daerah: [
    { value: 'strategis', label: 'Strategis', margin: 80, description: 'Lokasi strategis, akses jalan baik, fasilitas lengkap' },
    { value: 'cukup_strategis', label: 'Cukup Strategis', margin: 80, description: 'Lokasi cukup strategis' },
    { value: 'kurang_strategis', label: 'Kurang Strategis', margin: 70, description: 'Lokasi kurang strategis' },
    { value: 'tidak_strategis', label: 'Tidak Strategis', margin: 60, description: 'Lokasi tidak strategis' },
  ] as SafetyMarginOption[],

  topography: [
    { value: 'datar', label: 'Datar', margin: 80, description: 'Kondisi tanah datar' },
    { value: 'agak_berbukit', label: 'Agak Berbukit', margin: 70, description: 'Sedikit berbukit, agak terjal' },
    { value: 'sangat_berbukit', label: 'Sangat Berbukit', margin: 60, description: 'Sama sekali tidak rata, sangat terjal' },
    { value: 'agak_berlereng', label: 'Agak Berlereng', margin: 70, description: 'Sedikit berlereng, agak terjal' },
    { value: 'sangat_berlereng', label: 'Sangat Berlereng', margin: 60, description: 'Berlereng sangat terjal' },
    { value: 'rawa', label: 'Rawa/Ex. Rawa', margin: 60, description: 'Daerah rawa/bekas rawa, sawah' },
  ] as SafetyMarginOption[],

  ukuran_bentuk: [
    { value: 'ideal', label: 'Ideal', margin: 80, description: 'Ukuran dan bentuk ideal (Lebar:Panjang = 1:2 s.d 1:3), beraturan' },
    { value: 'kurang_ideal', label: 'Kurang Ideal', margin: 70, description: 'Ukuran kurang ideal (Lebar:Panjang = 2:1 s.d 3:1)' },
    { value: 'tidak_ideal', label: 'Tidak Ideal', margin: 60, description: 'Ukuran dan bentuk tidak ideal, tidak beraturan' },
  ] as SafetyMarginOption[],

  bukti_kepemilikan: [
    { value: 'pelepasan_hak', label: 'Pelepasan Hak Atas Tanah', margin: 60, description: 'Bukti dari Kantor Kecamatan' },
    { value: 'hak_milik', label: 'Hak Milik', margin: 80, description: 'Sertifikat Hak Milik' },
    { value: 'hgb', label: 'Hak Guna Bangunan', margin: 80, description: 'Sertifikat HGB' },
    { value: 'hgu', label: 'Hak Guna Usaha', margin: 80, description: 'Sertifikat HGU' },
    { value: 'hak_pakai', label: 'Hak Pakai', margin: 60, description: 'Sertifikat Hak Pakai' },
  ] as SafetyMarginOption[],

  lingkungan_sekitar: [
    { value: 'berkembang', label: 'Berkembang', margin: 80, description: 'Lingkungan sudah mapan, terdapat bangunan lain' },
    { value: 'prospek_berkembang', label: 'Prospek Berkembang', margin: 80, description: 'Sudah ada bangunan, diperkirakan berkembang' },
    { value: 'kurang_berkembang', label: 'Kurang Berkembang', margin: 70, description: 'Kurang diminati, ada kendala (dekat TPA, kuburan, dll)' },
    { value: 'sulit_berkembang', label: 'Sulit Berkembang', margin: 60, description: 'Banyak kendala untuk berkembang' },
  ] as SafetyMarginOption[],

  permasalahan: [
    { value: 'aman', label: 'Aman', margin: 80, description: 'Tidak terdapat permasalahan' },
    { value: 'ijin_habis', label: 'Ijin Habis', margin: 60, description: 'HGB/HGU/Hak Pakai habis atau akan habis (max 2 tahun)' },
    { value: 'disewakan', label: 'Disewakan', margin: 60, description: 'Kondisi tanah disewakan' },
    { value: 'warisan', label: 'Warisan', margin: 60, description: 'Milik ahli waris' },
    { value: 'batas_tidak_jelas', label: 'Batas Tidak Jelas', margin: 60, description: 'Tidak memiliki batas/patok yang jelas' },
    { value: 'dekat_tower', label: 'Dekat dengan Tower dsb', margin: 60, description: 'Dekat tower, pemancar, gardu listrik' },
    { value: 'perluasan_jalan', label: 'Perluasan Jalan', margin: 60, description: 'Akan/telah kena pemotongan jalan' },
    { value: 'beda_luas', label: 'Beda Luas terhadap Legalitas', margin: 60, description: 'Perbedaan luas tanah fisik dengan bukti kepemilikan' },
    { value: 'hgb_atas_hpl', label: 'HGB di atas HPL', margin: 0, description: 'HGB berdiri di atas Hak Pengelolaan' },
    { value: 'hp_atas_hpl', label: 'Hak Pakai di atas HPL', margin: 0, description: 'Hak Pakai berdiri di atas Hak Pengelolaan' },
    { value: 'jalur_hijau', label: 'Jalur Hijau', margin: 0, description: 'Daerah tidak boleh untuk bangunan' },
    { value: 'tanah_adat', label: 'Tanah Adat', margin: 0, description: 'Tanah terikat dengan adat kepemilikan' },
    { value: 'tanah_kuburan', label: 'Tanah Kuburan', margin: 0, description: 'Tanah untuk kuburan' },
    { value: 'tanah_wakaf', label: 'Tanah Wakaf', margin: 0, description: 'Tanah dari wakaf' },
    { value: 'sengketa', label: 'Sengketa', margin: 0, description: 'Sertifikat double, aspal, sengketa jual beli' },
    { value: 'lainnya', label: 'Lainnya', margin: 0, description: 'Permasalahan lainnya' },
  ] as SafetyMarginOption[],
};

// BANGUNAN Safety Margins
export const SAFETY_MARGIN_BANGUNAN = {
  design: [
    { value: 'modern', label: 'Modern', margin: 80, description: 'Model mutakhir' },
    { value: 'semi_modern', label: 'Semi Modern', margin: 70, description: 'Sebagian mutakhir, sebagian tidak' },
    { value: 'sederhana', label: 'Sederhana', margin: 60, description: 'Model sederhana/tidak mutakhir' },
  ] as SafetyMarginOption[],

  umur: [
    { value: 'muda', label: '≤ 5 tahun', margin: 80, description: 'Umur efektif bangunan ≤ 5 tahun' },
    { value: 'sedang', label: '5 - 10 tahun', margin: 70, description: 'Umur efektif bangunan 5-10 tahun' },
    { value: 'tua', label: '> 10 tahun', margin: 60, description: 'Umur efektif bangunan > 10 tahun' },
  ] as SafetyMarginOption[],

  peruntukkan: [
    { value: 'non_produktif', label: 'Non Produktif', margin: 80, description: 'Rumah tempat tinggal' },
    { value: 'produktif', label: 'Produktif', margin: 70, description: 'Ruko, Kantor, Apartemen, Hotel, dll' },
    { value: 'produktif_berat', label: 'Produktif Berat', margin: 60, description: 'Bengkel, Pabrik, Gudang' },
  ] as SafetyMarginOption[],

  imb: [
    { value: 'ada', label: 'Ada', margin: 80, description: 'IMB tersedia' },
    { value: 'tidak_ada_non_produktif', label: 'Tidak Ada (Non Produktif)', margin: 80, description: 'Khusus rumah tempat tinggal' },
    { value: 'tidak_ada_produktif', label: 'Tidak Ada (Produktif)', margin: 60, description: 'Khusus bangunan produktif' },
  ] as SafetyMarginOption[],

  kesesuaian_lahan: [
    { value: 'ideal', label: 'Ideal', margin: 80, description: 'Peruntukkan sesuai dengan lingkungan sekitar' },
    { value: 'kurang_ideal', label: 'Kurang Ideal', margin: 70, description: 'Kurang sesuai dengan lingkungan sekitar' },
    { value: 'tidak_ideal', label: 'Tidak Ideal', margin: 60, description: 'Sama sekali tidak sesuai dengan lingkungan' },
  ] as SafetyMarginOption[],

  permasalahan: [
    { value: 'aman', label: 'Aman', margin: 80, description: 'Tidak terdapat permasalahan' },
    { value: 'ijin_habis', label: 'Ijin Habis', margin: 60, description: 'HGB/HGU habis atau akan habis' },
    { value: 'disewakan', label: 'Disewakan', margin: 60, description: 'Kondisi bangunan disewakan' },
    { value: 'warisan', label: 'Warisan', margin: 60, description: 'Milik ahli waris' },
    { value: 'kurang_terawat', label: 'Bangunan Kurang/Tidak Terawat', margin: 60, description: 'Kurang terawat namun layak huni' },
    { value: 'dekat_tower', label: 'Dekat dengan Tower dsb', margin: 60, description: 'Dekat tower, pemancar, gardu listrik' },
    { value: 'perluasan_jalan', label: 'Perluasan Jalan', margin: 60, description: 'Akan kena pemotongan jalan' },
    { value: 'dalam_progress', label: 'Bangunan dalam Progress', margin: 60, description: 'Masih dalam progress (min 60%)' },
    { value: 'hgb_atas_hpl', label: 'HGB di atas HPL', margin: 0, description: 'HGB berdiri di atas Hak Pengelolaan' },
    { value: 'hp_atas_hpl', label: 'Hak Pakai di atas HPL', margin: 0, description: 'Hak Pakai berdiri di atas Hak Pengelolaan' },
    { value: 'jalur_hijau', label: 'Jalur Hijau', margin: 0, description: 'Daerah tidak boleh untuk bangunan' },
    { value: 'tanah_adat', label: 'Tanah Adat', margin: 0, description: 'Di atas tanah adat' },
    { value: 'tanah_kuburan', label: 'Tanah Kuburan', margin: 0, description: 'Di atas tanah kuburan' },
    { value: 'tanah_wakaf', label: 'Tanah Wakaf', margin: 0, description: 'Di atas tanah wakaf' },
    { value: 'sengketa', label: 'Sengketa', margin: 0, description: 'Sertifikat bermasalah' },
    { value: 'lainnya', label: 'Lainnya', margin: 0, description: 'Permasalahan lainnya' },
  ] as SafetyMarginOption[],
};

export const getMarginByValue = (options: SafetyMarginOption[], value: string): number => {
  const option = options.find(o => o.value === value);
  return option?.margin ?? 60;
};

export const getLabelByValue = (options: SafetyMarginOption[], value: string): string => {
  const option = options.find(o => o.value === value);
  return option?.label ?? value;
};

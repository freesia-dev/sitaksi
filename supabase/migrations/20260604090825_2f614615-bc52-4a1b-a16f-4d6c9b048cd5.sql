
-- Enum kategori kunjungan
CREATE TYPE public.kategori_kunjungan AS ENUM ('prospek', 'aktif', 'menunggak', 'restrukturisasi');
CREATE TYPE public.monitoring_status AS ENUM ('draft', 'final');
CREATE TYPE public.jadwal_status AS ENUM ('scheduled', 'done', 'canceled');

-- Tabel monitoring_kunjungan
CREATE TABLE public.monitoring_kunjungan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nomor_ba TEXT,
  kategori public.kategori_kunjungan NOT NULL,
  tanggal_kunjungan DATE NOT NULL DEFAULT CURRENT_DATE,
  jam_kunjungan TIME,
  nama_debitur TEXT NOT NULL,
  no_rekening TEXT,
  no_hp TEXT,
  alamat TEXT,
  plafond NUMERIC DEFAULT 0,
  baki_debet NUMERIC DEFAULT 0,
  tunggakan_pokok NUMERIC DEFAULT 0,
  tunggakan_bunga NUMERIC DEFAULT 0,
  hari_tunggakan INTEGER DEFAULT 0,
  tujuan_kunjungan TEXT,
  kondisi_usaha TEXT,
  kondisi_agunan TEXT,
  hasil_kunjungan TEXT,
  rencana_tindak_lanjut TEXT,
  komitmen_bayar_nominal NUMERIC DEFAULT 0,
  komitmen_bayar_tanggal DATE,
  foto_kunjungan TEXT[] DEFAULT '{}',
  taksasi_id UUID REFERENCES public.taksasi(id) ON DELETE SET NULL,
  officer_nama TEXT,
  pimpinan_nama TEXT,
  kantor_cabang TEXT DEFAULT 'KCP TELIHAN',
  status public.monitoring_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_monitoring_user ON public.monitoring_kunjungan(user_id);
CREATE INDEX idx_monitoring_kategori ON public.monitoring_kunjungan(kategori);
CREATE INDEX idx_monitoring_tanggal ON public.monitoring_kunjungan(tanggal_kunjungan);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.monitoring_kunjungan TO authenticated;
GRANT ALL ON public.monitoring_kunjungan TO service_role;
ALTER TABLE public.monitoring_kunjungan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view all monitoring"
ON public.monitoring_kunjungan FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert monitoring"
ON public.monitoring_kunjungan FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated can update monitoring"
ON public.monitoring_kunjungan FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete monitoring"
ON public.monitoring_kunjungan FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_monitoring_kunjungan_updated_at
BEFORE UPDATE ON public.monitoring_kunjungan
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabel monitoring_jadwal
CREATE TABLE public.monitoring_jadwal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tanggal_rencana DATE NOT NULL,
  jam_rencana TIME,
  nama_debitur TEXT NOT NULL,
  no_rekening TEXT,
  kategori public.kategori_kunjungan NOT NULL DEFAULT 'aktif',
  keterangan TEXT,
  status public.jadwal_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jadwal_user ON public.monitoring_jadwal(user_id);
CREATE INDEX idx_jadwal_tanggal ON public.monitoring_jadwal(tanggal_rencana);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.monitoring_jadwal TO authenticated;
GRANT ALL ON public.monitoring_jadwal TO service_role;
ALTER TABLE public.monitoring_jadwal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view all jadwal"
ON public.monitoring_jadwal FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert jadwal"
ON public.monitoring_jadwal FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated can update jadwal"
ON public.monitoring_jadwal FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete jadwal"
ON public.monitoring_jadwal FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_monitoring_jadwal_updated_at
BEFORE UPDATE ON public.monitoring_jadwal
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

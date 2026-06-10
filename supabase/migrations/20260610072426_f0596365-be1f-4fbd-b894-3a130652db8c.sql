
CREATE TABLE public.subrogasi_debitur (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_debitur TEXT NOT NULL,
  no_loan TEXT NOT NULL,
  produk TEXT,
  nik TEXT,
  no_premi_asuransi TEXT,
  no_perjanjian_kredit TEXT,
  nilai_subrogasi NUMERIC NOT NULL DEFAULT 0,
  tahun_pencairan INTEGER,
  nama_cabang TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_subrogasi_debitur_nama ON public.subrogasi_debitur(nama_debitur);
CREATE INDEX idx_subrogasi_debitur_noloan ON public.subrogasi_debitur(no_loan);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subrogasi_debitur TO authenticated;
GRANT ALL ON public.subrogasi_debitur TO service_role;
ALTER TABLE public.subrogasi_debitur ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved read debitur" ON public.subrogasi_debitur FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_approved = true));
CREATE POLICY "Approved insert debitur" ON public.subrogasi_debitur FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_approved = true));
CREATE POLICY "Owner update debitur" ON public.subrogasi_debitur FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner delete debitur" ON public.subrogasi_debitur FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.subrogasi_laporan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  periode TEXT NOT NULL,
  nama_kantor TEXT NOT NULL DEFAULT 'Kantor Cabang Pembantu Telihan Bontang',
  tanggal_laporan DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subrogasi_laporan TO authenticated;
GRANT ALL ON public.subrogasi_laporan TO service_role;
ALTER TABLE public.subrogasi_laporan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own or admin subrog laporan" ON public.subrogasi_laporan FOR SELECT TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Approved insert subrog laporan" ON public.subrogasi_laporan FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_approved = true));
CREATE POLICY "Owner update subrog laporan" ON public.subrogasi_laporan FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner delete subrog laporan" ON public.subrogasi_laporan FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.subrogasi_laporan_item (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  laporan_id UUID NOT NULL REFERENCES public.subrogasi_laporan(id) ON DELETE CASCADE,
  debitur_id UUID NOT NULL REFERENCES public.subrogasi_debitur(id) ON DELETE RESTRICT,
  urutan INTEGER NOT NULL DEFAULT 1,
  tanggal_pembayaran DATE,
  akumulasi_pembayaran NUMERIC NOT NULL DEFAULT 0,
  sisa_subrogasi NUMERIC NOT NULL DEFAULT 0,
  konfirmasi_asuransi TEXT,
  konfirmasi_cabang TEXT,
  hasil_kesepakatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_subrogasi_item_laporan ON public.subrogasi_laporan_item(laporan_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subrogasi_laporan_item TO authenticated;
GRANT ALL ON public.subrogasi_laporan_item TO service_role;
ALTER TABLE public.subrogasi_laporan_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access subrog item via laporan" ON public.subrogasi_laporan_item FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.subrogasi_laporan l WHERE l.id = laporan_id AND (l.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.subrogasi_laporan l WHERE l.id = laporan_id AND (l.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

CREATE TABLE public.mlf_snapshot (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jobdate DATE,
  brname TEXT,
  kol TEXT,
  lytitl TEXT,
  l0lnno TEXT,
  l0name TEXT,
  l0narr TEXT,
  date_mulai DATE,
  date_mature DATE,
  l0rstl TEXT,
  pla NUMERIC,
  baki NUMERIC,
  tungpk NUMERIC,
  tungbg NUMERIC,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_mlf_lnno ON public.mlf_snapshot(l0lnno);
CREATE INDEX idx_mlf_name ON public.mlf_snapshot(l0name);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mlf_snapshot TO authenticated;
GRANT ALL ON public.mlf_snapshot TO service_role;
ALTER TABLE public.mlf_snapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved read mlf" ON public.mlf_snapshot FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_approved = true));
CREATE POLICY "Approved insert mlf" ON public.mlf_snapshot FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploaded_by AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_approved = true));
CREATE POLICY "Approved delete mlf" ON public.mlf_snapshot FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_approved = true));

CREATE TABLE public.pl_to_npl_laporan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  periode TEXT NOT NULL,
  mlf_jobdate DATE,
  tanggal_laporan DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pl_to_npl_laporan TO authenticated;
GRANT ALL ON public.pl_to_npl_laporan TO service_role;
ALTER TABLE public.pl_to_npl_laporan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own or admin plnpl" ON public.pl_to_npl_laporan FOR SELECT TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Approved insert plnpl" ON public.pl_to_npl_laporan FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_approved = true));
CREATE POLICY "Owner update plnpl" ON public.pl_to_npl_laporan FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner delete plnpl" ON public.pl_to_npl_laporan FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.pl_to_npl_item (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  laporan_id UUID NOT NULL REFERENCES public.pl_to_npl_laporan(id) ON DELETE CASCADE,
  urutan INTEGER NOT NULL DEFAULT 1,
  no_loan TEXT,
  kolektabilitas TEXT,
  nama_debitur TEXT,
  no_pk TEXT,
  tanggal_mulai DATE,
  tanggal_mature DATE,
  no_rekening TEXT,
  plafon NUMERIC,
  baki_debet NUMERIC,
  tunggakan_pokok NUMERIC,
  tunggakan_bunga NUMERIC,
  jenis_kredit TEXT,
  cabang TEXT,
  proyeksi_tw TEXT,
  alasan_npl TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_plnpl_item_laporan ON public.pl_to_npl_item(laporan_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pl_to_npl_item TO authenticated;
GRANT ALL ON public.pl_to_npl_item TO service_role;
ALTER TABLE public.pl_to_npl_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Access plnpl item via laporan" ON public.pl_to_npl_item FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pl_to_npl_laporan l WHERE l.id = laporan_id AND (l.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pl_to_npl_laporan l WHERE l.id = laporan_id AND (l.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

CREATE TRIGGER trg_subrogasi_debitur_updated BEFORE UPDATE ON public.subrogasi_debitur FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_subrogasi_laporan_updated BEFORE UPDATE ON public.subrogasi_laporan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_subrogasi_item_updated BEFORE UPDATE ON public.subrogasi_laporan_item FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_plnpl_laporan_updated BEFORE UPDATE ON public.pl_to_npl_laporan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_plnpl_item_updated BEFORE UPDATE ON public.pl_to_npl_item FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

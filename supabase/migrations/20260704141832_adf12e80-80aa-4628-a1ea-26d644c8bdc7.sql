
CREATE TABLE IF NOT EXISTS public.subrogasi_pembayaran (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.subrogasi_laporan_item(id) ON DELETE CASCADE,
  urutan INTEGER NOT NULL DEFAULT 1,
  tanggal_pembayaran DATE,
  jumlah_pembayaran NUMERIC NOT NULL DEFAULT 0,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subrogasi_pembayaran TO authenticated;
GRANT ALL ON public.subrogasi_pembayaran TO service_role;

ALTER TABLE public.subrogasi_pembayaran ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage pembayaran"
ON public.subrogasi_pembayaran FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.subrogasi_laporan_item i
    JOIN public.subrogasi_laporan l ON l.id = i.laporan_id
    WHERE i.id = subrogasi_pembayaran.item_id
      AND (l.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.subrogasi_laporan_item i
    JOIN public.subrogasi_laporan l ON l.id = i.laporan_id
    WHERE i.id = subrogasi_pembayaran.item_id
      AND (l.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE INDEX IF NOT EXISTS idx_subrogasi_pembayaran_item ON public.subrogasi_pembayaran(item_id);

CREATE TRIGGER update_subrogasi_pembayaran_updated_at
BEFORE UPDATE ON public.subrogasi_pembayaran
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
--  Gelombang 1 — pengetatan akses database SITAKSI
--  Aman dijalankan berulang (semua DROP ... IF EXISTS / CREATE OR REPLACE).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Fungsi bantu: apakah user sudah di-approve admin?
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND is_approved = true
  )
$$;

-- ---------------------------------------------------------------------------
-- 1. profiles — user tidak boleh meng-approve dirinya sendiri
--    Sebelumnya policy "Users can update their own profile" mengizinkan user
--    mengubah SEMUA kolom barisnya sendiri, termasuk is_approved, lewat API.
--    Trigger ini menolak perubahan is_approved / role / user_id / email oleh
--    siapa pun yang bukan admin. Update oleh sistem (service role, SQL editor)
--    tidak terpengaruh karena auth.uid() di sana NULL.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lindungi_kolom_profil()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_approved := false;
    NEW.role := 'user';
    RETURN NEW;
  END IF;

  IF NEW.is_approved IS DISTINCT FROM OLD.is_approved
     OR NEW.role IS DISTINCT FROM OLD.role
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'Hanya admin yang boleh mengubah status persetujuan, role, atau email akun'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lindungi_kolom_profil ON public.profiles;
CREATE TRIGGER lindungi_kolom_profil
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.lindungi_kolom_profil();

-- Update milik sendiri juga harus tetap milik sendiri setelah diubah
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2. taksasi — hanya user approved yang boleh membuat; admin bisa melihat,
--    mengubah, dan menghapus taksasi semua officer (untuk review)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can create their own taksasi" ON public.taksasi;
CREATE POLICY "Users can create their own taksasi"
  ON public.taksasi FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_approved(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all taksasi" ON public.taksasi;
CREATE POLICY "Admins can view all taksasi"
  ON public.taksasi FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update all taksasi" ON public.taksasi;
CREATE POLICY "Admins can update all taksasi"
  ON public.taksasi FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete all taksasi" ON public.taksasi;
CREATE POLICY "Admins can delete all taksasi"
  ON public.taksasi FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- 3. monitoring_kunjungan & monitoring_jadwal
--    Sebelumnya: SEMUA user login (termasuk yang belum di-approve) bisa
--    melihat, mengubah, dan menghapus data siapa pun (USING true).
--    Sekarang: lihat = user approved; ubah/hapus = pemilik atau admin.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated can view all monitoring"   ON public.monitoring_kunjungan;
DROP POLICY IF EXISTS "Authenticated can insert monitoring"     ON public.monitoring_kunjungan;
DROP POLICY IF EXISTS "Authenticated can update monitoring"     ON public.monitoring_kunjungan;
DROP POLICY IF EXISTS "Authenticated can delete monitoring"     ON public.monitoring_kunjungan;

DROP POLICY IF EXISTS "Approved can view monitoring" ON public.monitoring_kunjungan;
CREATE POLICY "Approved can view monitoring"
  ON public.monitoring_kunjungan FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));
DROP POLICY IF EXISTS "Approved can insert own monitoring" ON public.monitoring_kunjungan;
CREATE POLICY "Approved can insert own monitoring"
  ON public.monitoring_kunjungan FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_approved(auth.uid()));
DROP POLICY IF EXISTS "Owner or admin can update monitoring" ON public.monitoring_kunjungan;
CREATE POLICY "Owner or admin can update monitoring"
  ON public.monitoring_kunjungan FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Owner or admin can delete monitoring" ON public.monitoring_kunjungan;
CREATE POLICY "Owner or admin can delete monitoring"
  ON public.monitoring_kunjungan FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated can view all jadwal"   ON public.monitoring_jadwal;
DROP POLICY IF EXISTS "Authenticated can insert jadwal"     ON public.monitoring_jadwal;
DROP POLICY IF EXISTS "Authenticated can update jadwal"     ON public.monitoring_jadwal;
DROP POLICY IF EXISTS "Authenticated can delete jadwal"     ON public.monitoring_jadwal;

DROP POLICY IF EXISTS "Approved can view jadwal" ON public.monitoring_jadwal;
CREATE POLICY "Approved can view jadwal"
  ON public.monitoring_jadwal FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));
DROP POLICY IF EXISTS "Approved can insert own jadwal" ON public.monitoring_jadwal;
CREATE POLICY "Approved can insert own jadwal"
  ON public.monitoring_jadwal FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_approved(auth.uid()));
DROP POLICY IF EXISTS "Owner or admin can update jadwal" ON public.monitoring_jadwal;
CREATE POLICY "Owner or admin can update jadwal"
  ON public.monitoring_jadwal FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Owner or admin can delete jadwal" ON public.monitoring_jadwal;
CREATE POLICY "Owner or admin can delete jadwal"
  ON public.monitoring_jadwal FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- 4. storage_files — daftar file hanya untuk user approved
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view all storage files" ON public.storage_files;
DROP POLICY IF EXISTS "Approved can view storage files" ON public.storage_files;
CREATE POLICY "Approved can view storage files"
  ON public.storage_files FOR SELECT TO authenticated
  USING (public.is_approved(auth.uid()));

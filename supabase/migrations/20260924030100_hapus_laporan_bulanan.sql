-- Fitur laporan bulanan via email (send-monthly-report) sudah di-drop.
-- Edge function-nya sudah dihapus dan cron job-nya sudah di-unschedule di
-- project produksi; migrasi ini membuat repo konsisten dengan kondisi itu,
-- supaya replay migrasi di project baru tidak menjadwalkannya lagi.

DO $$
BEGIN
  PERFORM cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname = 'send-monthly-taksasi-report';
EXCEPTION WHEN undefined_table OR invalid_schema_name OR undefined_function THEN
  NULL; -- pg_cron tidak terpasang: tidak ada yang perlu dibersihkan
END;
$$;

DROP FUNCTION IF EXISTS public.trigger_monthly_report_with_logging();
DROP FUNCTION IF EXISTS public.trigger_monthly_report();

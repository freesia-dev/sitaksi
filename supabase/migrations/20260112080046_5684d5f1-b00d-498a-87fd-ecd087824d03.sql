-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create a function to call the edge function
CREATE OR REPLACE FUNCTION public.trigger_monthly_report()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _supabase_url text;
  _service_role_key text;
BEGIN
  -- Get Supabase URL from environment (this will be set via vault)
  SELECT decrypted_secret INTO _supabase_url 
  FROM vault.decrypted_secrets 
  WHERE name = 'supabase_url' 
  LIMIT 1;
  
  SELECT decrypted_secret INTO _service_role_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'service_role_key' 
  LIMIT 1;

  -- If vault secrets not found, use hardcoded project URL
  IF _supabase_url IS NULL THEN
    _supabase_url := 'https://cniurnhyjhrflkwrltku.supabase.co';
  END IF;

  -- Call the edge function using pg_net
  PERFORM net.http_post(
    url := _supabase_url || '/functions/v1/send-monthly-report',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(_service_role_key, current_setting('app.settings.service_role_key', true))
    ),
    body := '{}'::jsonb
  );
  
  -- Log the execution
  RAISE NOTICE 'Monthly report triggered at %', now();
END;
$$;

-- Schedule the cron job to run on the 1st of every month at 08:00 AM (UTC+8 = 00:00 UTC)
-- Cron format: minute hour day-of-month month day-of-week
SELECT cron.schedule(
  'send-monthly-taksasi-report',  -- job name
  '0 0 1 * *',                     -- At 00:00 UTC on the 1st of every month (08:00 WITA)
  $$SELECT public.trigger_monthly_report()$$
);

-- Create a table to log cron job executions
CREATE TABLE IF NOT EXISTS public.cron_job_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  executed_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'success',
  details jsonb
);

-- Enable RLS
ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view cron logs"
ON public.cron_job_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create a wrapper function that logs execution
CREATE OR REPLACE FUNCTION public.trigger_monthly_report_with_logging()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the actual trigger function
  PERFORM public.trigger_monthly_report();
  
  -- Log success
  INSERT INTO public.cron_job_logs (job_name, status, details)
  VALUES ('send-monthly-taksasi-report', 'success', jsonb_build_object('triggered_at', now()));
  
EXCEPTION WHEN OTHERS THEN
  -- Log failure
  INSERT INTO public.cron_job_logs (job_name, status, details)
  VALUES ('send-monthly-taksasi-report', 'error', jsonb_build_object('error', SQLERRM, 'triggered_at', now()));
  RAISE;
END;
$$;

-- Update the cron job to use the logging wrapper
SELECT cron.unschedule('send-monthly-taksasi-report');

SELECT cron.schedule(
  'send-monthly-taksasi-report',
  '0 0 1 * *',
  $$SELECT public.trigger_monthly_report_with_logging()$$
);
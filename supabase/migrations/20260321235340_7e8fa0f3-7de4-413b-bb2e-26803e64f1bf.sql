
ALTER TABLE public.metrics_snapshot 
  ADD COLUMN IF NOT EXISTS cold_emails_sent integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cold_emails_replies integer DEFAULT 0;

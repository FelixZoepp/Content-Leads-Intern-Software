
-- Function to fire webhooks via pg_net (calls the edge function)
CREATE OR REPLACE FUNCTION public.notify_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _event_type text;
  _payload jsonb;
  _endpoint record;
  _supabase_url text;
  _service_role_key text;
BEGIN
  -- Determine event type based on trigger
  _event_type := TG_ARGV[0];
  
  -- Build payload based on event type
  CASE _event_type
    WHEN 'kpi_entry' THEN
      _payload := jsonb_build_object(
        'tenant_id', NEW.tenant_id,
        'period_date', NEW.period_date,
        'leads_total', NEW.leads_total,
        'deals', NEW.deals,
        'revenue', NEW.revenue
      );
    WHEN 'health_change' THEN
      _payload := jsonb_build_object(
        'tenant_id', NEW.tenant_id,
        'score', NEW.score,
        'color', NEW.color
      );
    WHEN 'survey_completed' THEN
      _payload := jsonb_build_object(
        'tenant_id', NEW.tenant_id,
        'survey_id', NEW.survey_id,
        'nps', NEW.nps,
        'avg_score', NEW.avg_score
      );
    ELSE
      _payload := to_jsonb(NEW);
  END CASE;

  -- Send webhook to each active endpoint for this event type
  FOR _endpoint IN
    SELECT url FROM webhook_endpoints
    WHERE event_type = _event_type AND is_active = true
  LOOP
    -- Use pg_net to send async HTTP request
    PERFORM net.http_post(
      url := _endpoint.url,
      body := jsonb_build_object(
        'event', _event_type,
        'timestamp', now(),
        'data', _payload
      ),
      headers := jsonb_build_object('Content-Type', 'application/json')
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Trigger on new KPI entries (metrics_snapshot)
CREATE TRIGGER webhook_on_kpi_entry
  AFTER INSERT ON public.metrics_snapshot
  FOR EACH ROW
  EXECUTE FUNCTION notify_webhook('kpi_entry');

-- Trigger on health score changes
CREATE TRIGGER webhook_on_health_change
  AFTER INSERT ON public.health_scores
  FOR EACH ROW
  EXECUTE FUNCTION notify_webhook('health_change');

-- Trigger on survey completion
CREATE TRIGGER webhook_on_survey_completed
  AFTER INSERT ON public.survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION notify_webhook('survey_completed');

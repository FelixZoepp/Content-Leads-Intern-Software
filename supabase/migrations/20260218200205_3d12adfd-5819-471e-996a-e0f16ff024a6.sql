
-- Drop old views
DROP VIEW IF EXISTS public.v_metrics_yearly;
DROP VIEW IF EXISTS public.v_metrics_monthly;
DROP VIEW IF EXISTS public.v_metrics_weekly;
DROP VIEW IF EXISTS public.v_metrics_daily;

-- Recreate with SECURITY INVOKER (respects RLS of querying user)
CREATE VIEW public.v_metrics_daily WITH (security_invoker = true) AS
SELECT 
  m.id, m.tenant_id, m.period_date, m.period_type, m.created_at,
  m.posts, m.post_url, m.post_type,
  m.impressions, m.likes, m.comments, m.link_clicks,
  m.new_followers, m.followers_current,
  m.leads_total, m.leads_qualified, m.appointments,
  m.settings_planned, m.settings_held, m.closings, m.deals,
  m.revenue, m.cash_collected, m.deal_volume, m.monthly_retainer,
  m.words_spoken,
  m.impressions - LAG(m.impressions) OVER w AS impressions_delta,
  m.likes - LAG(m.likes) OVER w AS likes_delta,
  m.comments - LAG(m.comments) OVER w AS comments_delta,
  m.followers_current - LAG(m.followers_current) OVER w AS followers_delta,
  ROUND(100.0 * m.settings_held / NULLIF(m.settings_planned, 0), 1) AS show_up_rate,
  ROUND(100.0 * m.deals / NULLIF(m.closings, 0), 1) AS closing_rate,
  ROUND(m.revenue / NULLIF(m.leads_total, 0), 2) AS revenue_per_lead,
  ROUND(m.leads_total::NUMERIC / NULLIF(m.closings, 0), 2) AS leads_per_closing,
  ROUND(m.monthly_retainer / NULLIF(m.leads_total, 0), 2) AS cost_per_lead,
  ROUND(100.0 * m.appointments / NULLIF(m.leads_total, 0), 1) AS cr_lead_to_appt,
  ROUND(100.0 * m.deals / NULLIF(m.appointments, 0), 1) AS cr_appt_to_deal,
  ROUND(100.0 * m.deals / NULLIF(m.leads_total, 0), 1) AS cr_lead_to_deal
FROM public.metrics_snapshot m
WINDOW w AS (PARTITION BY m.tenant_id ORDER BY m.period_date);

CREATE VIEW public.v_metrics_weekly WITH (security_invoker = true) AS
SELECT 
  tenant_id,
  date_trunc('week', period_date)::date AS period_start,
  (date_trunc('week', period_date) + interval '6 days')::date AS period_end,
  SUM(COALESCE(leads_total, 0))::bigint AS leads_total,
  SUM(COALESCE(leads_qualified, 0))::bigint AS leads_qualified,
  SUM(COALESCE(appointments, 0))::bigint AS appointments,
  SUM(COALESCE(settings_planned, 0))::bigint AS settings_planned,
  SUM(COALESCE(settings_held, 0))::bigint AS settings_held,
  SUM(COALESCE(closings, 0))::bigint AS closings,
  SUM(COALESCE(deals, 0))::bigint AS deals,
  SUM(COALESCE(revenue, 0)) AS revenue,
  SUM(COALESCE(cash_collected, 0)) AS cash_collected,
  SUM(COALESCE(deal_volume, 0)) AS deal_volume,
  SUM(COALESCE(impressions, 0))::bigint AS impressions,
  SUM(COALESCE(likes, 0))::bigint AS likes,
  SUM(COALESCE(comments, 0))::bigint AS comments,
  SUM(COALESCE(link_clicks, 0))::bigint AS link_clicks,
  SUM(COALESCE(words_spoken, 0))::bigint AS words_spoken,
  MAX(followers_current) AS followers_current,
  MAX(monthly_retainer) AS monthly_retainer,
  COUNT(*)::integer AS posts_count,
  ROUND(100.0 * SUM(COALESCE(settings_held, 0)) / NULLIF(SUM(COALESCE(settings_planned, 0)), 0), 1) AS show_up_rate,
  ROUND(100.0 * SUM(COALESCE(deals, 0)) / NULLIF(SUM(COALESCE(closings, 0)), 0), 1) AS closing_rate,
  ROUND(SUM(COALESCE(revenue, 0)) / NULLIF(SUM(COALESCE(leads_total, 0)), 0), 2) AS revenue_per_lead,
  ROUND(SUM(COALESCE(leads_total, 0))::NUMERIC / NULLIF(SUM(COALESCE(closings, 0)), 0), 2) AS leads_per_closing,
  ROUND(MAX(monthly_retainer) / NULLIF(SUM(COALESCE(leads_total, 0)), 0), 2) AS cost_per_lead,
  ROUND(100.0 * SUM(COALESCE(appointments, 0)) / NULLIF(SUM(COALESCE(leads_total, 0)), 0), 1) AS cr_lead_to_appt,
  ROUND(100.0 * SUM(COALESCE(deals, 0)) / NULLIF(SUM(COALESCE(appointments, 0)), 0), 1) AS cr_appt_to_deal,
  ROUND(100.0 * SUM(COALESCE(deals, 0)) / NULLIF(SUM(COALESCE(leads_total, 0)), 0), 1) AS cr_lead_to_deal,
  MIN(created_at) AS created_at
FROM public.metrics_snapshot
GROUP BY tenant_id, date_trunc('week', period_date);

CREATE VIEW public.v_metrics_monthly WITH (security_invoker = true) AS
SELECT 
  tenant_id,
  date_trunc('month', period_date)::date AS period_start,
  (date_trunc('month', period_date) + interval '1 month - 1 day')::date AS period_end,
  SUM(COALESCE(leads_total, 0))::bigint AS leads_total,
  SUM(COALESCE(leads_qualified, 0))::bigint AS leads_qualified,
  SUM(COALESCE(appointments, 0))::bigint AS appointments,
  SUM(COALESCE(settings_planned, 0))::bigint AS settings_planned,
  SUM(COALESCE(settings_held, 0))::bigint AS settings_held,
  SUM(COALESCE(closings, 0))::bigint AS closings,
  SUM(COALESCE(deals, 0))::bigint AS deals,
  SUM(COALESCE(revenue, 0)) AS revenue,
  SUM(COALESCE(cash_collected, 0)) AS cash_collected,
  SUM(COALESCE(deal_volume, 0)) AS deal_volume,
  SUM(COALESCE(impressions, 0))::bigint AS impressions,
  SUM(COALESCE(likes, 0))::bigint AS likes,
  SUM(COALESCE(comments, 0))::bigint AS comments,
  SUM(COALESCE(link_clicks, 0))::bigint AS link_clicks,
  SUM(COALESCE(words_spoken, 0))::bigint AS words_spoken,
  MAX(followers_current) AS followers_current,
  MAX(monthly_retainer) AS monthly_retainer,
  COUNT(*)::integer AS posts_count,
  ROUND(100.0 * SUM(COALESCE(settings_held, 0)) / NULLIF(SUM(COALESCE(settings_planned, 0)), 0), 1) AS show_up_rate,
  ROUND(100.0 * SUM(COALESCE(deals, 0)) / NULLIF(SUM(COALESCE(closings, 0)), 0), 1) AS closing_rate,
  ROUND(SUM(COALESCE(revenue, 0)) / NULLIF(SUM(COALESCE(leads_total, 0)), 0), 2) AS revenue_per_lead,
  ROUND(SUM(COALESCE(leads_total, 0))::NUMERIC / NULLIF(SUM(COALESCE(closings, 0)), 0), 2) AS leads_per_closing,
  ROUND(MAX(monthly_retainer) / NULLIF(SUM(COALESCE(leads_total, 0)), 0), 2) AS cost_per_lead,
  ROUND(100.0 * SUM(COALESCE(appointments, 0)) / NULLIF(SUM(COALESCE(leads_total, 0)), 0), 1) AS cr_lead_to_appt,
  ROUND(100.0 * SUM(COALESCE(deals, 0)) / NULLIF(SUM(COALESCE(appointments, 0)), 0), 1) AS cr_appt_to_deal,
  ROUND(100.0 * SUM(COALESCE(deals, 0)) / NULLIF(SUM(COALESCE(leads_total, 0)), 0), 1) AS cr_lead_to_deal,
  MIN(created_at) AS created_at
FROM public.metrics_snapshot
GROUP BY tenant_id, date_trunc('month', period_date);

CREATE VIEW public.v_metrics_yearly WITH (security_invoker = true) AS
SELECT 
  tenant_id,
  date_trunc('year', period_date)::date AS period_start,
  (date_trunc('year', period_date) + interval '1 year - 1 day')::date AS period_end,
  SUM(COALESCE(leads_total, 0))::bigint AS leads_total,
  SUM(COALESCE(leads_qualified, 0))::bigint AS leads_qualified,
  SUM(COALESCE(appointments, 0))::bigint AS appointments,
  SUM(COALESCE(settings_planned, 0))::bigint AS settings_planned,
  SUM(COALESCE(settings_held, 0))::bigint AS settings_held,
  SUM(COALESCE(closings, 0))::bigint AS closings,
  SUM(COALESCE(deals, 0))::bigint AS deals,
  SUM(COALESCE(revenue, 0)) AS revenue,
  SUM(COALESCE(cash_collected, 0)) AS cash_collected,
  SUM(COALESCE(deal_volume, 0)) AS deal_volume,
  SUM(COALESCE(impressions, 0))::bigint AS impressions,
  SUM(COALESCE(likes, 0))::bigint AS likes,
  SUM(COALESCE(comments, 0))::bigint AS comments,
  SUM(COALESCE(link_clicks, 0))::bigint AS link_clicks,
  SUM(COALESCE(words_spoken, 0))::bigint AS words_spoken,
  MAX(followers_current) AS followers_current,
  MAX(monthly_retainer) AS monthly_retainer,
  COUNT(*)::integer AS posts_count,
  ROUND(100.0 * SUM(COALESCE(settings_held, 0)) / NULLIF(SUM(COALESCE(settings_planned, 0)), 0), 1) AS show_up_rate,
  ROUND(100.0 * SUM(COALESCE(deals, 0)) / NULLIF(SUM(COALESCE(closings, 0)), 0), 1) AS closing_rate,
  ROUND(SUM(COALESCE(revenue, 0)) / NULLIF(SUM(COALESCE(leads_total, 0)), 0), 2) AS revenue_per_lead,
  ROUND(SUM(COALESCE(leads_total, 0))::NUMERIC / NULLIF(SUM(COALESCE(closings, 0)), 0), 2) AS leads_per_closing,
  ROUND(MAX(monthly_retainer) / NULLIF(SUM(COALESCE(leads_total, 0)), 0), 2) AS cost_per_lead,
  ROUND(100.0 * SUM(COALESCE(appointments, 0)) / NULLIF(SUM(COALESCE(leads_total, 0)), 0), 1) AS cr_lead_to_appt,
  ROUND(100.0 * SUM(COALESCE(deals, 0)) / NULLIF(SUM(COALESCE(appointments, 0)), 0), 1) AS cr_appt_to_deal,
  ROUND(100.0 * SUM(COALESCE(deals, 0)) / NULLIF(SUM(COALESCE(leads_total, 0)), 0), 1) AS cr_lead_to_deal,
  MIN(created_at) AS created_at
FROM public.metrics_snapshot
GROUP BY tenant_id, date_trunc('year', period_date);

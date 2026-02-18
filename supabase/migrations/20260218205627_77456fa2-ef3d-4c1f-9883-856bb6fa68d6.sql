
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS current_offer text,
ADD COLUMN IF NOT EXISTS offer_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS closing_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_per_lead numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_per_appointment numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_per_customer numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS margin_percent numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_costs_monthly numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS ads_spend_monthly numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tools_costs_monthly numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS personnel_costs_monthly numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_costs_monthly numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS contract_duration text,
ADD COLUMN IF NOT EXISTS revenue_recurring numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue_onetime numeric DEFAULT 0;

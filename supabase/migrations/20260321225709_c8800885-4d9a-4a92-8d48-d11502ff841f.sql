
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS product_palette jsonb DEFAULT '[]'::jsonb;

-- ============================================
-- Cashflow OS: New tables for asset generation,
-- daily tasks, and content calendar
-- ============================================

-- generated_assets: stores all AI-generated content
CREATE TABLE IF NOT EXISTS public.generated_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_type TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.generated_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own assets"
  ON public.generated_assets FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_generated_assets
  BEFORE UPDATE ON public.generated_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- daily_tasks: 90-day task plan
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  task_text TEXT NOT NULL,
  category TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own tasks"
  ON public.daily_tasks FOR ALL
  USING (auth.uid() = user_id);

-- Add daily tracking columns to kpi_entries
ALTER TABLE public.kpi_entries
  ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS dms_sent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dm_replies INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mails_sent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mail_opens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mail_replies INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS posts_published INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS termine INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS proposals INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS abschluesse INTEGER DEFAULT 0;

-- content_posts: for content calendar
CREATE TABLE IF NOT EXISTS public.content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheduled_date DATE NOT NULL,
  topic TEXT NOT NULL,
  caption TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own posts"
  ON public.content_posts FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_content_posts
  BEFORE UPDATE ON public.content_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

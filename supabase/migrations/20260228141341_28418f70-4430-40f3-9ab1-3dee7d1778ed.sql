
CREATE TABLE public.imported_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_name TEXT NOT NULL,
  business TEXT,
  location TEXT,
  previous_rep TEXT,
  contact_date DATE,
  contact_time TIME,
  lead_type TEXT DEFAULT 'warm' CHECK (lead_type IN ('hot', 'warm', 'cold')),
  pain_point TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.imported_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own imported leads"
  ON public.imported_leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own imported leads"
  ON public.imported_leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own imported leads"
  ON public.imported_leads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own imported leads"
  ON public.imported_leads FOR DELETE
  USING (auth.uid() = user_id);

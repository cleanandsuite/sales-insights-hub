-- Create winwords_scripts table
CREATE TABLE public.winwords_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scenario TEXT NOT NULL,
  persona JSONB NOT NULL DEFAULT '{}',
  deal_context JSONB NOT NULL DEFAULT '{}',
  style TEXT NOT NULL DEFAULT 'confident',
  generated_script JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Outcome tracking
  used_at TIMESTAMP WITH TIME ZONE,
  outcome TEXT,
  outcome_details JSONB,
  feedback TEXT,
  
  -- Performance metrics
  call_duration_seconds INTEGER,
  deal_size NUMERIC(12,2),
  win_rate_impact NUMERIC(5,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.winwords_scripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own scripts" 
ON public.winwords_scripts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scripts" 
ON public.winwords_scripts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scripts" 
ON public.winwords_scripts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scripts" 
ON public.winwords_scripts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_winwords_scripts_user_id ON public.winwords_scripts(user_id);
CREATE INDEX idx_winwords_scripts_scenario ON public.winwords_scripts(scenario);
CREATE INDEX idx_winwords_scripts_outcome ON public.winwords_scripts(outcome);
CREATE INDEX idx_winwords_scripts_generated_at ON public.winwords_scripts(generated_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_winwords_scripts_updated_at
BEFORE UPDATE ON public.winwords_scripts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create winwords_templates table for custom templates
CREATE TABLE public.winwords_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  scenario TEXT NOT NULL,
  template_structure JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.winwords_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates
CREATE POLICY "Users can view their own templates" 
ON public.winwords_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates" 
ON public.winwords_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
ON public.winwords_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
ON public.winwords_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for templates
CREATE INDEX idx_winwords_templates_user_id ON public.winwords_templates(user_id);
CREATE INDEX idx_winwords_templates_scenario ON public.winwords_templates(scenario);

-- Create trigger for updated_at
CREATE TRIGGER update_winwords_templates_updated_at
BEFORE UPDATE ON public.winwords_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
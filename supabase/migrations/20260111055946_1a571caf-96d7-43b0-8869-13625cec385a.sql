-- Add WinWords personalization columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_strengths text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS unique_differentiators text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS personal_tone text DEFAULT 'Neutral';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.company_strengths IS 'Array of company strengths for WinWords personalization';
COMMENT ON COLUMN public.profiles.unique_differentiators IS 'Array of unique differentiators for WinWords personalization';
COMMENT ON COLUMN public.profiles.personal_tone IS 'Preferred tone style: High-Energy (Cardone), Smooth Persuasion (Belfort), or Neutral';
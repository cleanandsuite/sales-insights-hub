-- Add position column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'Sales Representative';
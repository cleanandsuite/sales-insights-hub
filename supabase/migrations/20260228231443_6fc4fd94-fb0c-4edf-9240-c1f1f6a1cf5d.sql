-- Add phone_number column to imported_leads
ALTER TABLE public.imported_leads ADD COLUMN IF NOT EXISTS phone_number text;
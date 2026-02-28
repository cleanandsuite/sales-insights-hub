ALTER TABLE scheduled_calls
  ADD COLUMN IF NOT EXISTS outcome text,
  ADD COLUMN IF NOT EXISTS outcome_notes text,
  ADD COLUMN IF NOT EXISTS recurrence_rule text,
  ADD COLUMN IF NOT EXISTS recurrence_parent_id uuid REFERENCES scheduled_calls(id);
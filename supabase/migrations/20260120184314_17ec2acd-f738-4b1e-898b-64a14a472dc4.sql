-- Fix overly permissive RLS policies

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Managers manage coaching_assignments" ON public.coaching_assignments;
DROP POLICY IF EXISTS "Managers manage risk_alerts" ON public.risk_alerts;

-- Create proper insert policy for coaching_assignments
CREATE POLICY "Managers insert coaching_assignments"
  ON public.coaching_assignments FOR INSERT
  WITH CHECK (
    public.is_team_admin(team_id, auth.uid()) OR 
    EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = coaching_assignments.team_id AND tm.user_id = auth.uid() AND tm.role = 'manager')
  );

-- Create proper update policy for coaching_assignments
CREATE POLICY "Managers update coaching_assignments"
  ON public.coaching_assignments FOR UPDATE
  USING (
    public.is_team_admin(team_id, auth.uid()) OR 
    EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = coaching_assignments.team_id AND tm.user_id = auth.uid() AND tm.role = 'manager') OR
    assigned_to = auth.uid()
  );

-- Create proper delete policy for coaching_assignments
CREATE POLICY "Managers delete coaching_assignments"
  ON public.coaching_assignments FOR DELETE
  USING (
    public.is_team_admin(team_id, auth.uid()) OR 
    EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = coaching_assignments.team_id AND tm.user_id = auth.uid() AND tm.role = 'manager')
  );

-- Create proper insert policy for risk_alerts
CREATE POLICY "Managers insert risk_alerts"
  ON public.risk_alerts FOR INSERT
  WITH CHECK (
    public.is_team_admin(team_id, auth.uid()) OR 
    EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = risk_alerts.team_id AND tm.user_id = auth.uid() AND tm.role = 'manager')
  );

-- Create proper update policy for risk_alerts
CREATE POLICY "Managers update risk_alerts"
  ON public.risk_alerts FOR UPDATE
  USING (
    public.is_team_admin(team_id, auth.uid()) OR 
    EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = risk_alerts.team_id AND tm.user_id = auth.uid() AND tm.role = 'manager') OR
    user_id = auth.uid()
  );

-- Create proper delete policy for risk_alerts
CREATE POLICY "Managers delete risk_alerts"
  ON public.risk_alerts FOR DELETE
  USING (
    public.is_team_admin(team_id, auth.uid()) OR 
    EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = risk_alerts.team_id AND tm.user_id = auth.uid() AND tm.role = 'manager')
  );
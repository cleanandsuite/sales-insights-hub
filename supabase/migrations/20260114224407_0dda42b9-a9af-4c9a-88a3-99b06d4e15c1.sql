
-- Insert demo call recordings
INSERT INTO public.call_recordings (id, user_id, file_name, name, status, duration_seconds, sentiment_score, created_at, key_topics, summary) VALUES
('11111111-0001-4000-8000-000000000001', '793f2f9e-c358-4ee6-80ce-712267bebdfd', 'discovery-techflow.mp3', 'Discovery Call - TechFlow Solutions', 'analyzed', 2340, 0.89, NOW() - INTERVAL '2 days', ARRAY['budget discussion', 'implementation timeline', 'team size'], 'Excellent discovery call with TechFlow. Identified $85K budget, Q2 implementation goal. Decision maker engaged throughout.'),
('11111111-0002-4000-8000-000000000002', '793f2f9e-c358-4ee6-80ce-712267bebdfd', 'demo-cloudscale.mp3', 'Demo - CloudScale Enterprise', 'analyzed', 2760, 0.92, NOW() - INTERVAL '4 days', ARRAY['product demo', 'integration requirements', 'security compliance'], 'Strong demo with CloudScale. CTO impressed with security features. Moving to proposal stage.'),
('11111111-0003-4000-8000-000000000003', '793f2f9e-c358-4ee6-80ce-712267bebdfd', 'closing-datasync.mp3', 'Closing Call - DataSync Pro', 'analyzed', 1890, 0.95, NOW() - INTERVAL '5 days', ARRAY['contract terms', 'pricing', 'onboarding'], 'Closed $120K deal with DataSync Pro. 3-year contract signed. Onboarding scheduled for next week.'),
('11111111-0004-4000-8000-000000000004', '793f2f9e-c358-4ee6-80ce-712267bebdfd', 'followup-nextera.mp3', 'Follow-up - Nextera Digital', 'analyzed', 1560, 0.78, NOW() - INTERVAL '7 days', ARRAY['objection handling', 'competitor comparison', 'ROI discussion'], 'Addressed pricing concerns. Provided ROI calculator. Scheduled technical deep-dive for next week.'),
('11111111-0005-4000-8000-000000000005', '793f2f9e-c358-4ee6-80ce-712267bebdfd', 'discovery-quantum.mp3', 'Discovery - Quantum Analytics', 'analyzed', 2100, 0.86, NOW() - INTERVAL '9 days', ARRAY['pain points', 'current solution', 'decision process'], 'Strong discovery with Quantum. Clear pain points identified. Budget approved, need to engage procurement.'),
('11111111-0006-4000-8000-000000000006', '793f2f9e-c358-4ee6-80ce-712267bebdfd', 'demo-stratos.mp3', 'Demo - Stratos Systems', 'analyzed', 2580, 0.91, NOW() - INTERVAL '11 days', ARRAY['workflow automation', 'API integration', 'scalability'], 'Excellent demo reception. VP of Engineering wants to pilot with their team.'),
('11111111-0007-4000-8000-000000000007', '793f2f9e-c358-4ee6-80ce-712267bebdfd', 'negotiation-vertex.mp3', 'Negotiation - Vertex Corp', 'analyzed', 1980, 0.82, NOW() - INTERVAL '13 days', ARRAY['pricing negotiation', 'contract terms', 'SLA requirements'], 'Productive negotiation. Agreed on multi-year discount structure. Legal review in progress.'),
('11111111-0008-4000-8000-000000000008', '793f2f9e-c358-4ee6-80ce-712267bebdfd', 'discovery-aurora.mp3', 'Discovery - Aurora Tech', 'analyzed', 2220, 0.88, NOW() - INTERVAL '15 days', ARRAY['team challenges', 'growth plans', 'budget cycle'], 'Great initial call with Aurora. $150K potential. Need to present to board next month.'),
('11111111-0009-4000-8000-000000000009', '793f2f9e-c358-4ee6-80ce-712267bebdfd', 'closing-meridian.mp3', 'Closing - Meridian Group', 'analyzed', 1650, 0.94, NOW() - INTERVAL '18 days', ARRAY['final approval', 'implementation plan', 'success metrics'], 'Closed $95K deal. Customer excited about implementation. Reference customer potential.'),
('11111111-0010-4000-8000-000000000010', '793f2f9e-c358-4ee6-80ce-712267bebdfd', 'demo-cascade.mp3', 'Demo - Cascade Industries', 'analyzed', 2400, 0.85, NOW() - INTERVAL '20 days', ARRAY['product capabilities', 'customization options', 'support model'], 'Solid demo. Need to address integration concerns. Technical follow-up scheduled.'),
('11111111-0011-4000-8000-000000000011', '793f2f9e-c358-4ee6-80ce-712267bebdfd', 'followup-apex.mp3', 'Follow-up - Apex Solutions', 'analyzed', 1440, 0.72, NOW() - INTERVAL '22 days', ARRAY['timeline concerns', 'resource allocation', 'stakeholder alignment'], 'Some hesitation from CFO. Need executive sponsor to push timeline.'),
('11111111-0012-4000-8000-000000000012', '793f2f9e-c358-4ee6-80ce-712267bebdfd', 'discovery-nova.mp3', 'Discovery - Nova Dynamics', 'analyzed', 1980, 0.87, NOW() - INTERVAL '25 days', ARRAY['expansion plans', 'current pain points', 'evaluation criteria'], 'Strong discovery. Multiple stakeholders engaged. Moving to demo stage.'),
('11111111-0013-4000-8000-000000000013', '793f2f9e-c358-4ee6-80ce-712267bebdfd', 'live-recording.mp3', 'Live Call - Pinnacle Tech', 'recording', 420, NULL, NOW() - INTERVAL '30 minutes', NULL, NULL),
('11111111-0014-4000-8000-000000000014', '793f2f9e-c358-4ee6-80ce-712267bebdfd', 'processing-call.mp3', 'Recent Call - Horizon Labs', 'processing', 1860, NULL, NOW() - INTERVAL '2 hours', NULL, NULL),
('11111111-0015-4000-8000-000000000015', '793f2f9e-c358-4ee6-80ce-712267bebdfd', 'new-prospect.mp3', 'New Prospect - Stellar Corp', 'processing', 1200, NULL, NOW() - INTERVAL '4 hours', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Drop and recreate the leads trigger to fix the issue
DROP TRIGGER IF EXISTS log_leads_access_trigger ON public.leads;

-- Recreate the function to handle null auth.uid()
CREATE OR REPLACE FUNCTION public.log_leads_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if auth.uid() is not null
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.leads_access_logs (user_id, lead_id, action)
    VALUES (auth.uid(), NEW.id, TG_OP);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER log_leads_access_trigger
AFTER INSERT OR UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.log_leads_access();

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { frequency = 'weekly' } = await req.json().catch(() => ({}));
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Get users who have digest enabled for this frequency
    const { data: preferences, error: prefError } = await supabase
      .from('email_digest_preferences')
      .select('*, profiles:user_id(email, full_name)')
      .eq('enabled', true)
      .eq('frequency', frequency);

    if (prefError) throw prefError;

    const digestsToSend = (preferences || []).filter(pref => {
      if (frequency === 'weekly' && pref.day_of_week !== dayOfWeek) return false;
      if (frequency === 'monthly' && today.getDate() !== 1) return false;
      return true;
    });

    const results = [];

    for (const pref of digestsToSend) {
      try {
        // Get team KPIs
        const { data: kpiData } = await supabase
          .rpc('get_team_kpis', { p_team_id: pref.team_id })
          .single();

        // Get rep stats if included
        let repStats: any[] = [];
        if (pref.include_rep_breakdown) {
          const { data } = await supabase
            .from('manager_team_stats')
            .select('*')
            .eq('team_id', pref.team_id);
          repStats = data || [];
        }

        // Get goals progress if included
        let goalsProgress: any[] = [];
        if (pref.include_goals_progress) {
          const { data: teamGoals } = await supabase
            .from('team_goals')
            .select('*')
            .eq('team_id', pref.team_id)
            .eq('status', 'active');

          const { data: repGoals } = await supabase
            .from('rep_goals')
            .select('*')
            .eq('team_id', pref.team_id)
            .eq('status', 'active');

          goalsProgress = [...(teamGoals || []), ...(repGoals || [])];
        }

        // Get risk alerts if included
        let riskAlerts: any[] = [];
        if (pref.include_risk_alerts) {
          const { data } = await supabase
            .from('risk_alerts')
            .select('*')
            .eq('team_id', pref.team_id)
            .eq('acknowledged', false)
            .order('created_at', { ascending: false })
            .limit(5);
          riskAlerts = data || [];
        }

        // Build email content
        const emailContent = buildDigestEmail({
          userName: pref.profiles?.full_name || 'Manager',
          frequency,
          kpis: kpiData,
          repStats,
          goalsProgress,
          riskAlerts,
          includeRepBreakdown: pref.include_rep_breakdown,
          includeGoals: pref.include_goals_progress,
          includeAlerts: pref.include_risk_alerts,
        });

        // Log the digest (in production, send via email service)
        console.log(`Digest prepared for ${pref.profiles?.email}:`, {
          subject: emailContent.subject,
          preview: emailContent.preview,
        });

        results.push({
          user_id: pref.user_id,
          status: 'prepared',
          email: pref.profiles?.email,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Error preparing digest for ${pref.user_id}:`, err);
        results.push({
          user_id: pref.user_id,
          status: 'error',
          error: errorMessage,
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        digests_prepared: results.filter(r => r.status === 'prepared').length,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-digest-email:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildDigestEmail(data: {
  userName: string;
  frequency: string;
  kpis: any;
  repStats: any[];
  goalsProgress: any[];
  riskAlerts: any[];
  includeRepBreakdown: boolean;
  includeGoals: boolean;
  includeAlerts: boolean;
}) {
  const { userName, frequency, kpis, repStats, goalsProgress, riskAlerts } = data;

  const periodLabel = frequency === 'daily' ? 'Daily' : frequency === 'weekly' ? 'Weekly' : 'Monthly';

  let preview = `Team Win Rate: ${kpis?.teamWinRate?.toFixed(1) || 0}%`;
  if (riskAlerts.length > 0) {
    preview += ` | ${riskAlerts.length} risk alert${riskAlerts.length > 1 ? 's' : ''}`;
  }

  const sections = [];

  // KPI Summary
  sections.push({
    title: 'Team Performance Snapshot',
    content: `
      Win Rate: ${kpis?.teamWinRate?.toFixed(1) || 0}%
      Avg Calls/Rep: ${kpis?.avgCallsPerRep?.toFixed(1) || 0}
      Coaching Coverage: ${kpis?.coachingCoveragePct?.toFixed(0) || 0}%
      Discovery Score: ${kpis?.avgDiscoveryScore?.toFixed(1) || 0}
      Closing Score: ${kpis?.avgCloserScore?.toFixed(1) || 0}
    `,
  });

  // Rep Breakdown
  if (data.includeRepBreakdown && repStats.length > 0) {
    const topPerformers = [...repStats]
      .sort((a, b) => (b.avg_overall_score || 0) - (a.avg_overall_score || 0))
      .slice(0, 3);

    sections.push({
      title: 'Top Performers',
      content: topPerformers.map((r, i) => 
        `${i + 1}. ${r.full_name}: Score ${r.avg_overall_score?.toFixed(1) || 0}, ${r.total_calls || 0} calls`
      ).join('\n'),
    });
  }

  // Goals Progress
  if (data.includeGoals && goalsProgress.length > 0) {
    sections.push({
      title: 'Goals Progress',
      content: `${goalsProgress.length} active goal${goalsProgress.length > 1 ? 's' : ''} being tracked`,
    });
  }

  // Risk Alerts
  if (data.includeAlerts && riskAlerts.length > 0) {
    sections.push({
      title: 'Risk Alerts',
      content: riskAlerts.map(a => `⚠️ ${a.alert_type}: ${a.description}`).join('\n'),
    });
  }

  return {
    subject: `${periodLabel} Performance Digest - ${new Date().toLocaleDateString()}`,
    preview,
    greeting: `Hi ${userName},`,
    sections,
    footer: 'View full details in your Revenue Intelligence dashboard.',
  };
}

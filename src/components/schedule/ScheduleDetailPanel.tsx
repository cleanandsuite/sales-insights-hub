import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Phone, Clock, User, Video, Mail, ExternalLink, FileText,
  MapPin, Building2, CalendarIcon, Bell, BellOff, Sparkles,
  CheckCircle2, AlertTriangle, MessageSquare, Play, Link
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface ScheduledCall {
  id: string;
  title: string;
  description: string | null;
  contact_name: string | null;
  contact_email: string | null;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url: string | null;
  meeting_provider: string | null;
  status: string;
  prep_notes: string | null;
  reminder_sent?: boolean;
  reminder_minutes_before?: number;
}

interface ScheduleDetailPanelProps {
  call: ScheduledCall;
  onEmailDialog: (call: ScheduledCall) => void;
  onStartRecording: () => void;
}

interface LeadInfo {
  id: string;
  contact_name: string;
  company: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  lead_status: string;
  primary_pain_point: string | null;
  budget_info: string | null;
  timeline: string | null;
  competitor_status: string | null;
  urgency_level: string | null;
  priority_score: number | null;
  engagement_score: number | null;
  is_hot_lead: boolean | null;
}

interface RecordingInfo {
  id: string;
  name: string | null;
  file_name: string;
  duration_seconds: number | null;
  created_at: string;
  summary: string | null;
  sentiment_score: number | null;
  key_topics: string[] | null;
}

interface ScoreInfo {
  overall_score: number;
  discovery_score: number | null;
  rapport_score: number | null;
  closing_score: number | null;
  objection_handling_score: number | null;
  talk_ratio: number | null;
}

interface SummaryInfo {
  key_points: string[] | null;
  objections_raised: string[] | null;
  agreed_next_steps: string[] | null;
  emotional_tone: string | null;
  engagement_score: number | null;
  strengths: string[] | null;
  improvements: string[] | null;
  suggestions_next_call: string[] | null;
  review_before_calling: string[] | null;
  watch_out_for: string[] | null;
}

interface ActivityItem {
  id: string;
  type: 'call' | 'email' | 'note';
  title: string;
  description: string | null;
  date: string;
  metadata?: Record<string, any>;
}

export function ScheduleDetailPanel({ call, onEmailDialog, onStartRecording }: ScheduleDetailPanelProps) {
  const [lead, setLead] = useState<LeadInfo | null>(null);
  const [recording, setRecording] = useState<RecordingInfo | null>(null);
  const [score, setScore] = useState<ScoreInfo | null>(null);
  const [callSummary, setCallSummary] = useState<SummaryInfo | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [totalDials, setTotalDials] = useState(0);
  const [totalConversations, setTotalConversations] = useState(0);
  const [lastConversationDate, setLastConversationDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (call.id.startsWith('demo-')) {
      loadDemoDetails();
    } else {
      loadDetails();
    }
  }, [call.id]);

  const loadDemoDetails = () => {
    setLead({
      id: 'demo-lead',
      contact_name: call.contact_name || 'Unknown',
      company: call.title.split('—')[1]?.trim() || call.title.split('—')[0]?.trim() || null,
      title: 'VP of Sales',
      email: call.contact_email,
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      lead_status: 'qualified',
      primary_pain_point: 'Sales team lacks real-time coaching during calls',
      budget_info: '$50K–$120K annually',
      timeline: 'Q2 2026',
      competitor_status: 'Evaluating Gong and Chorus',
      urgency_level: 'high',
      priority_score: 85,
      engagement_score: 72,
      is_hot_lead: true,
    });
    setRecording({
      id: 'demo-rec',
      name: `Call with ${call.contact_name}`,
      file_name: 'demo-recording.mp3',
      duration_seconds: 1245,
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      summary: `Discussed their current sales enablement stack and identified key gaps in call coaching and real-time guidance. ${call.contact_name} expressed strong interest in AI-powered conversation intelligence and asked about integration with their existing CRM.`,
      sentiment_score: 0.78,
      key_topics: ['AI coaching', 'CRM integration', 'ROI', 'Team onboarding'],
    });
    setScore({
      overall_score: 76,
      discovery_score: 82,
      rapport_score: 71,
      closing_score: 68,
      objection_handling_score: 74,
      talk_ratio: 42,
    });
    setCallSummary({
      key_points: [
        'Currently using a manual coaching process with weekly 1:1s',
        'Team of 25 reps across 3 regions',
        'Interested in real-time AI suggestions during live calls',
        'CTO needs to approve any new integrations',
      ],
      objections_raised: [
        'Concerned about data privacy and call recording consent',
        'Wants to see ROI evidence from similar-sized companies',
      ],
      agreed_next_steps: [
        'Send case studies from financial services clients',
        'Schedule a technical deep-dive with their CTO',
        'Prepare a custom ROI projection for their team size',
      ],
      emotional_tone: 'Cautiously optimistic',
      engagement_score: 78,
      strengths: ['Strong discovery questions', 'Good rapport building'],
      improvements: ['Could have addressed pricing earlier', 'Missed opportunity to demo live'],
      suggestions_next_call: [
        'Lead with the ROI calculator — they are data-driven',
        'Bring up the compliance certifications early to address privacy concerns',
        'Propose a 2-week pilot with 5 reps to reduce perceived risk',
      ],
      review_before_calling: ['Check if CTO has availability', 'Prepare competitor comparison'],
      watch_out_for: ['Budget freeze risk in Q3', 'Champion may be leaving the company'],
    });
    setTotalDials(4);
    setTotalConversations(3);
    setLastConversationDate(new Date(Date.now() - 7 * 86400000).toISOString());
    setActivities([
      { id: 'demo-act-1', type: 'call', title: 'Discovery Call', description: 'Initial discovery — discussed pain points and current stack', date: new Date(Date.now() - 7 * 86400000).toISOString() },
      { id: 'demo-act-2', type: 'email', title: 'Sent Case Studies', description: 'Shared 3 case studies from similar-sized sales teams', date: new Date(Date.now() - 5 * 86400000).toISOString() },
      { id: 'demo-act-3', type: 'call', title: 'Follow-up Call', description: 'Reviewed case studies, answered technical questions about integrations', date: new Date(Date.now() - 3 * 86400000).toISOString() },
      { id: 'demo-act-4', type: 'note', title: 'Internal Note', description: 'Champion confirmed budget approval path — needs CTO sign-off', date: new Date(Date.now() - 2 * 86400000).toISOString() },
    ]);
    setLoading(false);
  };

  const loadDetails = async () => {
    setLoading(true);
    const contactName = call.contact_name;
    if (!contactName) {
      setLoading(false);
      return;
    }

    try {
      // Load lead
      const { data: leadData } = await supabase
        .from('leads')
        .select('id, contact_name, company, title, email, phone, location, lead_status, primary_pain_point, budget_info, timeline, competitor_status, urgency_level, priority_score, engagement_score, is_hot_lead')
        .ilike('contact_name', `%${contactName}%`)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (leadData?.[0]) setLead(leadData[0]);

      // Load recordings matching contact
      const { data: recordings } = await supabase
        .from('call_recordings')
        .select('id, name, file_name, duration_seconds, created_at, summary, sentiment_score, key_topics')
        .or(`name.ilike.%${contactName}%,file_name.ilike.%${contactName}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recordings && recordings.length > 0) {
        setRecording(recordings[0]);
        setTotalDials(recordings.length);
        setLastConversationDate(recordings[0].created_at);

        // Count conversations (ones with summaries)
        const convos = recordings.filter(r => r.summary);
        setTotalConversations(convos.length);

        // Build activity timeline
        const acts: ActivityItem[] = recordings.map(r => ({
          id: r.id,
          type: 'call' as const,
          title: r.summary ? 'Had Discussion' : 'Call Made',
          description: r.summary || `Called ${contactName}`,
          date: r.created_at,
        }));
        setActivities(acts);

        // Load score for latest recording
        const { data: scoreData } = await supabase
          .from('call_scores')
          .select('overall_score, discovery_score, rapport_score, closing_score, objection_handling_score, talk_ratio')
          .eq('recording_id', recordings[0].id)
          .limit(1);

        if (scoreData?.[0]) setScore(scoreData[0]);

        // Load summary
        const { data: summaryData } = await supabase
          .from('call_summaries')
          .select('key_points, objections_raised, agreed_next_steps, emotional_tone, engagement_score, strengths, improvements, suggestions_next_call, review_before_calling, watch_out_for')
          .eq('recording_id', recordings[0].id)
          .limit(1);

        if (summaryData?.[0]) setCallSummary(summaryData[0]);
      }

      // Load lead activities
      if (leadData?.[0]) {
        const { data: leadActs } = await supabase
          .from('lead_activities')
          .select('id, activity_type, title, description, created_at, metadata')
          .eq('lead_id', leadData[0].id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (leadActs) {
          const mapped: ActivityItem[] = leadActs.map(a => ({
            id: a.id,
            type: a.activity_type === 'email' ? 'email' as const : a.activity_type === 'call' ? 'call' as const : 'note' as const,
            title: a.title,
            description: a.description,
            date: a.created_at,
            metadata: a.metadata as Record<string, any> | undefined,
          }));
          setActivities(prev => [...prev, ...mapped].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
      }
    } catch (err) {
      console.error('Error loading details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: 'bg-primary/15 text-primary border-primary/30',
      completed: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
      cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
      no_show: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
    };
    const labels: Record<string, string> = {
      scheduled: 'Meeting Scheduled',
      completed: 'Completed',
      cancelled: 'Cancelled',
      no_show: 'No Show',
    };
    return <Badge className={`text-xs px-3 py-1 ${styles[status] || 'bg-muted text-muted-foreground'}`}>{labels[status] || status}</Badge>;
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 60) return 'text-amber-500';
    return 'text-destructive';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4 text-primary" />;
      case 'email': return <Mail className="h-4 w-4 text-primary" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Sparkles className="h-5 w-5 animate-pulse" />
        <span className="text-sm">Loading call intelligence...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 h-full animate-fade-in">
      {/* LEFT: Account / Lead Detail */}
      <div className="xl:col-span-2 space-y-4 overflow-y-auto">
        {/* Contact Header */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">{call.contact_name || call.title}</h2>
          {lead?.title && <p className="text-sm text-muted-foreground">{lead.title}</p>}

          {/* Company stats row (like the reference) */}
          {lead && (
            <div className="grid grid-cols-2 gap-3">
              {lead.company && (
                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="font-semibold text-sm text-foreground">{lead.company}</p>
                </div>
              )}
              {lead.location && (
                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-semibold text-sm text-foreground">{lead.location}</p>
                </div>
              )}
              {lead.budget_info && (
                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-semibold text-sm text-foreground">{lead.budget_info}</p>
                </div>
              )}
              {lead.timeline && (
                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-xs text-muted-foreground">Timeline</p>
                  <p className="font-semibold text-sm text-foreground">{lead.timeline}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-foreground">Status</h3>
          <div className="flex items-center gap-2">
            {getStatusBadge(call.status)}
            {lead?.is_hot_lead && (
              <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs">🔥 Hot</Badge>
            )}
            {lead?.urgency_level && (
              <Badge variant="outline" className="text-xs capitalize">{lead.urgency_level} priority</Badge>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          {lead?.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-foreground">{lead.email}</span>
            </div>
          )}
          {lead?.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-foreground">{lead.phone}</span>
            </div>
          )}
          {call.contact_email && !lead?.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-foreground">{call.contact_email}</span>
            </div>
          )}
        </div>

        {/* Meeting Date */}
        <div className="space-y-1">
          <p className="text-sm text-foreground font-medium">
            {format(new Date(call.scheduled_at), 'MMM d, h:mm a')}
          </p>
          <p className="text-xs text-muted-foreground">Meeting date</p>
          {call.meeting_url && (
            <a href={call.meeting_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1">
              <Link className="h-3.5 w-3.5" />
              Link to join meeting
            </a>
          )}
        </div>

        {/* Qualification Criteria */}
        {lead && (lead.primary_pain_point || lead.budget_info || lead.timeline || lead.title) && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-foreground">Qualification Criteria</h3>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground">Criteria</th>
                    <th className="text-left p-2 text-xs font-medium text-muted-foreground">Input</th>
                    <th className="text-center p-2 text-xs font-medium text-muted-foreground">Met</th>
                  </tr>
                </thead>
                <tbody>
                  {lead.primary_pain_point && (
                    <tr className="border-t border-border/30">
                      <td className="p-2 text-muted-foreground text-xs">Problem / Pain</td>
                      <td className="p-2 text-xs">{lead.primary_pain_point}</td>
                      <td className="p-2 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 inline" /></td>
                    </tr>
                  )}
                  {lead.title && (
                    <tr className="border-t border-border/30">
                      <td className="p-2 text-muted-foreground text-xs">Prospect Title</td>
                      <td className="p-2 text-xs">{lead.title}</td>
                      <td className="p-2 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 inline" /></td>
                    </tr>
                  )}
                  {lead.budget_info && (
                    <tr className="border-t border-border/30">
                      <td className="p-2 text-muted-foreground text-xs">Budget</td>
                      <td className="p-2 text-xs">{lead.budget_info}</td>
                      <td className="p-2 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 inline" /></td>
                    </tr>
                  )}
                  {lead.competitor_status && (
                    <tr className="border-t border-border/30">
                      <td className="p-2 text-muted-foreground text-xs">Competitors</td>
                      <td className="p-2 text-xs">{lead.competitor_status}</td>
                      <td className="p-2 text-center"><AlertTriangle className="h-4 w-4 text-amber-500 inline" /></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Caller Notes */}
        {call.prep_notes && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-foreground">Caller Notes</h3>
            <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground leading-relaxed">
              {call.prep_notes}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap pt-2">
          <Button size="sm" onClick={onStartRecording}>
            <Phone className="h-3.5 w-3.5 mr-1" /> Start Call
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEmailDialog(call)}>
            <Mail className="h-3.5 w-3.5 mr-1" /> Email
          </Button>
          {call.contact_email && (
            <Button size="sm" variant="outline"
              onClick={() => window.open(`mailto:${encodeURIComponent(call.contact_email!)}`, '_blank')}>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* RIGHT: Account Summary + History */}
      <div className="xl:col-span-3 space-y-4 overflow-y-auto">
        {/* Account Summary Card */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-3">
          <h3 className="text-sm font-bold text-primary">Account Summary</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center rounded-lg bg-background p-3 border border-border/50">
              <p className="text-lg font-bold text-foreground">
                {lastConversationDate ? format(new Date(lastConversationDate), 'M/d/yy') : '—'}
              </p>
              <p className="text-[10px] text-muted-foreground">Last conversation</p>
            </div>
            <div className="text-center rounded-lg bg-background p-3 border border-border/50">
              <p className="text-lg font-bold text-foreground">{totalDials}</p>
              <p className="text-[10px] text-muted-foreground">Number of dials</p>
            </div>
            <div className="text-center rounded-lg bg-background p-3 border border-border/50">
              <p className="text-lg font-bold text-foreground">{totalConversations}</p>
              <p className="text-[10px] text-muted-foreground">Conversations</p>
            </div>
          </div>

          {/* Summary text */}
          {recording?.summary && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Summary</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{recording.summary}</p>
            </div>
          )}
        </div>

        {/* Score breakdown */}
        {score && (
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: 'Overall', value: score.overall_score },
              { label: 'Discovery', value: score.discovery_score },
              { label: 'Rapport', value: score.rapport_score },
              { label: 'Closing', value: score.closing_score },
              { label: 'Objections', value: score.objection_handling_score },
            ].map(({ label, value }) => value != null && (
              <div key={label} className="text-center p-2 rounded-lg border border-border/50 bg-card">
                <div className={`text-lg font-bold ${getScoreColor(value)}`}>{value}</div>
                <div className="text-[10px] text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Account History / Call Summary tabs */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="history">Account History</TabsTrigger>
            <TabsTrigger value="insights">Call Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-3 mt-3">
            {activities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No activity history found</p>
            )}
            {/* Group by date */}
            {(() => {
              const grouped: Record<string, ActivityItem[]> = {};
              activities.forEach(a => {
                const key = format(new Date(a.date), 'MMM d, yyyy');
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(a);
              });
              return Object.entries(grouped).map(([dateStr, items]) => (
                <div key={dateStr}>
                  <div className="flex justify-center mb-2">
                    <Badge variant="secondary" className="text-xs">{dateStr}</Badge>
                  </div>
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-3 p-3 rounded-lg border border-border/50 bg-card">
                        <div className="mt-0.5">{getActivityIcon(item.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{item.title}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(item.date), 'h:mm a')}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4 mt-3">
            {callSummary ? (
              <>
                {callSummary.key_points && callSummary.key_points.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-foreground">Key Points</h5>
                    <ul className="space-y-1">
                      {callSummary.key_points.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {callSummary.objections_raised && callSummary.objections_raised.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-foreground">Objections</h5>
                    <ul className="space-y-1">
                      {callSummary.objections_raised.map((o, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {callSummary.agreed_next_steps && callSummary.agreed_next_steps.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-foreground">Next Steps</h5>
                    <ul className="space-y-1">
                      {callSummary.agreed_next_steps.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {callSummary.suggestions_next_call && callSummary.suggestions_next_call.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-foreground">Prep for Next Call</h5>
                    <ul className="space-y-1">
                      {callSummary.suggestions_next_call.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No call insights available yet</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  Clock,
  User,
  Video,
  Mail,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  CalendarIcon,
  Bell,
  BellOff,
  Play,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MessageSquare
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

interface CallRecordingInfo {
  id: string;
  name: string | null;
  file_name: string;
  duration_seconds: number | null;
  created_at: string;
  summary: string | null;
  sentiment_score: number | null;
  key_topics: string[] | null;
  live_transcription: string | null;
}

interface CallScoreInfo {
  overall_score: number;
  discovery_score: number | null;
  rapport_score: number | null;
  closing_score: number | null;
  objection_handling_score: number | null;
  talk_ratio: number | null;
}

interface CallSummaryInfo {
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

interface ScheduleCallCardProps {
  call: ScheduledCall;
  onEmailDialog: (call: ScheduledCall) => void;
  onStartRecording: () => void;
}

export function ScheduleCallCard({ call, onEmailDialog, onStartRecording }: ScheduleCallCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [recording, setRecording] = useState<CallRecordingInfo | null>(null);
  const [score, setScore] = useState<CallScoreInfo | null>(null);
  const [callSummary, setCallSummary] = useState<CallSummaryInfo | null>(null);
  const [lead, setLead] = useState<LeadInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expanded && !recording && !loading) {
      loadCallDetails();
    }
  }, [expanded]);

  const loadCallDetails = async () => {
    setLoading(true);
    try {
      // Find recording matching this call's contact or title
      const contactName = call.contact_name;
      let recordingData: CallRecordingInfo | null = null;

      if (contactName) {
        const { data: recordings } = await supabase
          .from('call_recordings')
          .select('id, name, file_name, duration_seconds, created_at, summary, sentiment_score, key_topics, live_transcription')
          .or(`name.ilike.%${contactName}%,file_name.ilike.%${contactName}%`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (recordings && recordings.length > 0) {
          recordingData = recordings[0];
          setRecording(recordingData);

          // Fetch score
          const { data: scoreData } = await supabase
            .from('call_scores')
            .select('overall_score, discovery_score, rapport_score, closing_score, objection_handling_score, talk_ratio')
            .eq('recording_id', recordingData.id)
            .limit(1);

          if (scoreData && scoreData.length > 0) {
            setScore(scoreData[0]);
          }

          // Fetch call summary
          const { data: summaryData } = await supabase
            .from('call_summaries')
            .select('key_points, objections_raised, agreed_next_steps, emotional_tone, engagement_score, strengths, improvements, suggestions_next_call, review_before_calling, watch_out_for')
            .eq('recording_id', recordingData.id)
            .limit(1);

          if (summaryData && summaryData.length > 0) {
            setCallSummary(summaryData[0]);
          }
        }

        // Fetch lead info
        const { data: leadData } = await supabase
          .from('leads')
          .select('id, contact_name, company, title, email, phone, location, lead_status, primary_pain_point, budget_info, timeline, competitor_status, urgency_level, priority_score, engagement_score, is_hot_lead')
          .ilike('contact_name', `%${contactName}%`)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (leadData && leadData.length > 0) {
          setLead(leadData[0]);
        }
      }
    } catch (err) {
      console.error('Error loading call details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-primary/15 text-primary border-primary/30">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'no_show':
        return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProviderIcon = (provider: string | null) => {
    switch (provider) {
      case 'zoom':
      case 'teams':
      case 'google_meet':
        return <Video className="h-4 w-4 text-primary" />;
      default:
        return <Phone className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getUrgencyColor = (urgency: string | null) => {
    switch (urgency) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 60) return 'text-amber-500';
    return 'text-destructive';
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden transition-all hover:border-border">
      {/* Header Row */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground truncate">{call.title}</h4>
              {getStatusBadge(call.status)}
              {lead?.is_hot_lead && (
                <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs">🔥 Hot Lead</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(call.scheduled_at), 'h:mm a')} · {call.duration_minutes}min
              </span>
              {call.contact_name && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {call.contact_name}
                </span>
              )}
              {lead?.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {lead.company}
                </span>
              )}
              {lead?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {lead.location}
                </span>
              )}
            </div>
          </div>
          {score && (
            <div className="text-right shrink-0">
              <div className={`text-2xl font-bold ${getScoreColor(score.overall_score)}`}>
                {score.overall_score}
              </div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
          )}
        </div>

        {/* Quick Info Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {call.meeting_url && (
            <a href={call.meeting_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              {getProviderIcon(call.meeting_provider)}
              Join Meeting
            </a>
          )}
          {lead?.urgency_level && (
            <Badge variant="outline" className={`text-xs ${getUrgencyColor(lead.urgency_level)}`}>
              {lead.urgency_level === 'high' ? '⚡' : lead.urgency_level === 'medium' ? '⏳' : '📌'} {lead.urgency_level} priority
            </Badge>
          )}
          {lead?.lead_status && (
            <Badge variant="outline" className="text-xs capitalize">{lead.lead_status.replace('_', ' ')}</Badge>
          )}
          {(call.reminder_minutes_before ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {call.reminder_sent ? (
                <><BellOff className="h-3 w-3" /> Sent</>
              ) : (
                <><Bell className="h-3 w-3 text-primary" /> {call.reminder_minutes_before}min before</>
              )}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={onStartRecording}>
            <Phone className="h-3.5 w-3.5 mr-1" />
            Start Call
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEmailDialog(call)}>
            <Mail className="h-3.5 w-3.5 mr-1" />
            Email
          </Button>
          {call.contact_email && (
            <Button size="sm" variant="outline"
              onClick={() => window.open(`mailto:${encodeURIComponent(call.contact_email!)}`, '_blank')}>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)} className="ml-auto">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="text-xs ml-1">{expanded ? 'Less' : 'Details'}</span>
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-border/50 p-4 space-y-4 bg-muted/20 animate-fade-in">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Loading call intelligence...
            </div>
          )}

          {/* Contact & Company Info */}
          {lead && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="text-sm font-semibold flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" />
                  Target Information
                </h5>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {lead.contact_name}</p>
                  {lead.title && <p><span className="text-muted-foreground">Title:</span> {lead.title}</p>}
                  {lead.email && <p><span className="text-muted-foreground">Email:</span> {lead.email}</p>}
                  {lead.phone && <p><span className="text-muted-foreground">Phone:</span> {lead.phone}</p>}
                  {lead.location && <p><span className="text-muted-foreground">Location:</span> {lead.location}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="text-sm font-semibold flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary" />
                  Company Information
                </h5>
                <div className="space-y-1 text-sm">
                  {lead.company && <p><span className="text-muted-foreground">Company:</span> {lead.company}</p>}
                  {lead.budget_info && <p><span className="text-muted-foreground">Budget:</span> {lead.budget_info}</p>}
                  {lead.timeline && <p><span className="text-muted-foreground">Timeline:</span> {lead.timeline}</p>}
                  {lead.competitor_status && <p><span className="text-muted-foreground">Competitors:</span> {lead.competitor_status}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Criteria / Qualification Table */}
          {lead && (lead.primary_pain_point || lead.budget_info || lead.timeline) && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Qualification Criteria
              </h5>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 font-medium text-muted-foreground">Criteria</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">Details</th>
                      <th className="text-center p-2 font-medium text-muted-foreground">Met</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lead.primary_pain_point && (
                      <tr className="border-t border-border/30">
                        <td className="p-2 text-muted-foreground">Problem / Pain</td>
                        <td className="p-2">{lead.primary_pain_point}</td>
                        <td className="p-2 text-center">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                        </td>
                      </tr>
                    )}
                    {lead.budget_info && (
                      <tr className="border-t border-border/30">
                        <td className="p-2 text-muted-foreground">Budget</td>
                        <td className="p-2">{lead.budget_info}</td>
                        <td className="p-2 text-center">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                        </td>
                      </tr>
                    )}
                    {lead.timeline && (
                      <tr className="border-t border-border/30">
                        <td className="p-2 text-muted-foreground">Timeline</td>
                        <td className="p-2">{lead.timeline}</td>
                        <td className="p-2 text-center">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                        </td>
                      </tr>
                    )}
                    {lead.title && (
                      <tr className="border-t border-border/30">
                        <td className="p-2 text-muted-foreground">Prospect Title</td>
                        <td className="p-2">{lead.title}</td>
                        <td className="p-2 text-center">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Call Summary */}
          {recording?.summary && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Call Summary
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed bg-muted/40 rounded-lg p-3">
                {recording.summary}
              </p>
            </div>
          )}

          {/* Key Points & Objections */}
          {callSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {callSummary.key_points && callSummary.key_points.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold">Key Points</h5>
                  <ul className="space-y-1">
                    {callSummary.key_points.slice(0, 5).map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {callSummary.objections_raised && callSummary.objections_raised.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold">Objections Raised</h5>
                  <ul className="space-y-1">
                    {callSummary.objections_raised.slice(0, 5).map((o, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Next Steps & Review Notes */}
          {callSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {callSummary.agreed_next_steps && callSummary.agreed_next_steps.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold">Agreed Next Steps</h5>
                  <ul className="space-y-1">
                    {callSummary.agreed_next_steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {callSummary.suggestions_next_call && callSummary.suggestions_next_call.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold">Suggestions for Next Call</h5>
                  <ul className="space-y-1">
                    {callSummary.suggestions_next_call.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Caller/Prep Notes */}
          {call.prep_notes && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" />
                Caller Notes
              </h5>
              <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-3 leading-relaxed">
                {call.prep_notes}
              </p>
            </div>
          )}

          {/* Score Breakdown */}
          {score && (
            <div className="space-y-2">
              <h5 className="text-sm font-semibold">Performance Scores</h5>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { label: 'Overall', value: score.overall_score },
                  { label: 'Discovery', value: score.discovery_score },
                  { label: 'Rapport', value: score.rapport_score },
                  { label: 'Closing', value: score.closing_score },
                  { label: 'Objections', value: score.objection_handling_score },
                ].map(({ label, value }) => value != null && (
                  <div key={label} className="text-center p-2 rounded-lg bg-muted/50">
                    <div className={`text-lg font-bold ${getScoreColor(value)}`}>{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
              {score.talk_ratio != null && (
                <p className="text-xs text-muted-foreground">
                  Talk ratio: {score.talk_ratio}%
                </p>
              )}
            </div>
          )}

          {/* Recording info */}
          {recording && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/30">
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                Called: {format(new Date(recording.created_at), 'MMM d, yyyy h:mm a')}
              </span>
              {recording.duration_seconds && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Duration: {Math.floor(recording.duration_seconds / 60)}:{String(recording.duration_seconds % 60).padStart(2, '0')}
                </span>
              )}
              {recording.key_topics && recording.key_topics.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {recording.key_topics.slice(0, 3).map((t, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">{t}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && !recording && !lead && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No linked call recording or lead data found for this contact.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
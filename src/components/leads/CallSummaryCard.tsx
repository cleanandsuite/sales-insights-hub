import { Phone, Clock, AlertTriangle, CheckCircle, Play, FileText, MessageSquare, TrendingUp, Lightbulb, Quote, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CallSummary {
  id: string;
  recording_id: string;
  quick_skim: {
    pain?: string;
    need?: string;
    budget?: string;
    timeline?: string;
    urgency?: string;
  };
  key_points: string[] | null;
  last_exchanges: any[];
  watch_out_for: string[] | null;
  agreed_next_steps: string[] | null;
  emotional_tone: string | null;
  talk_ratio_them: number | null;
  talk_ratio_you: number | null;
  question_count_them: number | null;
  question_count_you: number | null;
  positive_signals: number | null;
  concern_signals: number | null;
  engagement_score: number | null;
  strengths: string[] | null;
  improvements: string[] | null;
  suggestions_next_call: string[] | null;
  review_before_calling: string[] | null;
  questions_to_ask: string[] | null;
  materials_needed: string[] | null;
  conversation_starters: string[] | null;
  created_at: string;
}

interface CallSummaryCardProps {
  summary: CallSummary;
  contactName: string;
  company?: string;
  duration?: number;
  onPlayRecording: () => void;
  onViewTranscript: () => void;
  onAddNote: () => void;
}

export function CallSummaryCard({
  summary,
  contactName,
  company,
  duration,
  onPlayRecording,
  onViewTranscript,
  onAddNote
}: CallSummaryCardProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card-gradient rounded-xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-primary/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{contactName}</h3>
              {company && <p className="text-sm text-muted-foreground">{company}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(duration)}
            </Badge>
            <Badge className={
              summary.emotional_tone === 'positive' ? 'bg-success/20 text-success' :
              summary.emotional_tone === 'negative' ? 'bg-destructive/20 text-destructive' :
              'bg-warning/20 text-warning'
            }>
              {summary.emotional_tone || 'Neutral'}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {new Date(summary.created_at).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* 30-Second Skim */}
      <div className="p-5 border-b border-border/30">
        <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
          <Target className="h-4 w-4" />
          30-SECOND SKIM
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summary.quick_skim?.pain && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded">PAIN</span>
              <span className="text-sm text-foreground">{summary.quick_skim.pain}</span>
            </div>
          )}
          {summary.quick_skim?.need && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">NEED</span>
              <span className="text-sm text-foreground">{summary.quick_skim.need}</span>
            </div>
          )}
          {summary.quick_skim?.budget && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded">BUDGET</span>
              <span className="text-sm text-foreground">{summary.quick_skim.budget}</span>
            </div>
          )}
          {summary.quick_skim?.timeline && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded">TIMELINE</span>
              <span className="text-sm text-foreground">{summary.quick_skim.timeline}</span>
            </div>
          )}
          {summary.quick_skim?.urgency && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded">URGENCY</span>
              <span className="text-sm text-foreground">{summary.quick_skim.urgency}</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Points */}
      {summary.key_points && summary.key_points.length > 0 && (
        <div className="p-5 border-b border-border/30">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            🎯 KEY POINTS ({summary.key_points.length})
          </h4>
          <ul className="space-y-2">
            {summary.key_points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary mt-1">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Last Exchanges */}
      {summary.last_exchanges && summary.last_exchanges.length > 0 && (
        <div className="p-5 border-b border-border/30">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Quote className="h-4 w-4" />
            LAST EXCHANGES
          </h4>
          <div className="space-y-2">
            {summary.last_exchanges.slice(-3).map((exchange: any, idx: number) => (
              <div key={idx} className="text-sm">
                <span className="font-medium text-muted-foreground">{exchange.speaker}:</span>
                <span className="text-foreground ml-2">"{exchange.text}"</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Watch Out For */}
      {summary.watch_out_for && summary.watch_out_for.length > 0 && (
        <div className="p-5 border-b border-border/30 bg-warning/5">
          <h4 className="text-sm font-semibold text-warning mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            WATCH OUT FOR
          </h4>
          <ul className="space-y-1">
            {summary.watch_out_for.map((item, idx) => (
              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-warning">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Agreed Next Steps */}
      {summary.agreed_next_steps && summary.agreed_next_steps.length > 0 && (
        <div className="p-5 border-b border-border/30 bg-success/5">
          <h4 className="text-sm font-semibold text-success mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            NEXT STEPS AGREED
          </h4>
          <ul className="space-y-1">
            {summary.agreed_next_steps.map((step, idx) => (
              <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-success">✓</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Call Metrics */}
      <div className="p-5 border-b border-border/30">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          CALL ANALYTICS
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-2 rounded bg-secondary/20">
            <p className="text-lg font-bold text-foreground">
              {summary.talk_ratio_them || 0}% / {summary.talk_ratio_you || 0}%
            </p>
            <p className="text-xs text-muted-foreground">Talk Ratio</p>
          </div>
          <div className="text-center p-2 rounded bg-secondary/20">
            <p className="text-lg font-bold text-foreground">
              {summary.question_count_them || 0} / {summary.question_count_you || 0}
            </p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>
          <div className="text-center p-2 rounded bg-secondary/20">
            <p className="text-lg font-bold text-success">{summary.positive_signals || 0}</p>
            <p className="text-xs text-muted-foreground">Positive Signals</p>
          </div>
          <div className="text-center p-2 rounded bg-secondary/20">
            <p className="text-lg font-bold text-foreground">
              {summary.engagement_score ? `${summary.engagement_score.toFixed(1)}/10` : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">Engagement</p>
          </div>
        </div>
      </div>

      {/* Coaching Suggestions */}
      {(summary.strengths?.length || summary.improvements?.length) && (
        <div className="p-5 border-b border-border/30">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            COACHING FEEDBACK
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {summary.strengths && summary.strengths.length > 0 && (
              <div className="p-3 rounded bg-success/10 border border-success/20">
                <p className="text-xs font-medium text-success mb-2">✅ STRENGTHS</p>
                <ul className="space-y-1">
                  {summary.strengths.map((s, idx) => (
                    <li key={idx} className="text-sm text-foreground">• {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {summary.improvements && summary.improvements.length > 0 && (
              <div className="p-3 rounded bg-warning/10 border border-warning/20">
                <p className="text-xs font-medium text-warning mb-2">📈 OPPORTUNITIES</p>
                <ul className="space-y-1">
                  {summary.improvements.map((i, idx) => (
                    <li key={idx} className="text-sm text-foreground">• {i}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onPlayRecording} className="gap-2">
          <Play className="h-4 w-4" />
          Play Recording
        </Button>
        <Button size="sm" variant="outline" onClick={onViewTranscript} className="gap-2">
          <FileText className="h-4 w-4" />
          Full Transcript
        </Button>
        <Button size="sm" variant="outline" onClick={onAddNote} className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Add Note
        </Button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Pencil, 
  Sparkles, 
  Mail, 
  MessageSquare,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Video,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { format } from 'date-fns';

interface ExtractionData {
  suggested_title?: string;
  contact_name?: string;
  contact_email?: string;
  suggested_date?: string;
  suggested_time?: string;
  suggested_duration?: number;
  meeting_provider?: string;
  prep_notes?: string;
  confidence?: number;
  follow_up_reason?: string;
  urgency?: 'high' | 'medium' | 'low';
  ai_summary?: string;
  key_points?: string[];
  objections?: string[];
  next_steps?: string[];
}

interface ConflictInfo {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
}

interface EmailScript {
  subject: string;
  body: string;
  tone: string;
}

interface ScheduleConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extraction: ExtractionData | null;
  conflicts: ConflictInfo[];
  emailScript: EmailScript | null;
  isGeneratingEmail: boolean;
  onConfirm: (data: ExtractionData) => void;
  onGenerateEmail: (customPrompt?: string) => void;
  onCoachingQuery: (query: string) => Promise<string>;
}

export function ScheduleConfirmModal({
  open,
  onOpenChange,
  extraction,
  conflicts,
  emailScript,
  isGeneratingEmail,
  onConfirm,
  onGenerateEmail,
  onCoachingQuery
}: ScheduleConfirmModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ExtractionData | null>(null);
  const [activeTab, setActiveTab] = useState('confirm');
  const [coachingQuery, setCoachingQuery] = useState('');
  const [coachingResponse, setCoachingResponse] = useState('');
  const [isCoaching, setIsCoaching] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [customEmailPrompt, setCustomEmailPrompt] = useState('');

  const data = isEditing ? editedData : extraction;

  const handleEdit = () => {
    setEditedData({ ...extraction });
    setIsEditing(true);
  };

  const handleConfirm = () => {
    if (data) {
      onConfirm(data);
    }
  };

  const handleCoachingSubmit = async () => {
    if (!coachingQuery.trim()) return;
    setIsCoaching(true);
    try {
      const response = await onCoachingQuery(coachingQuery);
      setCoachingResponse(response);
    } finally {
      setIsCoaching(false);
    }
  };

  const handleCopyEmail = () => {
    if (emailScript) {
      navigator.clipboard.writeText(`Subject: ${emailScript.subject}\n\n${emailScript.body}`);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getUrgencyBadge = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return null;
    }
  };

  if (!extraction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Schedule Assistant
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="confirm">Confirm</TabsTrigger>
            <TabsTrigger value="summary">AI Summary</TabsTrigger>
            <TabsTrigger value="coaching">Coaching</TabsTrigger>
            <TabsTrigger value="email">Email Script</TabsTrigger>
          </TabsList>

          {/* Confirmation Tab */}
          <TabsContent value="confirm" className="space-y-4">
            {/* Confidence & Urgency */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${getConfidenceColor(data?.confidence || 0)}`} />
                <span className="text-sm">
                  Extraction Confidence: <strong>{data?.confidence || 0}%</strong>
                </span>
              </div>
              {getUrgencyBadge(data?.urgency)}
            </div>

            {/* Conflict Warning */}
            {conflicts.length > 0 && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-warning">Scheduling Conflict Detected</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This time overlaps with: {conflicts.map(c => c.title).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Extracted Fields */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Meeting Title
                </Label>
                {isEditing ? (
                  <Input
                    value={editedData?.suggested_title || ''}
                    onChange={(e) => setEditedData({ ...editedData!, suggested_title: e.target.value })}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded">{data?.suggested_title || 'Not detected'}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contact Name
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editedData?.contact_name || ''}
                      onChange={(e) => setEditedData({ ...editedData!, contact_name: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{data?.contact_name || 'Not detected'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Email
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editedData?.contact_email || ''}
                      onChange={(e) => setEditedData({ ...editedData!, contact_email: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{data?.contact_email || 'Not detected'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedData?.suggested_date?.split('T')[0] || ''}
                      onChange={(e) => setEditedData({ ...editedData!, suggested_date: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">
                      {data?.suggested_date 
                        ? format(new Date(data.suggested_date), 'MMM d, yyyy')
                        : 'Not detected'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </Label>
                  {isEditing ? (
                    <Input
                      type="time"
                      value={editedData?.suggested_time || ''}
                      onChange={(e) => setEditedData({ ...editedData!, suggested_time: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{data?.suggested_time || 'Not detected'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Platform
                  </Label>
                  {isEditing ? (
                    <Select
                      value={editedData?.meeting_provider || 'zoom'}
                      onValueChange={(value) => setEditedData({ ...editedData!, meeting_provider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="teams">Teams</SelectItem>
                        <SelectItem value="google_meet">Google Meet</SelectItem>
                        <SelectItem value="other">Phone/Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded capitalize">{data?.meeting_provider || 'Not detected'}</p>
                  )}
                </div>
              </div>

              {data?.follow_up_reason && (
                <div className="space-y-2">
                  <Label>Reason for Follow-up</Label>
                  <p className="text-sm p-2 bg-muted rounded">{data.follow_up_reason}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              {isEditing ? (
                <Button onClick={() => setIsEditing(false)}>
                  Done Editing
                </Button>
              ) : (
                <Button variant="secondary" onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button onClick={handleConfirm}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm & Schedule
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* AI Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                Call Summary
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data?.ai_summary || 'AI summary will be generated from the call transcript. Key discussion points, outcomes, and action items will appear here.'}
              </p>
            </div>

            {data?.key_points && data.key_points.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Key Points</h4>
                <ul className="space-y-1">
                  {data.key_points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data?.objections && data.objections.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-warning">Objections Raised</h4>
                <ul className="space-y-1">
                  {data.objections.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data?.next_steps && data.next_steps.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Next Steps</h4>
                <ul className="space-y-1">
                  {data.next_steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          {/* Coaching Tab */}
          <TabsContent value="coaching" className="space-y-4">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Ask AI Coach
              </Label>
              <div className="flex gap-2">
                <Textarea
                  placeholder="e.g., Analyze objections from this call, How could I have handled the pricing question better?"
                  value={coachingQuery}
                  onChange={(e) => setCoachingQuery(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button 
                  onClick={handleCoachingSubmit}
                  disabled={isCoaching || !coachingQuery.trim()}
                  className="h-auto"
                >
                  {isCoaching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Quick Query Buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  'Analyze objections',
                  'Identify buying signals',
                  'Rate my performance',
                  'Suggest improvements'
                ].map((query) => (
                  <Button
                    key={query}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCoachingQuery(query);
                    }}
                  >
                    {query}
                  </Button>
                ))}
              </div>
            </div>

            {coachingResponse && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Coach Response
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {coachingResponse}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Email Script Tab */}
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Follow-up Email Script
                </Label>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onGenerateEmail(customEmailPrompt)}
                  disabled={isGeneratingEmail}
                >
                  {isGeneratingEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {emailScript ? 'Regenerate' : 'Generate'}
                </Button>
              </div>

              <Textarea
                placeholder="Optional: Add custom instructions for the email (e.g., 'More formal tone', 'Include pricing discussion', 'Emphasize urgency')"
                value={customEmailPrompt}
                onChange={(e) => setCustomEmailPrompt(e.target.value)}
                rows={2}
              />
            </div>

            {emailScript && (
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-muted-foreground">Subject</Label>
                    <p className="font-medium">{emailScript.subject}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleCopyEmail}>
                    {copiedEmail ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Body</Label>
                  <p className="text-sm whitespace-pre-wrap mt-1">{emailScript.body}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Tone: {emailScript.tone}
                </Badge>
              </div>
            )}

            {!emailScript && !isGeneratingEmail && (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click "Generate" to create a personalized follow-up email</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

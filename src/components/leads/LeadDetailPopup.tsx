import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOutboundEmail } from '@/hooks/useOutboundEmail';
import { toast } from 'sonner';
import { Phone, Mail, Calendar, FileText, StickyNote, RefreshCw, Copy, Sparkles, MapPin, Building2, User, Clock, Send, Check, X, ChevronRight, Target } from 'lucide-react';
import type { ImportedLead } from './ImportedLeadsTable';

const TYPE_STYLES: Record<string, string> = {
  hot: 'bg-red-500/15 text-red-700 border-red-200',
  warm: 'bg-orange-500/15 text-orange-700 border-orange-200',
  cold: 'bg-blue-500/15 text-blue-700 border-blue-200',
};

interface LeadDetailPopupProps {
  lead: ImportedLead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadUpdated: () => void;
  onStartCallWithLead?: (lead: ImportedLead) => void;
}

interface SelectableLine {
  section: string;
  text: string;
  order: number;
}

function extractLinesFromScript(scriptData: any): SelectableLine[] {
  const lines: SelectableLine[] = [];
  let order = 0;
  if (!scriptData?.sections) return lines;
  Object.entries(scriptData.sections).forEach(([key, section]: [string, any]) => {
    if (section.script_lines) {
      section.script_lines.forEach((l: string) => lines.push({ section: key, text: l, order: order++ }));
    }
    if (section.variations) {
      section.variations.forEach((v: string) => lines.push({ section: key, text: v, order: order++ }));
    }
    if (section.key_points) {
      section.key_points.forEach((p: string) => lines.push({ section: key, text: p, order: order++ }));
    }
    if (section.options) {
      section.options.forEach((opt: string) => lines.push({ section: key, text: opt, order: order++ }));
    }
  });
  return lines;
}

export function LeadDetailPopup({ lead, open, onOpenChange, onLeadUpdated, onStartCallWithLead }: LeadDetailPopupProps) {
  const { user } = useAuth();
  const { sendEmail, isSending, isConfigured } = useOutboundEmail();
  const [painPoint, setPainPoint] = useState(lead.pain_point || '');
  const [savingPain, setSavingPain] = useState(false);
  const [scriptData, setScriptData] = useState<any>(null);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [confidence] = useState(() => Math.floor(60 + Math.random() * 35));
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Cherry-pick state
  const [showCherryPick, setShowCherryPick] = useState(false);
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());

  const savePainPoint = async () => {
    setSavingPain(true);
    const { error } = await supabase
      .from('imported_leads' as any)
      .update({ pain_point: painPoint } as any)
      .eq('id', lead.id);
    setSavingPain(false);
    if (error) toast.error('Failed to save');
    else { toast.success('Pain point saved'); onLeadUpdated(); }
  };

  const generateScript = async () => {
    setGeneratingScript(true);
    try {
      const { data, error } = await supabase.functions.invoke('winwords-generate', {
        body: {
          scenario: 'cold_call',
          style: 'confident',
          persona: {
            role: 'Decision Maker',
            industry: lead.business || 'Technology',
            companySize: 'Mid-market',
            painPoints: painPoint ? [painPoint] : ['operational efficiency'],
            personalityStyle: 'analytical',
            companyName: lead.business || '',
          },
          dealContext: {
            stage: 'early',
            budget: 'unknown',
            timeline: 'this_quarter',
            competition: '',
            previousInteractions: lead.previous_rep ? `Previously handled by ${lead.previous_rep}` : 'none',
            knownObjections: [],
          },
        }
      });

      if (error) throw error;

      if (data && data.sections) {
        setScriptData(data);
        // Open cherry-pick popup
        setSelectedLines(new Set());
        setShowCherryPick(true);
      } else {
        toast.error('Script generation returned empty. Try again.');
      }
    } catch (err: any) {
      console.error('Script generation error:', err);
      toast.error('Script generation failed');
    }
    setGeneratingScript(false);
  };

  const allLines = scriptData ? extractLinesFromScript(scriptData) : [];

  const toggleLine = (order: number) => {
    setSelectedLines(prev => {
      const next = new Set(prev);
      if (next.has(order)) next.delete(order);
      else next.add(order);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedLines(new Set(allLines.map(l => l.order)));
  };

  const handleUseScriptAndCall = () => {
    const lines = allLines.filter(l => selectedLines.has(l.order));
    if (lines.length === 0) {
      toast.error('Select at least one line');
      return;
    }
    localStorage.setItem('active_script_lines', JSON.stringify(lines));
    toast.success(`${lines.length} lines loaded for your call!`);
    setShowCherryPick(false);
    onOpenChange(false);
    if (onStartCallWithLead) {
      onStartCallWithLead(lead);
    }
  };

  // Group lines by section for cherry-pick view
  const groupedLines = allLines.reduce<Record<string, SelectableLine[]>>((acc, line) => {
    if (!acc[line.section]) acc[line.section] = [];
    acc[line.section].push(line);
    return acc;
  }, {});

  return (
    <>
      <Dialog open={open && !showCherryPick} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 pb-4 border-b">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DialogTitle className="text-xl font-bold">{lead.contact_name}</DialogTitle>
                  <DialogDescription className="flex flex-wrap items-center gap-3 text-sm">
                    {lead.business && (
                      <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{lead.business}</span>
                    )}
                    {lead.location && (
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{lead.location}</span>
                    )}
                    {lead.phone_number && (
                      <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{lead.phone_number}</span>
                    )}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={TYPE_STYLES[lead.lead_type || 'warm']}>
                    {lead.lead_type || 'warm'}
                  </Badge>
                  <div className="flex flex-col items-center px-3 py-1 rounded-lg bg-primary/10">
                    <span className="text-lg font-bold text-primary">{confidence}%</span>
                    <span className="text-[10px] text-muted-foreground">AI Score</span>
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {/* Pain Point */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Pain Point
              </h4>
              <Textarea
                value={painPoint}
                onChange={(e) => setPainPoint(e.target.value)}
                placeholder="Describe the lead's primary pain point..."
                className="min-h-[60px] resize-none"
              />
              <Button size="sm" variant="outline" onClick={savePainPoint} disabled={savingPain}>
                {savingPain ? 'Saving...' : 'Save'}
              </Button>
            </div>

            {/* Recent Activity */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Recent Activity
              </h4>
              <div className="space-y-2">
                {lead.contact_date ? (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Contact on {lead.contact_date}{lead.contact_time ? ` at ${lead.contact_time}` : ''}</p>
                      {lead.previous_rep && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <User className="h-3 w-3" /> Rep: {lead.previous_rep}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No previous activity recorded</p>
                )}
              </div>
            </div>

            {/* WinWords Script */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  WinWords Script
                </h4>
                <div className="flex gap-2">
                  {scriptData && (
                    <Button size="sm" variant="secondary" onClick={() => { setShowCherryPick(true); }} className="gap-1 h-7">
                      <Check className="h-3 w-3" /> Pick Lines & Call
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateScript}
                    disabled={generatingScript}
                    className="gap-1 h-7"
                  >
                    <RefreshCw className={`h-3 w-3 ${generatingScript ? 'animate-spin' : ''}`} />
                    {scriptData ? 'Regenerate' : 'Generate'}
                  </Button>
                </div>
              </div>
              {generatingScript ? (
                <div className="flex items-center justify-center py-8 rounded-lg border border-dashed border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm text-muted-foreground">Generating personalized script...</span>
                  </div>
                </div>
              ) : scriptData ? (
                <div className="p-4 rounded-lg bg-muted/40 border border-border/50 text-sm">
                  <p className="text-muted-foreground mb-2">
                    ✅ Script generated with {allLines.length} lines. Click "Pick Lines & Call" to select lines and start your call.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {scriptData.estimated_success_rate}
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-dashed border-border text-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click "Generate" to create a personalized cold call script
                  </p>
                </div>
              )}
            </div>

            {/* Email Composer */}
            {showEmailComposer && (
              <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" /> Compose Email
                  </h4>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setShowEmailComposer(false)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Input value={emailTo} onChange={e => setEmailTo(e.target.value)} placeholder="recipient@email.com" className="h-8 text-sm" />
                  <Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Subject" className="h-8 text-sm" />
                  <Textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} placeholder="Email body..." rows={4} className="text-sm" />
                </div>
                <div className="flex gap-2">
                  {isConfigured ? (
                    <Button size="sm" className="gap-1" disabled={isSending || emailSent || !emailTo}
                      onClick={async () => {
                        const ok = await sendEmail(emailTo, emailSubject, emailBody, 'lead', lead.id);
                        if (ok) setEmailSent(true);
                      }}>
                      {emailSent ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                      {emailSent ? 'Sent' : isSending ? 'Sending...' : 'Send'}
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">Set up email in Settings → Email to send directly</p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button size="sm" className="gap-2" onClick={() => {
                if (onStartCallWithLead) onStartCallWithLead(lead);
                onOpenChange(false);
              }}>
                <Phone className="h-3.5 w-3.5" /> Call
              </Button>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => {
                setShowEmailComposer(true);
                setEmailSent(false);
                if (!emailSubject) setEmailSubject(`Following up - ${lead.contact_name}`);
              }}>
                <Mail className="h-3.5 w-3.5" /> Email
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <Calendar className="h-3.5 w-3.5" /> Schedule
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <StickyNote className="h-3.5 w-3.5" /> Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cherry-Pick Script Popup */}
      <Dialog open={showCherryPick} onOpenChange={setShowCherryPick}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0">
          <div className="p-6 pb-3 border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Select Script Lines for {lead.contact_name}
              </DialogTitle>
              <DialogDescription>
                Pick the lines you want to use during the call. Selected lines will appear in your call screen.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-between mt-3">
              <Badge variant="secondary">{selectedLines.size} of {allLines.length} selected</Badge>
              <Button size="sm" variant="ghost" onClick={selectAll} className="text-xs">Select All</Button>
            </div>
          </div>

          <ScrollArea className="max-h-[50vh] px-6 py-4">
            <div className="space-y-4">
              {Object.entries(groupedLines).map(([section, sectionLines]) => (
                <div key={section}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {section.replace(/_/g, ' ')}
                  </p>
                  <div className="space-y-1.5">
                    {sectionLines.map((line) => {
                      const isSelected = selectedLines.has(line.order);
                      return (
                        <button
                          key={line.order}
                          onClick={() => toggleLine(line.order)}
                          className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-lg text-sm transition-all ${
                            isSelected
                              ? 'bg-primary/10 border border-primary/30'
                              : 'bg-muted/40 hover:bg-muted/70 border border-transparent'
                          }`}
                        >
                          <Checkbox checked={isSelected} className="mt-0.5" />
                          <span>{line.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t flex items-center justify-between">
            <Button variant="outline" onClick={() => setShowCherryPick(false)}>Cancel</Button>
            <Button
              onClick={handleUseScriptAndCall}
              disabled={selectedLines.size === 0}
              className="gap-2"
            >
              <Phone className="h-4 w-4" />
              Use Script & Call ({selectedLines.size} lines)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  X, MoreVertical, Sparkles, AlertTriangle, CheckCircle2, 
  MessageSquare, Users, Bell, Send, Bot
} from 'lucide-react';

interface DealBriefPanelProps {
  dealId?: string;
  dealName?: string;
  companyName?: string;
  onClose: () => void;
  teamId: string;
}

interface DealData {
  id: string;
  contactName: string;
  company: string;
  obstacles: string[];
  progress: string[];
  score: number;
  contacts: { name: string; role: string }[];
  warnings: string[];
}

export function DealBriefPanel({ 
  dealId, 
  dealName = 'Sample Deal', 
  companyName = 'Sample Company',
  onClose, 
  teamId 
}: DealBriefPanelProps) {
  const [activeTab, setActiveTab] = useState('brief');
  const [question, setQuestion] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [deal, setDeal] = useState<DealData>({
    id: dealId || '',
    contactName: dealName,
    company: companyName,
    obstacles: [
      'There is no clear timeline for a decision from the prospect',
      'Prospect has raised concerns about buy-in from key decision-makers (IT director and CFO)',
      'Pricing appears to be a significant factor for the prospect',
    ],
    progress: [
      'The prospect has confirmed that critical requirements like security, compliance, and scalability are well-addressed',
      'The prospect has scheduled a "Technical Deep Dive" call, showing active engagement and interest',
    ],
    score: 72,
    contacts: [
      { name: 'John Smith', role: 'VP of Sales' },
      { name: 'Sarah Johnson', role: 'IT Director' },
      { name: 'Mike Chen', role: 'CFO' },
    ],
    warnings: [
      'No activity in 5 days',
      'Competitor mentioned in last call',
      'Budget decision pending Q2 review',
    ],
  });

  useEffect(() => {
    if (dealId) {
      fetchDealData();
    }
  }, [dealId]);

  const fetchDealData = async () => {
    if (!dealId) return;
    
    try {
      const { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('id', dealId)
        .single();

      if (lead) {
        setDeal(prev => ({
          ...prev,
          id: lead.id,
          contactName: lead.contact_name,
          company: lead.company || 'Unknown Company',
          score: lead.ai_confidence || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching deal:', error);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('AI analysis complete - check the Brief tab for insights');
      setQuestion('');
    } catch (error) {
      toast.error('Failed to process question');
    } finally {
      setLoading(false);
    }
  };

  const handleSendUpdate = async () => {
    if (!message.trim()) return;

    try {
      toast.success('Deal update sent to team');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send update');
    }
  };

  return (
    <Card className="fixed right-6 top-24 w-[380px] h-[calc(100vh-120px)] bg-card shadow-xl border z-50 flex flex-col">
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground truncate">
              {deal.contactName}
            </CardTitle>
            <p className="text-sm text-muted-foreground truncate">{deal.company}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* AI Question Input */}
        <div className="mt-3 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <Input
            placeholder="Ask anything related to this deal"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
            className="pl-9 pr-4 bg-muted/50"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
          <TabsList className="grid grid-cols-4 h-9">
            <TabsTrigger value="brief" className="text-xs gap-1">
              <Sparkles className="h-3 w-3" />
              Brief
            </TabsTrigger>
            <TabsTrigger value="score" className="text-xs">Score</TabsTrigger>
            <TabsTrigger value="contacts" className="text-xs">Contacts</TabsTrigger>
            <TabsTrigger value="warnings" className="text-xs">Warnings</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            {activeTab === 'brief' && (
              <div className="space-y-4">
                {/* Obstacles */}
                <div className="p-4 rounded-lg border bg-destructive/5 border-destructive/20">
                  <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Obstacles
                  </h4>
                  <ul className="space-y-2">
                    {deal.obstacles.map((obstacle, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-destructive mt-1">•</span>
                        {obstacle}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Progress */}
                <div className="p-4 rounded-lg border bg-success/5 border-success/20">
                  <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Progress
                  </h4>
                  <ul className="space-y-2">
                    {deal.progress.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'score' && (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-3">
                    <span className="text-3xl font-bold text-primary">{deal.score}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">AI Confidence Score</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Engagement</span>
                    <Badge variant="outline" className="text-xs">High</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Budget Clarity</span>
                    <Badge variant="outline" className="text-xs text-warning border-warning/30">Medium</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Timeline</span>
                    <Badge variant="outline" className="text-xs text-destructive border-destructive/30">Low</Badge>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-3">
                {deal.contacts.map((contact, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'warnings' && (
              <div className="space-y-3">
                {deal.warnings.map((warning, i) => (
                  <div 
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20"
                  >
                    <Bell className="h-4 w-4 text-warning mt-0.5" />
                    <p className="text-sm text-foreground">{warning}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex gap-2">
          <Textarea
            placeholder="Send update to team..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[60px] resize-none bg-background"
          />
          <Button 
            size="icon" 
            className="h-[60px] w-10"
            onClick={handleSendUpdate}
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* AI Assistant Button */}
      <Button
        className="absolute bottom-20 right-4 h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        size="icon"
      >
        <Bot className="h-5 w-5" />
      </Button>
    </Card>
  );
}

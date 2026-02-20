import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { HealthBadge } from './HealthBadge';
import { BuyingSignalChip } from './BuyingSignalChip';
import { Deal, Objection } from '@/types/deals';
import { cn } from '@/lib/utils';
import { 
  X, 
  Phone, 
  Calendar, 
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  TrendingDown,
  Clock,
  Target,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DealDetailDrawerProps {
  deal: Deal | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: (deal: Deal) => void;
}

const stages = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'demo', label: 'Demo' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export function DealDetailDrawer({ deal, open, onClose, onUpdate }: DealDetailDrawerProps) {
  const [expandedObjection, setExpandedObjection] = useState<string | null>(null);
  const [showAllCalls, setShowAllCalls] = useState(false);

  if (!deal) return null;

  const healthFactors = [
    { 
      label: `Last contact: ${deal.daysSinceLastCall} days ago`, 
      impact: deal.daysSinceLastCall > 7 ? -20 : deal.daysSinceLastCall > 3 ? -5 : 0,
      negative: deal.daysSinceLastCall > 7
    },
    { 
      label: `Unresolved objections: ${deal.objections.filter(o => !o.resolved).length}`, 
      impact: deal.objections.filter(o => !o.resolved).length * -15,
      negative: deal.objections.filter(o => !o.resolved).length > 0
    },
    { 
      label: `Buying signals: ${deal.buyingSignals.length}`, 
      impact: deal.buyingSignals.length * 10,
      negative: false
    },
    { 
      label: 'Stage velocity', 
      impact: deal.healthScore < 50 ? -15 : 0,
      negative: deal.healthScore < 50
    },
  ];

  const displayedCalls = showAllCalls ? deal.calls : deal.calls.slice(0, 3);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background border-border">
        <SheetHeader className="space-y-4 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-xl font-bold text-foreground">{deal.name}</SheetTitle>
              <p className="text-muted-foreground">{deal.company}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{formatCurrency(deal.value)}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-4">
          {/* Health Score Section */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Deal Health</h3>
                <HealthBadge status={deal.healthStatus} score={deal.healthScore} size="lg" />
              </div>
              <Progress 
                value={deal.healthScore} 
                className={cn(
                  "h-2 mb-4",
                  deal.healthStatus === 'at_risk' && "[&>div]:bg-destructive",
                  deal.healthStatus === 'monitor' && "[&>div]:bg-warning",
                  deal.healthStatus === 'on_track' && "[&>div]:bg-success"
                )}
              />
              <div className="space-y-2">
                {healthFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className={cn(
                      "flex items-center gap-2",
                      factor.negative ? "text-muted-foreground" : "text-foreground"
                    )}>
                      {factor.negative ? (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      ) : (
                        <Target className="h-3 w-3 text-success" />
                      )}
                      {factor.label}
                    </span>
                    <span className={cn(
                      "font-medium",
                      factor.impact > 0 ? "text-success" : factor.impact < 0 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {factor.impact > 0 ? '+' : ''}{factor.impact} pts
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Next Action */}
          {deal.nextAction && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">AI Recommended Action</h3>
                    <p className="text-foreground mb-3">{deal.nextAction}</p>
                    <div className="p-3 rounded-lg bg-background/50 mb-3">
                      <p className="text-sm text-muted-foreground mb-2">Suggested talking points:</p>
                      <ul className="text-sm text-foreground space-y-1">
                        <li>• Address previous concerns about implementation timeline</li>
                        <li>• Highlight recent customer success stories in their industry</li>
                        <li>• Propose a pilot program to reduce risk perception</li>
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Phone className="h-4 w-4 mr-1" />
                        Call Now
                      </Button>
                      <Button size="sm" variant="outline" className="border-border">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                      <Button size="sm" variant="ghost" className="text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Buying Signals */}
          {deal.buyingSignals.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Buying Signals</h3>
              <div className="flex flex-wrap gap-2">
                {deal.buyingSignals.map((signal) => (
                  <BuyingSignalChip key={signal.id} signal={signal} />
                ))}
              </div>
            </div>
          )}

          {/* Objections */}
          {deal.objections.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Objections Raised
              </h3>
              <div className="space-y-2">
                {deal.objections.map((objection) => (
                  <ObjectionCard 
                    key={objection.id} 
                    objection={objection}
                    expanded={expandedObjection === objection.id}
                    onToggle={() => setExpandedObjection(
                      expandedObjection === objection.id ? null : objection.id
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Call History */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Call History
            </h3>
            <div className="space-y-2">
              {displayedCalls.map((call) => (
                <Card key={call.id} className="bg-muted/20 border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(call.date).toLocaleDateString()} · {Math.round(call.duration / 60)}m
                      </span>
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        call.score >= 80 ? "border-success/30 text-success" :
                        call.score >= 60 ? "border-warning/30 text-warning" :
                        "border-destructive/30 text-destructive"
                      )}>
                        Score: {call.score}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">{call.summary}</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-primary p-0 h-auto">
                      View Full Summary
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {deal.calls.length > 3 && (
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground"
                onClick={() => setShowAllCalls(!showAllCalls)}
              >
                {showAllCalls ? (
                  <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
                ) : (
                  <>Show {deal.calls.length - 3} More Calls <ChevronDown className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            )}
          </div>

          <Separator className="bg-border" />

          {/* Deal Details (Editable) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Deal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Contact</Label>
                <Input 
                  defaultValue={deal.contactName} 
                  className="bg-muted/20 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Email</Label>
                <Input 
                  defaultValue={deal.contactEmail} 
                  className="bg-muted/20 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Stage</Label>
                <Select defaultValue={deal.stage}>
                  <SelectTrigger className="bg-muted/20 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map(stage => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Value</Label>
                <Input 
                  type="number"
                  defaultValue={deal.value} 
                  className="bg-muted/20 border-border"
                />
              </div>
            </div>
          </div>

          {/* CRM Sync Status */}
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="text-sm text-foreground">Synced with HubSpot</span>
                <span className="text-xs text-muted-foreground">· Last sync: 2 min ago</span>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                View in HubSpot
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ObjectionCard({ 
  objection, 
  expanded, 
  onToggle 
}: { 
  objection: Objection; 
  expanded: boolean; 
  onToggle: () => void;
}) {
  return (
    <Card className={cn(
      "border transition-all",
      objection.resolved ? "bg-muted/10 border-border/50" : "bg-warning/5 border-warning/20"
    )}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={objection.resolved} 
            className="mt-1"
          />
          <div className="flex-1">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={onToggle}
            >
              <p className={cn(
                "text-sm",
                objection.resolved ? "text-muted-foreground line-through" : "text-foreground"
              )}>
                "{objection.text}"
              </p>
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {expanded && !objection.resolved && (
              <div className="mt-3 p-3 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">Suggested response:</p>
                <p className="text-sm text-foreground">{objection.suggestedResponse}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

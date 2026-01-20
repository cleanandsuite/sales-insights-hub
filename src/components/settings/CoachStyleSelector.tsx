import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Target, Scale, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CoachStyleSelectorProps {
  onStyleChange?: (style: string) => void;
  onEnabledChange?: (enabled: boolean) => void;
}

const COACH_STYLES = [
  {
    id: 'cardone',
    name: 'Grant Cardone',
    icon: '🔥',
    description: 'High-energy, pain-focused. Push for massive action and aggressive objection handling.',
    traits: ['10X Energy', 'Pain Focus', 'Close Hard'],
    color: 'border-orange-500 bg-orange-500/10',
    badgeColor: 'bg-orange-500',
  },
  {
    id: 'belfort',
    name: 'Jordan Belfort',
    icon: '🎯',
    description: 'Straight Line Selling. Focus on tonality, looping objections, and building certainty.',
    traits: ['Tonality', 'Looping', 'Certainty'],
    color: 'border-blue-500 bg-blue-500/10',
    badgeColor: 'bg-blue-500',
  },
  {
    id: 'neutral',
    name: 'Neutral Coach',
    icon: '⚖️',
    description: 'Balanced, professional approach. Practical suggestions without a specific persona.',
    traits: ['Balanced', 'Professional', 'Practical'],
    color: 'border-muted bg-muted/30',
    badgeColor: 'bg-muted-foreground',
  },
];

export function CoachStyleSelector({ onStyleChange, onEnabledChange }: CoachStyleSelectorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedStyle, setSelectedStyle] = useState('neutral');
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetchSettings();
    checkSubscription();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_lead_settings')
        .select('live_coach_style, live_coaching_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setSelectedStyle(data.live_coach_style || 'neutral');
        setIsEnabled(data.live_coaching_enabled || false);
      }
    } catch (error) {
      console.error('Error fetching coach settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (data?.plan === 'team' || data?.plan === 'enterprise') {
        setIsPremium(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleStyleChange = async (style: string) => {
    if (!isPremium && style !== 'neutral') {
      toast({
        title: 'Premium Feature',
        description: 'Coach styles require Team plan ($99/user/mo)',
      });
      return;
    }

    setSelectedStyle(style);
    onStyleChange?.(style);
    await saveSettings(style, isEnabled);
  };

  const handleEnabledChange = async (enabled: boolean) => {
    if (!isPremium && enabled) {
      toast({
        title: 'Premium Feature',
        description: 'Live AI coaching requires Team plan ($99/user/mo)',
      });
      return;
    }

    setIsEnabled(enabled);
    onEnabledChange?.(enabled);
    await saveSettings(selectedStyle, enabled);
  };

  const saveSettings = async (style: string, enabled: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ai_lead_settings')
        .upsert({
          user_id: user.id,
          live_coach_style: style,
          live_coaching_enabled: enabled,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({ title: 'Settings saved' });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to save settings',
      });
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3">
          <Crown className="h-5 w-5 text-primary" />
          <div>
            <Label className="text-base font-medium">Live AI Coaching</Label>
            <p className="text-sm text-muted-foreground">
              Get real-time suggestions during calls
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isPremium && (
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" />
              Team Plan
            </Badge>
          )}
          <Switch
            checked={isEnabled}
            onCheckedChange={handleEnabledChange}
            disabled={!isPremium}
          />
        </div>
      </div>

      {/* Coach Style Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Coach Style</Label>
        <p className="text-sm text-muted-foreground">
          Choose a coaching personality for live suggestions
        </p>

        <RadioGroup
          value={selectedStyle}
          onValueChange={handleStyleChange}
          className="grid gap-4"
        >
          {COACH_STYLES.map((style) => {
            const isSelected = selectedStyle === style.id;
            const isLocked = !isPremium && style.id !== 'neutral';

            return (
              <label
                key={style.id}
                className={cn(
                  "relative flex cursor-pointer rounded-lg border-2 p-4 transition-all",
                  isSelected ? style.color : "border-border hover:border-muted-foreground/50",
                  isLocked && "opacity-60 cursor-not-allowed"
                )}
              >
                <RadioGroupItem
                  value={style.id}
                  className="sr-only"
                  disabled={isLocked}
                />
                
                <div className="flex items-start gap-4 w-full">
                  <div className="text-3xl">{style.icon}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{style.name}</span>
                      {isLocked && (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      {isSelected && (
                        <Badge className={style.badgeColor}>Active</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {style.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {style.traits.map((trait) => (
                        <Badge key={trait} variant="outline" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className={cn(
                    "absolute top-2 right-2 h-3 w-3 rounded-full",
                    style.badgeColor
                  )} />
                )}
              </label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Premium CTA */}
      {!isPremium && (
        <Card className="p-4 border-primary/50 bg-primary/5">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium">Upgrade to Team Plan</p>
              <p className="text-sm text-muted-foreground">
                Unlock all coach styles and live AI coaching for $99/user/mo
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

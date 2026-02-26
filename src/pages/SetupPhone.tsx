import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Loader2, Search, CheckCircle, ArrowRight, Sparkles, Shield, Zap, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Phase = 'select' | 'provisioning' | 'welcome';

interface AvailableNumber {
  phone_number: string;
  formatted: string;
}

const ROTATING_TIPS = [
  { icon: Zap, text: "Your dedicated line means higher answer rates and trust" },
  { icon: Shield, text: "STIR/SHAKEN verified — your calls won't show as spam" },
  { icon: Sparkles, text: "AI coaching activates automatically on every call" },
  { icon: Trophy, text: "Top reps close 3x more deals with dedicated lines" },
  { icon: Phone, text: "Crystal-clear HD voice on every connection" },
  { icon: Zap, text: "Real-time transcription and sentiment analysis included" },
];

export default function SetupPhone() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('select');
  const [areaCode, setAreaCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<AvailableNumber | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionProgress, setProvisionProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [activeNumber, setActiveNumber] = useState('');

  // Check if user already has an active line
  useEffect(() => {
    const checkExisting = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data } = await supabase
        .from('user_phone_lines' as any)
        .select('phone_number, status')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if ((data as any)?.status === 'active') {
        setActiveNumber((data as any).phone_number);
        setPhase('welcome');
      } else if ((data as any)?.status === 'provisioning') {
        setPhase('provisioning');
      }
    };
    checkExisting();
  }, [navigate]);

  // Search for available numbers
  const handleSearch = async () => {
    if (!/^\d{3}$/.test(areaCode)) {
      toast.error('Please enter a valid 3-digit area code');
      return;
    }

    setIsSearching(true);
    setAvailableNumbers([]);
    setSelectedNumber(null);

    try {
      const { data, error } = await supabase.functions.invoke('telnyx-search-numbers', {
        body: { area_code: areaCode },
      });

      if (error) throw error;
      
      const numbers = (data as any)?.numbers || [];
      if (numbers.length === 0) {
        toast.error('No numbers available for this area code. Try another.');
      } else {
        setAvailableNumbers(numbers);
      }
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Could not search for numbers. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Claim selected number
  const handleClaim = async () => {
    if (!selectedNumber) return;

    setIsProvisioning(true);
    setPhase('provisioning');
    setProvisionProgress(5);

    try {
      const { error } = await supabase.functions.invoke('telnyx-provision-number', {
        body: {
          area_code: areaCode,
          phone_number: selectedNumber.phone_number,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Provisioning error:', err);
      toast.error('Failed to start provisioning. Please try again.');
      setPhase('select');
      setIsProvisioning(false);
    }
  };

  // Poll for provisioning status
  useEffect(() => {
    if (phase !== 'provisioning') return;

    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('user_phone_lines' as any)
        .select('phone_number, status, error_message')
        .eq('user_id', session.user.id)
        .maybeSingle();

      const row = data as any;
      if (row?.status === 'active') {
        setActiveNumber(row.phone_number);
        setProvisionProgress(100);
        setTimeout(() => setPhase('welcome'), 800);
        clearInterval(interval);
      } else if (row?.status === 'failed') {
        toast.error(row.error_message || 'Provisioning failed. Please contact support.');
        setPhase('select');
        setIsProvisioning(false);
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [phase]);

  // Progress animation during provisioning
  useEffect(() => {
    if (phase !== 'provisioning') return;

    const interval = setInterval(() => {
      setProvisionProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 3 + 0.5;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [phase]);

  // Rotate tips
  useEffect(() => {
    if (phase !== 'provisioning') return;

    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % ROTATING_TIPS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [phase]);

  const formatPhoneForDisplay = (e164: string): string => {
    const digits = e164.replace(/^\+1/, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return e164;
  };

  // ─── Phase 1: Area Code Selection ───
  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Phone className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Let's Set Up Your SellSig Line
            </h1>
            <p className="text-muted-foreground">
              Choose your area code and pick your dedicated business number
            </p>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="areaCode">Area Code</Label>
                <div className="flex gap-3">
                  <Input
                    id="areaCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    value={areaCode}
                    onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="e.g. 212"
                    className="text-lg font-mono tracking-wider"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isSearching || areaCode.length !== 3}>
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the 3-digit area code for your preferred region
                </p>
              </div>

              {availableNumbers.length > 0 && (
                <div className="space-y-3">
                  <Label>Available Numbers</Label>
                  <div className="grid gap-2">
                    {availableNumbers.map((num) => (
                      <button
                        key={num.phone_number}
                        onClick={() => setSelectedNumber(num)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedNumber?.phone_number === num.phone_number
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/40 hover:bg-muted/50'
                        }`}
                      >
                        <span className="text-lg font-mono font-semibold tracking-wide">
                          {num.formatted}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedNumber && (
                <Button
                  onClick={handleClaim}
                  disabled={isProvisioning}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {isProvisioning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting Up...
                    </>
                  ) : (
                    <>
                      Claim {selectedNumber.formatted}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Phase 2: Provisioning ───
  if (phase === 'provisioning') {
    const CurrentTipIcon = ROTATING_TIPS[tipIndex].icon;
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="relative mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Phone className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Setting Up Your SellSig Line
            </h1>
            <p className="text-muted-foreground">
              This takes about 2–3 minutes. Hang tight.
            </p>
          </div>

          <div className="mb-8 px-4">
            <Progress value={provisionProgress} className="h-2 mb-3" />
            <p className="text-sm text-muted-foreground">
              {provisionProgress < 30
                ? 'Reserving your number...'
                : provisionProgress < 60
                ? 'Configuring your line...'
                : provisionProgress < 90
                ? 'Activating HD voice...'
                : 'Almost ready...'}
            </p>
          </div>

          <Card className="border-border/50 bg-muted/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 transition-all duration-500">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CurrentTipIcon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  {ROTATING_TIPS[tipIndex].text}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Phase 3: Welcome ───
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-2">
          Welcome to the Elite
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your dedicated SellSig line is live.
        </p>

        <Card className="border-primary/20 bg-primary/5 mb-8">
          <CardContent className="p-8">
            <p className="text-sm text-muted-foreground mb-2">Your SellSig Number</p>
            <p className="text-4xl font-bold font-mono tracking-wider text-foreground">
              {formatPhoneForDisplay(activeNumber)}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
          <div className="flex items-start gap-3 p-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Verified Caller ID</p>
              <p className="text-xs text-muted-foreground">Never flagged as spam</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">AI Coaching</p>
              <p className="text-xs text-muted-foreground">Real-time on every call</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3">
            <Trophy className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Elite Access</p>
              <p className="text-xs text-muted-foreground">Full platform unlocked</p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => navigate('/dashboard')}
          size="lg"
          className="w-full h-12 text-base"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

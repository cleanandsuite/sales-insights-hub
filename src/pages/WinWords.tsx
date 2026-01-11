import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScenarioSelector } from '@/components/winwords/ScenarioSelector';
import { PersonaForm } from '@/components/winwords/PersonaForm';
import { DealContextForm } from '@/components/winwords/DealContextForm';
import { StyleSelector } from '@/components/winwords/StyleSelector';
import { GeneratedScript } from '@/components/winwords/GeneratedScript';
import { OutcomeTracker } from '@/components/winwords/OutcomeTracker';
import { WinWordsAnalytics } from '@/components/winwords/WinWordsAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getToastErrorMessage } from '@/lib/errorSanitizer';
import { 
  Trophy, Sparkles, ArrowRight, Loader2, 
  FileText, BarChart3, History 
} from 'lucide-react';

interface CompanyResearchData {
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  recentNews?: string[];
  painPoints?: string[];
  competitors?: string[];
  techStack?: string[];
}

interface Persona {
  role: string;
  industry: string;
  companySize: string;
  painPoints: string[];
  personalityStyle: string;
  companyName?: string;
  companyResearch?: CompanyResearchData | null;
}

interface DealContext {
  stage: string;
  budget: string;
  timeline: string;
  competition: string;
  previousInteractions: string;
  knownObjections: string[];
}

export default function WinWords() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('generate');
  const [step, setStep] = useState(1);
  const [scenario, setScenario] = useState('discovery');
  const [style, setStyle] = useState('confident');
  const [persona, setPersona] = useState<Persona>({
    role: '',
    industry: '',
    companySize: '',
    painPoints: [],
    personalityStyle: 'analytical',
  });
  const [dealContext, setDealContext] = useState<DealContext>({
    stage: 'discovery',
    budget: '',
    timeline: 'this_quarter',
    competition: '',
    previousInteractions: '',
    knownObjections: [],
  });
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [showOutcomeTracker, setShowOutcomeTracker] = useState(false);

  // Auto-fill competition when company research has competitors
  const handleStepChange = (newStep: number) => {
    // When moving to step 3 (Deal Context), auto-fill competition from company research
    if (newStep === 3 && persona.companyResearch?.competitors?.length) {
      const competitors = persona.companyResearch.competitors.slice(0, 3).join(', ');
      if (!dealContext.competition) {
        setDealContext(prev => ({ ...prev, competition: competitors }));
      }
    }
    setStep(newStep);
  };

  // Fetch user's scripts for history
  const { data: scripts } = useQuery({
    queryKey: ['winwords-scripts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('winwords_scripts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Generate script mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke('winwords-generate', {
        body: { scenario, persona, dealContext, style }
      });
      
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: async (data) => {
      setGeneratedScript(data);
      setStep(4);
      
      // Save to database
      if (user?.id) {
        const insertData = {
          user_id: user.id,
          scenario,
          persona,
          deal_context: dealContext,
          style,
          generated_script: data,
          confidence_score: data.confidence_score || 75,
        };
        await supabase.from('winwords_scripts').insert(insertData as any);
        queryClient.invalidateQueries({ queryKey: ['winwords-scripts'] });
      }
      
      toast.success('Script generated! 🎉');
    },
    onError: (error: unknown) => {
      console.error('Generation error:', error);
      toast.error(getToastErrorMessage(error, 'default'));
    },
  });

  // Track outcome mutation
  const trackOutcomeMutation = useMutation({
    mutationFn: async (outcomeData: {
      outcome: string;
      feedback: string;
      dealSize?: number;
      callDuration?: number;
    }) => {
      if (!generatedScript?.script_id) throw new Error('No script to track');
      
      const { error } = await supabase
        .from('winwords_scripts')
        .update({
          outcome: outcomeData.outcome,
          feedback: outcomeData.feedback,
          deal_size: outcomeData.dealSize,
          call_duration_seconds: outcomeData.callDuration,
          used_at: new Date().toISOString(),
        })
        .eq('generated_script->>script_id', generatedScript.script_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Outcome tracked! This helps improve future scripts.');
      setShowOutcomeTracker(false);
      queryClient.invalidateQueries({ queryKey: ['winwords-scripts'] });
    },
    onError: (error: unknown) => {
      toast.error(getToastErrorMessage(error, 'save'));
    },
  });

  // Calculate analytics from scripts
  const analyticsData = {
    totalScripts: scripts?.length || 0,
    scriptsUsed: scripts?.filter(s => s.used_at)?.length || 0,
    successRate: scripts?.length 
      ? (scripts.filter(s => s.outcome === 'closed_won').length / Math.max(scripts.filter(s => s.outcome).length, 1)) * 100 
      : 0,
    avgConfidence: scripts?.length 
      ? scripts.reduce((sum, s) => sum + (Number(s.confidence_score) || 0), 0) / scripts.length 
      : 0,
    scenarioBreakdown: Object.entries(
      scripts?.reduce((acc: Record<string, { count: number; wins: number }>, s) => {
        if (!acc[s.scenario]) acc[s.scenario] = { count: 0, wins: 0 };
        acc[s.scenario].count++;
        if (s.outcome === 'closed_won') acc[s.scenario].wins++;
        return acc;
      }, {}) || {}
    ).map(([scenario, data]) => ({
      scenario,
      count: data.count,
      winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0,
    })),
    topPerformingScenario: 'discovery',
    recentWins: scripts?.filter(s => s.outcome === 'closed_won').length || 0,
  };

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleUseScript = () => {
    setShowOutcomeTracker(true);
  };

  const resetForm = () => {
    setStep(1);
    setGeneratedScript(null);
    setShowOutcomeTracker(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                WINWORDS
              </h1>
              <p className="text-muted-foreground">AI-powered sales scripts that win deals</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="generate" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-6">
            {/* Progress Steps */}
            {step < 4 && (
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        step >= s
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {s}
                    </div>
                    {s < 3 && (
                      <div className={`w-16 h-0.5 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Scenario Selection */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>What type of call is this?</CardTitle>
                  <CardDescription>Select the scenario that best matches your upcoming conversation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ScenarioSelector selected={scenario} onSelect={setScenario} />
                  
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Tone & Style</label>
                    <StyleSelector selected={style} onSelect={setStyle} />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleStepChange(2)} className="gap-2">
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Persona */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Who are you talking to?</CardTitle>
                  <CardDescription>Help us personalize the script for your buyer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <PersonaForm persona={persona} onChange={setPersona} />

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => handleStepChange(1)}>
                      Back
                    </Button>
                    <Button onClick={() => handleStepChange(3)} className="gap-2">
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Deal Context */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Deal Context</CardTitle>
                  <CardDescription>What do you already know about this opportunity?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <DealContextForm context={dealContext} onChange={setDealContext} />

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => handleStepChange(2)}>
                      Back
                    </Button>
                    <Button 
                      onClick={handleGenerate} 
                      className="gap-2"
                      disabled={generateMutation.isPending}
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate Winning Script
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Generated Script */}
            {step === 4 && generatedScript && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={resetForm}>
                    ← Generate New Script
                  </Button>
                </div>

                <GeneratedScript script={generatedScript} onUseScript={handleUseScript} />

                {showOutcomeTracker && (
                  <OutcomeTracker
                    scriptId={generatedScript.script_id}
                    onSubmit={(data) => trackOutcomeMutation.mutate(data)}
                    isSubmitting={trackOutcomeMutation.isPending}
                  />
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="space-y-4">
              {scripts?.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No scripts generated yet</p>
                    <Button className="mt-4" onClick={() => setActiveTab('generate')}>
                      Generate Your First Script
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                scripts?.map((script) => (
                  <Card key={script.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{script.scenario.replace(/_/g, ' ')}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(script.created_at).toLocaleDateString()} • 
                              {script.confidence_score}% confidence
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {script.outcome && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              script.outcome === 'closed_won' 
                                ? 'bg-green-500/10 text-green-600' 
                                : script.outcome === 'closed_lost'
                                ? 'bg-red-500/10 text-red-600'
                                : 'bg-blue-500/10 text-blue-600'
                            }`}>
                              {script.outcome.replace(/_/g, ' ')}
                            </span>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setGeneratedScript(script.generated_script);
                              setStep(4);
                              setActiveTab('generate');
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <WinWordsAnalytics data={analyticsData} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

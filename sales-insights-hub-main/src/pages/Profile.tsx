import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getToastErrorMessage } from '@/lib/errorSanitizer';
import { User, Building, Mail, Save, Loader2, Sparkles, X, Plus, Zap, Target, Award, Shield, Clock, DollarSign, Users, Headphones, BarChart, Monitor, Search, Briefcase, CheckCircle2, MapPin, Volume2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast as sonnerToast } from 'sonner';

interface CompanyResearchData {
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  painPoints?: string[];
  competitors?: string[];
}

interface Profile {
  full_name: string | null;
  company: string | null;
  position: string | null;
  avatar_url: string | null;
  company_strengths: string[];
  unique_differentiators: string[];
  personal_tone: string;
}

const COMMON_STRENGTHS = [
  { value: 'Fastest setup', icon: Zap },
  { value: 'Real-time AI nudges', icon: Sparkles },
  { value: 'Lowest cost', icon: DollarSign },
  { value: '24/7 Support', icon: Headphones },
  { value: 'Enterprise security', icon: Shield },
  { value: 'Proven ROI', icon: BarChart },
  { value: 'Industry leader', icon: Award },
];


export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStrength, setNewStrength] = useState('');
  const [newDifferentiator, setNewDifferentiator] = useState('');
  const [companyResearch, setCompanyResearch] = useState<CompanyResearchData | null>(null);
  const [isResearchingCompany, setIsResearchingCompany] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    company: '',
    position: '',
    avatar_url: '',
    company_strengths: [],
    unique_differentiators: [],
    personal_tone: 'Neutral',
  });

  const isProfileComplete = profile.company && profile.company_strengths.length > 0;

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, company, position, avatar_url, company_strengths, unique_differentiators, personal_tone')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setProfile({
          full_name: data.full_name || '',
          company: data.company || '',
          position: data.position || '',
          avatar_url: data.avatar_url || '',
          company_strengths: (data.company_strengths as string[]) || [],
          unique_differentiators: (data.unique_differentiators as string[]) || [],
          personal_tone: data.personal_tone || 'Neutral',
        });
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        company: profile.company,
        position: profile.position,
        company_strengths: profile.company_strengths,
        unique_differentiators: profile.unique_differentiators,
        personal_tone: profile.personal_tone,
      })
      .eq('user_id', user.id);

    setSaving(false);

    if (error) {
      toast({
        title: 'Error saving profile',
        description: getToastErrorMessage(error, 'save'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profile saved',
        description: 'WinWord will now personalize every script with your profile.',
      });
    }
  };

  const addStrength = (strength: string) => {
    if (strength && !profile.company_strengths.includes(strength)) {
      setProfile({ ...profile, company_strengths: [...profile.company_strengths, strength] });
    }
    setNewStrength('');
  };

  const removeStrength = (strength: string) => {
    setProfile({
      ...profile,
      company_strengths: profile.company_strengths.filter((s) => s !== strength),
    });
  };

  const addDifferentiator = () => {
    if (newDifferentiator && !profile.unique_differentiators.includes(newDifferentiator)) {
      setProfile({
        ...profile,
        unique_differentiators: [...profile.unique_differentiators, newDifferentiator],
      });
      setNewDifferentiator('');
    }
  };

  const removeDifferentiator = (diff: string) => {
    setProfile({
      ...profile,
      unique_differentiators: profile.unique_differentiators.filter((d) => d !== diff),
    });
  };

  const handleResearchCompany = async () => {
    if (!profile.company?.trim()) {
      sonnerToast.error('Please enter a company name first');
      return;
    }

    setIsResearchingCompany(true);
    setCompanyResearch(null);

    try {
      const response = await supabase.functions.invoke('company-lookup', {
        body: { companyName: profile.company.trim(), confirmed: true }
      });

      if (response.error) {
        throw response.error;
      }

      const data = response.data;

      if (data.status === 'not_found') {
        sonnerToast.info('Company not found. Enter details manually.');
      } else if (data.status === 'found') {
        const research = data.research as CompanyResearchData;
        setCompanyResearch(research);
        
        // Auto-populate strengths and differentiators from research
        const newStrengths = [...profile.company_strengths];
        const newDifferentiators = [...profile.unique_differentiators];
        
        // Add pain points as company strengths (things you can solve)
        if (research.painPoints) {
          research.painPoints.forEach(point => {
            if (!newStrengths.includes(point)) {
              newStrengths.push(point);
            }
          });
        }
        
        // Add competitors as differentiators
        if (research.competitors) {
          research.competitors.forEach(competitor => {
            const diffText = `Compete against ${competitor}`;
            if (!newDifferentiators.includes(diffText)) {
              newDifferentiators.push(diffText);
            }
          });
        }
        
        setProfile({
          ...profile,
          company_strengths: newStrengths,
          unique_differentiators: newDifferentiators,
        });
        
        sonnerToast.success(`Found ${research.name}! Insights added to your profile.`);
      }
    } catch (error) {
      console.error('Company lookup error:', error);
      sonnerToast.error('Failed to research company. Enter details manually.');
    } finally {
      setIsResearchingCompany(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
          <p className="text-muted-foreground mt-1">
            Personalize WinWords with your company details
          </p>
        </div>

        {/* Profile Incomplete Banner */}
        {!isProfileComplete && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Fill this out once to supercharge your scripts
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                WinWords will automatically personalize every script with your company strengths and differentiators.
              </p>
            </div>
          </div>
        )}

        {/* Basic Info Card */}
        <div className="card-gradient rounded-xl border border-border/50 p-8">
          {/* Avatar */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border/30">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {profile.full_name || 'Your Name'}
              </h3>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={profile.full_name || ''}
                    onChange={(e) =>
                      setProfile({ ...profile, full_name: e.target.value })
                    }
                    className="pl-10 bg-input border-border focus:border-primary"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="pl-10 bg-input/50 border-border text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-foreground">
                Company Name
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="company"
                    value={profile.company || ''}
                    onChange={(e) => {
                      setProfile({ ...profile, company: e.target.value });
                      setCompanyResearch(null);
                    }}
                    className="pl-10 bg-input border-border focus:border-primary"
                    placeholder="Enter your company name"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResearchCompany}
                  disabled={isResearchingCompany || !profile.company?.trim()}
                  className="gap-2"
                >
                  {isResearchingCompany ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {isResearchingCompany ? 'Researching...' : 'Research'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click "Research" to auto-fill company insights for better scripts
              </p>
            </div>

            {/* Company Research Results */}
            {companyResearch && (
              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                          Research Complete: {companyResearch.name}
                        </p>
                        {companyResearch.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {companyResearch.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {companyResearch.industry && (
                            <Badge variant="secondary" className="text-xs">{companyResearch.industry}</Badge>
                          )}
                          {companyResearch.size && (
                            <Badge variant="secondary" className="text-xs">{companyResearch.size}</Badge>
                          )}
                          {companyResearch.city && companyResearch.state && (
                            <Badge variant="secondary" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {companyResearch.city}, {companyResearch.state}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCompanyResearch(null)}
                      className="text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Position Field */}
            <div className="space-y-2">
              <Label htmlFor="position" className="text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Position
                <Badge variant="outline" className="text-xs font-normal">Optional</Badge>
              </Label>
              <Input
                id="position"
                value={profile.position || ''}
                onChange={(e) =>
                  setProfile({ ...profile, position: e.target.value })
                }
                className="bg-input border-border focus:border-primary"
                placeholder="Sales Representative (default)"
              />
              <p className="text-xs text-muted-foreground">
                Your position affects how call scripts are tailored for your role
              </p>
            </div>
          </div>
        </div>

        {/* WinWords Personalization Card */}
        <div className="card-gradient rounded-xl border border-border/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">WinWords Personalization</h2>
              <p className="text-sm text-muted-foreground">These details are injected into every script</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Company Strengths */}
            <div className="space-y-3">
              <Label className="text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Company Strengths
              </Label>
              <p className="text-xs text-muted-foreground">
                What makes your product/service stand out? Select or add your own.
              </p>
              
              {/* Selected strengths */}
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {profile.company_strengths.map((strength) => (
                  <Badge
                    key={strength}
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5"
                  >
                    {strength}
                    <button
                      type="button"
                      onClick={() => removeStrength(strength)}
                      className="ml-2 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Common strengths to add */}
              <div className="flex flex-wrap gap-2">
                {COMMON_STRENGTHS.filter(
                  (s) => !profile.company_strengths.includes(s.value)
                ).map((strength) => (
                  <button
                    key={strength.value}
                    type="button"
                    onClick={() => addStrength(strength.value)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <strength.icon className="h-3.5 w-3.5" />
                    {strength.value}
                    <Plus className="h-3 w-3" />
                  </button>
                ))}
              </div>

              {/* Custom strength input */}
              <div className="flex gap-2">
                <Input
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  placeholder="Add custom strength..."
                  className="bg-input border-border focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addStrength(newStrength);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addStrength(newStrength)}
                  disabled={!newStrength}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Unique Differentiators */}
            <div className="space-y-3">
              <Label className="text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Unique Differentiators
              </Label>
              <p className="text-xs text-muted-foreground">
                What sets you apart from competitors? (e.g., "Zero setup vs Gong's months")
              </p>

              {/* Selected differentiators */}
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {profile.unique_differentiators.map((diff) => (
                  <Badge
                    key={diff}
                    variant="secondary"
                    className="bg-accent/50 text-accent-foreground border-accent/20 px-3 py-1.5"
                  >
                    {diff}
                    <button
                      type="button"
                      onClick={() => removeDifferentiator(diff)}
                      className="ml-2 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Add differentiator input */}
              <div className="flex gap-2">
                <Input
                  value={newDifferentiator}
                  onChange={(e) => setNewDifferentiator(e.target.value)}
                  placeholder="e.g., 50% faster than competitors"
                  className="bg-input border-border focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDifferentiator();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDifferentiator}
                  disabled={!newDifferentiator}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* Screen Share Recording Instructions */}
        <div className="card-gradient rounded-xl border border-border/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Screen Recording Setup</h2>
              <p className="text-sm text-muted-foreground">How to capture both sides of your calls</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 border border-border/30">
              <h3 className="font-medium text-foreground mb-3">When prompted to share your screen:</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                  <span>Click the <strong className="text-foreground">"Entire Screen"</strong> tab at the top right of the dialog</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                  <span>Select your screen from the options shown below</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-primary" />
                    <span>Enable <strong className="text-foreground">"Also share system audio"</strong> at the bottom of the dialog</span>
                  </div>
                </li>
              </ol>
            </div>
            
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p>
                <strong className="text-amber-600 dark:text-amber-400">Pro tip:</strong> This allows the app to capture both your voice and the other person's voice for accurate transcription and AI analysis.
              </p>
            </div>
            
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <Monitor className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p>
                <strong className="text-blue-600 dark:text-blue-400">Note:</strong> For security reasons, browsers require you to confirm screen sharing each time you start a new recording. This is a browser security requirement and cannot be bypassed.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#0070F3] text-white hover:bg-[#0070F3]/90 px-8"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

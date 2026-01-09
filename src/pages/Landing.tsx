import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Mic, Brain, TrendingUp, Zap, Play, Star, Globe, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import sellsigLogo from '@/assets/sellsig-logo.png';
import { AuthModal } from '@/components/auth/AuthModal';
import { DemoVideoModal } from '@/components/landing/DemoVideoModal';

const PRICING_TIERS = [
  {
    name: 'Single User',
    description: 'Perfect for individual sales reps',
    price: 19,
    afterTrialPrice: 39,
    features: [
      'Unlimited call recordings',
      'AI transcription & analysis',
      'Lead intelligence',
      'Deal coaching insights',
      'Email support',
    ],
    popular: false,
    planKey: 'single_user',
  },
  {
    name: 'Team',
    description: 'For growing sales teams',
    price: 79,
    afterTrialPrice: 99,
    perUser: true,
    features: [
      'Everything in Single User',
      'Team performance analytics',
      'Manager dashboard',
      'Lead assignment & routing',
      'Custom playbooks',
      'Priority support',
    ],
    popular: true,
    planKey: 'team',
  },
];

const TESTIMONIALS = [
  {
    quote: "We closed 40% more deals within 2 months of using SellSig. The instant feedback is game-changing.",
    author: "Sarah Chen",
    role: "VP of Sales",
    company: "TechFlow Inc.",
    avatar: "SC"
  },
  {
    quote: "Finally, a Gong alternative that doesn't require a PhD to set up. My team was productive in minutes.",
    author: "Marcus Johnson",
    role: "Sales Director",
    company: "CloudScale",
    avatar: "MJ"
  },
  {
    quote: "The AI coaching suggestions helped our junior reps perform like veterans. ROI was immediate.",
    author: "Emily Rodriguez",
    role: "Head of Revenue",
    company: "DataSync Pro",
    avatar: "ER"
  }
];

const TRUSTED_BY = [
  'TechFlow', 'CloudScale', 'DataSync', 'Velocity', 'Nexus'
];

export default function Landing() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const handleStartTrial = async (planKey: string = 'single_user') => {
    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke('create-trial-checkout', {
        body: { plan: planKey },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <DemoVideoModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />
      
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                <img src={sellsigLogo} alt="SellSig" className="h-6 w-6 object-contain" />
              </div>
              <span className="font-bold text-xl">SellSig</span>
            </Link>
            <div className="flex items-center gap-3">
              <Button onClick={() => setAuthModalOpen(true)} variant="ghost" className="hover:bg-primary/10">
                Sign In
              </Button>
              <Button onClick={() => handleStartTrial()} className="hover:scale-105 transition-transform">
                Start Free Trial
              </Button>
            </div>
          </nav>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Zero Setup—Browser Only
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Sales Coaching That
              <br />
              <span className="text-primary">Closes More Deals</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Turn cold calls hot with AI insights. Easier than Gong, half the cost.
              Record, analyze, and close more deals—all from your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => handleStartTrial()} className="gap-2" disabled={loadingPlan !== null}>
                {loadingPlan === 'single_user' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Start 14-Day Free Trial
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 hover:scale-105 transition-transform"
                onClick={() => setDemoModalOpen(true)}
              >
                <Play className="h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              14-day trial—no charge until value proven. Cancel anytime.
            </p>
            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 pt-4 text-muted-foreground">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4" />
                <span>No Downloads</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4" />
                <span>60s Setup</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Trusted By Section */}
      <section className="py-8 border-y border-border/50">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-6">Trusted by sales teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {TRUSTED_BY.map((company) => (
              <div key={company} className="text-lg font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">See It In Action</h2>
              <p className="text-muted-foreground">Get started in under 2 minutes—no RevOps required</p>
            </div>
            <div 
              className="aspect-video bg-card rounded-xl border border-border overflow-hidden shadow-lg cursor-pointer group hover:shadow-xl transition-shadow"
              onClick={() => setDemoModalOpen(true)}
            >
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 relative">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors">Click to watch demo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Sales Teams Choose SellSig</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to coach your team and close more deals
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">One-Click Recording</h3>
              <p className="text-muted-foreground text-sm">
                Record calls with a single click. No complicated setup or integrations required.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">AI Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Get instant insights on objection handling, talk ratios, and closing techniques.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Deal Intelligence</h3>
              <p className="text-muted-foreground text-sm">
                Auto-capture leads, track deal progress, and get AI-powered next steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Loved by Sales Teams</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what top-performing teams are saying
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimonial, idx) => (
              <Card key={idx} className="bg-card/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 text-sm">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">Start with a 14-day free trial. No charge until you see the value.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <Card 
                key={tier.name} 
                className={`relative ${tier.popular ? 'border-primary shadow-lg' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground">{tier.perUser ? '/user/mo' : '/mo'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      then ${tier.afterTrialPrice}{tier.perUser ? '/user' : ''}/mo (grandfathered)
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={tier.popular ? 'default' : 'outline'}
                    onClick={() => handleStartTrial(tier.planKey)}
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === tier.planKey ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      'Start 14-Day Free Trial'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Card required upfront—no charge until day 15. Cancel anytime.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Close More Deals?</h2>
            <p className="text-lg text-muted-foreground">
              Join hundreds of sales teams already using AI to improve their close rates.
              Start your 14-day trial today—no charge until you're convinced.
            </p>
            <Button size="lg" onClick={() => handleStartTrial()} className="gap-2" disabled={loadingPlan !== null}>
              {loadingPlan ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Start Your Free Trial
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                <img src={sellsigLogo} alt="SellSig" className="h-5 w-5 object-contain" />
              </div>
              <span className="font-semibold">SellSig</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SellSig. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

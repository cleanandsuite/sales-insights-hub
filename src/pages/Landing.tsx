import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Mic, Brain, TrendingUp, Users, Zap, Play, Star, Globe, Shield } from 'lucide-react';

const PRICING_TIERS = [
  {
    name: 'Single User',
    description: 'Perfect for individual sales reps',
    price: 19,
    originalPrice: 39,
    promo: 'First 3 months',
    grandfathered: true,
    features: [
      'Unlimited call recordings',
      'AI transcription & analysis',
      'Lead intelligence',
      'Deal coaching insights',
      'Email support',
    ],
    popular: false,
  },
  {
    name: 'Team',
    description: 'For growing sales teams',
    price: 79,
    originalPrice: 99,
    promo: 'First 3 months',
    grandfathered: true,
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
  },
];

const TESTIMONIALS = [
  {
    quote: "We closed 40% more deals within 2 months of using SalesCoach AI. The instant feedback is game-changing.",
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
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Mic className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">SalesCoach AI</span>
            </div>
            <Button onClick={() => navigate('/auth')} variant="outline">
              Sign In
            </Button>
          </nav>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Zero Setup—Browser Only
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Sales Coaching in 60 Seconds
              <br />
              <span className="text-primary">No Setup, No Fees</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Turn cold calls hot with AI insights. Easier than Gong, half the cost.
              Record, analyze, and close more deals—all from your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
                <Mic className="h-5 w-5" />
                Get Started Now
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 pt-8 text-muted-foreground">
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
            <div className="aspect-video bg-card rounded-xl border border-border overflow-hidden shadow-lg">
              {/* Video placeholder - replace with actual embed */}
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Demo video coming soon</p>
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
            <h2 className="text-3xl font-bold mb-4">Why Sales Teams Choose Us</h2>
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
            <p className="text-muted-foreground">Lock in early-adopter rates—grandfathered forever</p>
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
                      {tier.promo} • Then ${tier.originalPrice}{tier.perUser ? '/user' : ''}/mo
                    </p>
                    {tier.grandfathered && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Early adopters grandfathered at launch price
                      </Badge>
                    )}
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
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            No credit card required • Cancel anytime
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
            </p>
            <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
              <Users className="h-5 w-5" />
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <Mic className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">SalesCoach AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SalesCoach AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

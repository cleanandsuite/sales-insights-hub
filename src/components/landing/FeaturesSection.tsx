import { Mic, Brain, TrendingUp, Zap, Target, Users } from 'lucide-react';
import salesCallImage from '@/assets/sales-call.jpg';

const features = [
  {
    icon: Mic,
    title: 'One-Click Recording',
    description: 'Record calls directly in your browser. No downloads, no integrations, no IT tickets. Just click and go.',
  },
  {
    icon: Brain,
    title: 'Real-Time AI Coaching',
    description: 'Get live suggestions during calls—handle objections, ask better questions, and never miss a closing opportunity.',
  },
  {
    icon: TrendingUp,
    title: 'Deal Intelligence',
    description: 'Automatically capture leads, track deal progress, and get AI-powered next steps to accelerate your pipeline.',
  },
  {
    icon: Zap,
    title: '60-Second Setup',
    description: 'Unlike Gong or Chorus that take months, start using SellSig in under a minute. No training required.',
  },
  {
    icon: Target,
    title: 'Objection Detection',
    description: 'Our AI identifies objection patterns and provides proven rebuttals that top performers use to close deals.',
  },
  {
    icon: Users,
    title: 'Team Analytics',
    description: 'See how your team performs, identify coaching opportunities, and replicate what your best reps do.',
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-24 md:py-32 bg-features-gradient overflow-hidden" id="features">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Platform Features</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
            Everything You Need to <span className="gradient-text">Win More Deals</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A complete AI sales coaching platform built for modern sales teams
          </p>
        </div>

        {/* Two-column layout: Features + Image */}
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="group"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Feature Image */}
          <div className="relative hidden lg:block">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={salesCallImage} 
                alt="Sales professional using SellSig" 
                className="w-full h-auto"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-2xl p-5 border border-border">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-foreground">AI Coaching Active</p>
                  <p className="text-sm text-muted-foreground">3 suggestions ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

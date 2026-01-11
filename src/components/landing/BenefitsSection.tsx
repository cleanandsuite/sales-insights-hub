import { TrendingUp, Zap, Target, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const benefits = [
  {
    icon: Target,
    stat: '90%',
    statLabel: 'cold calls rejected',
    title: 'Detect Objections Live',
    description: 'Our AI Sales Coach identifies objection patterns in real-time, giving you instant rebuttals that actually work.',
    highlight: 'Reduce rejection rate by 47%',
  },
  {
    icon: Zap,
    stat: '400%',
    statLabel: 'productivity lost to bad tools',
    title: 'Insights in 60 Seconds',
    description: 'No more wasting hours on manual call reviews. Get AI Coaching insights instantly after every call.',
    highlight: 'Save 8+ hours per week',
  },
  {
    icon: TrendingUp,
    stat: '20%',
    statLabel: 'average rep close rate',
    title: 'Top Users Hit 42%+',
    description: 'Our AI Sales Coaching platform helps reps double their close rates with personalized, data-driven guidance.',
    highlight: 'Double your close rate',
  },
  {
    icon: Clock,
    stat: '3-6mo',
    statLabel: 'typical Gong setup',
    title: 'Instant Browser Recording',
    description: 'Unlike competitors that take months to deploy, start using our AI Coach in under 60 seconds. No IT required.',
    highlight: 'Zero setup time',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 bg-muted/30" id="benefits">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Sales Teams Choose Our{' '}
            <span className="text-primary">AI Sales Coaching</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real problems. Real solutions. Real results with AI Coaching that works.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card rounded-lg"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-destructive">{benefit.stat}</span>
                      <span className="text-sm text-muted-foreground">{benefit.statLabel}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                      ✓ {benefit.highlight}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

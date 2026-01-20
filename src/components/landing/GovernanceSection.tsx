import { Brain, Link, BarChart2, CheckCircle, Sparkles } from 'lucide-react';

const differentiators = [
  {
    icon: Brain,
    title: 'AI + Human Touch',
    description: 'AI handles scale and data; executive coaches add context and mindset support.',
    gradient: 'from-primary/20 to-primary/5',
  },
  {
    icon: Link,
    title: 'Full Sales Process Integration',
    description: 'Connects calls to pipeline stages, CRM, and renewals—not just isolated analysis.',
    gradient: 'from-accent/20 to-accent/5',
  },
  {
    icon: BarChart2,
    title: 'Measurable Results',
    description: 'Track improvements in close rates, deal velocity, and forecast accuracy with clear dashboards.',
    gradient: 'from-success/20 to-success/5',
  },
];

export function GovernanceSection() {
  return (
    <section className="py-20 md:py-28 bg-section-glass relative overflow-hidden" id="governance">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Section badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your Unfair Advantage</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What Makes SellSig{' '}
            <span className="gradient-text">Different</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Unlike basic call recording tools or pure role-play bots, SellSig combines the best of AI coaching and human expertise
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {differentiators.map((item) => (
            <div 
              key={item.title}
              className="group bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-8 text-center hover:shadow-2xl hover:border-primary/30 transition-all duration-300"
            >
              <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                <item.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 rounded-2xl border border-primary/20 p-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-4 text-center">
            <CheckCircle className="h-6 w-6 text-success flex-shrink-0" />
            <p className="text-lg font-semibold text-foreground">
              Your unfair advantage in every sales call—AI coaching that actually works
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
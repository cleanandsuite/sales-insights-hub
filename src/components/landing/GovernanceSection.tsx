import { Brain, Link, BarChart2, CheckCircle } from 'lucide-react';

const differentiators = [
  {
    icon: Brain,
    title: 'AI + Human Touch',
    description: 'AI handles scale and data; executive coaches add context and mindset support.',
  },
  {
    icon: Link,
    title: 'Full Sales Process Integration',
    description: 'Connects calls to pipeline stages, CRM, and renewals—not just isolated analysis.',
  },
  {
    icon: BarChart2,
    title: 'Measurable Results',
    description: 'Track improvements in close rates, deal velocity, and forecast accuracy with clear dashboards.',
  },
];

export function GovernanceSection() {
  return (
    <section className="py-20 md:py-28 bg-background" id="governance">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What Makes SellSig{' '}
            <span className="gradient-text">Different</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Unlike basic call recording tools or pure role-play bots, SellSig combines the best of AI and human expertise
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {differentiators.map((item) => (
            <div 
              key={item.title}
              className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 text-center hover:shadow-xl hover:border-primary/30 transition-all duration-300"
            >
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 rounded-2xl border border-primary/20 p-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-4 text-center">
            <CheckCircle className="h-6 w-6 text-success flex-shrink-0" />
            <p className="text-foreground font-medium">
              Your unfair advantage in every sales call
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

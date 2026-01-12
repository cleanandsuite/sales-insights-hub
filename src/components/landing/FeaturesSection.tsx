import { Mic, Brain, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'One-Click Recording',
    description: 'Record calls with a single click. No complicated setup or integrations required.',
  },
  {
    icon: Brain,
    title: 'AI Analysis',
    description: 'Get instant insights on objection handling, talk ratios, and closing techniques.',
  },
  {
    icon: TrendingUp,
    title: 'Deal Intelligence',
    description: 'Auto-capture leads, track deal progress, and get AI-powered next steps.',
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-24 bg-features-gradient overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5">
            Why Sales Teams Choose <span className="text-primary">SellSig</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
            Everything you need to coach your team and close more deals
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="card-enterprise p-10 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
              <p className="text-muted-foreground text-lg">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

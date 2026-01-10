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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-foreground mb-4">Why Sales Teams Choose SellSig</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Everything you need to coach your team and close more deals
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="card-enterprise p-8 text-center hover:shadow-lg transition-shadow"
            >
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

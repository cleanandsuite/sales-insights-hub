import { Target, Clock, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const benefits = [
  {
    icon: Target,
    title: 'Lead Generation & Scoring',
    description: 'AI sales tools help with lead generation and scoring, so sales teams can target the right people, improve conversion, and focus on the most valuable prospects.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: BarChart3,
    title: 'Forecasting Accuracy',
    description: 'AI improves forecasting accuracy because AI sales tools analyze data from past deals, buyer behavior, and activity to predict future revenue with better precision.',
    color: 'bg-success/10 text-success',
  },
  {
    icon: Clock,
    title: 'Time Savings',
    description: 'AI sales tools reduce time spent on repetitive tasks, replace manual data entry, and streamline scheduling, email outreach, and report creation, which reduces cost per contact.',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: TrendingUp,
    title: 'Pricing & Cross-sell Decisions',
    description: 'AI-based sales analysis supports pricing, cross-sell, and up-sell decisions, so managers can show clear revenue impact and explain the benefits of each sales initiative.',
    color: 'bg-warning/10 text-warning',
  },
  {
    icon: Zap,
    title: 'Consistent Dashboards & Insights',
    description: 'AI sales tools deliver consistent dashboards, tailored insights, and driven recommendations that help sales managers adjust strategy and allocate resources with confidence.',
    color: 'bg-purple-100 text-purple-600',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 md:py-28 bg-background" id="benefits">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Key Benefits of AI for{' '}
            <span className="gradient-text">Sales Teams</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            The main benefits of using AI inside sales organizations are visible across prospecting, 
            engagement, and closing. Effective AI sales tools help sales teams achieve measurable results faster.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card 
              key={benefit.title}
              className="group hover:shadow-xl transition-all duration-300 border-border hover:border-primary/30"
            >
              <CardContent className="p-6">
                <div className={`h-14 w-14 rounded-xl ${benefit.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

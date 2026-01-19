import { TrendingUp, Target, Clock, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const metrics = [
  {
    icon: TrendingUp,
    stat: '+35%',
    title: 'Revenue Growth',
    description: 'Teams close bigger deals faster',
    gradient: 'from-success/20 to-success/5',
    color: 'text-success',
  },
  {
    icon: Target,
    stat: '95%',
    title: 'Forecast Accuracy',
    description: 'Data replaces gut feel',
    gradient: 'from-primary/20 to-primary/5',
    color: 'text-primary',
  },
  {
    icon: Clock,
    stat: '40%',
    title: 'Time Saved',
    description: 'Auto-summaries end manual reviews',
    gradient: 'from-accent/20 to-accent/5',
    color: 'text-accent',
  },
  {
    icon: Zap,
    stat: '2x',
    title: 'Deal Velocity',
    description: 'Better prep shortens cycles',
    gradient: 'from-warning/20 to-warning/5',
    color: 'text-warning',
  },
];

export function ROISection() {
  return (
    <section className="py-20 md:py-28 bg-section-aurora relative overflow-hidden" id="roi">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/3 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Real Results{' '}
            <span className="gradient-text">You Can Measure</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            AI coaching that delivers measurable impact on your sales performance
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <Card 
              key={metric.title}
              className="group hover:shadow-2xl transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/80 backdrop-blur-sm overflow-hidden"
            >
              <CardContent className="p-6 text-center relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center mx-auto mb-4`}>
                    <metric.icon className={`h-7 w-7 ${metric.color}`} />
                  </div>
                  <p className={`text-4xl font-bold ${metric.color} mb-2`}>{metric.stat}</p>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{metric.title}</h3>
                  <p className="text-sm text-muted-foreground">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

import { TrendingUp, Target, Clock, Zap, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ROISectionProps {
  onStartTrialClick?: () => void;
}

const metrics = [
  {
    icon: TrendingUp,
    stat: '+35%',
    title: 'Revenue Growth',
    description: 'Teams close bigger deals faster',
    gradient: 'from-success/20 to-success/5',
    color: 'text-green-700',
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
    color: 'text-teal-700',
  },
  {
    icon: Zap,
    stat: '2x',
    title: 'Deal Velocity',
    description: 'Better prep shortens cycles',
    gradient: 'from-warning/20 to-warning/5',
    color: 'text-amber-600',
  },
];

export function ROISection({ onStartTrialClick }: ROISectionProps) {
  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden" id="roi">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Section badge */}
          <div className="inline-flex items-center gap-2 bg-success/20 rounded-full px-4 py-2 mb-6">
            <Award className="h-4 w-4 text-green-700" />
            <span className="text-sm font-medium text-green-700">Proven Results</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Real Results{' '}
            <span className="gradient-text">You Can Measure</span>
          </h2>
          <p className="text-lg text-foreground/70">
            AI coaching for sales calls that delivers measurable impact on your sales performance
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
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <metric.icon className={`h-8 w-8 ${metric.color}`} />
                  </div>
                  <p className={`text-5xl font-extrabold ${metric.color} mb-2`}>{metric.stat}</p>
                  <h3 className="text-lg font-bold text-foreground mb-2">{metric.title}</h3>
                  <p className="text-sm text-muted-foreground">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Second CTA - mid-page */}
        {onStartTrialClick && (
          <div className="mt-16 text-center">
            <div className="inline-block bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 rounded-2xl border border-primary/20 p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to See These Results?
              </h3>
              <p className="text-muted-foreground mb-6">
                Join hundreds of sales teams already using AI coaching for their sales calls
              </p>
              <Button 
                size="lg" 
                onClick={onStartTrialClick}
                className="group gap-2 font-bold text-lg px-10 py-7 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl rounded-xl"
              >
                Claim Your Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
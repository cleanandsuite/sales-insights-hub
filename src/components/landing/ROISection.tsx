import { Clock, TrendingUp, Target, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const metrics = [
  {
    icon: Clock,
    title: 'Productivity Impact',
    description: 'Track how AI affects sales productivity, including time saved on manual tasks, data entry, and scheduling, and how this time is redirected toward high-value selling activities.',
    stat: '40%',
    statLabel: 'Time Saved',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: TrendingUp,
    title: 'Conversion Changes',
    description: 'Measure changes in conversion from lead to opportunity and from opportunity to closed deals, and use AI reports to identify which actions contributed most to improvement.',
    stat: '+25%',
    statLabel: 'Higher Conversion',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    icon: Target,
    title: 'Forecast Accuracy',
    description: 'Compare forecast accuracy before and after AI implementation to show how AI sales tools support better planning and inventory, staffing, and cash flow decisions.',
    stat: '95%',
    statLabel: 'Accuracy Rate',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: DollarSign,
    title: 'Deal Margin',
    description: 'Assess whether AI-driven pricing and offer guidance increases deal margin, average contract value, and lifetime value of customers.',
    stat: '+18%',
    statLabel: 'Margin Increase',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
];

export function ROISection() {
  return (
    <section className="py-20 md:py-28 bg-features-gradient" id="roi">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Measuring Results and{' '}
            <span className="text-primary">ROI of AI in Sales</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            To justify ongoing investment, leaders must connect AI sales tools directly to performance metrics, 
            costs, and revenue outcomes, using consistent reporting and analysis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {metrics.map((metric) => (
            <Card key={metric.title} className="group hover:shadow-xl transition-all border-border hover:border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-12 w-12 rounded-xl ${metric.bgColor} flex items-center justify-center`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${metric.color}`}>{metric.stat}</p>
                    <p className="text-xs text-muted-foreground">{metric.statLabel}</p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {metric.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-card rounded-xl border border-border p-6 max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground">
            When these indicators show consistent improvement, organizations can confidently expand AI 
            across more sales areas and continue to refine their powered sales models.
          </p>
        </div>
      </div>
    </section>
  );
}

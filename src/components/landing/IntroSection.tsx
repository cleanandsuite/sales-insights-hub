import { Database, TrendingUp, Target, Zap } from 'lucide-react';

export function IntroSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            AI Sales Tools: Data-Driven Platforms for{' '}
            <span className="gradient-text">Revenue Growth</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            AI-powered sales now helps sales teams move from manual, time-consuming tasks to data-driven, 
            digital selling. Our platform shows you how to use AI sales tools to optimize every stage of 
            the sales cycle and increase predictable revenue.
          </p>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            By combining AI, sales data, and modern tools in one platform, companies can analyze data, 
            track activity, forecast results, and turn complex information into accurate, real decisions 
            that directly support sales strategy and conversion.
          </p>
        </div>

        {/* Visual Icons Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          {[
            { icon: Database, label: 'Data Analysis', color: 'bg-primary/10 text-primary' },
            { icon: TrendingUp, label: 'Revenue Tracking', color: 'bg-success/10 text-success' },
            { icon: Target, label: 'Accurate Forecasts', color: 'bg-accent/10 text-accent' },
            { icon: Zap, label: 'Real-time Decisions', color: 'bg-warning/10 text-warning' },
          ].map((item, index) => (
            <div 
              key={item.label}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow"
            >
              <div className={`h-14 w-14 rounded-full ${item.color} flex items-center justify-center`}>
                <item.icon className="h-7 w-7" />
              </div>
              <span className="text-sm font-medium text-foreground text-center">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

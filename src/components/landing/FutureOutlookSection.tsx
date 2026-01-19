import { Sparkles, Phone, Brain } from 'lucide-react';

export function FutureOutlookSection() {
  return (
    <section className="py-20 md:py-28 bg-section-glass relative overflow-hidden" id="future">
      {/* Subtle aurora */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex h-16 w-16 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              The Future of{' '}
              <span className="text-primary">AI Coaching for Sales</span>
            </h2>
          </div>

          <div className="space-y-6 text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              As leaders engage with AI coaching that respects their time and intelligence, they see 
              development not as an obligation but as a strategic advantage. They bring sharper thinking 
              to each sale, stronger listening to each sales call, and more deliberate choices to every follow-up.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed">
              The business benefits from better decisions, stronger relationships, and a culture built 
              on continuous learning, reflective practice, and shared accountability.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">AI Coaching Evolves</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time negotiation guidance</li>
                <li>• Dynamic pricing optimization</li>
                <li>• Personalized learning journeys</li>
                <li>• Advanced predictive analytics</li>
              </ul>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-success" />
                </div>
                <h3 className="font-semibold text-foreground">Sales Calls Transform</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Every call becomes a learning moment</li>
                <li>• Consistent quality across teams</li>
                <li>• Faster ramp for new hires</li>
                <li>• Top performer insights for everyone</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/20 p-8 text-center">
            <p className="text-lg font-medium text-foreground">
              Organizations that combine disciplined strategy, high-quality data, and AI coaching 
              will capture new opportunities, strengthen customer relationships, and drive sustainable 
              revenue growth across changing markets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

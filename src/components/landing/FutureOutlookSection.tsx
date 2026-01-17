import { Sparkles, Rocket, Users } from 'lucide-react';

export function FutureOutlookSection() {
  return (
    <section className="py-20 md:py-28 bg-features-gradient" id="future">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex h-16 w-16 rounded-2xl bg-primary/10 items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Future Outlook for{' '}
              <span className="text-primary">AI in Sales</span>
            </h2>
          </div>

          <div className="space-y-6 text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              The role of AI in sales continues to expand as models become more advanced, data volumes grow, 
              and integrations across platforms deepen. Leaders who invest early gain a structural advantage.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Over the coming years, AI sales tools are expected to handle more complex tasks, such as 
              real-time negotiation guidance, dynamic pricing optimization, and fully personalized content 
              journeys across digital and human channels.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed">
              At the same time, human expertise in relationship building, strategic thinking, and creative 
              problem solving will remain central to sales success, with AI serving as an intelligence layer 
              that enhances, rather than replaces, the work of skilled sales professionals.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">AI Capabilities</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time negotiation guidance</li>
                <li>• Dynamic pricing optimization</li>
                <li>• Personalized content journeys</li>
                <li>• Advanced predictive analytics</li>
              </ul>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-success" />
                </div>
                <h3 className="font-semibold text-foreground">Human Expertise</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Relationship building</li>
                <li>• Strategic thinking</li>
                <li>• Creative problem solving</li>
                <li>• Complex negotiations</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-primary/5 rounded-xl border border-primary/20 p-8 text-center">
            <p className="text-lg font-medium text-foreground">
              Organizations that combine disciplined strategy, high-quality data, and carefully selected 
              AI sales tools will be positioned to capture new opportunities, strengthen customer relationships, 
              and drive sustainable revenue growth across changing markets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

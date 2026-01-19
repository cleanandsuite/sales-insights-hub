import { Brain, Headphones, BarChart2, MessageSquare, Users } from 'lucide-react';

export function WhatIsAISection() {
  const capabilities = [
    { icon: Headphones, label: 'Call Analysis' },
    { icon: MessageSquare, label: 'Live Prompts' },
    { icon: BarChart2, label: 'Performance Data' },
    { icon: Users, label: 'Team Insights' },
  ];

  return (
    <section className="py-20 md:py-28 bg-section-glass relative overflow-hidden" id="what-is-ai">
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              What AI Coaching Delivers for{' '}
              <span className="text-primary">Sales Calls</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our AI coaching platform combines human expertise and responsible AI to deliver programs 
              that align with your strategy. Leaders experience an integrated journey linking goals, 
              team metrics, and day-to-day customer interactions.
            </p>

            <p className="text-base text-muted-foreground leading-relaxed">
              At the core sits the AI coach that engages leaders in short, targeted dialogues. The 
              design draws on proven models, behavioral science, and real case data from thousands 
              of sales calls. Leaders explore scenarios, rehearse conversations, and stress-test 
              decisions in a confidential, always-available environment.
            </p>

            <p className="text-base text-muted-foreground leading-relaxed">
              To keep the experience deeply human, each senior leader is paired with an executive 
              coach who focuses on context, accountability, and deeper mindset work—blending the 
              reach of AI coaching with the nuance only experienced coaches provide.
            </p>
          </div>

          {/* Right - Integration Visualization with glass effect */}
          <div className="relative">
            <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 p-8 shadow-2xl glass-card">
              <div className="text-center mb-8">
                <div className="inline-flex h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 items-center justify-center mb-4">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">AI Coaching Engine</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Continuous analysis of your sales calls
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {capabilities.map((item) => (
                  <div 
                    key={item.label}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-secondary/80 to-secondary/40 hover:from-primary/10 hover:to-primary/5 transition-all duration-300"
                  >
                    <item.icon className="h-6 w-6 text-primary" />
                    <span className="text-xs font-medium text-foreground text-center">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Connection indicator */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span>Real-time sales call synchronization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

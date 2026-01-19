import { AlertTriangle, Eye, Clock, TrendingDown } from "lucide-react";

export function WhatIsAISection() {
  const problems = [
    { 
      icon: AlertTriangle, 
      text: "Traditional coaching (workshops, occasional 1:1s) gives good ideas—but real-world pressure makes it hard to apply them consistently." 
    },
    { 
      icon: Eye, 
      text: "Managers can't review every call manually, so patterns like missed buying signals or weak objection handling go unnoticed." 
    },
    { 
      icon: Clock, 
      text: "New reps take too long to ramp up, deals drag on, and teams miss revenue targets quarter after quarter." 
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-section-glass relative overflow-hidden" id="what-is-ai">
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-warning/5" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Sales Calls Need{" "}
              <span className="text-primary">AI Coaching</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              The problem with traditional sales training and coaching
            </p>
          </div>

          <div className="space-y-6">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:shadow-xl hover:border-destructive/30 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center flex-shrink-0">
                  <problem.icon className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-muted-foreground leading-relaxed pt-2">
                  {problem.text}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom indicator */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-destructive/10 rounded-full px-4 py-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">These gaps cost you deals every day</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

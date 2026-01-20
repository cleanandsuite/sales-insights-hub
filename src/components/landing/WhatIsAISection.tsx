import { AlertTriangle, Eye, Clock, TrendingDown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatIsAISectionProps {
  onStartTrialClick?: () => void;
}

export function WhatIsAISection({ onStartTrialClick }: WhatIsAISectionProps) {
  const problems = [
    { 
      icon: AlertTriangle, 
      title: "Coaching Doesn't Stick",
      text: "Traditional coaching (workshops, occasional 1:1s) gives good ideas—but real-world pressure makes it hard to apply them consistently." 
    },
    { 
      icon: Eye, 
      title: "Blind Spots Go Unnoticed",
      text: "Managers can't review every call manually, so patterns like missed buying signals or weak objection handling go unnoticed." 
    },
    { 
      icon: Clock, 
      title: "Slow Ramp, Missed Targets",
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
            {/* Question-style H2 for SEO */}
            <div className="inline-flex items-center gap-2 bg-destructive/10 rounded-full px-4 py-2 mb-6">
              <HelpCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">The Problem</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Tired of Losing Deals to{" "}
              <span className="text-destructive">Poor Objection Handling?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Why sales calls need AI coaching—and why traditional methods fall short
            </p>
          </div>

          <div className="space-y-6">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:shadow-xl hover:border-destructive/30 transition-all duration-300"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center flex-shrink-0">
                  <problem.icon className="h-7 w-7 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{problem.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {problem.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom indicator with CTA */}
          <div className="mt-12 text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-destructive/10 rounded-full px-4 py-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">These gaps cost you deals every day</span>
            </div>
            
            {onStartTrialClick && (
              <div>
                <Button 
                  size="lg" 
                  onClick={onStartTrialClick}
                  className="gap-2 font-bold text-base px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl rounded-xl"
                >
                  See How AI Coaching Fixes This
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
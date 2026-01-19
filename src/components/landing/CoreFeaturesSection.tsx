import { Phone, Brain, LineChart, Users, BarChart2, Shield } from "lucide-react";
const features = [
  {
    icon: Phone,
    title: "Sales Call Debriefs",
    description:
      "Capture quick reflections linked to deal stages. Generates concise summaries highlighting strengths and gaps helping managers review the sales call without rewatching full recordings.",
  },
  {
    icon: Brain,
    title: "Prompts and Ai coaching",
    description:
      "Just-in-time guidance before major negotiations. The AI coach asks you to outline objectives, anticipate objections, and test alternative strategies.",
  },
  {
    icon: LineChart,
    title: "Performance Analytics",
    description:
      "Compare call summaries across regions and roles. See how tone, pacing, and listening affect conversion rates over time and how these metrics relate to leads, close rates, and the health of the broader sales pipeline.",
  },
  {
    icon: Users,
    title: "Team Insights",
    description:
      "Tie conversation quality directly to deals closed. Point to concrete shifts in close rates and cycle time tied to specific behaviors defined as ai coaching benchmarks.",
  },
  {
    icon: BarChart2,
    title: "Behavior Libraries",
    description:
      "Reusable assets for sales calls, QBRs, and steering committees. Pull examples of strong value narratives and objection handling from top performers, building a practical script library that every coach and rep can access.",
  },
  {
    icon: Shield,
    title: "Privacy & Governance",
    description:
      "Data encryption, tight access controls, and clear terms respecting both company policies and individual privacy during digital sessions and call reviews.",
  },
];
export function CoreFeaturesSection() {
  return (
    <section className="py-20 md:py-28 bg-section-glass relative overflow-hidden" id="features">
      {/* Subtle aurora background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />

     import React from 'react';

function Features() {
  return (
    <div className="container mx-auto px-4 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
          Core Features For The
          <span className="text-primary"> AI Coaching Program & Sales Calls</span>
        </h2>
      </div>
    </div>
  );
}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:shadow-2xl hover:border-primary/30 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Search, Zap, TrendingUp, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: Search,
    title: "Analyzes Every Sales Call Automatically",
    description:
      "Our intelligent engine reviews recordings, notes, and CRM updates to spot what works and what doesn't—without you watching hours of video.",
    color: "from-primary to-primary/80",
  },
  {
    number: "2",
    icon: Zap,
    title: "Delivers Real-Time and Just-in-Time Guidance",
    points: [
      "Before a big call: Get quick AI prompts to prepare objections, set goals, and plan your approach.",
      "During/after: Receive instant feedback on tone, listening, and next steps—while details are fresh.",
    ],
    color: "from-accent to-accent/80",
  },
  {
    number: "3",
    icon: TrendingUp,
    title: "Builds Better Habits and Team Performance",
    description:
      "Link call quality directly to deals won. Share top-performer examples, set clear standards for discovery/demos/pricing, and track improvements in close rates, deal speed, and forecast accuracy.",
    color: "from-success to-success/80",
  },
];

export function CoreFeaturesSection() {
  return (
    <section className="py-20 md:py-28 bg-section-glass relative overflow-hidden" id="features">
      {/* Subtle aurora background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            How SellSig's AI Coaching
            <span className="text-primary"> Fixes These Pain Points</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            The simple 1-2-3 solution to transform your sales calls
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 md:p-8 hover:shadow-2xl hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                {/* Step number */}
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <step.icon className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  </div>
                  
                  {step.description && (
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  )}
                  
                  {step.points && (
                    <ul className="space-y-3 mt-2">
                      {step.points.map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

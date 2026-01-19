import { Brain, Phone, TrendingUp, Zap } from "lucide-react";
export function IntroSection() {
  return (
    <section className="py-20 md:py-28 bg-section-aurora relative overflow-hidden">
      {/* Subtle mesh background */}
      <div className="absolute inset-0 bg-mesh-subtle opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Why Every Sales Conversations
            <span className="gradient-text">Need AI Coaching</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Senior leaders navigate complex deals and high-stakes customer interactions, yet traditional development
            support often fails to keep pace. Workshops and occasional coaching sessions create insight, but impact
            fades once people return to real pressure and real sales calls.
          </p>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            This is exactly where AI-driven guidance, where ai coaches operate in real time, thransforms customer calls.
            Instead of sporadic meetings, equip every team member with continuous, data-based guidance that adapts to
            their role and current pipeline—delivering stronger performance and measurable business outcomes.
          </p>
        </div>

        {/* Visual Icons Grid with glass effect */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          {[
            {
              icon: Brain,
              label: "AI Coaching",
              color: "from-primary/20 to-primary/5",
            },
            {
              icon: Phone,
              label: "Sales Calls",
              color: "from-success/20 to-success/5",
            },
            {
              icon: TrendingUp,
              label: "Growth Metrics",
              color: "from-accent/20 to-accent/5",
            },
            {
              icon: Zap,
              label: "Real-time Feedback",
              color: "from-warning/20 to-warning/5",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:shadow-xl hover:border-primary/30 transition-all duration-300 glass-card-subtle"
            >
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                <item.icon className="h-7 w-7 text-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground text-center">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

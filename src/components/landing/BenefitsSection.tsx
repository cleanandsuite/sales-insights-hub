import { Phone, Rocket, BarChart3, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Phone,
    title: "Better Customer Calls",
    description:
      "Catch buying signals, understand pain points, and handle objections like top reps. Every sales call becomes a learning opportunity.",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Rocket,
    title: "Faster Ramp for New Hires",
    description:
      "Guided practice and AI coaching turns rookies into closers quicker. Reduce time-to-productivity by weeks, not months.",
    gradient: "from-success/20 to-success/5",
  },
  {
    icon: BarChart3,
    title: "Smarter Managers",
    description:
      "Get team insights and patterns across hundreds of sales calls—no more guessing where to coach. Data-driven decisions, not gut feel.",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Full encryption, strict controls, and human oversight—AI suggests, you decide. Your data stays secure and compliant.",
    gradient: "from-warning/20 to-warning/5",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 md:py-28 bg-background relative" id="benefits">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Core Benefits
            <span className="gradient-text"> Your Team Gets</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            AI coaching that transforms how your team approaches every sales call—from preparation to close.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={benefit.title}
                className="group hover:shadow-2xl transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/80 backdrop-blur-sm overflow-hidden"
              >
                <CardContent className="p-6 relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <div className="relative z-10">
                    <div
                      className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-7 w-7 text-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{benefit.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { Phone, Brain, TrendingUp, Target, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
const benefits = [{
  icon: Phone,
  title: "Better Client Calls",
  description: "The platform analyzes conversation data, meeting notes, and CRM updates to highlight patterns. Track how often reps truly understand prospects and where they miss buying signals.",
  gradient: "from-primary/20 to-primary/5"
}, {
  icon: Brain,
  title: "Analyzed Sales Conversation",
  description: "Before high-stakes meetings, short prompts help prepare for objections and clarify outcomes. Afterward, leaders debrief calls in minutes while interactions are still fresh.",
  gradient: "from-success/20 to-success/5"
}, {
  icon: TrendingUp,
  title: "Quality Standards",
  description: 'Define what "good" looks like for discovery, demos, and pricing discussions. Link those standards to observation tools and insights across all sales calls.',
  gradient: "from-accent/20 to-accent/5"
}, {
  icon: Target,
  title: "Pattern Recognition",
  description: "Aggregate trends across hundreds of sales calls weekly, surfacing which behaviors reliably lead to stronger outcomes—like when manager involvement accelerates deals.",
  gradient: "from-warning/20 to-warning/5"
}, {
  icon: Clock,
  title: "Continuous Improvement",
  description: "Structure every call review for learning. Generate concise summaries highlighting strengths, gaps, and opportunities without overwhelming users with noise.",
  gradient: "from-purple-500/20 to-purple-500/5"
}];
export function BenefitsSection() {
  return <section className="py-20 md:py-28 bg-background relative" id="benefits">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">How AI Coaching Elevates
How AI Coaching Elevates   Sales Call Quality Sales Call Quality<span className="gradient-text">Sales Call Quality</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Revenue leaders ask how the system improves what happens across sales calls. Our platform delivers insights
            you'd struggle to see manually, turning every interaction into a catalyst for growth and a clear example of
            a sales call done well.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map(benefit => <Card key={benefit.title} className="group hover:shadow-2xl transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6 relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <benefit.icon className="h-7 w-7 text-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </section>;
}
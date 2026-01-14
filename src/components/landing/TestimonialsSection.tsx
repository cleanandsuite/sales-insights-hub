import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Shield, Lock } from 'lucide-react';

const testimonials = [
  {
    quote: "We closed 40% more deals within 2 months of using SellSig. The instant feedback is game-changing.",
    author: "Sarah Chen",
    role: "VP of Sales",
    company: "TechFlow Inc.",
    avatar: "SC",
  },
  {
    quote: "Finally, a Gong alternative that doesn't require a PhD to set up. My team was productive in minutes.",
    author: "Marcus Johnson",
    role: "Sales Director",
    company: "CloudScale",
    avatar: "MJ",
  },
  {
    quote: "The AI coaching suggestions helped our junior reps perform like veterans. ROI was immediate.",
    author: "Emily Rodriguez",
    role: "Head of Revenue",
    company: "DataSync Pro",
    avatar: "ER",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-20 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by <span className="text-primary">Sales Reps</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            See what top-performing sales professionals are saying
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="bg-card rounded-lg border border-border shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6 pb-6 px-6">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground text-base mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <div className="flex items-center gap-3 px-5 py-3 bg-card rounded-lg border border-border shadow-sm">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">GDPR Compliant</p>
              <p className="text-xs text-muted-foreground">EU Data Protection</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 bg-card rounded-lg border border-border shadow-sm">
            <Lock className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">256-bit Encryption</p>
              <p className="text-xs text-muted-foreground">Bank-level Security</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 bg-card rounded-lg border border-border shadow-sm">
            <Badge variant="outline" className="text-xs font-medium">SOC 2 Type II</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}

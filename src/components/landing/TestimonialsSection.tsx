import { Card, CardContent } from '@/components/ui/card';
import { Star, Shield, Lock, Award } from 'lucide-react';
import testimonial1 from '@/assets/testimonial-1.jpg';
import testimonial2 from '@/assets/testimonial-2.jpg';
import testimonial3 from '@/assets/testimonial-3.jpg';

const testimonials = [
  {
    quote: "We closed 40% more deals within 2 months of using SellSig. The instant feedback during calls is an absolute game-changer for our team.",
    author: "Sarah Chen",
    role: "VP of Sales",
    company: "TechFlow Inc.",
    image: testimonial1,
    metric: "+40% close rate"
  },
  {
    quote: "Finally, a Gong alternative that doesn't require months to set up. My team was productive in minutes, not weeks.",
    author: "Marcus Johnson",
    role: "Sales Director",
    company: "CloudScale",
    image: testimonial2,
    metric: "60-second setup"
  },
  {
    quote: "The AI coaching suggestions helped our junior reps perform like veterans. The ROI was immediate and measurable.",
    author: "Emily Rodriguez",
    role: "Head of Revenue",
    company: "DataSync Pro",
    image: testimonial3,
    metric: "2x rep performance"
  },
];

const logos = ['Acme Corp', 'TechFlow', 'CloudScale', 'DataSync', 'RevHub', 'SalesForge'];

export function TestimonialsSection() {
  return (
    <section className="relative py-24 md:py-32 bg-testimonials-gradient overflow-hidden" id="testimonials">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">Customer Success</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
            Trusted by <span className="gradient-text">10,000+</span> Sales Professionals
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            See how sales teams are crushing their quotas with AI-powered coaching
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="bg-card rounded-2xl border border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <CardContent className="p-0">
                {/* Metric badge */}
                <div className="bg-primary/5 px-6 py-3 border-b border-border">
                  <span className="text-primary font-bold text-sm">{testimonial.metric}</span>
                </div>
                
                <div className="p-6">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-foreground text-base mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.author}
                      className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security Badges */}
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6 font-medium uppercase tracking-wider">
            Enterprise-Grade Security
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border shadow-md">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">GDPR Compliant</p>
                <p className="text-xs text-muted-foreground">EU Data Protection</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border shadow-md">
              <Lock className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">256-bit Encryption</p>
                <p className="text-xs text-muted-foreground">Bank-level Security</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border shadow-md">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">SOC 2 Type II</p>
                <p className="text-xs text-muted-foreground">Certified Compliant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

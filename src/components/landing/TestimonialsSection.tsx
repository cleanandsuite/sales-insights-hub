import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

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
    <section className="relative py-24 bg-testimonials-gradient overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5">
            Loved by <span className="text-primary">Sales Teams</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
            See what top-performing teams are saying
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="card-enterprise hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-8 pb-8 px-8">
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground text-lg mb-8 leading-relaxed font-medium">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-base">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

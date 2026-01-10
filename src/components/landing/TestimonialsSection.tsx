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
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-foreground mb-4">Loved by Sales Teams</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            See what top-performing teams are saying
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="card-enterprise">
              <CardContent className="pt-6">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">
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

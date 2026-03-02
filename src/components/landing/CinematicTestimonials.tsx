import { Star } from 'lucide-react';
import { useScrollReveal } from './gsap/useGSAPAnimations';

const testimonials = [
  {
    quote: "SellSig added $340K in extra revenue per rep in the first quarter. The live coaching alone paid for the entire platform in week one.",
    name: "Marcus Chen",
    role: "VP Sales, NovaTech",
    stars: 5,
  },
  {
    quote: "Our win rate jumped 38% in 90 days. Reps stopped guessing what to say and started closing with confidence.",
    name: "Sarah Williams",
    role: "Sales Director, Apex Group",
    stars: 5,
  },
  {
    quote: "We replaced Gong, our dialer, and two coaching tools with SellSig. One platform, half the cost, twice the insight.",
    name: "James Park",
    role: "CRO, Fieldlink",
    stars: 5,
  },
];

export function CinematicTestimonials() {
  const revealRef = useScrollReveal();

  return (
    <section ref={revealRef} className="py-28 px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[radial-gradient(circle,hsl(var(--cin-teal)/0.04),transparent_70%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16" data-reveal>
          <span className="text-[11px] font-mono uppercase tracking-[.2em] text-[hsl(var(--cin-teal))] mb-4 block">
            Results
          </span>
          <h2 className="text-[clamp(32px,4vw,48px)] font-bold tracking-[-1.5px] leading-[1.1] text-white">
            Teams That Switched<br />
            <span className="italic text-white/60">Never Went Back.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6" data-reveal>
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 flex flex-col hover:bg-white/[0.06] transition-colors duration-300"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-white/70 leading-relaxed flex-1 mb-6">"{t.quote}"</p>
              <div>
                <div className="text-sm font-semibold text-white">{t.name}</div>
                <div className="text-xs text-white/40">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

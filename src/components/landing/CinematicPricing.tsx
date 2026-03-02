import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const tiers = [
  {
    name: 'Starter Plan',
    price: '$99',
    period: '/mo',
    desc: 'For individual reps ready to level up.',
    features: ['Unlimited call recording', 'AI call scoring', 'Post-call summaries', 'Basic coaching insights', 'Email support'],
    highlighted: false,
    cta: 'Start Free Trial',
  },
  {
    name: 'Pro Small Business',
    price: '$250',
    period: '/mo',
    desc: 'For teams that want to dominate quota.',
    features: ['Everything in Essential', 'Real-time whisper coaching', 'Live sentiment analysis', 'Team leaderboard & analytics', 'Coach style customization', 'Priority support'],
    highlighted: true,
    cta: 'Book a Demo',
  },
  {
    name: 'Enterprise Plan',
    price: 'Custom',
    period: '',
    desc: 'For organizations scaling revenue intelligence.',
    features: ['Everything in Performance', 'SSO & advanced security', 'Custom integrations', 'Dedicated success manager', 'SLA guarantee', 'Unlimited seats'],
    highlighted: false,
    cta: 'Contact Sales',
  },
];

interface CinematicPricingProps {
  onStartTrialClick: () => void;
}

export function CinematicPricing({ onStartTrialClick }: CinematicPricingProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const cards = sectionRef.current?.querySelectorAll('[data-pricing-card]');
      cards?.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: i * 0.15,
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="bg-[hsl(var(--cin-bg))] py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[hsl(var(--cin-teal))] text-xs font-mono uppercase tracking-[0.2em] mb-4">Pricing</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
            Invest in every conversation.
          </h2>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual ? 'bg-[hsl(var(--cin-teal))] text-[hsl(var(--cin-bg))]' : 'text-white/50'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${annual ? 'bg-[hsl(var(--cin-teal))] text-[hsl(var(--cin-bg))]' : 'text-white/50'}`}
            >
              Annual <span className="text-xs opacity-70">(-20%)</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <div
              key={i}
              data-pricing-card
              className={`rounded-[2rem] p-8 flex flex-col transition-all duration-500 ${
                tier.highlighted
                  ? 'bg-[hsl(var(--cin-teal))]/10 border-2 border-[hsl(var(--cin-teal))]/30 scale-[1.02] ring-1 ring-[hsl(var(--cin-teal))]/20'
                  : 'bg-white/[0.03] border border-white/[0.08]'
              }`}
            >
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-1 ${tier.highlighted ? 'text-[hsl(var(--cin-teal))]' : 'text-white'}`}>
                  {tier.name}
                </h3>
                <p className="text-white/40 text-sm">{tier.desc}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  {tier.price === 'Custom' ? tier.price : (annual ? `$${Math.round(parseInt(tier.price.slice(1)) * 0.8)}` : tier.price)}
                </span>
                {tier.period && <span className="text-white/40 text-base">{tier.period}</span>}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-white/60 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.highlighted ? 'text-[hsl(var(--cin-teal))]' : 'text-white/30'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={onStartTrialClick}
                className={`magnetic-btn w-full py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 ${
                  tier.highlighted
                    ? 'bg-[hsl(var(--cin-teal))] text-[hsl(var(--cin-bg))]'
                    : 'border border-white/[0.15] text-white hover:bg-white/[0.05]'
                }`}
              >
                {tier.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-sm mt-8">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
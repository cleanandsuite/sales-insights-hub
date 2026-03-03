import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const tiers = [
  {
    name: 'Starter Plan',
    originalPrice: '$129',
    price: '$79',
    period: '/mo',
    desc: 'For individual reps ready to level up.',
    promo: true,
    promoLabel: '🔥 Limited Time! Only 17 seats left',
    features: [
      '1,500 call minutes/month',
      '⚡ +1,000 bonus minutes (promo)',
      'Dedicated US business phone number',
      'Unlimited AI call scripts (limited time)',
      'Call recording & transcription',
      'Basic post-call scoring',
      'Real-time live coaching',
      'Basic team sharing (link-based)',
      'Export to PDF/CSV',
      'Email support (48-hr SLA)',
    ],
    highlighted: false,
    premium: false,
    cta: 'Start Free Trial',
  },
  {
    name: 'Pro Small Business',
    price: '$250',
    period: '/mo',
    desc: 'For growing teams — real-time coaching + team visibility that actually improves win rates.',
    promo: true,
    promoLabel: '⚡ First 30 days: +5,000 bonus minutes included',
    subheadline: '📞 Dedicated Business Phone Line · 15,000 min · 5 users · 99.9% uptime',
    features: [
      '5 user seats',
      'Dedicated US business phone number',
      '15,000 call minutes/month',
      'Unlimited script generation',
      'Live emotion & sentiment detection',
      'Real-time objection coaching',
      'Full 40-dimension call scoring',
      'Team management dashboard',
      'Rank & stats leaderboard',
      'Role-based access (manager vs. rep)',
      'Custom script templates (team library)',
      'Priority support (24-hr SLA + chat)',
      '🔗 CRM Sync: Salesforce & HubSpot — coming soon',
    ],
    highlighted: true,
    premium: false,
    cta: 'Book a Demo',
  },
  {
    name: 'Enterprise Plan',
    price: 'Custom',
    period: '',
    desc: 'Tailored for scaling revenue organizations. Advanced performance transparency, accelerated team development, and maximum coaching flexibility.',
    features: [
      'Everything in Pro, plus:',
      'Custom business-specific AI',
      'Gamified Performance Ranking System',
      '5 Distinct Elite AI Coaching Systems',
      'Full-Transparency Management Dashboard',
      'Dedicated Account Specialist',
      'Priority 24/7 response SLA',
      'Quarterly business reviews',
      'Custom integrations',
      'Flexible seat scaling',
    ],
    highlighted: false,
    premium: true,
    cta: '📞 Contact Sales',
    ctaSub: 'Request a personalized demo →',
  },
];

const PAYMENT_LINKS = {
  starter: 'https://buy.stripe.com/cNibJ0a5Oc4n8664TI9k402',
  pro: 'https://buy.stripe.com/3cIeVcb9S9WfgCCae29k403',
};

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

  const getCardClasses = (tier: typeof tiers[number]) => {
    const base = 'rounded-[2rem] p-8 flex flex-col transition-all duration-300 cursor-pointer hover:scale-[1.03] hover:-translate-y-1 border';

    if (tier.premium) {
      return `${base} bg-gradient-to-b from-[#1a1a2e] to-[#16213e] border-white/[0.12] shadow-[0_0_40px_rgba(251,191,36,0.08)] hover:shadow-[0_0_60px_rgba(251,191,36,0.15)]`;
    }
    if (tier.highlighted) {
      return `${base} bg-[hsl(var(--cin-teal))]/10 border-2 border-[hsl(var(--cin-teal))]/30 scale-[1.02] ring-1 ring-[hsl(var(--cin-teal))]/20 hover:bg-[hsl(var(--cin-teal))]/15`;
    }
    if (tier.promo && !tier.highlighted) {
      return `${base} bg-white/[0.03] border-[hsl(var(--cin-teal))]/20 shadow-[0_0_30px_rgba(20,184,166,0.08)] hover:bg-white/[0.06] hover:shadow-[0_0_40px_rgba(20,184,166,0.15)]`;
    }
    return `${base} bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]`;
  };

  return (
    <section id="pricing" ref={sectionRef} className="bg-[hsl(var(--cin-bg))] py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[hsl(var(--cin-teal))] text-xs font-mono uppercase tracking-[0.2em] mb-4">Pricing</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
            Invest in every conversation.
          </h2>

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
              Annual <span className="text-xs opacity-70">(Save 20%)</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <div key={i} data-pricing-card className={getCardClasses(tier)}>
              {/* Starter "Best Value" ribbon */}
              {tier.promo && !tier.highlighted && !tier.premium && (
                <div className="flex items-center gap-1.5 mb-4">
                  <Sparkles className="w-4 h-4 text-[hsl(var(--cin-teal))]" />
                  <span className="text-[hsl(var(--cin-teal))] text-xs font-bold uppercase tracking-wider">Best Value</span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${
                  tier.premium
                    ? 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent'
                    : tier.highlighted
                      ? 'text-[hsl(var(--cin-teal))]'
                      : 'text-white'
                }`}>
                  {tier.name}
                </h3>
                <p className={`text-base ${tier.premium ? 'text-white/50' : 'text-white/40'}`}>{tier.desc}</p>
                {'subheadline' in tier && tier.subheadline && (
                  <p className="text-white/50 text-xs mt-2 font-medium">{tier.subheadline}</p>
                )}
              </div>

              {'promo' in tier && tier.promo && 'promoLabel' in tier && (
                <div className="mb-3">
                  <span className="inline-block bg-[hsl(var(--cin-teal))]/10 border border-[hsl(var(--cin-teal))]/20 text-[hsl(var(--cin-teal))] text-xs font-bold px-3 py-1 rounded-full">
                    {tier.promoLabel}
                  </span>
                </div>
              )}

              <div className="mb-6">
                {'originalPrice' in tier && tier.originalPrice && !tier.highlighted && (
                  <span className="text-xl text-white/30 line-through mr-2">
                    {tier.originalPrice}
                  </span>
                )}
                <span className={`text-4xl font-bold ${tier.premium ? 'text-gray-200' : 'text-white'}`}>
                  {tier.price === 'Custom' 
                    ? tier.price 
                    : tier.highlighted && annual 
                      ? '$200' 
                      : tier.price}
                </span>
                {tier.period && <span className="text-white/40 text-base">{tier.period}</span>}
                {tier.highlighted && annual && (
                  <p className="text-[10px] text-[hsl(var(--cin-teal))] mt-1 font-semibold uppercase tracking-wider">🔒 Save 20% — locked in at annual rate</p>
                )}
                {tier.premium && (
                  <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">Minimum 10 seats · Custom pricing & contract terms</p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-white/60 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      tier.premium ? 'text-amber-400' : tier.highlighted ? 'text-[hsl(var(--cin-teal))]' : 'text-white/30'
                    }`} />
                    {f}
                  </li>
                ))}
              </ul>

              <div>
                <button
                  onClick={() => {
                    if (tier.premium) {
                      onStartTrialClick();
                    } else if (tier.highlighted) {
                      window.open(PAYMENT_LINKS.pro, '_blank');
                    } else {
                      window.open(PAYMENT_LINKS.starter, '_blank');
                    }
                  }}
                  className={`magnetic-btn w-full py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    tier.premium
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:from-amber-400 hover:to-yellow-500'
                      : tier.highlighted
                        ? 'bg-[hsl(var(--cin-teal))] text-[hsl(var(--cin-bg))]'
                        : 'border border-white/[0.15] text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {tier.cta} <ArrowRight className="w-4 h-4" />
                </button>
                {'ctaSub' in tier && tier.ctaSub && (
                  <p className="text-center text-white/30 text-xs mt-2">{tier.ctaSub}</p>
                )}
              </div>
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

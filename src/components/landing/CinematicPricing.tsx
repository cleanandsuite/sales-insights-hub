import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, ArrowRight, Sparkles, Shield } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const tiers = [
  {
    name: 'Starter',
    originalPrice: '$129',
    price: '$79.99',
    annualPrice: '$63.99',
    period: '/mo',
    desc: 'For individual reps ready to level up.',
    promo: true,
    promoLabel: '🔥 Limited Time — Only 17 seats left',
    features: [
      '1,500 call minutes/month',
      '⚡ +1,000 bonus minutes (promo)',
      'Dedicated US business phone number',
      'Unlimited AI call scripts',
      'Call recording & transcription',
      'Basic post-call scoring',
      'Real-time live coaching',
      'Export to PDF/CSV',
      'Email support (48-hr SLA)',
    ],
    highlighted: false,
    premium: false,
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$250',
    annualPrice: '$200',
    period: '/mo',
    desc: 'For growing teams — coaching + analytics that improve win rates.',
    promo: true,
    promoLabel: '⚡ First 30 days: +5,000 bonus minutes',
    subheadline: '📞 15,000 min · 5 seats · 99.9% uptime',
    features: [
      '5 user seats included',
      'Dedicated US business phone number',
      '15,000 call minutes/month',
      'Unlimited script generation',
      'Live emotion & sentiment detection',
      'Real-time objection coaching',
      'Full 40-dimension call scoring',
      'Team management dashboard',
      'Rank & stats leaderboard',
      'Role-based access control',
      'Priority support (24-hr SLA)',
    ],
    highlighted: true,
    premium: false,
    cta: 'Get Started',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    annualPrice: 'Custom',
    period: '',
    desc: 'For scaling revenue orgs. Maximum coaching power & flexibility.',
    features: [
      'Everything in Pro, plus:',
      'Custom business-specific AI',
      'Gamified Performance Ranking',
      '5 Elite AI Coaching Systems',
      'Full-Transparency Manager Dashboard',
      'Dedicated Account Specialist',
      'Priority 24/7 support SLA',
      'Quarterly business reviews',
      'Custom integrations',
      'Flexible seat scaling',
    ],
    highlighted: false,
    premium: true,
    cta: 'Talk to Sales',
    ctaSub: 'Get a personalized demo →',
  },
];

interface CinematicPricingProps {
  onStartTrialClick: (plan?: 'single_user' | 'team') => void;
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
    const base = 'rounded-[2rem] p-8 flex flex-col transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:-translate-y-1 border';
    if (tier.premium) {
      return `${base} bg-gradient-to-b from-[#1a1a2e] to-[#16213e] border-white/[0.12] shadow-[0_0_40px_rgba(251,191,36,0.08)]`;
    }
    if (tier.highlighted) {
      return `${base} bg-[hsl(var(--cin-teal))]/10 border-2 border-[hsl(var(--cin-teal))]/30 scale-[1.02] ring-1 ring-[hsl(var(--cin-teal))]/20`;
    }
    return `${base} bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]`;
  };

  return (
    <section id="pricing" ref={sectionRef} className="bg-[hsl(var(--cin-bg))] py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[hsl(var(--cin-teal))] text-xs font-mono uppercase tracking-[0.2em] mb-4">Pricing</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Invest in every conversation.
          </h2>
          <p className="text-white/40 text-base max-w-md mx-auto mb-8">
            No long-term contracts. Cancel anytime.
          </p>

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
              {/* Most Popular badge for Pro */}
              {tier.highlighted && (
                <div className="flex items-center gap-1.5 mb-4">
                  <Sparkles className="w-4 h-4 text-[hsl(var(--cin-teal))]" />
                  <span className="text-[hsl(var(--cin-teal))] text-xs font-bold uppercase tracking-wider">Most Popular</span>
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
                <p className="text-white/40 text-sm">{tier.desc}</p>
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
                {'originalPrice' in tier && tier.originalPrice && !annual && (
                  <span className="text-xl text-white/30 line-through mr-2">
                    {tier.originalPrice}
                  </span>
                )}
                <span className={`text-4xl font-bold ${tier.premium ? 'text-gray-200' : 'text-white'}`}>
                  {tier.price === 'Custom' ? tier.price : annual ? tier.annualPrice : tier.price}
                </span>
                {tier.period && <span className="text-white/40 text-base">{tier.period}</span>}
                {annual && tier.price !== 'Custom' && (
                  <p className="text-[10px] text-[hsl(var(--cin-teal))] mt-1 font-semibold uppercase tracking-wider">
                    Save 20% — billed annually
                  </p>
                )}
                {tier.premium && (
                  <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">10+ seats · Custom terms</p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-white/60 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      tier.premium ? 'text-amber-400' : 'text-[hsl(var(--cin-teal))]'
                    }`} />
                    {f}
                  </li>
                ))}
              </ul>

              <div>
                <button
                  onClick={() => {
                    if (tier.premium) {
                      // Enterprise: scroll to contact or open mailto
                      window.location.href = 'mailto:sales@sellsig.com?subject=Enterprise%20Inquiry';
                    } else if (tier.highlighted) {
                      onStartTrialClick('team');
                    } else {
                      onStartTrialClick('single_user');
                    }
                  }}
                  className={`magnetic-btn w-full py-3.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    tier.premium
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:from-amber-400 hover:to-yellow-500'
                      : tier.highlighted
                        ? 'bg-[hsl(var(--cin-teal))] text-[hsl(var(--cin-bg))]'
                        : 'bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/[0.12]'
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

        {/* Trust bar */}
        <div className="flex items-center justify-center gap-6 mt-10 text-white/25 text-xs">
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> 256-bit encryption</span>
          <span>·</span>
          <span>Cancel anytime</span>
          <span>·</span>
          <span>No long-term contracts</span>
        </div>
      </div>
    </section>
  );
}

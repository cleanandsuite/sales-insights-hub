import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useScrollReveal, useCountUp } from '../gsap/useGSAPAnimations';
import { ArrowRight, Check, Star, Shield, Clock, AlertTriangle, Users, TrendingUp, Zap, Quote } from 'lucide-react';
import { gsap } from 'gsap';

const testimonials = [
  {
    quote: "AI coaching turned my sales calls from disasters into dominance. Last month I closed $287K — more than the previous quarter combined.",
    author: "Marcus T.",
    role: "Enterprise AE",
    avatar: "MT",
    revenue: "+$287K",
  },
  {
    quote: "The AI coaching caught an objection on my calls I would've fumbled. That single whisper saved a $45K deal.",
    author: "Sarah L.",
    role: "SDR Team Lead",
    avatar: "SL",
    revenue: "+$45K saved",
  },
  {
    quote: "I was terrified of sales calls. Now I look forward to them. AI coaching rewired my brain for sales.",
    author: "David K.",
    role: "Startup Founder",
    avatar: "DK",
    revenue: "3x close rate",
  },
];

const beforeAfter = [
  { before: "Fumbling objections on calls", after: "Destroying objections with AI coaching" },
  { before: "Losing deals to 'I'll think about it'", after: "Closing sales on the first call" },
  { before: "Praying for luck on sales calls", after: "AI coaching commands every conversation" },
  { before: "Guessing what to say next", after: "AI coaching feeds you perfect responses" },
];

interface CloseSequenceProps {
  onClaimRedemption: () => void;
}

export function CloseSequence({ onClaimRedemption }: CloseSequenceProps) {
  const revealRef = useScrollReveal();
  const ctaWrapperRef = useRef<HTMLDivElement>(null);
  const revenueRef = useCountUp(4200000, 2.5);
  const callsRef = useCountUp(2847, 2);
  const spotsRef = useCountUp(97, 1.5);

  // Pulsing glow effect on wrapper div instead of button
  useEffect(() => {
    if (!ctaWrapperRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ctaWrapperRef.current, {
        boxShadow: '0 0 60px 10px rgba(16, 185, 129, 0.5)',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, ctaWrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Urgency overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(239,68,68,0.1)_0%,transparent_50%)] pointer-events-none" />

      <div ref={revealRef} className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">

          {/* STEP 1: Pain Peak + Final Confession */}
          <div data-reveal className="text-center mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold mb-6">
              <AlertTriangle className="w-4 h-4" />
              Final Question About Your Sales Calls
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
              How Many More{' '}
              <span className="text-red-400">Sales Calls</span>{' '}
              Will You Fumble Before You Act?
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Every day without AI coaching costs you sales deals. Every week without guidance 
              costs you thousands. The confession is over. The choice for AI coaching is now.
            </p>
          </div>

          {/* STEP 2: Proof Avalanche */}
          <div data-reveal className="mb-20">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              📊 The Proof (From Real Closers)
            </h3>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-3xl md:text-4xl font-black text-emerald-400">
                  $<span ref={revenueRef}>0</span>
                </p>
                <p className="text-sm text-white/50 mt-1">Revenue Recovered</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-3xl md:text-4xl font-black text-white">
                  <span ref={callsRef}>0</span>+
                </p>
                <p className="text-sm text-white/50 mt-1">Calls Saved</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-3xl md:text-4xl font-black text-amber-400">
                  <span ref={spotsRef}>0</span>
                </p>
                <p className="text-sm text-white/50 mt-1">Spots Remaining</p>
              </div>
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {testimonials.map((t, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <Quote className="w-8 h-8 text-emerald-400/40" />
                  <p className="text-white/80 text-sm leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.author}</p>
                      <p className="text-white/40 text-xs">{t.role}</p>
                    </div>
                    <span className="ml-auto text-emerald-400 text-sm font-bold">{t.revenue}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Before/After */}
            <div className="grid md:grid-cols-2 gap-4">
              {beforeAfter.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex-1">
                    <p className="text-red-400/80 text-sm line-through">{item.before}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-emerald-400 text-sm font-medium">{item.after}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3: Risk Reversal */}
          <div data-reveal className="text-center mb-16 p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <Shield className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              100% AI Coaching Guarantee
            </h3>
            <p className="text-lg text-white/70 max-w-xl mx-auto">
              If AI coaching doesn't transform your sales calls in 30 days — 
              we refund every penny AND pay you $100 for wasting your time.
              <br />
              <span className="text-emerald-400 font-semibold">Zero risk. Total redemption for your sales calls.</span>
            </p>
          </div>

          {/* STEP 4: Scarcity/Urgency */}
          <div data-reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-lg mb-4 animate-pulse">
              <Clock className="w-5 h-5" />
              Only 97 spots at $97/mo — Price doubles when they're gone
            </div>
            <p className="text-white/50">
              Last 14 spots claimed in the past 3 hours
            </p>
          </div>

          {/* STEP 5: Absolution CTA Climax */}
          <div data-reveal className="text-center">
            <div ref={ctaWrapperRef} className="inline-block rounded-2xl">
              <Button
                size="lg"
                onClick={onClaimRedemption}
                className="group relative gap-4 font-black text-xl md:text-2xl px-12 py-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-2xl border-0 transition-all duration-300"
              >
                {/* Particle glow effect */}
                <span className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                
                <span className="relative flex items-center gap-4">
                  ✝️ Claim Your Redemption Now — $97/mo
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </Button>
            </div>

            {/* CTA Variant B */}
            {/* "I'm Ready To Win — Give Me AI Coaching" */}

            {/* Final trust signals */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Cancel anytime
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                AI Coaching starts immediately
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Ready in 60 seconds for sales calls
              </span>
            </div>

            <p className="mt-8 text-white/40 text-sm max-w-lg mx-auto">
              Every sales call you make without AI coaching is a confession you're not ready to win.
              <br />
              <span className="text-emerald-400">Choose AI coaching. Choose revenue. Choose now.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

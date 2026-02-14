import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, PhoneCall, Bot, Shield } from 'lucide-react';
import { gsap } from 'gsap';
import { useFloatingOrbs } from '../gsap/useGSAPAnimations';

interface HeroConfessionProps {
  onClaimRedemption: () => void;
}

// Phone number for the business
const PHONE_NUMBER = '+1 (855) 503-0497';

// Floating 3D-style orb component
const FloatingOrb = ({ 
  className, 
  delay = 0,
  gradient 
}: { 
  className?: string; 
  delay?: number;
  gradient: string;
}) => (
  <div 
    data-orb
    className={`absolute rounded-full blur-sm opacity-60 ${className}`}
    style={{ 
      background: gradient,
      animationDelay: `${delay}s`,
    }}
  />
);

export const HeroConfession = React.forwardRef<HTMLElement, HeroConfessionProps>(({ onClaimRedemption }, ref) => {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const orbsRef = useFloatingOrbs();

  useEffect(() => {
    if (!headlineRef.current) return;

    // Animate headline words
    const words = headlineRef.current.querySelectorAll('.hero-word');
    gsap.fromTo(words,
      { opacity: 0, y: 40, rotateX: -30 },
      { 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      }
    );
  }, []);

  return (
    <section ref={ref} className="relative min-h-[100vh] flex items-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background orbs */}
      <div ref={orbsRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingOrb 
          className="w-96 h-96 -top-20 -left-20"
          gradient="radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)"
          delay={0}
        />
        <FloatingOrb 
          className="w-80 h-80 top-1/4 right-0"
          gradient="radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)"
          delay={0.5}
        />
        <FloatingOrb 
          className="w-64 h-64 bottom-1/4 left-1/4"
          gradient="radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)"
          delay={1}
        />
        <FloatingOrb 
          className="w-72 h-72 -bottom-10 right-1/3"
          gradient="radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)"
          delay={1.5}
        />
        
        {/* Holographic microphone icon */}
        <div 
          data-orb
          className="absolute top-1/3 right-[15%] hidden lg:flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl"
        >
          <PhoneCall className="w-10 h-10 text-emerald-400" />
        </div>
        
        {/* AI Agent avatar */}
        <div 
          data-orb
          className="absolute bottom-1/3 left-[10%] hidden lg:flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 backdrop-blur-xl border border-white/20"
        >
          <Bot className="w-8 h-8 text-purple-300" />
        </div>
        
        {/* Revenue graph icon */}
        <div 
          data-orb
          className="absolute top-1/2 left-[20%] hidden lg:flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border border-white/10"
        >
          <Zap className="w-6 h-6 text-emerald-300" />
        </div>
      </div>

      {/* Mesh overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px] pointer-events-none" />

      <div className="container mx-auto px-4 pt-28 pb-16 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          
          {/* Pre-headline - Pattern interrupt */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            ⚠️ WARNING: This will expose everything you've been hiding
          </div>

          {/* Main Headline - H1 with keywords */}
          <h1 
            ref={headlineRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight"
          >
            <span className="hero-word inline-block">Your</span>{' '}
            <span className="hero-word inline-block text-red-400">Sales Calls</span>{' '}
            <span className="hero-word inline-block">Are</span>{' '}
            <span className="hero-word inline-block">Bleeding</span>{' '}
            <span className="hero-word inline-block">Money.</span>
            <br />
            <span className="hero-word inline-block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              AI Coaching
            </span>{' '}
            <span className="hero-word inline-block text-white/90">Stops</span>{' '}
            <span className="hero-word inline-block text-white/90">The</span>{' '}
            <span className="hero-word inline-block text-white/90">Bleeding.</span>
          </h1>

          {/* Subheadline - Shame exposure */}
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Every objection you fumble. Every deal you lose. Every "I'll think about it" that haunts you at 2AM.
            <br />
            <span className="text-white font-semibold">
              AI coaching hears it all — and fixes it in real-time.
            </span>
          </p>

          {/* CTA Section */}
          <div className="pt-6 space-y-4">
            {/* Primary CTA */}
            <Button
              size="lg"
              onClick={onClaimRedemption}
              className="group relative gap-3 font-black text-xl px-10 py-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] rounded-2xl transition-all duration-300 border-0 overflow-hidden"
            >
              {/* Glow effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative flex items-center gap-3">
                🔥 Claim Your Redemption — $97/mo
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>

            {/* Call Now Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={() => window.location.href = 'tel:+18555030497'}
                className="gap-3 font-bold text-lg px-8 py-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all duration-300"
              >
                <PhoneCall className="h-5 w-5 text-emerald-400" />
                Call for Demo: {PHONE_NUMBER}
              </Button>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                Coaching Guarantee
              </span>
              <span>•</span>
              <span>Cancel anytime</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">Only 97 spots left</span>
            </div>
          </div>

          {/* Quick social proof */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-white/60">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">2,847+</p>
              <p className="text-xs uppercase tracking-wider">Calls Coached</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-400">$4.2M</p>
              <p className="text-xs uppercase tracking-wider">Revenue Recovered</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">38%</p>
              <p className="text-xs uppercase tracking-wider">More Closes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
        <span className="text-xs uppercase tracking-widest">Scroll to confess</span>
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/40 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
});

HeroConfession.displayName = "HeroConfession";

/**
 * SellSig Final CTA Section - Last Push
 * 
 * Design specs from: nova-hero-mockup.md
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, CheckCircle, Sparkles, Users, TrendingUp, Target, Clock, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface FinalCTASectionProps {
  onStartTrialClick: () => void;
}

export function FinalCTASection({ onStartTrialClick }: FinalCTASectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content animation
      gsap.fromTo('.cta-content > *',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'easeOut',
          scrollTrigger: {
            trigger: '.cta-content',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Stats animation
      gsap.fromTo('.cta-stat',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'easeOut',
          scrollTrigger: {
            trigger: '.cta-stats',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative bg-[#0F172A] py-16 md:py-24 overflow-hidden"
    >
      {/* Background gradient mesh */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(124,58,237,0.2) 0%, transparent 50%)',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="cta-content max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div 
            className="inline-flex items-center rounded-full px-4 py-2 border"
            style={{
              background: 'rgba(124,58,237,0.2)',
              borderColor: 'rgba(124,58,237,0.3)',
            }}
          >
            <Users className="w-4 h-4 text-[#A78BFA] mr-2" />
            <span className="text-sm font-semibold text-[#A78BFA]">
              Join 500+ reps becoming rejection-proof
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-[32px] md:text-[48px] font-bold text-[#F8FAFC] leading-tight">
            Ready to Give Your Team{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(90deg, #3B82F6, #7C3AED, #A78BFA)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              the Edge?
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-[18px] text-[#94A3B8] max-w-xl mx-auto">
            Join sales leaders who use SellSig to transform sales calls into 
            consistent wins. Start your 14-day free trial today.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <button
              onClick={onStartTrialClick}
              className="group relative inline-flex items-center gap-3 font-semibold text-[18px] px-8 py-4 rounded-[24px] text-white overflow-hidden transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(90deg, #2563EB, #3B82F6)',
                boxShadow: '0 0 40px rgba(37,99,235,0.4)',
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Start Your Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-[#94A3B8]">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                14-day free trial
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                No credit card required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                Full access to AI coaching
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="cta-stats grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto mt-16">
          {[
            { icon: TrendingUp, stat: '+35%', label: 'Revenue Growth', color: '#10B981' },
            { icon: Target, stat: '95%', label: 'Forecast Accuracy', color: '#3B82F6' },
            { icon: Clock, stat: '40%', label: 'Time Saved', color: '#7C3AED' },
            { icon: Zap, stat: '2x', label: 'Deal Velocity', color: '#F59E0B' },
          ].map((item, index) => (
            <div 
              key={index}
              className="cta-stat bg-[#1E293B]/50 backdrop-blur-sm rounded-[16px] p-4 md:p-6 border border-white/10 text-center"
            >
              <item.icon 
                className="w-6 h-6 mx-auto mb-2" 
                style={{ color: item.color }} 
              />
              <p 
                className="text-[28px] md:text-[36px] font-bold font-mono text-[#F8FAFC]"
              >
                {item.stat}
              </p>
              <p className="text-xs md:text-sm text-[#64748B]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

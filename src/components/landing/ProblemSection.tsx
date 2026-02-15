/**
 * SellSig Problem Section - Pain → Solution Split
 * 
 * Design specs from: nova-hero-mockup.md
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  XCircle, 
  AlertTriangle, 
  TrendingDown, 
  Brain, 
  Shield, 
  Rocket 
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const painPoints = [
  {
    icon: XCircle,
    iconColor: '#EF4444',
    title: "Calls go poorly & you don't know why",
    description: "Reps make the same mistakes over and over. No real feedback. No improvement."
  },
  {
    icon: AlertTriangle,
    iconColor: '#F59E0B',
    title: "Objections kill deals",
    description: "Price concerns. Competitor comparisons. 'Need more time.' Your team freezes."
  },
  {
    icon: TrendingDown,
    iconColor: '#EF4444',
    title: "Top performers leave, averages stay average",
    description: "Your best closers burn out or jump ship. The rest plateau."
  }
];

const solutionPoints = [
  {
    icon: Brain,
    iconColor: '#7C3AED',
    title: "Real-time AI coaching",
    description: "Every call gets instant, actionable feedback. No waiting for manager reviews."
  },
  {
    icon: Shield,
    iconColor: '#10B981',
    title: "Handle any objection",
    description: "AI suggests the perfect response. Your team sounds like your top closer."
  },
  {
    icon: Rocket,
    iconColor: '#2563EB',
    title: "Scale your best performers",
    description: "Turn average reps into closers. Make top performers even better."
  }
];

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const painRef = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pain column animations - staggered
      gsap.fromTo('.pain-item', 
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'easeOut',
          scrollTrigger: {
            trigger: painRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Solution column animation
      gsap.fromTo(solutionRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'easeOut',
          scrollTrigger: {
            trigger: solutionRef.current,
            start: 'top 80%',
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
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column: The Pain */}
          <div ref={painRef} className="space-y-8">
            <div>
              <p className="font-mono text-xs font-bold text-[#64748B] tracking-[0.1em] mb-4">
                THE PROBLEM
              </p>
              <h2 className="text-[28px] md:text-[40px] font-bold text-[#F8FAFC] leading-[1.2]">
                Your Sales Team Is Wingin' It
              </h2>
            </div>

            <div className="space-y-6">
              {painPoints.map((point, index) => (
                <div 
                  key={index} 
                  className="pain-item flex gap-4"
                >
                  <point.icon 
                    className="w-6 h-6 shrink-0 mt-1" 
                    style={{ color: point.iconColor }} 
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">
                      {point.title}
                    </h3>
                    <p className="text-[15px] text-[#94A3B8] leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: The Solution */}
          <div ref={solutionRef}>
            <div 
              className="relative rounded-[24px] p-8 md:p-10"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(37,99,235,0.1) 100%)',
                border: '1px solid rgba(124,58,237,0.2)',
                animation: 'borderGlow 4s ease-in-out infinite'
              }}
            >
              <h3 
                className="text-[28px] md:text-[32px] font-bold mb-6"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #3B82F6, #7C3AED, #A78BFA)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Enter SellSig
              </h3>

              <div className="space-y-6">
                {solutionPoints.map((point, index) => (
                  <div 
                    key={index} 
                    className="flex gap-4"
                  >
                    <div 
                      className="w-10 h-10 rounded-[16px] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${point.iconColor}20` }}
                    >
                      <point.icon 
                        className="w-5 h-5" 
                        style={{ color: point.iconColor }} 
                      />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[#F8FAFC] mb-1">
                        {point.title}
                      </h4>
                      <p className="text-sm text-[#94A3B8] leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(124,58,237,0.2); }
          50% { border-color: rgba(124,58,237,0.4); }
        }
      `}</style>
    </section>
  );
}

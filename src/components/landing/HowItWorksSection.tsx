/**
 * SellSig How It Works Section - 3-Step Cards
 * 
 * Design specs from: nova-hero-mockup.md
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone, Brain, Trophy, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    icon: Phone,
    iconGradient: 'from-[#7C3AED] to-[#A78BFA]',
    title: 'Connect Your Calls',
    description: 'One-click integration with Zoom, Google Meet, or your CRM. We handle the technical setup.'
  },
  {
    number: '02',
    icon: Brain,
    iconGradient: 'from-[#2563EB] to-[#06B6D4]',
    title: 'AI Listens & Learns',
    description: 'Our AI analyzes every word, tone, and pause. It learns what works for your team specifically.'
  },
  {
    number: '03',
    icon: Trophy,
    iconGradient: 'from-[#F59E0B] to-[#FBBF24]',
    title: 'Win More Deals',
    description: 'Get coaching in real-time. Improve your close rate. Watch your revenue grow.'
  }
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section header animation
      gsap.fromTo('.how-it-works-header',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'easeOut',
          scrollTrigger: {
            trigger: '.how-it-works-header',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Cards stagger animation
      gsap.fromTo('.step-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'easeOut',
          scrollTrigger: {
            trigger: '.steps-grid',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Icon scale animation on scroll
      gsap.fromTo('.step-icon',
        { scale: 0.8 },
        {
          scale: 1,
          duration: 0.5,
          stagger: 0.15,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: '.steps-grid',
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
      className="relative bg-gray-50 py-16 md:py-24 overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="how-it-works-header text-center mb-12 md:mb-16">
          <p className="font-mono text-xs font-bold text-gray-500 tracking-[0.1em] mb-4">
            HOW IT WORKS
          </p>
          <h2 className="text-[28px] md:text-[40px] font-bold text-[#0F172A] leading-[1.2] mb-3">
            From First Call to Close in 3 Steps
          </h2>
          <p className="text-[18px] text-gray-600">
            Get started in minutes. See results in days.
          </p>
        </div>

        {/* Step Cards Grid */}
        <div className="steps-grid grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="step-card group relative bg-white rounded-[24px] p-8 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:-translate-y-1 shadow-sm"
            >
              {/* Step Number - positioned absolutely */}
              <span 
                className="absolute top-0 right-[-8px] text-[48px] font-bold font-mono opacity-30"
                style={{ color: '#7C3AED' }}
              >
                {step.number}
              </span>

              {/* Connector Arrow (between cards on desktop) */}
              {index < steps.length - 1 && (
                <ArrowRight 
                  className="hidden md:block absolute top-1/2 -right-5 w-6 h-6 text-[#64748B] z-10 transform translate-y"
                  style={{ top: 'calc(50% - 12px)' }}
                />
              )}

              {/* Icon Circle */}
              <div 
                className={`step-icon w-16 h-16 rounded-[16px] flex items-center justify-center mb-6 bg-gradient-to-br ${step.iconGradient}`}
              >
                <step.icon className="w-7 h-7 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-[22px] font-semibold text-[#0F172A] mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-[15px] text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

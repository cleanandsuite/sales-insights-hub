/**
 * SellSig Features Section - 2x2 Feature Grid
 * 
 * Design specs from: nova-hero-mockup.md
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, BookOpen, BarChart2, Link } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Zap,
    iconColor: '#7C3AED',
    bgColor: 'rgba(124,58,237,0.15)',
    title: 'Real-Time Coaching',
    description: 'Get instant suggestions during calls. Handle objections as they happen. Never miss a close.',
    stat: '34% more closes',
    statColor: '#10B981'
  },
  {
    icon: BookOpen,
    iconColor: '#3B82F6',
    bgColor: 'rgba(37,99,235,0.15)',
    title: 'Objection Library',
    description: '500+ proven responses for every objection. Customize for your industry and style.',
    stat: '500+ responses',
    statColor: '#3B82F6'
  },
  {
    icon: BarChart2,
    iconColor: '#10B981',
    bgColor: 'rgba(16,185,129,0.15)',
    title: 'Performance Analytics',
    description: 'Track every metric that matters. See where your team wins and loses. Coach with data.',
    stat: '40+ metrics',
    statColor: '#10B981'
  },
  {
    icon: Link,
    iconColor: '#F59E0B',
    bgColor: 'rgba(245,158,11,0.15)',
    title: 'CRM Integration',
    description: 'Works where you work. Salesforce, HubSpot, Pipedrive, and 50+ more.',
    stat: '50+ integrations',
    statColor: '#F59E0B'
  }
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section header animation
      gsap.fromTo('.features-header',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'easeOut',
          scrollTrigger: {
            trigger: '.features-header',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Feature cards stagger animation
      gsap.fromTo('.feature-card',
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'easeOut',
          scrollTrigger: {
            trigger: '.features-grid',
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
      className="relative py-16 md:py-24 overflow-hidden bg-white"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="features-header text-center mb-12 md:mb-16">
          <p className="font-mono text-xs font-bold text-gray-500 tracking-[0.1em] mb-4">
            KEY FEATURES
          </p>
          <h2 className="text-[28px] md:text-[40px] font-bold text-[#0F172A] leading-[1.2] mb-3">
            Everything You Need to Close
          </h2>
          <p className="text-[18px] text-gray-600">
            Powerful features, simple to use
          </p>
        </div>

        {/* 2x2 Feature Grid */}
        <div className="features-grid grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="feature-card group relative bg-white rounded-[16px] p-7 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:-translate-y-1 overflow-hidden shadow-sm"
            >
              {/* Glow effect at top */}
              <div 
                className="absolute top-0 left-0 right-0 h-[1px] transition-all duration-200 group-hover:h-[3px]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${feature.iconColor}, transparent)`
                }}
              />

              {/* Icon */}
              <div 
                className="w-12 h-12 rounded-[12px] flex items-center justify-center mb-4"
                style={{ backgroundColor: feature.bgColor }}
              >
                <feature.icon className="w-6 h-6" style={{ color: feature.iconColor }} />
              </div>

              {/* Title */}
              <h3 className="text-[20px] font-semibold text-[#0F172A] mb-2">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-[15px] text-gray-600 leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Stats Row */}
              <div 
                className="pt-4 border-t border-gray-100"
              >
                <span 
                  className="text-[14px] font-bold"
                  style={{ color: feature.statColor }}
                >
                  {feature.stat}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

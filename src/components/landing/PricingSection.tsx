/**
 * SellSig Pricing Section - 3-Tier Pricing
 * 
 * Design specs from: nova-hero-mockup.md
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const pricingTiers = [
  {
    name: 'Starter',
    description: 'Perfect for individual sales reps',
    price: '$25',
    period: '/mo',
    priceNote: '200 AI coaching minutes',
    features: [
      'Unlimited call recordings',
      'AI transcription & analysis',
      'Live coaching suggestions',
      '200 AI minutes/month',
      'Basic analytics',
      'Email support'
    ],
    cta: 'Start Free Trial',
    popular: false,
    accentColor: '#2563EB'
  },
  {
    name: 'Pro',
    description: 'For serious sales professionals',
    price: '$55',
    period: '/mo',
    priceNote: 'Unlimited AI coaching',
    features: [
      'Everything in Starter',
      'Unlimited AI coaching minutes',
      '5 AI Coach Personalities',
      'Smart Coaching Engine',
      'Advanced analytics',
      'Team leaderboards',
      'Priority support',
      'CRM integrations'
    ],
    cta: 'Start Free Trial',
    popular: true,
    accentColor: '#7C3AED'
  },
  {
    name: 'Enterprise',
    description: 'For scaling organizations',
    price: '$150',
    period: '/user/mo',
    priceNote: 'Contact for volume discounts',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantees',
      'Advanced security',
      'API access',
      '24/7 phone support',
      'Custom training'
    ],
    cta: 'Contact Sales',
    popular: false,
    accentColor: '#10B981'
  }
];

interface PricingSectionProps {
  onStartTrialClick: () => void;
}

export function PricingSection({ onStartTrialClick }: PricingSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section header animation
      gsap.fromTo('.pricing-header',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'easeOut',
          scrollTrigger: {
            trigger: '.pricing-header',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Pricing cards stagger animation
      gsap.fromTo('.pricing-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.15,
          ease: 'easeOut',
          scrollTrigger: {
            trigger: '.pricing-grid',
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
        {/* Section Header */}
        <div className="pricing-header text-center mb-12 md:mb-16">
          <p className="font-mono text-xs font-bold text-[#64748B] tracking-[0.1em] mb-4">
            PRICING
          </p>
          <h2 className="text-[28px] md:text-[40px] font-bold text-[#F8FAFC] leading-[1.2] mb-3">
            Simple, Transparent Pricing
          </h2>
          <p className="text-[18px] text-[#94A3B8]">
            Start with a 14-day free trial. No credit card required.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="pricing-grid grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div 
              key={index}
              className={`pricing-card relative bg-[#1E293B] rounded-[24px] p-8 border transition-all duration-200 hover:-translate-y-1 ${
                tier.popular 
                  ? 'border-[#7C3AED] shadow-lg shadow-[#7C3AED]/20' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1"
                  style={{ backgroundColor: tier.accentColor }}
                >
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              {/* Plan name */}
              <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">
                {tier.name}
              </h3>
              <p className="text-sm text-[#64748B] mb-6">
                {tier.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-[40px] font-bold text-[#F8FAFC]">
                    {tier.price}
                  </span>
                  <span className="text-[#64748B]">
                    {tier.period}
                  </span>
                </div>
                <p 
                  className="text-sm font-medium mt-1"
                  style={{ color: tier.accentColor }}
                >
                  {tier.priceNote}
                </p>
              </div>

              {/* Features list */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, fIndex) => (
                  <li 
                    key={fIndex} 
                    className="flex items-start gap-3 text-sm text-[#94A3B8]"
                  >
                    <Check 
                      className="w-5 h-5 shrink-0" 
                      style={{ color: tier.accentColor }} 
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={onStartTrialClick}
                className={`w-full py-3 px-6 rounded-[12px] font-semibold text-[16px] transition-all duration-200 hover:scale-[1.02] ${
                  tier.popular
                    ? 'text-white'
                    : 'bg-white/10 text-[#F8FAFC] border border-white/20 hover:bg-white/20'
                }`}
                style={{
                  backgroundColor: tier.popular ? tier.accentColor : undefined
                }}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-[#64748B] mt-12">
          All plans include a 14-day free trial. Cancel anytime.
        </p>
      </div>
    </section>
  );
}

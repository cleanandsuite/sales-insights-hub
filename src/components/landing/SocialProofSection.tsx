/**
 * SellSig Social Proof Section - Logos + Testimonials
 * 
 * Design specs from: nova-hero-mockup.md
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Company logos (placeholder names - would be actual SVGs in production)
const companyLogos = [
  'Stripe', 'Shopify', 'Notion', 'Figma', 'Linear', 'Vercel'
];

const testimonials = [
  {
    quote: "SellSig transformed our sales process. Our close rate went up 34% in just 60 days. The real-time coaching is like having a top performer in every call.",
    author: "Sarah Chen",
    role: "VP of Sales",
    company: "TechFlow",
    avatar: "SC",
    avatarGradient: "from-[#2563EB] to-[#7C3AED]",
    rating: 5
  },
  {
    quote: "I was skeptical at first, but the objection handling suggestions are incredible. My team now sounds like our best closer on every call.",
    author: "Marcus Johnson",
    role: "Sales Director",
    company: "ScaleUp Inc",
    avatar: "MJ",
    avatarGradient: "from-[#10B981] to-[#06B6D4]",
    rating: 5
  },
  {
    quote: "The analytics alone are worth it. We finally know where deals are winning and losing. Coaching has never been more data-driven.",
    author: "Emily Rodriguez",
    role: "Revenue Ops Lead",
    company: "GrowthCo",
    avatar: "ER",
    avatarGradient: "from-[#F59E0B] to-[#EF4444]",
    rating: 5
  }
];

export function SocialProofSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Logos animation
      gsap.fromTo('.logo-item',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'easeOut',
          scrollTrigger: {
            trigger: '.logos-row',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Testimonials stagger animation
      gsap.fromTo('.testimonial-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'easeOut',
          scrollTrigger: {
            trigger: '.testimonials-grid',
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
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="font-mono text-xs font-bold text-[#64748B] tracking-[0.1em] mb-4">
            TRUSTED BY TEAMS
          </p>
          <h2 className="text-[28px] md:text-[40px] font-bold text-[#F8FAFC] leading-[1.2] mb-3">
            Loved by Sales Professionals
          </h2>
          <p className="text-[18px] text-[#94A3B8]">
            Join hundreds of teams already closing more deals
          </p>
        </div>

        {/* Company Logos */}
        <div className="logos-row flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-16">
          {companyLogos.map((logo, index) => (
            <div 
              key={index}
              className="logo-item text-xl md:text-2xl font-bold text-[#64748B] hover:text-[#94A3B8] transition-colors cursor-default"
            >
              {logo}
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="testimonials-grid grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="testimonial-card relative bg-[#1E293B] rounded-[16px] p-6 border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-[#7C3AED]/30 absolute top-4 right-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" 
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[15px] text-[#94A3B8] leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div 
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.avatarGradient} flex items-center justify-center text-white text-sm font-bold`}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-[#F8FAFC] font-semibold text-sm">
                    {testimonial.author}
                  </p>
                  <p className="text-[#64748B] text-xs">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { stat: '+35%', label: 'Revenue Growth' },
            { stat: '2x', label: 'Deal Velocity' },
            { stat: '500+', label: 'Responses' },
            { stat: '95%', label: 'Customer Satisfaction' }
          ].map((item, index) => (
            <div 
              key={index}
              className="text-center"
            >
              <p className="text-[32px] md:text-[48px] font-bold font-mono text-[#F8FAFC]">
                {item.stat}
              </p>
              <p className="text-[14px] text-[#64748B]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

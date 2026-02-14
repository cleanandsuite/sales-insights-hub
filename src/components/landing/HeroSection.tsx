/**
 * SellSig Hero Section - Week 1 Redesign
 * 
 * Design specs from: nova-hero-mockup.md
 * Headline: "Close More Deals with AI That Coaches You"
 * Subhead: Includes "34% more closes"
 * CTA: "No Credit Card required"
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Play,
  CheckCircle,
  Phone,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

interface HeroSectionProps {
  onStartTrialClick: () => void;
  onWatchDemoClick: () => void;
}

// Design tokens from nova-hero-mockup.md
// Colors:
// - Background Primary: #0F172A (Deep Navy)
// - Primary: #2563EB (Trust Blue)
// - Secondary/AI: #7C3AED (Premium Purple)
// - Success: #10B981 (Action Green)
// - Text Primary: #F8FAFC
// - Text Secondary: #94A3B8

// Product Mockup Component - Shows AI coaching in action
const ProductMockup = () => (
  <div className="relative w-full max-w-2xl mx-auto">
    {/* Main Interface Frame */}
    <div className="rounded-[24px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)] border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A]">
      {/* Browser-like header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#0F172A]/80 border-b border-white/10">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
          <div className="w-3 h-3 rounded-full bg-[#10B981]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-[#1E293B]/50 rounded-lg px-4 py-1.5 text-xs text-[#64748B] font-medium">
            sellsig.ai — Live Coaching
          </div>
        </div>
      </div>

      {/* Call Interface */}
      <div className="p-6 space-y-4">
        {/* Call header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white font-bold text-sm">
              JD
            </div>
            <div>
              <p className="text-[#F8FAFC] font-semibold text-sm">John Davis — Acme Corp</p>
              <p className="text-[#64748B] text-xs">Enterprise Deal • $125,000</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#10B981]/20 rounded-full px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[#10B981] text-xs font-medium">Live</span>
            </div>
            <span className="text-[#94A3B8] text-xs font-mono">12:34</span>
          </div>
        </div>

        {/* Audio waveform simulation */}
        <div className="flex items-center gap-1 h-12 px-4 bg-[#1E293B]/30 rounded-[12px]">
          {[...Array(32)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-[#2563EB] to-[#06B6D4] rounded-full"
              style={{
                height: `${30 + Math.random() * 50}%`,
                animation: `waveform ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        {/* Transcript snippet */}
        <div className="space-y-2 bg-[#1E293B]/20 rounded-[12px] p-4">
          <div className="flex items-start gap-2">
            <span className="text-[#2563EB] text-xs font-semibold shrink-0">Prospect:</span>
            <p className="text-[#94A3B8] text-sm italic leading-relaxed">
              "The price seems high..."
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* AI Coaching Prompt - Main floating card */}
    <div 
      className="absolute -right-4 top-1/4 bg-white rounded-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.5)] p-5 max-w-[280px] border border-black/10"
      style={{ animation: 'float 3s ease-in-out infinite alternate' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wide">AI Coach</span>
          <span className="text-xs text-[#64748B] ml-2">Just now</span>
        </div>
      </div>
      <p className="text-sm text-[#334155] font-medium leading-relaxed mb-3">
        💡 <strong>Price objection detected!</strong> Reframe around ROI:
      </p>
      <div className="bg-[#F5F3FF] rounded-lg p-3 border border-[#7C3AED]/10">
        <p className="text-xs text-[#6B7280] italic">
          "I understand. Many clients felt that way initially—but after seeing 40% more closed deals in 90 days..."
        </p>
      </div>
      <div className="flex items-center justify-between mt-3">
        <Button size="sm" className="text-xs h-8 px-3 bg-[#2563EB] hover:bg-[#3B82F6] text-white rounded-[6px]">
          Use This Response
        </Button>
        <span className="text-xs text-[#10B981] font-medium">92% success rate</span>
      </div>
    </div>

    {/* Floating stat - Deal velocity */}
    <div
      className="absolute -left-6 bottom-16 bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.4)] p-4 border border-black/10"
      style={{ animation: 'float 3.5s ease-in-out infinite alternate', animationDelay: '1s' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-[#10B981]" />
        </div>
        <div>
          <p className="text-xl font-bold text-[#0F172A]">2x</p>
          <p className="text-xs text-[#64748B]">Deal Velocity</p>
        </div>
      </div>
    </div>

    {/* Floating stat - Revenue Growth */}
    <div
      className="absolute -left-2 top-8 bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.4)] p-3 border border-black/10"
      style={{ animation: 'float 3s ease-in-out infinite alternate', animationDelay: '1.5s' }}
    >
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-[#2563EB]/20 flex items-center justify-center">
          <Phone className="w-4 h-4 text-[#2563EB]" />
        </div>
        <div>
          <p className="text-lg font-bold text-[#0F172A]">+35%</p>
          <p className="text-[11px] text-[#64748B]">Revenue Growth</p>
        </div>
      </div>
    </div>

    {/* Live insights badge */}
    <div
      className="absolute -bottom-4 right-1/4 bg-[#0F172A] text-white rounded-full px-5 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center gap-2"
      style={{ animation: 'float 2.8s ease-in-out infinite alternate', animationDelay: '0.5s' }}
    >
      <Sparkles className="w-4 h-4 text-[#F59E0B]" />
      <span className="text-xs font-semibold">Live Coaching Active</span>
    </div>
  </div>
);

export function HeroSection({ onStartTrialClick, onWatchDemoClick }: HeroSectionProps) {
  return (
    <section className="relative bg-[#0F172A] h-[800px] lg:h-[900px] flex items-center overflow-hidden">
      {/* Background mesh gradient - subtle drift animation */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse 100% 80% at 20% 10%, rgba(37,99,235,0.3) 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 80% 90%, rgba(124,58,237,0.3) 0%, transparent 40%)',
          filter: 'blur(100px)',
          animation: 'meshDrift 20s ease-in-out infinite',
        }}
      />

      {/* Particle effects - subtle dots */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px), radial-gradient(circle, rgba(255,255,255,0.08) 2px, transparent 2px)',
          backgroundSize: '60px 60px, 100px 100px',
        }}
      />

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content - Copy & CTA */}
          <div className="space-y-6 text-center lg:text-left max-w-xl">
            {/* Pre-headline badge */}
            <div 
              className="inline-block rounded-full px-4 py-2 border"
              style={{
                background: 'rgba(124,58,237,0.2)',
                borderColor: 'rgba(124,58,237,0.3)',
              }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span className="text-sm font-semibold text-[#A78BFA]">#1 AI Coach for Sales</span>
              </div>
            </div>

            {/* Main Headline - H1 */}
            <h1 
              className="text-4xl sm:text-5xl md:text-[56px] font-extrabold text-[#F8FAFC] leading-[1.1] tracking-tight"
              style={{
                animation: 'slideUp 0.6s ease-out forwards',
                animationDelay: '0.1s',
                opacity: 0,
              }}
            >
              Close More Deals with{' '}
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #3B82F6, #7C3AED, #A78BFA)',
                }}
              >
                AI That Coaches You
              </span>
            </h1>

            {/* Subheadline - Includes "34% more closes" */}
            <p 
              className="text-lg md:text-xl text-[#94A3B8] leading-[1.6] max-w-lg mx-auto lg:mx-0"
              style={{
                animation: 'slideUp 0.4s ease-out forwards',
                animationDelay: '0.2s',
                opacity: 0,
              }}
            >
              Real-time coaching during calls. Insights that actually help. <span className="text-[#10B981] font-semibold">34% more closes</span> — guaranteed.
            </p>

            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-2"
              style={{
                animation: 'scaleIn 0.4s ease-out forwards',
                animationDelay: '0.3s',
                opacity: 0,
              }}
            >
              {/* Primary CTA - "Start Free" */}
              <Button
                size="lg"
                onClick={onStartTrialClick}
                className="group gap-3 font-semibold text-lg px-8 py-4 rounded-[24px] text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] border-0"
                style={{
                  background: 'linear-gradient(90deg, #2563EB, #3B82F6)',
                  transition: 'all 0.2s ease-out',
                }}
              >
                Start Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Secondary CTA - "Watch Demo" */}
              <Button
                size="lg"
                variant="outline"
                onClick={onWatchDemoClick}
                className="group gap-2 font-semibold text-lg px-8 py-4 rounded-[24px] text-[#F8FAFC] bg-transparent border-2 border-white/20 hover:bg-white/10 hover:border-white/40 transition-all"
              >
                <Play className="h-5 w-5 fill-current" />
                Watch Demo
              </Button>
            </div>

            {/* CTA Subtext - "No Credit Card required" */}
            <div 
              className="flex items-center justify-center lg:justify-start gap-3 text-sm text-[#94A3B8]"
              style={{
                animation: 'fadeIn 0.3s ease-out forwards',
                animationDelay: '0.35s',
                opacity: 0,
              }}
            >
              <CheckCircle className="w-4 h-4 text-[#10B981]" />
              <span>No Credit Card required</span>
              <span className="text-white/20">•</span>
              <span>14-day free trial</span>
            </div>

            {/* Social Proof Stats */}
            <div 
              className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm"
              style={{
                animation: 'fadeIn 0.3s ease-out forwards',
                animationDelay: '0.4s',
                opacity: 0,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#F8FAFC]">+35%</span>
                <span className="text-[#94A3B8]">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#F8FAFC]">2x</span>
                <span className="text-[#94A3B8]">Deal Velocity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#F8FAFC]">500+</span>
                <span className="text-[#94A3B8]">Responses</span>
              </div>
            </div>
          </div>

          {/* Right Side - Product Mockup */}
          <div 
            className="relative hidden lg:block"
            style={{
              animation: 'slideInRight 0.6s ease-out forwards',
              animationDelay: '0.4s',
              opacity: 0,
            }}
          >
            <ProductMockup />
          </div>
        </div>
      </div>

      {/* Inline styles for keyframe animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes float {
          from {
            transform: translateY(-8px);
          }
          to {
            transform: translateY(8px);
          }
        }

        @keyframes waveform {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(0.8); }
        }

        @keyframes meshDrift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, 10px); }
        }
      `}</style>
    </section>
  );
}

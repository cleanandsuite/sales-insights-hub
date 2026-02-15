/**
 * SellSig Hero Section - Award-Winning Redesign
 * 
 * Design specs from: nova-hero-mockup.md
 * Created by: Nova (Creative Director)
 */

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  CheckCircle,
  Phone,
  Sparkles,
  TrendingUp,
  Zap,
  BarChart3,
  Brain,
  Shield,
  Rocket,
} from "lucide-react";

interface HeroSectionProps {
  onStartTrialClick: () => void;
  onWatchDemoClick: () => void;
}

// Floating stat cards components
const FloatingStatCard = ({ 
  icon: Icon, 
  stat, 
  label, 
  color,
  position,
  delay = 0,
  size = 'normal'
}: { 
  icon: React.ElementType;
  stat: string;
  label: string;
  color: string;
  position: string;
  delay?: number;
  size?: 'normal' | 'small';
}) => (
  <div
    className={`absolute bg-white/95 backdrop-blur-sm rounded-[12px] shadow-lg border border-black/10 ${
      size === 'small' ? 'p-3' : 'p-4'
    }`}
    style={{
      animation: `float 3s ease-in-out infinite alternate`,
      animationDelay: `${delay}s`,
      ...position,
    }}
  >
    <div className={`flex items-center ${size === 'small' ? 'gap-2' : 'gap-3'}`}>
      <div 
        className={`${size === 'small' ? 'w-9 h-9 rounded-lg' : 'w-11 h-11 rounded-xl'} flex items-center justify-center`}
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className={size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} style={{ color }} />
      </div>
      <div>
        <p className={`font-bold text-[#0F172A] ${size === 'small' ? 'text-lg' : 'text-xl'}`}>{stat}</p>
        <p className={`text-[#64748B] ${size === 'small' ? 'text-[11px]' : 'text-xs'}`}>{label}</p>
      </div>
    </div>
  </div>
);

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

    {/* AI Coaching Prompt - Main floating card with glassmorphism */}
    <div 
      className="absolute -right-6 top-1/4 bg-white/95 backdrop-blur-md rounded-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.5)] p-5 max-w-[280px] border border-black/10"
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
        <Button size="sm" className="text-xs h-8 px-3 bg-[#2563EB] hover:bg-[#3B82F6] text-white rounded-[6px] transition-all hover:scale-105">
          Use This Response
        </Button>
        <span className="text-xs text-[#10B981] font-medium">92% success rate</span>
      </div>
    </div>

    {/* Floating stat - Deal velocity */}
    <FloatingStatCard
      icon={TrendingUp}
      stat="2x"
      label="Deal Velocity"
      color="#10B981"
      position={{ left: '-24px', bottom: '64px' }}
      delay={1}
    />

    {/* Floating stat - Revenue Growth */}
    <FloatingStatCard
      icon={Phone}
      stat="+35%"
      label="Revenue Growth"
      color="#2563EB"
      position={{ left: '-8px', top: '32px' }}
      delay={1.5}
      size="small"
    />

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
    <section className="relative bg-white min-h-screen flex items-center overflow-hidden">
      {/* Clean white background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        }}
      />

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content - Copy & CTA */}
          <div className="space-y-6 text-center lg:text-left max-w-xl">
            {/* Pre-headline badge */}
            <div 
              className="inline-flex items-center rounded-full px-4 py-2 border"
              style={{
                background: 'rgba(37,99,235,0.1)',
                borderColor: 'rgba(37,99,235,0.2)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB] mr-2" />
              <span className="text-sm font-semibold text-[#2563EB]">#1 AI Coach for Sales</span>
            </div>

            {/* Main Headline - H1 */}
            <h1 
              className="text-[36px] sm:text-[48px] md:text-[56px] font-extrabold text-[#0F172A] leading-[1.1] tracking-tight"
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
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                AI That Coaches You
              </span>
            </h1>

            {/* Subheadline - Exact text from spec */}
            <p 
              className="text-[18px] md:text-[20px] text-gray-600 leading-[1.6] max-w-[480px]"
              style={{
                animation: 'slideUp 0.4s ease-out forwards',
                animationDelay: '0.2s',
                opacity: 0,
              }}
            >
              Real-time coaching during calls. Insights that actually help. Wins that stack up.
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
              {/* Primary CTA - "Start Free" with glow animation */}
              <Button
                size="lg"
                onClick={onStartTrialClick}
                className="group relative font-semibold text-[18px] px-8 py-4 rounded-[24px] text-white border-0 overflow-hidden"
                style={{
                  background: 'linear-gradient(90deg, #2563EB, #3B82F6)',
                  transition: 'all 0.2s ease-out',
                }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Start Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <span 
                  className="absolute inset-0 rounded-[24px]"
                  style={{
                    boxShadow: '0 0 40px rgba(37,99,235,0.4)',
                    animation: 'glowPulse 3s ease-in-out infinite',
                  }}
                />
              </Button>

              {/* Secondary CTA - "Watch Demo" */}
              <Button
                size="lg"
                variant="outline"
                onClick={onWatchDemoClick}
                className="group gap-2 font-semibold text-[18px] px-8 py-4 rounded-[24px] text-[#0F172A] bg-transparent border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-400 transition-all hover:scale-[1.02]"
              >
                <Play className="h-5 w-5 fill-current" />
                Watch Demo
              </Button>
            </div>

            {/* CTA Subtext */}
            <div 
              className="flex items-center justify-center lg:justify-start gap-3 text-sm text-gray-600"
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
                <span className="font-bold text-[#0F172A]">+35%</span>
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0F172A]">2x</span>
                <span className="text-gray-600">Deal Velocity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0F172A]">500+</span>
                <span className="text-gray-600">Responses</span>
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

        @keyframes badgePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes glowPulse {
          0%, 100% { 
            box-shadow: 0 0 40px rgba(37,99,235,0.4);
          }
          50% { 
            box-shadow: 0 0 60px rgba(37,99,235,0.6);
          }
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.2;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }

        @media (max-width: 1024px) {
          .hidden\\:lg\\:block {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}

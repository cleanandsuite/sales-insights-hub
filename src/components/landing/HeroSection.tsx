import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Play,
  CheckCircle,
  Phone,
  Brain,
  Sparkles,
  Users,
  Zap,
  MessageSquare,
  TrendingUp,
  Shield,
} from "lucide-react";

interface HeroSectionProps {
  onStartTrialClick: () => void;
  onWatchDemoClick: () => void;
}

// Product Mockup Component - Shows AI coaching in action
const ProductMockup = () => (
  <div className="relative w-full max-w-2xl mx-auto">
    {/* Main Interface Frame */}
    <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-xl">
      {/* Browser-like header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-white/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-slate-700/50 rounded-lg px-4 py-1.5 text-xs text-white/60 font-medium">
            sellsig.ai — Live Sales Call
          </div>
        </div>
      </div>

      {/* Call Interface */}
      <div className="p-6 space-y-4">
        {/* Call header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              JD
            </div>
            <div>
              <p className="text-white font-semibold text-sm">John Davis — Acme Corp</p>
              <p className="text-white/50 text-xs">Enterprise Deal • $125,000</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-green-500/20 rounded-full px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-medium">Live</span>
            </div>
            <span className="text-white/60 text-xs font-mono">12:34</span>
          </div>
        </div>

        {/* Audio waveform simulation */}
        <div className="flex items-center gap-1 h-12 px-4 bg-slate-700/30 rounded-xl">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 0.05}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Transcript snippet */}
        <div className="space-y-2 bg-slate-700/20 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <span className="text-blue-400 text-xs font-medium shrink-0">Prospect:</span>
            <p className="text-white/80 text-xs leading-relaxed">
              "The price seems high compared to what we're paying now..."
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* AI Coaching Prompt - Main floating card */}
    <div className="absolute -right-4 top-1/4 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl p-5 max-w-xs animate-float border border-slate-200/50">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wide">AI Coach</span>
          <span className="text-xs text-slate-400 ml-2">Just now</span>
        </div>
      </div>
      <p className="text-sm text-slate-700 font-medium leading-relaxed mb-3">
        💡 <strong>Price objection detected!</strong> Reframe around ROI:
      </p>
      <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
        <p className="text-xs text-slate-600 italic">
          "I understand. Many clients felt that way initially—but after seeing 40% more closed deals in 90 days, they
          found it paid for itself 3x over."
        </p>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Button size="sm" className="text-xs h-7 px-3 bg-primary hover:bg-primary/90">
          Use This Response
        </Button>
        <span className="text-xs text-green-600 font-medium">92% success rate</span>
      </div>
    </div>

    {/* Floating stat - Deal velocity */}
    <div
      className="absolute -left-6 bottom-16 bg-white rounded-xl shadow-xl p-4 animate-float border border-slate-100"
      style={{ animationDelay: "1s" }}
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="text-xl font-bold text-slate-900">2x</p>
          <p className="text-xs text-slate-500">Deal Velocity</p>
        </div>
      </div>
    </div>

    {/* Floating stat - Success rate */}
    <div
      className="absolute -left-2 top-8 bg-white rounded-xl shadow-xl p-3 animate-float border border-slate-100"
      style={{ animationDelay: "2s" }}
    >
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
          <Phone className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900">+35%</p>
          <p className="text-[10px] text-slate-500">Revenue Growth</p>
        </div>
      </div>
    </div>

    {/* Live insights badge */}
    <div
      className="absolute -bottom-4 right-1/4 bg-slate-900 text-white rounded-full px-4 py-2 shadow-xl animate-float flex items-center gap-2"
      style={{ animationDelay: "0.5s" }}
    >
      <Sparkles className="w-4 h-4 text-yellow-400" />
      <span className="text-xs font-medium">Live Insights Active</span>
    </div>
  </div>
);

export function HeroSection({ onStartTrialClick, onWatchDemoClick }: HeroSectionProps) {
  return (
    <section className="relative bg-hero-gradient min-h-[100vh] flex items-center overflow-hidden">
      {/* Aurora mesh background - 2025/2026 trend */}
      <div className="bg-hero-aurora" />
      <div className="bg-hero-mesh" />

      {/* Promo Banner */}
      <div className="absolute top-16 left-0 right-0 bg-promo-banner py-3 z-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white font-semibold text-sm md:text-base">
            🔥 Limited Offer: 40% off for life – grandfathered pricing for the next 100 users!
            <ArrowRight className="inline h-4 w-4 ml-2" />
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-36 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content - Split hero: headline + CTA */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Pre-headline badge */}
            <div className="inline-block animate-fade-in">
              <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 text-sm font-medium backdrop-blur-md glass-effect">
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                #1 AI Coach for Sales Calls
              </Badge>
            </div>

            {/* Main Headline - H1 optimized for SEO */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] animate-slide-up">
              AI Coaching for Sales Calls:
              <br />
              <span className="gradient-text-aurora">Win More Deals, Faster</span>
            </h1>

            {/* Subheadline - Shorter, punchier */}
            <p
              className="text-lg md:text-xl text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-slide-up"
              style={{
                animationDelay: "0.1s",
              }}
            >
              Real-time AI coaching that analyzes every call, handles objections for you, and turns your reps into
              closers—all in 60 seconds.
            </p>

            {/* Primary CTA - BIG and prominent with urgency */}
            <div className="flex flex-col gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Button
                  size="lg"
                  onClick={onStartTrialClick}
                  className="group gap-3 font-bold text-lg px-8 py-7 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-2xl hover:shadow-green-500/25 transition-all rounded-xl animate-cta-pulse border-0"
                >
                  Claim 40% Off & Free Trial
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onWatchDemoClick}
                  className="group gap-2 font-semibold text-lg px-8 py-7 border-2 border-white/30 bg-white/10 text-white hover:bg-white hover:text-primary rounded-xl backdrop-blur-md transition-all glass-effect"
                >
                  <Play className="h-5 w-5 fill-current" />
                  See It In Action
                </Button>
              </div>
              {/* CTA subtext - friction reducers */}
              <p className="text-sm text-white/60 flex items-center gap-4 justify-center lg:justify-start flex-wrap">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  14-day free trial
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  No Charge until 15th Day
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-green-400" />
                  Lifetime pricing locked
                </span>
              </p>
            </div>

            {/* Social Proof - Combined with stats */}
            <div
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-slide-up"
              style={{
                animationDelay: "0.3s",
              }}
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                <Users className="h-4 w-4 text-accent" />
                <span className="text-white/90 text-sm font-medium">Join 500+ reps becoming rejection-proof</span>
              </div>
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <span className="font-bold text-white">+35%</span> Revenue
                <span className="text-white/30">•</span>
                <span className="font-bold text-white">2x</span> Velocity
                <span className="text-white/30">•</span>
                <span className="font-bold text-white">95%</span> Accuracy
              </div>
            </div>
          </div>

          {/* Right Side - Premium Product Mockup */}
          <div className="relative animate-slide-in-right hidden lg:block">
            <ProductMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

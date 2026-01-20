import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Users, Zap, TrendingUp, Target, Clock } from "lucide-react";

interface FinalCTASectionProps {
  onStartTrialClick: () => void;
}

export function FinalCTASection({ onStartTrialClick }: FinalCTASectionProps) {
  return (
    <section className="relative py-20 md:py-28 bg-cta-gradient overflow-hidden">
      {/* Aurora mesh effect */}
      <div className="absolute inset-0 bg-hero-mesh opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Ready to Give Your Team{" "}
            <span className="text-accent">the Edge?</span>
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Join sales leaders who use SellSig to transform sales calls into consistent wins. 
            Start your 14-day free trial today—full access, no hassle.
          </p>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 text-white/80">
            <Users className="h-5 w-5" />
            <span className="font-medium">Join 500+ reps becoming rejection-proof</span>
          </div>

          {/* Big CTA Button */}
          <div className="pt-4">
            <Button
              size="lg"
              onClick={onStartTrialClick}
              className="group gap-3 font-bold text-xl px-12 py-8 bg-white text-primary hover:bg-white/95 shadow-2xl hover:shadow-3xl rounded-xl animate-cta-pulse"
            >
              Start Your Free Trial Now
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-white/80 mt-4 flex flex-wrap items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> 14-day free trial
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Credit card required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Full access to AI coaching
              </span>
            </p>
          </div>

          {/* Trust Points - Stats */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { icon: TrendingUp, stat: "+35%", label: "Revenue Growth" },
              { icon: Target, stat: "95%", label: "Forecast Accuracy" },
              { icon: Clock, stat: "40%", label: "Time Saved" },
              { icon: Zap, stat: "2x", label: "Deal Velocity" },
            ].map((item) => (
              <div key={item.label} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <item.icon className="h-6 w-6 text-accent mx-auto mb-2" />
                <p className="text-3xl md:text-4xl font-extrabold text-white">{item.stat}</p>
                <p className="text-sm text-white/70">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
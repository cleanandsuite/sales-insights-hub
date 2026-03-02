import { Phone, Users, Signal, Clock } from 'lucide-react';
import { useScrollReveal } from './gsap/useGSAPAnimations';

const stats = [
  { icon: Phone, value: '5,000', label: 'Minutes / month', sub: 'Included with Pro' },
  { icon: Users, value: '3', label: 'Rep seats', sub: 'Per account' },
  { icon: Signal, value: '1', label: 'Dedicated number', sub: 'US business line' },
  { icon: Clock, value: '99.9%', label: 'Uptime SLA', sub: 'Enterprise-grade' },
];

export function CinematicPhoneLine() {
  const revealRef = useScrollReveal();

  return (
    <section ref={revealRef} className="py-28 px-6 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(circle,hsl(var(--cin-teal)/0.06),transparent_70%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16" data-reveal>
          <span className="text-[11px] font-mono uppercase tracking-[.2em] text-[hsl(var(--cin-teal))] mb-4 block">
            Built-in Dialer
          </span>
          <h2 className="text-[clamp(32px,4vw,52px)] font-bold tracking-[-1.5px] leading-[1.1] text-white mb-4">
            Your Phone Line.<br />
            <span className="italic text-white/60">AI-Powered.</span>
          </h2>
          <p className="text-base text-white/40 max-w-lg mx-auto">
            No third-party dialer needed. Every call is recorded, transcribed, and coached in real time.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-reveal>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center hover:bg-white/[0.06] transition-colors duration-300"
            >
              <stat.icon className="w-5 h-5 text-[hsl(var(--cin-teal))] mx-auto mb-3 opacity-60" />
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs font-mono uppercase tracking-[.15em] text-white/50 mb-1">{stat.label}</div>
              <div className="text-[10px] text-white/30">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Mini mockup */}
        <div className="mt-12 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 max-w-md mx-auto" data-reveal>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Live — Outbound Call</span>
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-white/[0.06] rounded-full w-full" />
            <div className="h-2 bg-white/[0.06] rounded-full w-3/4" />
            <div className="h-2 bg-[hsl(var(--cin-teal)/0.15)] rounded-full w-1/2" />
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-white/30 font-mono">
            <span>02:34 elapsed</span>
            <span>AI Coach: Active</span>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useScrollReveal } from './gsap/useGSAPAnimations';
import { TrendingUp, Phone, Users, Award } from 'lucide-react';

const stats = [
  { icon: Users, value: '2,000+', label: 'Sales Teams' },
  { icon: Phone, value: '4.2M', label: 'Calls Analyzed' },
  { icon: TrendingUp, value: '+34%', label: 'Win Rate Lift' },
  { icon: Award, value: '99.9%', label: 'Uptime SLA' },
];

export function CinematicLogoBanner() {
  const revealRef = useScrollReveal();

  return (
    <section ref={revealRef} className="py-14 border-t border-b border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-6" data-reveal>
        <p className="text-center text-[11px] font-mono uppercase tracking-[.2em] text-white/30 mb-8">
          Trusted by high-performing revenue teams
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center gap-2">
              <stat.icon className="w-5 h-5 text-[hsl(var(--cin-teal))]/60 mb-1" />
              <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">{stat.value}</span>
              <span className="text-white/35 text-xs font-medium uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

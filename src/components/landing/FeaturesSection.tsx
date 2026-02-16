import { Rocket, Ear, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Rocket,
    title: 'Pre-Call: Signal-Powered Prep',
    description: 'AI scans history & external signals to craft tailored discovery questions and preemptive objection handlers.',
    accent: 'border-l-violet-600 bg-violet-500/10',
    iconColor: 'text-violet-600',
  },
  {
    icon: Ear,
    title: 'During Call: Live Detection',
    description: 'Real-time AI spots tone shifts, objections, and stakeholder signals, delivering whisper-quiet prompts for better pivots.',
    accent: 'border-l-indigo-600 bg-indigo-500/10',
    iconColor: 'text-indigo-600',
  },
  {
    icon: TrendingUp,
    title: 'Post-Call: Signal-to-Growth',
    description: 'Deep analysis scores call quality against benchmarks and builds custom playbooks to upgrade your skills permanently.',
    accent: 'border-l-emerald-500 bg-emerald-500/10',
    iconColor: 'text-emerald-600',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-20 bg-slate-50" id="features">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-10">
          Full-Cycle Buyer Signal Intelligence
        </h2>

        <div className="space-y-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`flex gap-4 items-start bg-white rounded-2xl p-5 shadow-sm border-l-[5px] ${feature.accent} hover:-translate-y-1 hover:shadow-md transition-all duration-300`}
            >
              <div className={`min-w-[45px] h-[45px] rounded-xl flex items-center justify-center ${feature.accent}`}>
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{feature.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

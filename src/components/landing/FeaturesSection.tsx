import { Rocket, Ear, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Rocket,
    title: 'Pre-Call: Signal-Powered Prep',
    description:
      'AI scans history & external signals to craft tailored discovery questions and preemptive objection handlers — so every rep walks in ready.',
  },
  {
    icon: Ear,
    title: 'During Call: Live Detection',
    description:
      'Real-time AI spots tone shifts, objections, and stakeholder signals, delivering whisper-quiet prompts so your rep always knows what to say next.',
  },
  {
    icon: TrendingUp,
    title: 'Post-Call: Signal-to-Growth',
    description:
      "Deep analysis scores call quality against benchmarks and builds custom playbooks to upgrade your team's skills permanently.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-20 bg-white" id="features">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Section badge + heading */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-4">
            Our Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Everything your sales team needs to win
          </h2>
        </div>

        {/* 3-column card grid */}
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-md transition-shadow duration-300"
            >
              <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

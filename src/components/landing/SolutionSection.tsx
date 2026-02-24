import { Brain, BarChart3, Target, ArrowRight } from 'lucide-react';

interface SolutionSectionProps {
  onStartTrialClick: () => void;
}

export function SolutionSection({ onStartTrialClick }: SolutionSectionProps) {
  const pillars = [
    {
      icon: Brain,
      title: 'Real-time AI coaching',
      description:
        'SellSig listens to every call and delivers contextual coaching prompts as the conversation unfolds. Reps get the right words at the right moment.',
      details: [
        'Objection handling suggestions in real-time',
        'Buying signal detection and next-step prompts',
        'Competitor mention alerts with battle cards',
        'Talk ratio and sentiment monitoring',
      ],
    },
    {
      icon: BarChart3,
      title: 'Conversation intelligence',
      description:
        'Every call is automatically recorded, transcribed, and analyzed. Surface patterns across thousands of conversations that drive revenue.',
      details: [
        'Automatic call recording and transcription',
        'Key moment extraction and tagging',
        'Cross-call pattern analysis',
        'Coaching queue for managers',
      ],
    },
    {
      icon: Target,
      title: 'Revenue forecasting',
      description:
        'Move beyond gut-feel pipeline reviews. SellSig analyzes conversation signals to predict deal outcomes with measurable accuracy.',
      details: [
        'Signal-based deal health scoring',
        'Automated risk alerts on stalling deals',
        'Pipeline coverage and gap analysis',
        'Forecast accuracy tracking over time',
      ],
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#fafbfc]">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <div className="max-w-[600px] mx-auto text-center mb-16">
          <p className="text-[13px] font-semibold text-blue-600/80 uppercase tracking-[0.08em] mb-4">
            The platform
          </p>
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#0f172a] leading-[1.15] tracking-[-0.02em] mb-4">
            Intelligence at every stage of the deal
          </h2>
          <p className="text-[16px] text-gray-500 leading-relaxed">
            From first call to closed-won, SellSig gives your team the insight
            advantage that separates consistent performers from everyone else.
          </p>
        </div>

        {/* Three pillars */}
        <div className="grid md:grid-cols-3 gap-8 max-w-[1080px] mx-auto mb-12">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-xl border border-gray-200/80 p-8 hover:border-gray-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-5">
                <pillar.icon className="w-5 h-5 text-blue-600" />
              </div>

              {/* Title */}
              <h3 className="text-[18px] font-semibold text-[#0f172a] mb-3">
                {pillar.title}
              </h3>

              {/* Description */}
              <p className="text-[14px] text-gray-500 leading-relaxed mb-6">
                {pillar.description}
              </p>

              {/* Detail list */}
              <ul className="space-y-2.5">
                {pillar.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60 mt-[7px] shrink-0" />
                    <span className="text-[13px] text-gray-500 leading-snug">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <button
            onClick={onStartTrialClick}
            className="group inline-flex items-center gap-2 text-[14px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            See all capabilities
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

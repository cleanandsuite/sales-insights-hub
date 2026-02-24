import { TrendingDown, Eye, AlertTriangle } from 'lucide-react';

export function ProblemSection() {
  const problems = [
    {
      icon: TrendingDown,
      stat: '67%',
      headline: 'of deals are lost to inaction',
      description:
        'Reps miss buying signals, fail to handle objections, and lose winnable deals every day. Your CRM only tells you after the damage is done.',
    },
    {
      icon: Eye,
      stat: '5hrs',
      headline: 'per week on manual call reviews',
      description:
        'Managers listen to recordings, take notes, schedule coaching sessions. By the time feedback reaches the rep, the deal has moved on.',
    },
    {
      icon: AlertTriangle,
      stat: '73%',
      headline: 'of forecasts miss the mark',
      description:
        'Pipeline reviews rely on gut feel and self-reported data. Leaders make resourcing decisions on information that is weeks stale.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white" id="problem">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <div className="max-w-[600px] mx-auto text-center mb-16">
          <p className="text-[13px] font-semibold text-red-500/80 uppercase tracking-[0.08em] mb-4">
            The problem
          </p>
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#0f172a] leading-[1.15] tracking-[-0.02em]">
            Your team is leaving revenue on the table
          </h2>
        </div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-[960px] mx-auto">
          {problems.map((problem, idx) => (
            <div
              key={idx}
              className="relative p-8 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-6">
                <problem.icon className="w-5 h-5 text-red-500/70" />
              </div>
              <div className="text-[36px] font-bold text-[#0f172a] tracking-tight mb-1">
                {problem.stat}
              </div>
              <div className="text-[15px] font-semibold text-[#0f172a] mb-3">
                {problem.headline}
              </div>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

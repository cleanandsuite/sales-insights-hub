import { Clock, Flag, UserX, AlertTriangle } from 'lucide-react';

const problems = [
  {
    icon: Clock,
    text: 'Gong & Chorus replay calls after the deal\'s cold',
  },
  {
    icon: Flag,
    text: 'ZoomInfo & Outreach flag accounts, but not what happens in the room',
  },
  {
    icon: UserX,
    text: 'Reps fly solo, missing micro-signals like hesitation or urgency',
  },
];

export function ProblemSection() {
  return (
    <section className="bg-[#020617] text-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
          <h2 className="text-lg sm:text-xl font-extrabold text-white/95">
            Buyers are signaling intent everywhere—but most tools miss it
          </h2>
        </div>

        {/* Problem Grid */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {problems.map((problem) => (
            <div
              key={problem.text}
              className="bg-white/5 border border-white/10 rounded-xl p-5 text-center space-y-3"
            >
              <problem.icon className="h-8 w-8 text-red-400 mx-auto drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <p className="text-sm font-medium text-slate-200 leading-snug">
                {problem.text}
              </p>
            </div>
          ))}
        </div>

        {/* Result line */}
        <p className="text-center text-sm sm:text-base font-bold text-red-300">
          Result: Missed opportunities, stalled pipelines, inconsistent performance.
        </p>
      </div>
    </section>
  );
}

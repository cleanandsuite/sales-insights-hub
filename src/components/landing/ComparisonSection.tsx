const rows = [
  {
    feature: 'Real-Time Signal Detection',
    us: 'Tone, Intent, Objections',
    them: 'Post-call only / None',
  },
  {
    feature: 'Pre-Call Proactive Prep',
    us: 'Signal-driven, Personalized',
    them: 'Basic / Generic',
  },
  {
    feature: 'Live Call Guidance',
    us: 'Unobtrusive, Adaptive',
    them: 'Clunky / None',
  },
  {
    feature: 'Personalization',
    us: 'Your style + signals',
    them: 'Team averages / One-size-fits-all',
  },
];

export function ComparisonSection() {
  return (
    <section className="py-12 px-4 bg-slate-100">
      <div className="container mx-auto max-w-3xl">
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-200">
                <th className="text-left p-3 font-extrabold text-slate-900">Feature</th>
                <th className="text-left p-3 font-extrabold text-slate-900">Us</th>
                <th className="text-left p-3 font-extrabold text-slate-900">Competitors</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className={idx < rows.length - 1 ? 'border-b border-slate-100' : ''}>
                  <td className="p-3 bg-white text-slate-500 font-medium">{row.feature}</td>
                  <td className="p-3 bg-violet-500/[0.08] font-extrabold text-violet-700 border-l-[3px] border-l-violet-600">
                    {row.us}
                  </td>
                  <td className="p-3 bg-white text-slate-500 font-medium">{row.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

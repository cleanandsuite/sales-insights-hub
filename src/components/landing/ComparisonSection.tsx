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
    <section className="py-14 px-4 bg-gray-50" id="comparison">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-4">
            Why SellSig
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            See how we compare
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-200">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-600">
                <th className="text-left p-4 font-bold text-white">Feature</th>
                <th className="text-left p-4 font-bold text-white">SellSig</th>
                <th className="text-left p-4 font-bold text-white">Competitors</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`${idx < rows.length - 1 ? 'border-b border-gray-100' : ''} ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="p-4 text-gray-700 font-medium">{row.feature}</td>
                  <td className="p-4 font-bold text-blue-700 border-l-4 border-l-blue-600 bg-blue-50/50">
                    {row.us}
                  </td>
                  <td className="p-4 text-gray-500 font-medium">{row.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

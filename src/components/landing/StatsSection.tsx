const stats = [
  { value: '41', suffix: '%', label: 'Win rate increase', delta: '▲ Avg across all teams' },
  { value: '2.8', suffix: '×', label: 'Faster rep onboarding', delta: '▲ vs. industry benchmark' },
  { value: '18k', suffix: '+', label: 'Reps coached to date', delta: '▲ Growing monthly' },
  { value: '$2.1', suffix: 'B', label: 'Pipeline influenced', delta: '▲ Last 12 months' },
];

export function StatsSection() {
  return (
    <section className="py-20 px-4 md:px-10 bg-[#0A1628]">
      <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-white/[.08] rounded-2xl overflow-hidden">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#0A1628] p-8 md:p-10">
            <div className="font-bricolage text-[clamp(36px,5vw,52px)] font-extrabold text-white leading-none tracking-[-2px]">
              {s.value}
              <span className="text-[#6B9FFF]">{s.suffix}</span>
            </div>
            <div className="text-sm text-white/[.45] mt-2 font-medium">{s.label}</div>
            <div className="text-xs text-[#6BFFA4] font-semibold mt-1.5 flex items-center gap-1">
              {s.delta}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

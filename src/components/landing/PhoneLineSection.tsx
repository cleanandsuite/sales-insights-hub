interface PhoneLineSectionProps {
  onStartTrialClick: () => void;
}

export function PhoneLineSection({ onStartTrialClick }: PhoneLineSectionProps) {
  const specs = [
    { value: '5,000', unit: 'min', label: 'Monthly minutes included' },
    { value: '3', unit: 'seats', label: 'Users on Pro plan' },
    { value: '1', unit: 'number', label: 'Dedicated business line' },
    { value: '99.9', unit: '%', label: 'Uptime SLA guaranteed' },
  ];

  const reps = [
    { initials: 'JR', name: 'Jordan Rivera', detail: 'Meridian Group · Ended 4 min ago · 18 min', score: '91', status: 'Scored', gradient: 'from-[#3B6EE8] to-[#6B9FFF]', scoreColor: '#00875A' },
    { initials: 'SM', name: 'Sara Malone', detail: 'NovaTech Inc. · On call · 8:24 elapsed', score: '📞', status: 'Live', gradient: 'from-[#E83B6E] to-[#FF9FBF]', scoreColor: '#0057FF' },
    { initials: 'DK', name: 'David Kim', detail: 'Apex Group · Ended 12 min ago · 22 min', score: '88', status: 'Scored', gradient: 'from-[#1a6b3a] to-[#3BE89A]', scoreColor: '#00875A' },
  ];

  return (
    <section className="bg-[#0A1628] py-24 px-4 md:px-10" id="phone">
      <div className="max-w-[1280px] mx-auto grid md:grid-cols-2 gap-20 items-center">
        {/* Left text */}
        <div>
          <span className="text-xs font-bold text-[#6B9FFF] tracking-[.08em] uppercase mb-3 block">
            Dedicated Phone Infrastructure
          </span>
          <h2 className="font-bricolage text-[clamp(36px,4vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.1] text-white mb-4">
            Your team's own <span className="text-[#6B9FFF]">business phone line.</span> Included.
          </h2>
          <p className="text-[17px] text-white/[.55] leading-[1.75] mb-10">
            Every Pro plan comes with a real, dedicated US business number backed by carrier-grade infrastructure — fully integrated with SellSig AI coaching. No Twilio. No third-party dialer.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-10">
            {specs.map((s) => (
              <div key={s.label} className="bg-white/[.05] border border-white/[.1] rounded-xl p-5 hover:bg-white/[.08] hover:border-[rgba(107,159,255,.4)] transition-all">
                <div className="font-bricolage text-[32px] font-extrabold text-white leading-none">
                  {s.value}<span className="text-sm font-medium text-white/[.3] ml-1">{s.unit}</span>
                </div>
                <div className="text-xs text-white/[.4] mt-1.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={onStartTrialClick}
              className="bg-white text-[#0A1628] px-7 py-3.5 rounded-[10px] text-[15px] font-bold hover:bg-[#EEF3FF] hover:text-[#0057FF] transition-all hover:-translate-y-0.5 shadow-[0_8px_32px_rgba(255,255,255,.15)] inline-flex items-center gap-2"
            >
              Get your line — $200/mo →
            </button>
            <a
              href="#features"
              className="border-[1.5px] border-white/[.2] text-white/[.7] px-7 py-3 rounded-[10px] text-[15px] font-semibold hover:border-white/[.5] hover:text-white transition-all inline-flex items-center gap-2"
            >
              See all integrations
            </a>
          </div>
        </div>

        {/* Right phone dashboard */}
        <div className="bg-white rounded-[20px] shadow-[0_32px_100px_rgba(0,0,0,.4)] overflow-hidden">
          <div className="bg-[#162140] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6B9FFF]" />
              <span className="font-bricolage text-[15px] font-bold text-white">+1 (888) 924-7731</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6BFFA4]">
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-blink" />
              3 reps active
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {[
                { v: '2,841', l: 'Min Used' },
                { v: '2,159', l: 'Remaining' },
                { v: '47', l: 'Today' },
              ].map((s) => (
                <div key={s.l} className="bg-[#F7F9FC] border border-[#E4E8F0] rounded-[10px] py-3.5 px-3 text-center">
                  <div className="font-bricolage text-[22px] font-extrabold text-[#0A1628]">{s.v}</div>
                  <div className="text-[10px] text-[#6B7A99] mt-0.5 uppercase tracking-[.06em] font-semibold">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {reps.map((r) => (
                <div key={r.initials} className="flex items-center gap-3 p-2.5 rounded-[10px] border border-[#E4E8F0] bg-white">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${r.gradient} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                    {r.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#0A1628]">{r.name}</div>
                    <div className="text-[11px] text-[#6B7A99] mt-0.5 truncate">{r.detail}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bricolage text-lg font-bold" style={{ color: r.scoreColor }}>{r.score}</div>
                    <div className="text-[11px] font-semibold" style={{ color: r.status === 'Live' ? '#0057FF' : '#6B7A99' }}>{r.status}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-semibold text-[#0A1628]">Monthly Minutes</span>
                <span className="text-[#6B7A99]">2,841 / 5,000 used</span>
              </div>
              <div className="h-2 bg-[#E4E8F0] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#0057FF] to-[#6B9FFF]" style={{ width: '56%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

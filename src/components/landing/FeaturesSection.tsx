const features = [
  { icon: '🧠', title: 'SWOT-Powered Script Builder', desc: "Input your company and prospect data — SellSig generates a complete, objection-ready call script personalized to each buyer in under 10 seconds." },
  { icon: '❤️', title: 'Live Emotion Detection', desc: 'Our proprietary 6-dimension emotion engine reads interest, trust, urgency, and skepticism in real time — so reps always know how the prospect truly feels.' },
  { icon: '⚡', title: 'Real-Time Objection Handling', desc: 'The moment an objection is detected, SellSig classifies it and surfaces the proven response — price, competitor, timing, and 20+ other objection types.' },
  { icon: '📊', title: '40-Dimension Call Scoring', desc: 'Every call is automatically scored across discovery, objection handling, closing technique, talk ratio, and 36 more competencies mapped to your playbook.' },
  { icon: '📞', title: 'Dedicated Business Phone Line', desc: 'Every Pro plan includes a professional dedicated number with 5,000 minutes. No third-party dialer needed — SellSig is your complete calling infrastructure.' },
  { icon: '🎯', title: 'Personalized Growth Roadmaps', desc: 'After every call, each rep receives a prioritized coaching plan with specific module assignments, peer benchmarks, and a clear path to their next performance level.' },
];

export function FeaturesSection() {
  return (
    <section className="bg-[#F7F9FC] py-24 px-4 md:px-10" id="features">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#0057FF] tracking-[.08em] uppercase mb-3 block">
            Platform Capabilities
          </span>
          <h2 className="font-bricolage text-[clamp(34px,3.8vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.1] text-[#0A1628] mb-4">
            Everything your team needs to <span className="text-[#0057FF]">win more</span>
          </h2>
          <p className="text-[17px] text-[#3B4A63] leading-[1.75] max-w-[520px] mx-auto">
            SellSig replaces your scattered stack of coaching tools, dialers, and recording software with one intelligent, integrated platform.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-[#E4E8F0] rounded-xl p-8 transition-all duration-200 hover:border-[#D0DCFF] hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(10,22,40,.12)]"
            >
              <div className="w-11 h-11 rounded-[10px] bg-[#EEF3FF] flex items-center justify-center text-[22px] mb-5">
                {f.icon}
              </div>
              <div className="font-bricolage text-lg font-bold text-[#0A1628] mb-2.5">{f.title}</div>
              <p className="text-sm text-[#3B4A63] leading-[1.7]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

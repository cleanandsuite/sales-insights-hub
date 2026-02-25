import { Zap, BookOpen, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Zap,
    stat: '34%',
    statLabel: 'more closes',
    title: 'Real-Time Coaching',
    desc: 'Get instant suggestions during calls. Handle objections as they happen. Never miss a close — AI responds in under 2 seconds with the proven counter.',
    color: '#7C3AED',
  },
  {
    icon: BookOpen,
    stat: '500+',
    statLabel: 'proven responses',
    title: 'Objection Library',
    desc: '500+ battle-tested responses for every objection — price, competitor, timing, and 20+ other types. Customize for your industry and selling style.',
    color: '#0057FF',
  },
  {
    icon: BarChart3,
    stat: '40+',
    statLabel: 'metrics tracked',
    title: 'Performance Analytics',
    desc: 'Track every metric that matters across 40+ competency dimensions. See where your team wins and loses. Coach with data, not gut feel.',
    color: '#00875A',
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-[#F7F9FC] py-24 px-4 md:px-10" id="features">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#0057FF] tracking-[.08em] uppercase mb-3 block">
            Why Teams Switch to SellSig
          </span>
          <h2 className="font-bricolage text-[clamp(34px,3.8vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.1] text-[#0A1628] mb-4">
            Close more deals. <span className="text-[#0057FF]">Ramp faster.</span> Win consistently.
          </h2>
          <p className="text-[17px] text-[#3B4A63] leading-[1.75] max-w-[560px] mx-auto">
            SellSig replaces your scattered stack of coaching tools, dialers, and recording software with one intelligent platform — integrated with Salesforce, HubSpot & 50+ CRMs.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-[#E4E8F0] rounded-xl p-8 transition-all duration-200 hover:border-[#D0DCFF] hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(10,22,40,.12)]"
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-11 h-11 rounded-[10px] flex items-center justify-center"
                  style={{ background: `${f.color}12` }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <div className="text-right ml-auto">
                  <div className="font-bricolage text-2xl font-extrabold leading-none" style={{ color: f.color }}>
                    {f.stat}
                  </div>
                  <div className="text-[10px] text-[#6B7A99] font-medium">{f.statLabel}</div>
                </div>
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

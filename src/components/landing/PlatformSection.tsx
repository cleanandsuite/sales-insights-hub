import { useState } from 'react';

const tabs = [
  {
    num: 'Phase 01',
    title: 'Pre-Call Preparation',
    desc: 'AI-generated scripts tailored to each prospect using SWOT intelligence.',
  },
  {
    num: 'Phase 02',
    title: 'Live Call Coaching',
    desc: 'Real-time emotion detection, objection handling, and buying signal alerts.',
  },
  {
    num: 'Phase 03',
    title: 'Post-Call Analysis',
    desc: '40-dimension scoring, growth roadmaps, and automated manager digests.',
  },
];

function PreCallPanel() {
  return (
    <div className="grid md:grid-cols-2 gap-16 items-center">
      <div>
        <h3 className="font-bricolage text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-1px] text-[#0A1628] mb-3.5 leading-tight">
          Walk into every call with the perfect script
        </h3>
        <p className="text-base text-[#3B4A63] leading-[1.75] mb-7">
          Input your company's strengths and your prospect's profile. SellSig generates a full discovery-to-close script — personalized, objection-ready, updated in real time.
        </p>
        <ul className="flex flex-col gap-2.5">
          {[
            'SWOT-driven competitive positioning',
            'Auto-generated discovery questions',
            'Pre-emptive objection handlers',
            'Tailored value propositions per buyer persona',
          ].map((item) => (
            <li key={item} className="flex gap-2.5 items-start text-sm text-[#3B4A63]">
              <span className="w-[18px] h-[18px] rounded-full bg-[#EEF3FF] border border-[#D0DCFF] flex items-center justify-center text-[10px] text-[#0057FF] shrink-0 mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white border border-[#E4E8F0] rounded-[20px] shadow-[0_12px_48px_rgba(10,22,40,.12)] overflow-hidden">
        <div className="bg-[#F7F9FC] border-b border-[#E4E8F0] px-5 py-3 flex items-center gap-2">
          <div className="flex gap-[5px]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="text-xs text-[#6B7A99] ml-2 font-semibold">SWOT Script Builder</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-[#E3F5EE] border border-[rgba(0,135,90,.15)] rounded-lg p-3">
              <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[#00875A] mb-1.5">Strength</div>
              <div className="text-xs text-[#3B4A63] leading-snug">Fastest onboarding in market (2 days vs 14 avg)</div>
            </div>
            <div className="bg-[#FEF0EF] border border-[rgba(217,45,32,.12)] rounded-lg p-3">
              <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[#D92D20] mb-1.5">Weakness</div>
              <div className="text-xs text-[#3B4A63] leading-snug">No native Slack integration yet</div>
            </div>
            <div className="bg-[#EEF3FF] border border-[#D0DCFF] rounded-lg p-3">
              <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[#0057FF] mb-1.5">Opportunity</div>
              <div className="text-xs text-[#3B4A63] leading-snug">Prospect's contract expires in Q2</div>
            </div>
            <div className="bg-[#FEF6EE] border border-[rgba(181,71,8,.15)] rounded-lg p-3">
              <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[#B54708] mb-1.5">Threat</div>
              <div className="text-xs text-[#3B4A63] leading-snug">Competitor already in POC stage</div>
            </div>
          </div>
          <button className="w-full bg-[#0057FF] text-white rounded-lg py-3 text-[13px] font-semibold mb-3.5 hover:bg-[#003FBB] transition-colors">
            Generate Call Script →
          </button>
          <div className="bg-[#F7F9FC] border border-[#E4E8F0] rounded-lg p-3.5 space-y-2">
            {[
              { color: '#0057FF', text: 'Open with Q2 deadline — ask about renewal timeline' },
              { color: '#00875A', text: 'Lead with 2-day onboarding vs their current 3-week setup' },
              { color: '#B54708', text: 'Pre-empt Slack concern — mention API + Zapier workaround' },
            ].map((line) => (
              <div key={line.text} className="flex gap-2 items-start">
                <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: line.color }} />
                <span className="text-xs text-[#3B4A63] leading-snug">{line.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveCoachingPanel() {
  const emotions = [
    { label: 'Interest', value: 78, color: '#0057FF' },
    { label: 'Trust', value: 65, color: '#00875A' },
    { label: 'Skepticism', value: 32, color: '#D92D20' },
    { label: 'Urgency', value: 61, color: '#B54708' },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-16 items-center">
      <div>
        <h3 className="font-bricolage text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-1px] text-[#0A1628] mb-3.5 leading-tight">
          Coach your reps while the deal is still alive
        </h3>
        <p className="text-base text-[#3B4A63] leading-[1.75] mb-7">
          SellSig listens to every word and detects emotion shifts, objections, and buying signals in real time — then surfaces exactly what to say next.
        </p>
        <ul className="flex flex-col gap-2.5">
          {[
            '6-dimension emotion engine runs in real time',
            'Objection classification with proven responses',
            'Buying signal alerts with close recommendations',
            'Manager-visible live feed for shadow coaching',
          ].map((item) => (
            <li key={item} className="flex gap-2.5 items-start text-sm text-[#3B4A63]">
              <span className="w-[18px] h-[18px] rounded-full bg-[#EEF3FF] border border-[#D0DCFF] flex items-center justify-center text-[10px] text-[#0057FF] shrink-0 mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white border border-[#E4E8F0] rounded-[20px] shadow-[0_12px_48px_rgba(10,22,40,.12)] overflow-hidden">
        <div className="bg-[#F7F9FC] border-b border-[#E4E8F0] px-5 py-3 flex items-center gap-2">
          <div className="flex gap-[5px]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="text-xs text-[#6B7A99] ml-2 font-semibold">Live Coaching — Active Call</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-2 mb-3.5">
            {emotions.map((e) => (
              <div key={e.label} className="bg-[#F7F9FC] border border-[#E4E8F0] rounded-[10px] p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#0A1628]">{e.label}</span>
                  <span className="font-bricolage text-xl font-bold" style={{ color: e.color }}>{e.value}</span>
                </div>
                <div className="h-1.5 bg-[#E4E8F0] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${e.value}%`, background: e.color }} />
                </div>
              </div>
            ))}
          </div>
          {/* Objection card */}
          <div className="bg-[#FEF6EE] border border-[rgba(181,71,8,.2)] rounded-[10px] p-3.5 mb-2.5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#B54708] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Price Objection</span>
              <span className="text-[11px] text-[#6B7A99]">4:22</span>
            </div>
            <p className="text-xs text-[#3B4A63] mb-1.5">"This is more than what we have budgeted right now."</p>
            <div className="flex gap-1.5 items-start bg-white rounded-md p-2 border border-[rgba(181,71,8,.1)]">
              <span className="text-[10px] font-bold text-[#0057FF] whitespace-nowrap">AI →</span>
              <span className="text-[11px] text-[#3B4A63] leading-snug">"Most clients recover costs in under 60 days. Want me to walk through the ROI model?"</span>
            </div>
          </div>
          {/* Buying signal card */}
          <div className="bg-[#EEF3FF] border border-[#D0DCFF] rounded-[10px] p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#0057FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">🎯 Buying Signal</span>
              <span className="text-[11px] text-[#6B7A99]">7:08</span>
            </div>
            <p className="text-xs text-[#0A1628] mb-1.5">"When would we be able to get started?"</p>
            <div className="flex gap-1.5 items-start bg-white rounded-md p-2 border border-[#D0DCFF]">
              <span className="text-[10px] font-bold text-[#0057FF] whitespace-nowrap">AI →</span>
              <span className="text-[11px] text-[#3B4A63] leading-snug">Strong intent detected — pivot to close. Mention 2-week onboarding timeline.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostCallPanel() {
  const scores = [
    { label: 'Discovery', value: 92 },
    { label: 'Objection Handling', value: 79 },
    { label: 'Closing Attempts', value: 84 },
    { label: 'Talk/Listen Ratio', value: 68 },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-16 items-center">
      <div>
        <h3 className="font-bricolage text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-1px] text-[#0A1628] mb-3.5 leading-tight">
          Every call produces a full growth plan
        </h3>
        <p className="text-base text-[#3B4A63] leading-[1.75] mb-7">
          SellSig scores every call across 40+ competency dimensions, extracts buyer intent keywords, and generates a personalized coaching roadmap automatically.
        </p>
        <ul className="flex flex-col gap-2.5">
          {[
            '40+ dimension competency scoring with benchmarks',
            'Moment-level transcript with AI commentary',
            'Buyer intent keyword extraction and deal risk scoring',
            'Automated manager digest — saves 4+ hours per week',
            'Personalized rep growth roadmap with assigned modules',
          ].map((item) => (
            <li key={item} className="flex gap-2.5 items-start text-sm text-[#3B4A63]">
              <span className="w-[18px] h-[18px] rounded-full bg-[#EEF3FF] border border-[#D0DCFF] flex items-center justify-center text-[10px] text-[#0057FF] shrink-0 mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white border border-[#E4E8F0] rounded-[20px] shadow-[0_12px_48px_rgba(10,22,40,.12)] overflow-hidden">
        <div className="bg-[#F7F9FC] border-b border-[#E4E8F0] px-5 py-3 flex items-center gap-2">
          <div className="flex gap-[5px]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="text-xs text-[#6B7A99] ml-2 font-semibold">Post-Call Analysis — Jordan Rivera</span>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-5 mb-4 p-4 bg-[#F7F9FC] rounded-[10px] border border-[#E4E8F0]">
            <div className="w-[72px] h-[72px] rounded-full bg-[#0057FF] flex items-center justify-center shrink-0">
              <span className="font-bricolage text-[28px] font-extrabold text-white">87</span>
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-[#0A1628]">Excellent Call Performance</h4>
              <p className="text-[13px] text-[#6B7A99] mt-0.5">Top 8% of your team · Meridian Group · 18 min</p>
              <div className="text-xs font-semibold text-[#00875A] mt-1">▲ +11 from last call average</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 mb-3.5">
            {scores.map((s) => (
              <div key={s.label} className="flex items-center gap-2.5">
                <span className="text-xs text-[#3B4A63] w-[110px] shrink-0">{s.label}</span>
                <div className="flex-1 h-1.5 bg-[#E4E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0057FF] to-[#6B9FFF]"
                    style={{ width: `${s.value}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-[#0A1628] w-7 text-right">{s.value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 items-start p-2.5 bg-[#EEF3FF] rounded-lg border border-[#D0DCFF]">
            <span className="text-sm shrink-0">💡</span>
            <span className="text-xs text-[#3B4A63] leading-snug">
              <strong className="text-[#0057FF] font-semibold">Key insight:</strong> Missed close attempt at 7:08 when prospect asked about onboarding timeline — prime buying signal.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlatformSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-24 px-4 md:px-10" id="platform">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#0057FF] tracking-[.08em] uppercase mb-3 block">
            The SellSig Intelligence Loop
          </span>
          <h2 className="font-bricolage text-[clamp(34px,3.8vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.1] text-[#0A1628] mb-4">
            Three phases. <span className="text-[#0057FF]">One platform.</span>
          </h2>
          <p className="text-[17px] text-[#3B4A63] leading-[1.75] max-w-[520px] mx-auto">
            Before, during, and after every call — SellSig makes your team sharper at every stage.
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`text-left p-6 rounded-xl border-[1.5px] transition-all relative overflow-hidden ${
                activeTab === i
                  ? 'border-[#0057FF] bg-[#EEF3FF] shadow-[0_4px_20px_rgba(0,87,255,.1)]'
                  : 'border-[#E4E8F0] bg-white hover:border-[#D0DCFF]'
              }`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${activeTab === i ? 'bg-[#0057FF]' : 'bg-transparent'}`} />
              <div className={`text-[11px] font-bold tracking-[.08em] uppercase mb-2 ${activeTab === i ? 'text-[#0057FF]' : 'text-[#6B7A99]'}`}>
                {tab.num}
              </div>
              <div className={`font-bricolage text-lg font-bold mb-1.5 ${activeTab === i ? 'text-[#0A1628]' : 'text-[#0A1628]'}`}>
                {tab.title}
              </div>
              <div className={`text-[13px] leading-relaxed ${activeTab === i ? 'text-[#3B4A63]' : 'text-[#6B7A99]'}`}>
                {tab.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Panels */}
        {activeTab === 0 && <PreCallPanel />}
        {activeTab === 1 && <LiveCoachingPanel />}
        {activeTab === 2 && <PostCallPanel />}
      </div>
    </section>
  );
}

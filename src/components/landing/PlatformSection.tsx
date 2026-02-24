import { useState } from 'react';

const tabs = [
  {
    num: '01 — Pre-Call',
    title: 'AI Script Builder',
    desc: 'Generate a personalized, SWOT-powered call script in seconds before you dial.',
  },
  {
    num: '02 — During Call',
    title: 'Live Coaching',
    desc: 'Real-time emotion detection, objection handling, and next-action prompts.',
  },
  {
    num: '03 — Post-Call',
    title: 'Deep Analysis',
    desc: 'Full call scoring, keyword intelligence, and a personalized rep growth plan.',
  },
];

function PreCallPanel() {
  return (
    <div className="grid md:grid-cols-2 gap-16 items-center">
      <div>
        <h3 className="font-bricolage text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-1px] text-[#0A1628] mb-3.5 leading-tight">
          Walk into every call with a winning script
        </h3>
        <p className="text-base text-[#3B4A63] leading-[1.75] mb-7">
          Enter your company's strengths and weaknesses alongside your target's profile. SellSig synthesizes a fully personalized, objection-ready call script — tailored to the exact buyer — in under 10 seconds.
        </p>
        <ul className="flex flex-col gap-2.5">
          {[
            'SWOT-driven script generation from your real competitive data',
            'Pre-arms reps for the top 3 objections most likely to arise',
            'Adjusts tone and language to match each buyer persona',
            'Includes competitor battle card and ROI talking points',
            'One-click update as your market landscape shifts',
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
          <span className="text-xs text-[#6B7A99] ml-2 font-semibold">SellSig Script Builder — Pre-Call Intelligence</span>
        </div>
        <div className="p-5">
          {/* Company/Target inputs */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-[#F7F9FC] border border-[#E4E8F0] rounded-lg p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[#6B7A99] mb-0.5">Your Company</div>
              <div className="text-[13px] font-semibold text-[#0A1628]">Apex Solutions</div>
            </div>
            <div className="bg-[#F7F9FC] border border-[#E4E8F0] rounded-lg p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[#6B7A99] mb-0.5">Target Account</div>
              <div className="text-[13px] font-semibold text-[#0A1628]">Meridian Group</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-[#E3F5EE] border border-[rgba(0,135,90,.15)] rounded-lg p-3">
              <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[#00875A] mb-1.5">Strength</div>
              <div className="text-xs text-[#3B4A63] leading-snug">3× faster onboarding, 99.9% uptime SLA</div>
            </div>
            <div className="bg-[#FEF0EF] border border-[rgba(217,45,32,.12)] rounded-lg p-3">
              <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[#D92D20] mb-1.5">Weakness</div>
              <div className="text-xs text-[#3B4A63] leading-snug">Higher price point vs. legacy incumbents</div>
            </div>
            <div className="bg-[#EEF3FF] border border-[#D0DCFF] rounded-lg p-3">
              <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[#0057FF] mb-1.5">Opportunity</div>
              <div className="text-xs text-[#3B4A63] leading-snug">Scaling 40% YoY, outgrown current tools</div>
            </div>
            <div className="bg-[#FEF6EE] border border-[rgba(181,71,8,.15)] rounded-lg p-3">
              <div className="text-[10px] font-bold uppercase tracking-[.08em] text-[#B54708] mb-1.5">Concern</div>
              <div className="text-xs text-[#3B4A63] leading-snug">CFO budget scrutiny, needs ROI justification</div>
            </div>
          </div>
          <button className="w-full bg-[#0057FF] text-white rounded-lg py-3 text-[13px] font-semibold mb-3.5 hover:bg-[#003FBB] transition-colors">
            ⚡ Generate Script
          </button>
          <div className="bg-[#F7F9FC] border border-[#E4E8F0] rounded-lg p-3.5 space-y-2">
            {[
              { color: '#0057FF', text: <><strong className="text-[#0A1628] font-semibold">Open:</strong> "I saw Meridian just hit 40% growth — exactly the stage where legacy tools become the bottleneck..."</> },
              { color: '#00875A', text: <><strong className="text-[#0A1628] font-semibold">Lead with:</strong> 3× onboarding speed — addresses Q3 disruption concern directly</> },
              { color: '#B54708', text: <><strong className="text-[#0A1628] font-semibold">Pre-empt price:</strong> "We're priced higher intentionally — here's the 60-day ROI math..."</> },
            ].map((line, i) => (
              <div key={i} className="flex gap-2 items-start">
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
    { label: 'Interest', value: 84, color: '#00875A' },
    { label: 'Trust', value: 71, color: '#0057FF' },
    { label: 'Skepticism', value: 32, color: '#D92D20' },
    { label: 'Urgency', value: 61, color: '#B54708' },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-16 items-center">
      <div>
        <h3 className="font-bricolage text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-1px] text-[#0A1628] mb-3.5 leading-tight">
          Your AI coach is on every single call
        </h3>
        <p className="text-base text-[#3B4A63] leading-[1.75] mb-7">
          SellSig reads your prospect's emotional state in real time — surfacing skepticism, excitement, and buying intent the moment it appears — so your reps respond confidently instead of guessing.
        </p>
        <ul className="flex flex-col gap-2.5">
          {[
            '6-dimension live emotion and sentiment analysis',
            'Objection classified and responded to in under 2 seconds',
            'Competitor mentions trigger instant battle card overlay',
            'Talk/listen ratio and filler word coaching',
            'Silent coaching — invisible to your prospect',
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
          <span className="text-xs text-[#6B7A99] ml-2 font-semibold">Live Coaching — 7:14 into call</span>
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
              <span className="text-[11px] text-[#3B4A63] leading-snug">"Most clients recover costs in under 60 days. Want me to walk through the ROI model for your team size?"</span>
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
              <span className="text-[11px] text-[#3B4A63] leading-snug">Strong intent detected — pivot to close. Mention 2-week onboarding timeline and propose next step.</span>
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
          SellSig scores every call across 40+ competency dimensions, extracts buyer intent keywords, and generates a personalized coaching roadmap for each rep — automatically sent to both rep and manager.
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
              <strong className="text-[#0057FF] font-semibold">Key insight:</strong> Missed close attempt at 7:08 when prospect asked about onboarding timeline — prime buying signal. Practice "direct close" drill in module 4B.
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
            One platform. <span className="text-[#0057FF]">Three unfair advantages.</span>
          </h2>
          <p className="text-[17px] text-[#3B4A63] leading-[1.75] max-w-[520px] mx-auto">
            The only sales coaching platform that works before, during, and after every call — turning each conversation into a permanent competitive advantage.
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

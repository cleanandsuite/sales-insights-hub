import {
  Mic,
  BarChart3,
  Zap,
  Users,
  Shield,
  RefreshCw,
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Mic,
      title: 'Live call coaching',
      description:
        'AI-generated prompts appear on screen as the conversation unfolds. Handle objections, pivot to value, and close with confidence.',
    },
    {
      icon: BarChart3,
      title: 'Performance analytics',
      description:
        'Track talk ratios, sentiment trends, question frequency, and 40+ metrics per rep. Identify what separates your closers from the rest.',
    },
    {
      icon: Zap,
      title: 'Instant transcription',
      description:
        'Every call is transcribed in real-time with speaker separation. Search across your entire call library in seconds.',
    },
    {
      icon: Users,
      title: 'Team leaderboards',
      description:
        'Gamified performance tracking that motivates without micromanaging. Reps see exactly where they stand and what to improve.',
    },
    {
      icon: Shield,
      title: 'Enterprise security',
      description:
        'SOC 2 Type II compliant. 256-bit encryption at rest and in transit. GDPR ready. Your data never leaves your control.',
    },
    {
      icon: RefreshCw,
      title: 'CRM integration',
      description:
        'Bi-directional sync with Salesforce, HubSpot, and 50+ tools. Call insights flow directly into your existing workflow.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white" id="features">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <div className="max-w-[600px] mx-auto text-center mb-16">
          <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-4">
            Capabilities
          </p>
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#0f172a] leading-[1.15] tracking-[-0.02em] mb-4">
            Everything your revenue team needs
          </h2>
          <p className="text-[16px] text-gray-500 leading-relaxed">
            Built for the workflows that drive pipeline, not the ones that slow it down.
          </p>
        </div>

        {/* Feature grid - 3x2 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1080px] mx-auto">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group p-7 rounded-xl border border-gray-100 hover:border-gray-200 bg-white hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-[#0f172a] flex items-center justify-center mb-5 transition-colors duration-200">
                <feature.icon className="w-[18px] h-[18px] text-gray-500 group-hover:text-white transition-colors duration-200" />
              </div>

              <h3 className="text-[16px] font-semibold text-[#0f172a] mb-2">
                {feature.title}
              </h3>

              <p className="text-[14px] text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

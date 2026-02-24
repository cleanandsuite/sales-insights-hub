import { Check, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  onStartTrialClick: () => void;
}

const tiers = [
  {
    name: 'Growth',
    description: 'For teams getting started with revenue intelligence',
    price: '$99',
    period: '/user/mo',
    annualNote: 'Billed annually. $119/mo billed monthly.',
    features: [
      'Unlimited call recording & transcription',
      'AI coaching suggestions (200 mins/mo)',
      'Basic conversation analytics',
      'Team performance dashboards',
      'Salesforce & HubSpot integration',
      'Email support',
    ],
    cta: 'Start free trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    description: 'For revenue teams that need to win consistently',
    price: '$249',
    period: '/user/mo',
    annualNote: 'Billed annually. $299/mo billed monthly.',
    badge: 'Most popular',
    features: [
      'Everything in Growth, plus:',
      'Unlimited AI coaching minutes',
      'Real-time live call coaching',
      'Revenue forecasting & deal intelligence',
      'Custom coaching playbooks',
      'Team leaderboards & gamification',
      'Advanced analytics & reporting',
      'API access',
      'Priority support with dedicated CSM',
    ],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'For organizations that run on revenue intelligence',
    price: 'Custom',
    period: '',
    annualNote: 'Volume pricing for 50+ seats',
    features: [
      'Everything in Professional, plus:',
      'Custom AI model training on your data',
      'SSO / SAML authentication',
      'Dedicated infrastructure',
      'Custom integrations & webhooks',
      'SLA guarantees (99.99% uptime)',
      '24/7 phone support',
      'Quarterly business reviews',
      'Custom onboarding & training',
    ],
    cta: 'Talk to sales',
    highlighted: false,
  },
];

export function PricingSection({ onStartTrialClick }: PricingSectionProps) {
  return (
    <section className="py-20 md:py-28 bg-white" id="pricing">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <div className="max-w-[640px] mx-auto text-center mb-16">
          <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-4">
            Pricing
          </p>
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#0f172a] leading-[1.15] tracking-[-0.02em] mb-4">
            Invest in revenue, not cost
          </h2>
          <p className="text-[16px] text-gray-500 leading-relaxed">
            SellSig pays for itself with one additional closed deal per quarter.
            Every plan includes a 14-day free trial.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-[1080px] mx-auto mb-12">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`relative rounded-xl p-8 flex flex-col ${
                tier.highlighted
                  ? 'bg-[#0f172a] text-white ring-1 ring-[#0f172a] shadow-[0_8px_40px_rgba(15,23,42,0.15)]'
                  : 'bg-white border border-gray-200/80'
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-3 left-8 inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-[12px] font-semibold">
                  {tier.badge}
                </div>
              )}

              {/* Plan name */}
              <h3
                className={`text-[18px] font-semibold mb-1 ${
                  tier.highlighted ? 'text-white' : 'text-[#0f172a]'
                }`}
              >
                {tier.name}
              </h3>
              <p
                className={`text-[14px] mb-6 ${
                  tier.highlighted ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {tier.description}
              </p>

              {/* Price */}
              <div className="mb-1">
                <span
                  className={`text-[40px] font-bold tracking-tight ${
                    tier.highlighted ? 'text-white' : 'text-[#0f172a]'
                  }`}
                >
                  {tier.price}
                </span>
                {tier.period && (
                  <span
                    className={`text-[15px] ml-1 ${
                      tier.highlighted ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {tier.period}
                  </span>
                )}
              </div>
              <p
                className={`text-[13px] mb-8 ${
                  tier.highlighted ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {tier.annualNote}
              </p>

              {/* CTA */}
              <button
                onClick={onStartTrialClick}
                className={`group w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-[14px] font-medium transition-all mb-8 ${
                  tier.highlighted
                    ? 'bg-white text-[#0f172a] hover:bg-gray-100'
                    : 'bg-[#0f172a] text-white hover:bg-[#1e293b]'
                }`}
              >
                {tier.cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3">
                    <Check
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        tier.highlighted ? 'text-blue-400' : 'text-gray-400'
                      }`}
                    />
                    <span
                      className={`text-[14px] leading-snug ${
                        tier.highlighted ? 'text-gray-300' : 'text-gray-500'
                      } ${fIdx === 0 && idx > 0 ? 'font-medium' : ''}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ROI callout */}
        <div className="max-w-[720px] mx-auto text-center">
          <div className="rounded-xl border border-gray-200/80 bg-gray-50/50 p-8">
            <p className="text-[15px] text-gray-600 leading-relaxed mb-4">
              The average SellSig customer sees a{' '}
              <span className="font-semibold text-[#0f172a]">12x return on investment</span>{' '}
              within the first 90 days. One additional closed deal per quarter pays for
              your entire team's licenses.
            </p>
            <button
              onClick={onStartTrialClick}
              className="group inline-flex items-center gap-2 text-[14px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Calculate your ROI
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

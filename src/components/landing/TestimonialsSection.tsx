import { Star, Shield, Lock, Award } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        'We saw a 40% increase in close rates within the first quarter. SellSig caught signals our reps were missing on every single call.',
      author: 'Sarah Chen',
      role: 'VP of Sales',
      company: 'TechFlow',
      metric: '+40% close rate',
    },
    {
      quote:
        'Our forecast accuracy went from 58% to 91%. Leadership finally trusts the pipeline numbers we bring to board meetings.',
      author: 'Marcus Johnson',
      role: 'CRO',
      company: 'CloudScale',
      metric: '91% forecast accuracy',
    },
    {
      quote:
        'New reps are ramping in 3 weeks instead of 3 months. The AI coaching gives them the instincts that used to take years to develop.',
      author: 'Emily Rodriguez',
      role: 'Head of Revenue',
      company: 'DataSync',
      metric: '67% faster ramp',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#fafbfc]" id="customers">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <div className="max-w-[600px] mx-auto text-center mb-16">
          <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-4">
            Customer results
          </p>
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#0f172a] leading-[1.15] tracking-[-0.02em] mb-4">
            Trusted by high-performing revenue teams
          </h2>
          <p className="text-[16px] text-gray-500 leading-relaxed">
            Sales leaders use SellSig to build teams that consistently outperform.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 max-w-[1080px] mx-auto mb-16">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="relative bg-white rounded-xl border border-gray-200/80 p-8 flex flex-col"
            >
              {/* Metric badge */}
              <div className="inline-flex self-start items-center px-3 py-1 rounded-full bg-emerald-50 mb-6">
                <span className="text-[13px] font-semibold text-emerald-700">
                  {t.metric}
                </span>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[15px] text-gray-600 leading-relaxed mb-8 flex-1">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-[14px] font-semibold text-gray-500">
                    {t.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#0f172a]">
                    {t.author}
                  </div>
                  <div className="text-[13px] text-gray-400">
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Security badges */}
        <div className="max-w-[720px] mx-auto">
          <p className="text-center text-[12px] font-medium text-gray-400 uppercase tracking-[0.1em] mb-6">
            Enterprise-grade security and compliance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { icon: Shield, label: 'GDPR Compliant' },
              { icon: Lock, label: '256-bit Encryption' },
              { icon: Award, label: 'SOC 2 Type II' },
            ].map((badge, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 px-5 py-3 rounded-lg border border-gray-200/80 bg-white"
              >
                <badge.icon className="w-4 h-4 text-gray-400" />
                <span className="text-[13px] font-medium text-gray-500">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

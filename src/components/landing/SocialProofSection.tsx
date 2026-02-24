const testimonials = [
  {
    quote: 'The pre-call script builder changed everything. We stopped winging discovery and started <strong>leading with exactly the right value prop</strong> for each prospect. Win rate up 38% in 90 days.',
    name: 'Jordan Rivera',
    role: 'VP of Sales · Nexus Cloud',
    initials: 'JR',
    gradient: 'from-[#3B6EE8] to-[#6B9FFF]',
    logo: 'NexusCloud',
  },
  {
    quote: 'We replaced three separate tools — dialer, coaching, and recording — with SellSig. The <strong>integrated phone line and live objection handling</strong> alone is worth the $200. We\'d pay 3× for this.',
    name: 'Sarah Malone',
    role: 'CRO · Fieldlink Technologies',
    initials: 'SM',
    gradient: 'from-[#E83B6E] to-[#FF9FBF]',
    logo: 'Fieldlink',
  },
  {
    quote: 'Post-call analysis flagged that our reps were pitching 4 minutes too early. One change. <strong>31% improvement in close rate.</strong> In a single month. I\'ve never seen anything move a metric that fast.',
    name: 'David Kim',
    role: 'Sales Director · Orbit SaaS',
    initials: 'DK',
    gradient: 'from-[#1a6b3a] to-[#3BE89A]',
    logo: 'OrbitSaaS',
  },
];

export function SocialProofSection() {
  return (
    <section className="py-24 px-4 md:px-10 bg-[#F7F9FC]" id="customers">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#0057FF] tracking-[.08em] uppercase mb-3 block">
            Customer Stories
          </span>
          <h2 className="font-bricolage text-[clamp(34px,3.8vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.1] text-[#0A1628] mb-4">
            Teams that switched never <span className="text-[#0057FF]">looked back</span>
          </h2>
          <p className="text-[17px] text-[#3B4A63] leading-[1.75] max-w-[520px] mx-auto">
            From solo reps to 50-person revenue orgs, SellSig has become the unfair advantage that leading sales teams refuse to give up.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-[#E4E8F0] rounded-[20px] p-9 transition-all duration-200 hover:border-[#D0DCFF] hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(10,22,40,.12)]"
            >
              <div className="text-[#F5A623] text-sm tracking-[3px] mb-4">★★★★★</div>
              <blockquote
                className="text-base text-[#0A1628] leading-[1.7] mb-6"
                dangerouslySetInnerHTML={{ __html: `"${t.quote}"` }}
              />
              <div className="flex items-center gap-3 border-t border-[#E4E8F0] pt-5">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                  {t.initials}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#0A1628]">{t.name}</div>
                  <div className="text-xs text-[#6B7A99] mt-0.5">{t.role}</div>
                </div>
                <span className="font-bricolage text-sm font-bold text-[#D0D7E6] ml-auto">{t.logo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

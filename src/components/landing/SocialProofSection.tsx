const testimonials = [
  {
    quote: 'I was skeptical about AI coaching, but SellSig proved me wrong. Closed my biggest deal last quarter — using their objection responses verbatim. <strong>Win rate up 38% in 90 days.</strong>',
    name: 'Sarah Malone',
    role: 'Regional Sales Director · TechFlow',
    initials: 'SM',
    gradient: 'from-[#E83B6E] to-[#FF9FBF]',
    logo: 'TechFlow',
  },
  {
    quote: 'My team went from 18% to 26% close rate in 60 days. That\'s <strong>$340K extra revenue per rep.</strong> We replaced three tools — dialer, coaching, and recording — with one platform.',
    name: 'James Kim',
    role: 'VP of Sales · ScaleUp Inc.',
    initials: 'JK',
    gradient: 'from-[#1a6b3a] to-[#3BE89A]',
    logo: 'ScaleUp',
  },
  {
    quote: 'I felt like a natural closer in my second week. The AI guided me through every objection. <strong>My manager asked what changed — I said I got an AI wingman.</strong>',
    name: 'Priya Lakshmi',
    role: 'Account Executive · GrowthCo',
    initials: 'PL',
    gradient: 'from-[#3B6EE8] to-[#6B9FFF]',
    logo: 'GrowthCo',
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
            From solo SDRs to 50-person revenue orgs, SellSig is the unfair advantage leading teams refuse to give up.
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

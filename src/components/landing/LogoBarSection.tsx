const logos = ['Meridian', 'NovaTech', 'Apex Group', 'Fieldlink', 'Orbitco', 'Trellis', 'Vantage'];

export function LogoBarSection() {
  return (
    <section className="border-t border-b border-[#E4E8F0] py-10 px-4 bg-white">
      <div className="max-w-[1280px] mx-auto">
        <p className="text-center text-[13px] text-[#6B7A99] font-medium mb-7 tracking-[.04em] uppercase">
          Trusted by sales teams at leading companies
        </p>
        <div className="flex items-center justify-center gap-12 flex-wrap">
          {logos.map((name) => (
            <span
              key={name}
              className="font-bricolage text-lg font-bold text-[#D0D7E6] tracking-[-0.5px] hover:text-[#6B7A99] transition-colors cursor-default"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

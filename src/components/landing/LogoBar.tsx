export function LogoBar() {
  const companies = [
    'Salesforce', 'HubSpot', 'Outreach', 'Gong', 'ZoomInfo',
    'Apollo', 'Clari', 'Chorus',
  ];

  return (
    <section className="bg-[#0A0A0A] border-t border-white/5 py-12">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-widest mb-8">
          Trusted by leading sales teams worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {companies.map((name) => (
            <span
              key={name}
              className="text-lg font-bold text-gray-600 hover:text-gray-400 transition-colors select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

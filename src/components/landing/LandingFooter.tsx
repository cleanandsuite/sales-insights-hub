import { Link } from 'react-router-dom';

const footerLinks = {
  Platform: ['Script Builder', 'Live Coaching', 'Emotion Detection', 'Call Analysis', 'Phone Lines'],
  Solutions: ['For Sales Teams', 'For Managers', 'For Enterprise'],
  Company: ['About', 'Blog', 'Customers', 'Careers', 'Press'],
  Support: [
    { label: 'Documentation', to: '/support' },
    { label: 'Status' },
    { label: 'Security' },
    { label: 'Privacy', to: '/privacy' },
    { label: 'Contact', to: '/support' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="bg-[#0A1628] py-16 px-4 md:px-10 border-t border-white/[.08]">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 no-underline mb-4">
              <div className="w-8 h-8 bg-[#0057FF] rounded-lg flex items-center justify-center font-bricolage font-extrabold text-white text-base tracking-[-1px]">
                S
              </div>
              <span className="font-bricolage font-bold text-xl tracking-[-0.5px] text-white">SellSig</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-[280px]">
              The AI sales intelligence platform that coaches your team before, during, and after every call.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h5 className="text-xs font-bold text-white/60 tracking-[.08em] uppercase mb-4">{title}</h5>
              <ul className="space-y-2.5">
                {links.map((link) => {
                  const item = typeof link === 'string' ? { label: link } : link;
                  return (
                    <li key={item.label}>
                      {item.to ? (
                        <Link to={item.to} className="text-sm text-white/35 hover:text-white/70 transition-colors">
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-sm text-white/35 cursor-default">{item.label}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[.08] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">© {new Date().getFullYear()} SellSig, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-white/25 hover:text-white/50 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-white/25 hover:text-white/50 transition-colors">Terms of Service</Link>
            <span className="text-xs text-white/25 cursor-default">Cookie Policy</span>
            <span className="text-xs text-white/25 cursor-default">DPA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

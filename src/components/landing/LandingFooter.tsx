import { Link } from 'react-router-dom';

export function LandingFooter() {
  const columns = [
    {
      title: 'Product',
      links: [
        { label: 'AI Coaching', href: '#features' },
        { label: 'Analytics', href: '#features' },
        { label: 'Integrations', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Security', href: '#customers' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#' },
        { label: 'API Reference', href: '#' },
        { label: 'Changelog', href: '#' },
        { label: 'Status', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '/privacy', isRoute: true },
        { label: 'Terms', href: '/terms', isRoute: true },
        { label: 'Support', href: '/support', isRoute: true },
      ],
    },
  ];

  return (
    <footer className="bg-[#0f172a] border-t border-gray-800">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
                <span className="text-[#0f172a] font-bold text-[12px]">S</span>
              </div>
              <span className="text-[16px] font-semibold text-white tracking-tight">
                SellSig
              </span>
            </Link>
            <p className="text-[13px] text-gray-500 leading-relaxed max-w-[200px]">
              Revenue intelligence that makes every rep your best rep.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[12px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.isRoute ? (
                      <Link
                        to={link.href}
                        className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-[13px] text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-gray-600">
            &copy; {new Date().getFullYear()} SellSig, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors" aria-label="Twitter">
              Twitter
            </a>
            <a href="#" className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors" aria-label="LinkedIn">
              LinkedIn
            </a>
            <a href="#" className="text-[13px] text-gray-600 hover:text-gray-400 transition-colors" aria-label="GitHub">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

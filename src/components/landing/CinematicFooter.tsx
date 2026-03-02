import { Link } from 'react-router-dom';

export function CinematicFooter() {
  const columns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Protocol', href: '#protocol' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Support', to: '/support' },
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Terms of Service', to: '/terms' },
      ],
    },
    {
      title: 'Connect',
      links: [
        { label: 'Twitter', href: 'https://twitter.com/SellSig' },
        { label: 'LinkedIn', href: 'https://linkedin.com/company/sellsig' },
      ],
    },
  ];

  return (
    <footer className="bg-[hsl(var(--cin-bg))] rounded-t-[4rem] border-t border-white/[0.06] mt-0">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid md:grid-cols-4 gap-12 md:gap-8 mb-16">
          {/* Brand */}
          <div>
            <span className="text-white font-bold text-xl tracking-tight block mb-3">SellSig</span>
            <p className="text-white/40 text-sm leading-relaxed">
              Revenue Intelligence Platform.<br />
              Built by reps, for reps.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white/60 text-xs font-mono uppercase tracking-[0.15em] mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {'to' in link && link.to ? (
                      <Link to={link.to} className="text-white/40 hover:text-white text-sm cin-lift transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={'href' in link ? link.href : '#'}
                        onClick={(e) => {
                          const href = 'href' in link ? link.href : '';
                          if (href?.startsWith('#')) {
                            e.preventDefault();
                            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        target={'href' in link && link.href?.startsWith('http') ? '_blank' : undefined}
                        rel={'href' in link && link.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-white/40 hover:text-white text-sm cin-lift transition-colors"
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.06]">
          <p className="text-white/25 text-xs">© {new Date().getFullYear()} SellSig. All rights reserved.</p>

          {/* System status */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 cin-pulse-dot" />
            <span className="text-white/40 text-xs font-mono">System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
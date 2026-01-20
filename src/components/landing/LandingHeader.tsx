import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface LandingHeaderProps {
  onStartTrialClick: () => void;
}

// Custom SellSig Logo Icon - Signal wave with upward momentum
const SellSigIcon = () => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-7 w-7"
  >
    {/* Signal bars representing call analysis */}
    <rect x="4" y="18" width="4" height="10" rx="2" fill="url(#gradient1)" />
    <rect x="10" y="12" width="4" height="16" rx="2" fill="url(#gradient1)" />
    <rect x="16" y="6" width="4" height="22" rx="2" fill="url(#gradient1)" />
    {/* AI spark/lightning accent */}
    <path
      d="M24 4L22 12H26L22 20L24 12H20L24 4Z"
      fill="url(#gradient2)"
    />
    <defs>
      <linearGradient id="gradient1" x1="12" y1="4" x2="12" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="1" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id="gradient2" x1="23" y1="4" x2="23" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

export function LandingHeader({ onStartTrialClick }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Support', to: '/support' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#032D60]/95 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo - Icon + Polished Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-colors">
              <SellSigIcon />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white leading-none">
                Sell<span className="text-blue-400">Sig</span>
              </span>
              <span className="text-[10px] text-white/50 font-medium tracking-widest uppercase leading-none mt-0.5">
                AI Coach
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.to ? (
                <Link 
                  key={link.label}
                  to={link.to} 
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a 
                  key={link.label}
                  href={link.href} 
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              )
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="font-medium text-white/90 hover:text-white hover:bg-white/10">
                Log In
              </Button>
            </Link>
            <Button 
              onClick={() => window.open('https://buy.stripe.com/fZu6oG1zi7O7euubi69k400', '_blank')}
              className="font-semibold bg-white text-primary hover:bg-white/95 shadow-lg"
            >
              Start for Free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                link.to ? (
                  <Link 
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a 
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                )
              ))}
              <div className="border-t border-white/10 my-2" />
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="ghost" className="w-full justify-center font-medium text-white hover:bg-white/10">
                  Log In
                </Button>
              </Link>
              <Button 
                onClick={() => window.open('https://buy.stripe.com/fZu6oG1zi7O7euubi69k400', '_blank')}
                className="w-full font-semibold bg-white text-primary"
              >
                Start for Free
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

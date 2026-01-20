import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { SellSigLogo } from '@/components/ui/SellSigLogo';

interface LandingHeaderProps {
  onStartTrialClick: () => void;
}

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
          <SellSigLogo variant="light" linkTo="/" />

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

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone } from 'lucide-react';

interface LandingHeaderProps {
  onStartTrialClick: () => void;
}

export function LandingHeader({ onStartTrialClick }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Integrations', href: '#integrations' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SellSig</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.to ? (
                <Link 
                  key={link.label}
                  to={link.to} 
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a 
                  key={link.label}
                  href={link.href} 
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              )
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="font-medium text-slate-300 hover:text-white hover:bg-slate-800">
                Log In
              </Button>
            </Link>
            <Button 
              onClick={onStartTrialClick}
              className="font-semibold bg-blue-600 hover:bg-blue-500"
            >
              Start Free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
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
          <div className="md:hidden py-4 border-t border-slate-800 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                link.to ? (
                  <Link 
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a 
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                )
              ))}
              <div className="border-t border-slate-800 my-2" />
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="ghost" className="w-full justify-center font-medium text-slate-300 hover:bg-slate-800">
                  Log In
                </Button>
              </Link>
              <Button 
                onClick={onStartTrialClick}
                className="w-full font-semibold bg-blue-600"
              >
                Start Free
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

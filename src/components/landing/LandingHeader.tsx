import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface LandingHeaderProps {
  onStartTrialClick: () => void;
}

export function LandingHeader({ onStartTrialClick }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Customers', href: '#customers' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <nav className="flex items-center justify-between h-16" aria-label="Main navigation">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="SellSig home">
            <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-sm tracking-tight">S</span>
            </div>
            <span className="text-[18px] font-semibold text-[#0f172a] tracking-tight">SellSig</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[14px] font-medium text-gray-500 hover:text-[#0f172a] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/auth"
              className="text-[14px] font-medium text-gray-600 hover:text-[#0f172a] px-4 py-2 transition-colors"
            >
              Log in
            </Link>
            <button
              onClick={onStartTrialClick}
              className="text-[14px] font-medium text-white bg-[#0f172a] hover:bg-[#1e293b] px-5 py-2.5 rounded-lg transition-colors"
            >
              Start free trial
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-[#0f172a]" />
            ) : (
              <Menu className="h-5 w-5 text-[#0f172a]" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 animate-fade-in" role="navigation" aria-label="Mobile navigation">
            <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-3 text-[15px] font-medium text-gray-600 hover:text-[#0f172a] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-gray-100 my-2" />
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-3 text-[15px] font-medium text-gray-600 hover:text-[#0f172a] hover:bg-gray-50 rounded-lg transition-colors"
              >
                Log in
              </Link>
              <button
                onClick={onStartTrialClick}
                className="mt-1 text-[15px] font-medium text-white bg-[#0f172a] hover:bg-[#1e293b] px-5 py-3 rounded-lg transition-colors"
              >
                Start free trial
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

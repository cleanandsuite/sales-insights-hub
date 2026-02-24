import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface LandingHeaderProps {
  onStartTrialClick: () => void;
}

export function LandingHeader({ onStartTrialClick }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Platform', href: '#platform' },
    { label: 'Features', href: '#features' },
    { label: 'Phone Lines', href: '#phone' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Enterprise', href: '#enterprise' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[500] h-[68px] bg-white/95 backdrop-blur-[20px] backdrop-saturate-[180%] border-b border-[#E4E8F0] flex items-center justify-between px-4 md:px-10">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline">
        <div className="w-8 h-8 bg-[#0057FF] rounded-lg flex items-center justify-center font-bricolage font-extrabold text-white text-base tracking-[-1px]">
          S
        </div>
        <span className="font-bricolage font-bold text-xl tracking-[-0.5px] text-[#0A1628]">SellSig</span>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden lg:flex items-center gap-1">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="px-3.5 py-2 rounded-md text-sm font-medium text-[#3B4A63] hover:text-[#0A1628] hover:bg-[#F7F9FC] transition-all"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Desktop CTAs */}
      <div className="hidden lg:flex items-center gap-2.5">
        <Link
          to="/auth"
          className="text-sm font-medium text-[#3B4A63] hover:text-[#0A1628] hover:bg-[#F7F9FC] px-4 py-2 rounded-md transition-all"
        >
          Sign in
        </Link>
        <Link
          to="/support"
          className="text-sm font-medium text-[#0057FF] px-4 py-2 rounded-lg border-[1.5px] border-[#D0DCFF] hover:bg-[#EEF3FF] transition-all"
        >
          Book a demo
        </Link>
        <button
          onClick={onStartTrialClick}
          className="bg-[#0057FF] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#003FBB] hover:-translate-y-[1px] hover:shadow-[0_4px_16px_rgba(0,87,255,.3)] transition-all whitespace-nowrap"
        >
          Start free trial
        </button>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden p-2 rounded-lg hover:bg-[#F7F9FC] transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="h-6 w-6 text-[#3B4A63]" /> : <Menu className="h-6 w-6 text-[#3B4A63]" />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-[68px] left-0 right-0 bg-white border-b border-[#E4E8F0] shadow-lg lg:hidden py-4 px-4">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-[#3B4A63] hover:text-[#0A1628] hover:bg-[#F7F9FC] rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-[#E4E8F0] my-2" />
            <Link
              to="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-sm font-medium text-[#3B4A63] hover:text-[#0A1628] hover:bg-[#F7F9FC] rounded-lg text-center"
            >
              Sign in
            </Link>
            <button
              onClick={onStartTrialClick}
              className="bg-[#0057FF] text-white text-sm font-semibold py-3 rounded-lg hover:bg-[#003FBB] transition-colors"
            >
              Start free trial
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

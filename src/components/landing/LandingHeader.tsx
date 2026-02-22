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

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Support', to: '/support' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="[&_span]:!text-gray-900 [&_.text-white]:!text-gray-900 [&_.text-blue-500]:!text-blue-600 [&_.text-blue-400]:!text-blue-600 [&_.text-muted-foreground]:!text-gray-500">
            <SellSigLogo variant="default" linkTo="/" showTagline={false} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                Log In
              </Button>
            </Link>
            <Button
              onClick={onStartTrialClick}
              className="font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm px-5"
            >
              Get Started Free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-white">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) =>
                link.to ? (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
              <div className="border-t border-gray-100 my-2" />
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="ghost" className="w-full justify-center font-medium text-gray-700 hover:bg-gray-100">
                  Log In
                </Button>
              </Link>
              <Button
                onClick={onStartTrialClick}
                className="w-full font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

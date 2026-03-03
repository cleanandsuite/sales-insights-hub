import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SellSigLogo } from '@/components/ui/SellSigLogo';

interface CinematicNavbarProps {
  onStartTrialClick: () => void;
}

export function CinematicNavbar({ onStartTrialClick }: CinematicNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const hero = document.getElementById('cinematic-hero');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Protocol', href: '#protocol' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Philosophy', href: '#philosophy' },
  ];

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[800px]">
      <div
        className={`
          flex items-center justify-between px-4 md:px-6 py-3 rounded-full transition-all duration-500
          ${scrolled
            ? 'bg-[hsl(var(--cin-bg))]/60 backdrop-blur-xl border border-white/[0.08] shadow-2xl'
            : 'bg-transparent border border-transparent'
          }
        `}
      >
        {/* Logo */}
        <SellSigLogo size="sm" variant="light" showTagline={false} linkTo="" className="pointer-events-none" />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="text-white/60 hover:text-white text-sm font-medium cin-lift transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/auth"
            className="text-white/60 hover:text-white text-sm font-medium transition-colors"
          >
            Sign in
          </Link>
          <button
            onClick={onStartTrialClick}
            className="magnetic-btn flex items-center gap-2 bg-[hsl(var(--cin-teal))] text-[hsl(var(--cin-bg))] px-5 py-2 rounded-full text-sm font-semibold"
          >
            Book a Demo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white p-1"
          aria-label="Toggle menu"
        >
          <div className="w-5 flex flex-col gap-1">
            <span className={`block h-0.5 bg-white transition-transform ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block h-0.5 bg-white transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-white transition-transform ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-2 bg-[hsl(var(--cin-bg))]/90 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 flex flex-col gap-4">
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="text-white/70 hover:text-white text-left text-base font-medium"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => { onStartTrialClick(); setMobileOpen(false); }}
            className="magnetic-btn bg-[hsl(var(--cin-teal))] text-[hsl(var(--cin-bg))] px-5 py-3 rounded-full text-sm font-semibold mt-2 flex items-center justify-center gap-2"
          >
            Book a Demo <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </nav>
  );
}
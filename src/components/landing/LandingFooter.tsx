import { Link } from 'react-router-dom';
import { SellSigLogo } from '@/components/ui/SellSigLogo';

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 py-8 bg-[#0A0A0A]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <SellSigLogo variant="default" showTagline={false} linkTo="/" size="sm" />

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link to="/support" className="text-gray-500 hover:text-white transition-colors">
              Support
            </Link>
            <Link to="/privacy" className="text-gray-500 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} SellSig. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

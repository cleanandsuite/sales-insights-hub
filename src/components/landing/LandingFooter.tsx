import { Link } from 'react-router-dom';
import { SellSigLogo } from '@/components/ui/SellSigLogo';

export function LandingFooter() {
  return (
    <footer className="border-t border-gray-200 py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="[&_span]:!text-gray-900 [&_.text-white]:!text-gray-900 [&_.text-blue-500]:!text-blue-600 [&_.text-blue-400]:!text-blue-600 [&_.text-muted-foreground]:!text-gray-400 [&_div.border]:!border-gray-200 [&_div.bg-primary\\/10]:!bg-blue-50">
            <SellSigLogo variant="default" showTagline={false} linkTo="/" size="sm" />
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link to="/support" className="text-gray-500 hover:text-gray-900 transition-colors">
              Support
            </Link>
            <Link to="/privacy" className="text-gray-500 hover:text-gray-900 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-900 transition-colors">
              Terms of Service
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} SellSig. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

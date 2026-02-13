import { Link } from 'react-router-dom';
import sellsigLogo from '@/assets/sellsig-logo.png';

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
              <img src={sellsigLogo} alt="SellSig" className="h-5 w-5 object-contain" />
            </div>
            <span className="font-semibold text-foreground">SellSig</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link 
              to="/support" 
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Support
            </Link>
            <Link 
              to="/privacy" 
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-foreground/70">
            © {new Date().getFullYear()} SellSig. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import { SellSigLogo } from '@/components/ui/SellSigLogo';
import { Link } from 'react-router-dom';

export const ConfessionFooter = React.forwardRef<HTMLElement>((_props, ref) => {
  return (
    <footer ref={ref} className="bg-slate-950 border-t border-white/10 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <SellSigLogo variant="light" size="sm" showTagline={false} />
          
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/support" className="hover:text-white transition-colors">
              Support
            </Link>
          </nav>

          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} SellSig. All rights reserved.
          </p>
        </div>

        {/* SEO footer text */}
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-white/30 max-w-3xl mx-auto leading-relaxed">
            SellSig provides AI coaching for sales calls. Real-time coaching whispers perfect responses. 
            Transform every call with AI that listens and coaches you to close more deals.
          </p>
        </div>
      </div>
    </footer>
  );
});

ConfessionFooter.displayName = "ConfessionFooter";

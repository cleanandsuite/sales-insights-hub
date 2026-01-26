import { SellSigLogo } from '@/components/ui/SellSigLogo';
import { Link } from 'react-router-dom';

export function ConfessionFooter() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 py-12">
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
            SellSig provides AI coaching for sales calls, powered by intelligent AI 
            that listens during calls, provides real-time coaching, and helps you close more sales. 
            Transform your sales calls with AI coaching that whispers perfect responses. 
            Real-time AI coaching for every call. Win more sales with coaching.
          </p>
        </div>
      </div>
    </footer>
  );
}

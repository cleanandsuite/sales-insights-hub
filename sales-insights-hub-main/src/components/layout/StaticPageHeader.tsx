import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import sellsigLogo from '@/assets/sellsig-logo.png';

export function StaticPageHeader() {
  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
              <img src={sellsigLogo} alt="SellSig" className="h-6 w-6 object-contain" loading="lazy" />
            </div>
            <span className="font-bold text-xl">SellSig</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/privacy">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Button>
            </Link>
            <Link to="/terms">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Terms
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

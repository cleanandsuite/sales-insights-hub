import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SellSigLogo } from '@/components/ui/SellSigLogo';

export function StaticPageHeader() {
  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <SellSigLogo size="sm" linkTo="/" />
          
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

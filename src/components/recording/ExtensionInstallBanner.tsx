import { useState } from 'react';
import { Download, X, Chrome, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExtensionInstallBannerProps {
  onDismiss?: () => void;
}

export function ExtensionInstallBanner({ onDismiss }: ExtensionInstallBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleInstall = () => {
    // For development, show instructions
    // In production, this would link to Chrome Web Store
    window.open('/gritcall-extension/README.md', '_blank');
  };

  return (
    <div className="relative flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
      <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
        <Headphones className="h-5 w-5 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground">
          Record both sides of your calls automatically
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Install our Chrome extension for one-click audio capture — no screen sharing needed
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleInstall}
          className="gap-2"
        >
          <Chrome className="h-4 w-4" />
          <span className="hidden sm:inline">Get Extension</span>
          <Download className="h-3 w-3 sm:hidden" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

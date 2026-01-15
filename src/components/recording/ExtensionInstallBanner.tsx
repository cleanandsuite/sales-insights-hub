import { useState } from 'react';
import { X, Chrome, Headphones, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ExtensionInstallBannerProps {
  onDismiss?: () => void;
  variant?: 'compact' | 'full';
}

export function ExtensionInstallBanner({ onDismiss, variant = 'compact' }: ExtensionInstallBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const InstallInstructions = () => (
    <div className="space-y-4 text-sm">
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground">Installation Steps:</h4>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>Download the extension files from our GitHub repository</li>
          <li>Open Chrome and navigate to <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">chrome://extensions/</code></li>
          <li>Enable "Developer mode" in the top right corner</li>
          <li>Click "Load unpacked" and select the <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">gritcall-extension</code> folder</li>
          <li>The extension icon will appear in your toolbar</li>
        </ol>
      </div>
      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Coming Soon:</strong> We're working on publishing to the Chrome Web Store for one-click installation.
        </p>
      </div>
    </div>
  );

  if (variant === 'full') {
    return (
      <div className="relative p-4 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
            <Headphones className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground">
              Record both sides of your calls automatically
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">
              Install our Chrome extension for one-click audio capture — no screen sharing needed
            </p>
            <InstallInstructions />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

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
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Chrome className="h-4 w-4" />
              <span className="hidden sm:inline">Get Extension</span>
              <ExternalLink className="h-3 w-3 sm:hidden" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Chrome className="h-5 w-5 text-primary" />
                GritCall Chrome Extension
              </DialogTitle>
              <DialogDescription>
                Capture both your microphone and tab audio for complete call recording.
              </DialogDescription>
            </DialogHeader>
            <InstallInstructions />
          </DialogContent>
        </Dialog>
        
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

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DemoVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoVideoModal({ open, onOpenChange }: DemoVideoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black border-none">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 text-white hover:bg-white/20"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="aspect-video w-full">
          {/* Placeholder demo video - YouTube embed */}
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
            title="GritCall Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

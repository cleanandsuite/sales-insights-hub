import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RecordingNameDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName: string;
  isLoading?: boolean;
}

export function RecordingNameDialog({
  open,
  onClose,
  onSave,
  defaultName,
  isLoading = false,
}: RecordingNameDialogProps) {
  const [name, setName] = useState(defaultName);

  const handleSave = () => {
    onSave(name.trim() || defaultName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Name Your Recording</DialogTitle>
          <DialogDescription>
            Give your recording a memorable name to find it easily later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recording-name">Recording Name</Label>
            <Input
              id="recording-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={defaultName}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Recording'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

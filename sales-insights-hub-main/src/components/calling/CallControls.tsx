import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Hash, 
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

interface CallControlsProps {
  isMuted: boolean;
  isOnHold: boolean;
  onToggleMute: () => void;
  onToggleHold: () => void;
  onSendDTMF: (digit: string) => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  className?: string;
}

const dtmfKeys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];

export function CallControls({
  isMuted,
  isOnHold,
  onToggleMute,
  onToggleHold,
  onSendDTMF,
  volume = 100,
  onVolumeChange,
  className,
}: CallControlsProps) {
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-2', className)}>
        {/* Mute Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isMuted ? 'destructive' : 'outline'}
              size="icon"
              onClick={onToggleMute}
              className="h-10 w-10"
            >
              {isMuted ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isMuted ? 'Unmute' : 'Mute'}
          </TooltipContent>
        </Tooltip>

        {/* Hold Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isOnHold ? 'secondary' : 'outline'}
              size="icon"
              onClick={onToggleHold}
              className={cn('h-10 w-10', isOnHold && 'ring-2 ring-yellow-500')}
            >
              {isOnHold ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isOnHold ? 'Resume' : 'Hold'}
          </TooltipContent>
        </Tooltip>

        {/* DTMF Keypad */}
        <Popover open={keypadOpen} onOpenChange={setKeypadOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                >
                  <Hash className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Keypad</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-auto p-3" align="center">
            <div className="grid gap-2">
              {dtmfKeys.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-2">
                  {row.map((key) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 text-lg font-medium"
                      onClick={() => onSendDTMF(key)}
                    >
                      {key}
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Volume Control */}
        {onVolumeChange && (
          <Popover open={volumeOpen} onOpenChange={setVolumeOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                  >
                    {volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Volume</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-40 p-4" align="center">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Volume</span>
                  <span className="text-muted-foreground">{volume}%</span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={([val]) => onVolumeChange(val)}
                  max={100}
                  step={5}
                />
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </TooltipProvider>
  );
}

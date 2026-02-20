import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Monitor, Headphones } from 'lucide-react';
import { type DesktopSource } from '@/lib/electronAudio';

interface AudioSourceSelectorProps {
  sources: DesktopSource[];
  selectedSourceId: string | undefined;
  onSourceChange: (sourceId: string) => void;
  onRefresh: () => Promise<void>;
  isDisabled?: boolean;
}

export function AudioSourceSelector({
  sources,
  selectedSourceId,
  onSourceChange,
  onRefresh,
  isDisabled = false
}: AudioSourceSelectorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  // Group sources by type (screen vs window)
  const screenSources = sources.filter(s => s.id.startsWith('screen:'));
  const windowSources = sources.filter(s => s.id.startsWith('window:'));

  return (
    <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Audio Source</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || isDisabled}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Select the app or screen whose audio you want to capture along with your microphone.
      </p>

      <Select
        value={selectedSourceId || 'auto'}
        onValueChange={(value) => onSourceChange(value === 'auto' ? '' : value)}
        disabled={isDisabled || sources.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select audio source..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span>Auto (Full Screen)</span>
            </div>
          </SelectItem>
          
          {screenSources.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Screens
              </div>
              {screenSources.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>{source.name}</span>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
          
          {windowSources.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Applications
              </div>
              {windowSources.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 bg-contain bg-center bg-no-repeat rounded-sm"
                      style={{ backgroundImage: `url(${source.thumbnail})` }}
                    />
                    <span className="truncate max-w-[200px]">{source.name}</span>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>

      {sources.length === 0 && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          No sources found. Click refresh or ensure screen recording permission is granted.
        </p>
      )}
    </div>
  );
}

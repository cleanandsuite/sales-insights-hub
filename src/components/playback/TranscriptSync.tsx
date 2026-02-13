import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Word {
  word: string;
  start: number;
  end: number;
}

interface TranscriptSyncProps {
  transcription: string;
  timestampedWords?: Word[];
  currentTime: number;
  onWordClick?: (time: number) => void;
}

export function TranscriptSync({ 
  transcription, 
  timestampedWords, 
  currentTime,
  onWordClick 
}: TranscriptSyncProps) {
  const activeWordRef = useRef<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to active word
  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTime]);

  // If we have timestamped words, render with sync
  if (timestampedWords && timestampedWords.length > 0) {
    return (
      <ScrollArea className="h-full" ref={containerRef}>
        <div className="p-4 leading-relaxed text-foreground">
          {timestampedWords.map((wordData, index) => {
            const isActive = currentTime >= wordData.start && currentTime < wordData.end;
            const isPast = currentTime >= wordData.end;

            return (
              <span
                key={index}
                ref={isActive ? activeWordRef : null}
                onClick={() => onWordClick?.(wordData.start)}
                className={`
                  cursor-pointer transition-all duration-150 px-0.5 rounded
                  ${isActive 
                    ? 'bg-primary/30 text-primary font-medium scale-105' 
                    : isPast 
                      ? 'text-foreground' 
                      : 'text-muted-foreground'
                  }
                  hover:bg-primary/20
                `}
              >
                {wordData.word}{' '}
              </span>
            );
          })}
        </div>
      </ScrollArea>
    );
  }

  // Fallback: render plain transcription with estimated timing
  const words = transcription.split(' ');
  const avgWordDuration = 0.5; // Assume 0.5 seconds per word average

  return (
    <ScrollArea className="h-full" ref={containerRef}>
      <div className="p-4 leading-relaxed">
        {words.map((word, index) => {
          const estimatedStart = index * avgWordDuration;
          const estimatedEnd = (index + 1) * avgWordDuration;
          const isActive = currentTime >= estimatedStart && currentTime < estimatedEnd;
          const isPast = currentTime >= estimatedEnd;

          return (
            <span
              key={index}
              ref={isActive ? activeWordRef : null}
              onClick={() => onWordClick?.(estimatedStart)}
              className={`
                cursor-pointer transition-all duration-150 px-0.5 rounded
                ${isActive 
                  ? 'bg-primary/30 text-primary font-medium' 
                  : isPast 
                    ? 'text-foreground' 
                    : 'text-muted-foreground'
                }
                hover:bg-primary/20
              `}
            >
              {word}{' '}
            </span>
          );
        })}
      </div>
    </ScrollArea>
  );
}
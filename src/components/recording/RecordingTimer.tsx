import { useEffect, useState } from 'react';

interface RecordingTimerProps {
  isRecording: boolean;
  isPaused: boolean;
  onTimeUpdate?: (seconds: number) => void;
}

export function RecordingTimer({ isRecording, isPaused, onTimeUpdate }: RecordingTimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRecording) {
      setSeconds(0);
      return;
    }

    if (isPaused) return;

    const interval = setInterval(() => {
      setSeconds(s => {
        const newSeconds = s + 1;
        onTimeUpdate?.(newSeconds);
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, isPaused, onTimeUpdate]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${isRecording && !isPaused ? 'bg-destructive animate-pulse' : 'bg-muted-foreground'}`} />
      <span className="text-4xl font-mono font-bold text-foreground tabular-nums">
        {formatTime(seconds)}
      </span>
      {isPaused && (
        <span className="text-sm text-warning font-medium">PAUSED</span>
      )}
    </div>
  );
}

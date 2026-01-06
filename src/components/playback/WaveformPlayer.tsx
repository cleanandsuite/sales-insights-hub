import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Download } from 'lucide-react';
import { createPlayableObjectUrl } from '@/lib/audioPlayback';

interface Marker {
  id: string;
  type: 'buying_signal' | 'objection' | 'key_moment' | 'question' | 'positive' | 'negative' | 'ai_suggestion';
  content: string;
  timestampSeconds: number | null;
  color: string;
}

interface WaveformPlayerProps {
  audioUrl: string;
  duration: number;
  markers?: Marker[];
  onTimeUpdate?: (time: number) => void;
  onMarkerClick?: (marker: Marker) => void;
}

const MARKER_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  buying_signal: { bg: 'bg-success/30', border: 'border-success', label: '🟢 Signal' },
  positive: { bg: 'bg-success/30', border: 'border-success', label: '🟢 Positive' },
  objection: { bg: 'bg-destructive/30', border: 'border-destructive', label: '🔴 Objection' },
  negative: { bg: 'bg-destructive/30', border: 'border-destructive', label: '🔴 Negative' },
  key_moment: { bg: 'bg-purple-500/30', border: 'border-purple-500', label: '🟣 Key Moment' },
  question: { bg: 'bg-warning/30', border: 'border-warning', label: '🟡 Question' },
  ai_suggestion: { bg: 'bg-primary/30', border: 'border-primary', label: '🔵 AI Suggestion' },
};

export function WaveformPlayer({ 
  audioUrl, 
  duration, 
  markers = [],
  onTimeUpdate,
  onMarkerClick 
}: WaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const recoveredObjectUrlRef = useRef<string | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate fake waveform data (in production, analyze actual audio)
  useEffect(() => {
    const bars = 200;
    const data = Array.from({ length: bars }, () => 
      0.2 + Math.random() * 0.6 + Math.sin(Math.random() * Math.PI) * 0.2
    );
    setWaveformData(data);
  }, [audioUrl]);

  // Draw waveform
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const barWidth = width / waveformData.length;
    const progress = currentTime / (duration || 1);

    ctx.clearRect(0, 0, width, height);

    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * height * 0.8;
      const y = (height - barHeight) / 2;
      const isPlayed = index / waveformData.length <= progress;

      ctx.fillStyle = isPlayed 
        ? 'hsl(186, 100%, 50%)' // primary color
        : 'hsl(222, 30%, 25%)'; // muted color
      
      ctx.beginPath();
      ctx.roundRect(x, y, Math.max(barWidth - 1, 1), barHeight, 2);
      ctx.fill();
    });

    // Draw markers
    markers.forEach((marker) => {
      if (marker.timestampSeconds !== null) {
        const markerX = (marker.timestampSeconds / duration) * width;
        const markerColor = MARKER_COLORS[marker.type]?.border.replace('border-', '') || 'primary';
        
        ctx.fillStyle = `hsl(var(--${markerColor === 'success' ? 'success' : 
          markerColor === 'destructive' ? 'destructive' : 
          markerColor === 'warning' ? 'warning' : 'primary'}))`;
        
        ctx.beginPath();
        ctx.arc(markerX, 8, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [waveformData, currentTime, duration, markers]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Load audio
  useEffect(() => {
    if (!audioUrl) {
      console.log('WaveformPlayer: No audio URL provided');
      return;
    }

    console.log('WaveformPlayer: Loading audio from URL:', audioUrl.substring(0, 100) + '...');

    const audio = new Audio(audioUrl);
    audio.preload = 'auto';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      console.log('WaveformPlayer: Audio metadata loaded, duration:', audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };

    const handleEnded = () => setIsPlaying(false);

    const handleError = async () => {
      console.error('WaveformPlayer: Audio error', audio.error);
      setIsPlaying(false);

      // Attempt a one-time recovery by sniffing the file container and re-wrapping bytes.
      if (!recoveredObjectUrlRef.current) {
        try {
          const { objectUrl, mime } = await createPlayableObjectUrl(audioUrl);
          recoveredObjectUrlRef.current = objectUrl;
          console.warn('WaveformPlayer: recovered playable audio as', mime);

          audio.src = objectUrl;
          audio.load();
        } catch (e) {
          console.error('WaveformPlayer: recovery failed', e);
        }
      }

      setIsLoading(false);
    };

    const handleCanPlayThrough = () => {
      console.log('WaveformPlayer: Audio can play through');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);

      audio.pause();
      audio.src = '';

      if (recoveredObjectUrlRef.current) {
        URL.revokeObjectURL(recoveredObjectUrlRef.current);
        recoveredObjectUrlRef.current = null;
      }
    };
  }, [audioUrl, onTimeUpdate]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      console.error('WaveformPlayer: play() failed', e);
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const vol = value[0];
    audioRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioRef.current || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    if (!audioUrl) return;
    
    const response = await fetch(audioUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Waveform */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={80}
          className="w-full h-20 cursor-pointer rounded-lg bg-muted/30"
          onClick={handleSeek}
        />
        
        {/* Marker tooltips */}
        {markers.filter(m => m.timestampSeconds !== null).map((marker) => {
          const position = ((marker.timestampSeconds || 0) / duration) * 100;
          const markerStyle = MARKER_COLORS[marker.type] || MARKER_COLORS.ai_suggestion;
          
          return (
            <div
              key={marker.id}
              className={`absolute top-0 cursor-pointer group`}
              style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
              onClick={() => onMarkerClick?.(marker)}
            >
              <div className={`w-3 h-3 rounded-full ${markerStyle.bg} ${markerStyle.border} border-2`} />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="bg-card border border-border rounded-lg p-2 shadow-lg whitespace-nowrap text-xs">
                  <span className="font-medium">{markerStyle.label}</span>
                  <p className="text-muted-foreground max-w-48 truncate">{marker.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => skip(-10)}>
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full"
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => skip(10)}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>

        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Marker Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(MARKER_COLORS).slice(0, 6).map(([type, style]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${style.bg} ${style.border} border`} />
            <span className="text-muted-foreground capitalize">{type.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
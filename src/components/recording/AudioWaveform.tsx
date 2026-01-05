import { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  audioLevel: number;
  isRecording: boolean;
  isPaused: boolean;
}

export function AudioWaveform({ audioLevel, isRecording, isPaused }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>(Array(40).fill(0.1));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const barCount = barsRef.current.length;
      const barWidth = (width / barCount) * 0.7;
      const gap = (width / barCount) * 0.3;

      // Update bar heights with smooth animation
      barsRef.current = barsRef.current.map((bar, i) => {
        if (!isRecording || isPaused) {
          return bar * 0.95; // Decay when not recording
        }
        
        // Create wave-like effect based on audio level
        const targetHeight = audioLevel * (0.5 + 0.5 * Math.sin(Date.now() / 200 + i * 0.5));
        return bar + (targetHeight - bar) * 0.3;
      });

      // Draw bars
      barsRef.current.forEach((bar, i) => {
        const x = i * (barWidth + gap);
        const barHeight = Math.max(4, bar * height * 0.8);
        const y = (height - barHeight) / 2;

        // Gradient color from primary to accent
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, 'hsl(186, 100%, 50%)');
        gradient.addColorStop(1, 'hsl(210, 100%, 60%)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      });
    };

    const animationFrame = requestAnimationFrame(function animate() {
      draw();
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [audioLevel, isRecording, isPaused]);

  return (
    <div className="w-full h-24 flex items-center justify-center rounded-lg bg-secondary/30 border border-border/30 overflow-hidden">
      <canvas 
        ref={canvasRef}
        width={400}
        height={80}
        className="w-full h-full"
      />
    </div>
  );
}

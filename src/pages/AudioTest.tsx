import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Download, Play, Volume2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AudioTest() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const log = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, `${new Date().toISOString().slice(11, 19)} - ${msg}`]);
  };

  const updateLevel = () => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    setAudioLevel(avg / 255);
    animationFrameRef.current = requestAnimationFrame(updateLevel);
  };

  const startRecording = async () => {
    try {
      log('Requesting microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        }
      });
      
      streamRef.current = stream;
      
      const track = stream.getAudioTracks()[0];
      log(`Mic: ${track.label}`);
      log(`Settings: ${JSON.stringify(track.getSettings())}`);
      
      // Audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Native MediaRecorder (WebM)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      log(`Using MIME: ${mimeType}`);
      
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          log(`Chunk: ${e.data.size} bytes`);
        }
      };
      
      recorder.start(500);
      setIsRecording(true);
      updateLevel();
      log('Recording started!');
      
    } catch (err) {
      log(`Error: ${err}`);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
      });
      log(`Final blob: ${blob.size} bytes, type: ${blob.type}`);
      setRecordedBlob(blob);
      
      // Create playback URL
      const url = URL.createObjectURL(blob);
      setPlaybackUrl(url);
      log(`Playback URL created`);
    };
    
    mediaRecorderRef.current.stop();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setIsRecording(false);
    setAudioLevel(0);
    log('Recording stopped');
  };

  const downloadRaw = () => {
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-raw.webm';
    a.click();
    URL.revokeObjectURL(url);
    log('Downloaded raw WebM');
  };

  useEffect(() => {
    return () => {
      if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    };
  }, [playbackUrl]);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Audio Test Page</h1>
        <p className="text-muted-foreground">
          Test your microphone directly without any MP3 conversion. 
          This will tell us if the issue is mic capture or transcoding.
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Microphone Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Audio Level Meter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <span className="text-sm">Audio Level</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-75"
                  style={{ width: `${audioLevel * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isRecording ? 'Speak now - the bar should move!' : 'Start recording to see levels'}
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex gap-2">
              {!isRecording ? (
                <Button onClick={startRecording} className="gap-2">
                  <Mic className="h-4 w-4" />
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive" className="gap-2">
                  <Square className="h-4 w-4" />
                  Stop Recording
                </Button>
              )}
            </div>
            
            {/* Playback */}
            {playbackUrl && (
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-medium">Playback (raw WebM - no conversion):</p>
                <audio controls src={playbackUrl} className="w-full" />
                <Button onClick={downloadRaw} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Raw WebM
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded-md h-48 overflow-y-auto font-mono text-xs space-y-1">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">Logs will appear here...</p>
              ) : (
                logs.map((l, i) => <div key={i}>{l}</div>)
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

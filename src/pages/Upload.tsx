import { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Upload as UploadIcon, File, X, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
}

export default function Upload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav')
    );
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadedFile[] = newFiles.map((file) => ({
      file,
      status: 'pending',
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...uploadFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!user) return;

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;

      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: 'uploading' } : f))
      );

      const file = files[i].file;
      const filePath = `${user.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('call-recordings')
        .upload(filePath, file);

      if (uploadError) {
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'error' } : f))
        );
        toast({
          title: 'Upload failed',
          description: uploadError.message,
          variant: 'destructive',
        });
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('call-recordings')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('call_recordings').insert({
        user_id: user.id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        status: 'pending',
      });

      if (dbError) {
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'error' } : f))
        );
        toast({
          title: 'Database error',
          description: dbError.message,
          variant: 'destructive',
        });
        continue;
      }

      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: 'success', progress: 100 } : f))
      );
    }

    toast({
      title: 'Upload complete',
      description: 'Your files have been uploaded successfully.',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload Calls</h1>
          <p className="text-muted-foreground mt-1">
            Upload your sales call recordings for analysis
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`card-gradient rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border/50 hover:border-primary/50'
          }`}
        >
          <div className="mx-auto w-fit">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-6">
              <UploadIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Drop your audio files here
            </h3>
            <p className="text-muted-foreground mb-6">
              or click to browse from your computer
            </p>
            <label>
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground/70 mt-4">
              Supported formats: MP3, WAV, M4A
            </p>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="card-gradient rounded-xl border border-border/50 overflow-hidden">
            <div className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Files ({files.length})
              </h2>
              {pendingCount > 0 && (
                <Button onClick={uploadFiles} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Upload {pendingCount} file{pendingCount > 1 ? 's' : ''}
                </Button>
              )}
            </div>
            <div className="divide-y divide-border/30">
              {files.map((uploadFile, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <File className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {uploadFile.status === 'pending' && (
                      <span className="text-sm text-muted-foreground">Ready</span>
                    )}
                    {uploadFile.status === 'uploading' && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                    {uploadFile.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    {uploadFile.status === 'error' && (
                      <span className="text-sm text-destructive">Failed</span>
                    )}
                    {uploadFile.status === 'pending' && (
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 rounded hover:bg-destructive/10 transition-colors"
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

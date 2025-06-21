"use client"
import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AudioUploaderProps = {
  onFileUpload: (formData: FormData) => void;
};

export default function AudioUploader({ onFileUpload }: AudioUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (files: FileList | null) => {
    if (files && files[0]) {
      const formData = new FormData();
      formData.append('file', files[0]);
      onFileUpload(formData);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFile(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleFile(e.target.files);
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} onDragEnter={handleDrag}>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".mp3,.wav,.m4a,.mp4"
        onChange={handleChange}
      />
      <label
        htmlFor="audio-dropzone"
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors ${dragActive ? 'border-primary' : 'border-border'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">MP3, WAV, M4A, or MP4 files</p>
            <Button type="button" onClick={onButtonClick} className="mt-4" size="sm" variant="outline">Select File</Button>
          </div>
      </label>
    </form>
  );
}

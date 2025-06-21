"use client"
import { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2 } from 'lucide-react';

type FileUploaderProps = {
  onFileUpload: (formData: FormData) => void;
  isParsing: boolean;
};

export default function FileUploader({ onFileUpload, isParsing }: FileUploaderProps) {
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
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Upload Your Essay</CardTitle>
        <CardDescription>Upload your IELTS Writing Task 2 essay as a .docx file to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()} onDragEnter={handleDrag}>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleChange}
            disabled={isParsing}
          />
          <label
            htmlFor="dropzone-file"
            className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors ${dragActive ? 'border-primary' : 'border-border'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isParsing ? (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Loader2 className="w-10 h-10 mb-3 text-primary animate-spin" />
                <p className="mb-2 text-sm text-muted-foreground">Parsing document...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">.DOCX files only</p>
                <Button type="button" onClick={onButtonClick} className="mt-4" size="sm" variant="outline">Select File</Button>
              </div>
            )}
          </label>
        </form>
      </CardContent>
    </Card>
  );
}

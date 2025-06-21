"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Sparkles, X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

type EssayPreviewProps = {
  essay: { fileName: string; text: string };
  onGrade: () => void;
  onReset: () => void;
  isGrading: boolean;
};

export default function EssayPreview({ essay, onGrade, onReset, isGrading }: EssayPreviewProps) {
  const wordCount = essay.text.split(/\s+/).filter(Boolean).length;
  
  return (
    <Card className="w-full animate-in fade-in duration-500">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline flex items-center gap-2">
                    <FileText className="w-6 h-6" /> Essay Preview
                </CardTitle>
                <CardDescription>File: {essay.fileName} ({wordCount} words)</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onReset} disabled={isGrading}>
                <X className="w-5 h-5" />
                <span className="sr-only">Upload another file</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 rounded-md border">
          <Textarea
            readOnly
            value={essay.text}
            className="h-96 resize-none border-0 focus-visible:ring-0"
            placeholder="Your essay content will appear here..."
          />
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={onGrade} disabled={isGrading} size="lg">
          {isGrading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Grading...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Grade Essay
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

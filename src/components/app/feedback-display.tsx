"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import type { DisplayAIFeedbackOutput } from '@/ai/flows/display-ai-feedback';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

type FeedbackDisplayProps = {
  feedback: DisplayAIFeedbackOutput;
  onReset: () => void;
};

export default function FeedbackDisplay({ feedback, onReset }: FeedbackDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate document.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ielts-feedback.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: `Could not generate the .docx file. ${errorMessage}`,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="w-full animate-in fade-in duration-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" /> Feedback Report
            </CardTitle>
            <CardDescription>Your essay has been graded. Review your feedback below.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="annotated">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="annotated">Annotated Essay</TabsTrigger>
            <TabsTrigger value="summary">Score Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="annotated" className="mt-4">
            <ScrollArea className="h-96 w-full rounded-md border p-4">
              <div
                className="prose-lg max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: feedback.annotatedHtml }}
              />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="summary" className="mt-4">
            <ScrollArea className="h-96 w-full rounded-md border p-4">
                <div
                    className="prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2 [&_p]:mb-4"
                    dangerouslySetInnerHTML={{ __html: feedback.bandScoreSummary }}
                />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button variant="outline" onClick={onReset} className="w-full sm:w-auto">
          <RefreshCw className="mr-2 h-4 w-4" />
          Grade Another Essay
        </Button>
        <Button onClick={handleDownload} disabled={isDownloading} size="lg" className="w-full sm:w-auto">
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Download Feedback
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

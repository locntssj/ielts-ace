"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw, FileDown, Loader2 } from 'lucide-react';
import type { GradeSpeakingOutput } from '@/ai/flows/grade-speaking';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type SpeakingFeedbackDisplayProps = {
  feedback: GradeSpeakingOutput;
  onReset: () => void;
};

const scoreLabels = {
    fluency: 'Fluency & Coherence',
    lexical: 'Lexical Resource',
    grammar: 'Grammatical Range & Accuracy',
    pronunciation: 'Pronunciation'
};

export default function SpeakingFeedbackDisplay({ feedback, onReset }: SpeakingFeedbackDisplayProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const { toast } = useToast();

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
          const response = await fetch('/api/download-speaking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback }),
          });
    
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate document.');
          }
    
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ielts-speaking-feedback_graded.docx`;
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
                <CardTitle className="font-headline flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-500" /> Speaking Feedback Report
                </CardTitle>
                <CardDescription>Your speaking performance has been graded. Review your feedback below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-3 font-headline">Score Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {Object.entries(feedback.score).map(([key, value]) => (
                             <div key={key} className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">{scoreLabels[key as keyof typeof scoreLabels]}</p>
                                <p className="text-2xl font-bold text-primary">{value.toFixed(1)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                 <div>
                    <h3 className="text-lg font-semibold mb-3 font-headline">Detailed Feedback</h3>
                    <div className="space-y-4">
                       {Object.entries(feedback.feedback).map(([key, value]) => (
                            <div key={key}>
                                <h4 className="font-semibold">{scoreLabels[key as keyof typeof scoreLabels]}</h4>
                                <p className="text-muted-foreground">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold font-headline mb-3">Transcript Analysis</h3>
                    <Tabs defaultValue="annotated">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="annotated">Annotated</TabsTrigger>
                            <TabsTrigger value="corrected">Corrected</TabsTrigger>
                            <TabsTrigger value="original">Original</TabsTrigger>
                        </TabsList>
                        <TabsContent value="annotated" className="mt-4">
                            <ScrollArea className="h-80 w-full rounded-md border p-4">
                                <div
                                    className="prose-lg max-w-none leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: feedback.annotated_transcript }}
                                />
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="corrected" className="mt-4">
                            <ScrollArea className="h-80 w-full rounded-md border p-4">
                                <div className="prose-lg max-w-none leading-relaxed whitespace-pre-wrap">
                                    {feedback.corrected_transcript}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="original" className="mt-4">
                            <ScrollArea className="h-80 w-full rounded-md border p-4">
                                <div className="prose-lg max-w-none leading-relaxed whitespace-pre-wrap">
                                    {feedback.original_transcript}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Button variant="outline" onClick={onReset} className="w-full sm:w-auto">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
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

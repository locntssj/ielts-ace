"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw } from 'lucide-react';
import type { GradeSpeakingOutput } from '@/ai/flows/grade-speaking';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
    const [showCorrections, setShowCorrections] = useState(true);

    const renderTranscript = () => {
        let transcript = feedback.annotated_transcript;
        if (!showCorrections) {
            transcript = transcript.replace(/\s*\([^)]+\)/g, '');
        }
        return transcript;
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
                    <div className="flex justify-between items-center mb-3">
                         <h3 className="text-lg font-semibold font-headline">Annotated Transcript</h3>
                         <div className="flex items-center space-x-2">
                            <Switch id="show-corrections" checked={showCorrections} onCheckedChange={setShowCorrections} />
                            <Label htmlFor="show-corrections" className="text-sm">Show Corrections</Label>
                         </div>
                    </div>
                    <ScrollArea className="h-80 w-full rounded-md border p-4">
                        <div
                            className="prose-lg max-w-none leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderTranscript() }}
                        />
                    </ScrollArea>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button variant="outline" onClick={onReset}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
            </CardFooter>
        </Card>
    );
}

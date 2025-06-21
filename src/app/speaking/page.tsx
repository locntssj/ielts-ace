"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, FileText } from 'lucide-react';
import AudioUploader from '@/components/app/audio-uploader';
import SpeakingFeedbackDisplay from '@/components/app/speaking-feedback-display';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { transcribeAudio, getSpeakingGrading } from '@/app/actions';
import type { GradeSpeakingOutput } from '@/ai/flows/grade-speaking';
import { Loader2, Sparkles } from 'lucide-react';


export default function SpeakingPage() {
    const [feedback, setFeedback] = useState<GradeSpeakingOutput | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [transcript, setTranscript] = useState<string>('');
    const { toast } = useToast();

    const handleAudioUpload = async (formData: FormData) => {
        setIsLoading(true);
        setFeedback(null);
        setLoadingMessage('Transcribing audio...');

        const transcribeResult = await transcribeAudio(formData);
        if (transcribeResult.error) {
            toast({ variant: "destructive", title: "Transcription Failed", description: transcribeResult.error });
            setIsLoading(false);
            return;
        }

        setLoadingMessage('Grading transcript...');
        const gradeResult = await getSpeakingGrading(transcribeResult.transcript);
        if (gradeResult.error) {
            toast({ variant: "destructive", title: "Grading Failed", description: gradeResult.error });
        } else if (gradeResult.feedback) {
            setFeedback(gradeResult.feedback);
        }
        setIsLoading(false);
    };

    const handleTranscriptSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transcript.trim()) {
            toast({ variant: "destructive", title: "Empty Transcript", description: "Please paste a transcript to grade." });
            return;
        }
        setIsLoading(true);
        setFeedback(null);
        setLoadingMessage('Grading transcript...');

        const gradeResult = await getSpeakingGrading(transcript);
        if (gradeResult.error) {
            toast({ variant: "destructive", title: "Grading Failed", description: gradeResult.error });
        } else if (gradeResult.feedback) {
            setFeedback(gradeResult.feedback);
        }
        setIsLoading(false);
    };

    const handleReset = () => {
        setFeedback(null);
        setTranscript('');
        setIsLoading(false);
    }
    
    if (isLoading) {
        return (
             <Card className="w-full">
                <CardHeader>
                    <CardTitle className="font-headline">Processing your request</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4 p-12">
                   <Loader2 className="w-12 h-12 text-primary animate-spin" />
                   <p className="text-muted-foreground">{loadingMessage}</p>
                </CardContent>
            </Card>
        );
    }

    if (feedback) {
        return <SpeakingFeedbackDisplay feedback={feedback} onReset={handleReset} />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">IELTS Speaking Evaluation</CardTitle>
                <CardDescription>Upload an audio file or paste a transcript to get AI-powered feedback.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="audio">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="audio"><Mic className="mr-2 h-4 w-4" /> Upload Audio</TabsTrigger>
                        <TabsTrigger value="transcript"><FileText className="mr-2 h-4 w-4" /> Paste Transcript</TabsTrigger>
                    </TabsList>
                    <TabsContent value="audio" className="mt-4">
                        <AudioUploader onFileUpload={handleAudioUpload} />
                    </TabsContent>
                    <TabsContent value="transcript" className="mt-4">
                         <form onSubmit={handleTranscriptSubmit} className="space-y-4">
                            <Textarea
                                placeholder="Paste your speaking transcript here..."
                                className="h-64"
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button type="submit">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Grade Transcript
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

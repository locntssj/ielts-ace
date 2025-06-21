"use client";

import { useState } from 'react';
import type { DisplayAIFeedbackOutput } from '@/ai/flows/display-ai-feedback';
import AppHeader from '@/components/app/header';
import FileUploader from '@/components/app/file-uploader';
import EssayPreview from '@/components/app/essay-preview';
import FeedbackDisplay from '@/components/app/feedback-display';
import { getAIGrading, parseDocx } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

type Essay = {
  fileName: string;
  text: string;
};

export default function Home() {
  const [essay, setEssay] = useState<Essay | null>(null);
  const [feedback, setFeedback] = useState<DisplayAIFeedbackOutput | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [taskType, setTaskType] = useState<'task1' | 'task2'>('task2');
  const { toast } = useToast();

  const handleFileUpload = async (formData: FormData) => {
    setIsParsing(true);
    setEssay(null);
    setFeedback(null);
    const result = await parseDocx(formData);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: result.error,
      });
    } else {
      setEssay({ text: result.text, fileName: result.fileName });
    }
    setIsParsing(false);
  };

  const handleGradeEssay = async (selectedTaskType: 'task1' | 'task2') => {
    if (!essay?.text) return;
    setIsGrading(true);
    setFeedback(null);
    const result = await getAIGrading(essay.text, selectedTaskType);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Grading Failed",
        description: result.error,
      });
    } else if (result.feedback) {
      setFeedback(result.feedback);
    }
    setIsGrading(false);
  };
  
  const handleReset = () => {
    setEssay(null);
    setFeedback(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {!essay ? (
            <FileUploader onFileUpload={handleFileUpload} isParsing={isParsing} />
          ) : !feedback ? (
            <EssayPreview 
              essay={essay} 
              onGrade={handleGradeEssay} 
              onReset={handleReset} 
              isGrading={isGrading}
              taskType={taskType}
              setTaskType={setTaskType}
            />
          ) : (
            <FeedbackDisplay feedback={feedback} fileName={essay.fileName} onReset={handleReset} />
          )}
        </div>
      </main>
    </div>
  );
}

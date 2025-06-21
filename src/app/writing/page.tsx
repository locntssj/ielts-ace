"use client";

import { useState } from 'react';
import type { DisplayAIFeedbackOutput } from '@/ai/flows/display-ai-feedback';
import FileUploader from '@/components/app/file-uploader';
import EssayPreview from '@/components/app/essay-preview';
import FeedbackDisplay from '@/components/app/feedback-display';
import { getAIGrading, parseDocx } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

type Essay = {
  fileName: string;
  text: string;
};

export default function WritingPage() {
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
    <>
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
    </>
  );
}

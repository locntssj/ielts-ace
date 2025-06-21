"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Sparkles, X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"


type EssayPreviewProps = {
  essay: { fileName: string; text: string };
  onGrade: (taskType: 'task1' | 'task2') => void;
  onReset: () => void;
  isGrading: boolean;
  taskType: 'task1' | 'task2';
  setTaskType: (value: 'task1' | 'task2') => void;
};

export default function EssayPreview({ essay, onGrade, onReset, isGrading, taskType, setTaskType }: EssayPreviewProps) {
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
        <div className="mt-6 space-y-3">
            <Label htmlFor="task-type" className="font-semibold text-base">Select Task Type</Label>
            <RadioGroup
                id="task-type"
                value={taskType}
                onValueChange={(value) => setTaskType(value as 'task1' | 'task2')}
                className="flex items-center gap-6"
                disabled={isGrading}
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="task2" id="task2" />
                    <Label htmlFor="task2" className="cursor-pointer font-normal">Task 2</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="task1" id="task1" />
                    <Label htmlFor="task1" className="cursor-pointer font-normal">Task 1</Label>
                </div>
            </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={() => onGrade(taskType)} disabled={isGrading} size="lg">
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

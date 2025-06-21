'use server';

import mammoth from 'mammoth';
import { displayAIFeedback, type DisplayAIFeedbackOutput, type DisplayAIFeedbackInput } from '@/ai/flows/display-ai-feedback';

export async function parseDocx(formData: FormData): Promise<{ text: string; error: string | null; fileName: string }> {
  try {
    const file = formData.get('file') as File;

    if (!file) {
      return { text: '', error: 'No file uploaded.', fileName: '' };
    }

    if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return { text: '', error: 'Invalid file type. Please upload a .docx file.', fileName: '' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer });
    
    return { text: result.value, error: null, fileName: file.name };
  } catch (e) {
    console.error(e);
    return { text: '', error: 'Failed to parse the document.', fileName: '' };
  }
}

export async function getAIGrading(essay: string, taskType: 'task1' | 'task2'): Promise<{ feedback: DisplayAIFeedbackOutput | null; error: string | null }> {
  if (!essay) {
    return { feedback: null, error: 'Essay text is empty.' };
  }

  try {
    const feedback = await displayAIFeedback({ essay, taskType });
    return { feedback, error: null };
  } catch (e) {
    console.error(e);
    return { feedback: null, error: 'Failed to get AI grading. Please try again.' };
  }
}

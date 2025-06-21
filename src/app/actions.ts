'use server';

import mammoth from 'mammoth';
import { displayAIFeedback, type DisplayAIFeedbackOutput, type DisplayAIFeedbackInput } from '@/ai/flows/display-ai-feedback';
import { createClient, DeepgramClient, PrerecordedTranscriptionOptions } from '@deepgram/sdk';
import { gradeSpeaking, type GradeSpeakingOutput } from '@/ai/flows/grade-speaking';

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


export async function transcribeAudio(formData: FormData): Promise<{ transcript: string; error: string | null }> {
  const file = formData.get('file') as File;
  if (!file) {
    return { transcript: '', error: 'No audio file provided.' };
  }

  try {
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      return { transcript: '', error: 'Deepgram API key is not configured.' };
    }

    const deepgram: DeepgramClient = createClient(deepgramApiKey);
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const source = {
      buffer,
      mimetype: file.type,
    };

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        source,
        {
            model: 'nova-2-general',
            smart_format: true,
            detect_language: true,
        }
    );

    if (error) {
        console.error('Deepgram API Error:', error);
        return { transcript: '', error: `Deepgram error: ${error.message}` };
    }
    
    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

    if (!transcript) {
        console.error('Deepgram Result Invalid or Empty Transcript:', result);
        return { transcript: '', error: 'Could not extract a transcript. The audio might be silent, corrupted, or in an unsupported format.' };
    }

    return { transcript, error: null };

  } catch (e) {
    console.error('Transcription process failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown server error occurred.';
    return { transcript: '', error: `Failed to process audio file: ${errorMessage}` };
  }
}

export async function getSpeakingGrading(transcript: string): Promise<{ feedback: GradeSpeakingOutput | null; error: string | null }> {
  if (!transcript) {
    return { feedback: null, error: 'Transcript is empty.' };
  }

  try {
    const feedback = await gradeSpeaking(transcript);
    return { feedback, error: null };
  } catch (e) {
    console.error(e);
    return { feedback: null, error: 'Failed to get AI grading for speaking. Please try again.' };
  }
}

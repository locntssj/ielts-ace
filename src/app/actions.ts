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
    
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        buffer,
        {
            model: 'nova-2',
            smart_format: true,
        } as PrerecordedTranscriptionOptions
    );

    if (error) {
        throw error;
    }
    
    const transcript = result.results.channels[0].alternatives[0].transcript;
    return { transcript, error: null };

  } catch (e) {
    console.error('Transcription failed:', e);
    return { transcript: '', error: 'Failed to transcribe the audio file.' };
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

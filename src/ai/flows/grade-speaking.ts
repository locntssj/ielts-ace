'use server';
/**
 * @fileOverview Grades an IELTS Speaking transcript using Gemini.
 *
 * - gradeSpeaking - A function that accepts a transcript and returns detailed feedback.
 * - GradeSpeakingInput - The input type for the gradeSpeaking function.
 * - GradeSpeakingOutput - The return type for the gradeSpeaking function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GradeSpeakingInputSchema = z.string().describe('The IELTS Speaking transcript to be graded.');
export type GradeSpeakingInput = z.infer<typeof GradeSpeakingInputSchema>;

const GradeSpeakingOutputSchema = z.object({
    score: z.object({
        fluency: z.number().describe('The band score for Fluency and Coherence.'),
        lexical: z.number().describe('The band score for Lexical Resource.'),
        grammar: z.number().describe('The band score for Grammatical Range and Accuracy.'),
        pronunciation: z.number().describe('The band score for Pronunciation.'),
    }),
    feedback: z.object({
        fluency: z.string().describe('Feedback on Fluency and Coherence.'),
        lexical: z.string().describe('Feedback on Lexical Resource.'),
        grammar: z.string().describe('Feedback on Grammatical Range and Accuracy.'),
        pronunciation: z.string().describe('Feedback on Pronunciation.'),
    }),
    annotated_transcript: z.string().describe("The transcript with errors wrapped in `<span class='error'>` tags and corrections in `<span class='correction'>` tags."),
    corrected_transcript: z.string().describe("A clean version of the transcript with all corrections applied, without any HTML tags."),
    original_transcript: z.string().describe("The original, unmodified transcript as provided in the input."),
});
export type GradeSpeakingOutput = z.infer<typeof GradeSpeakingOutputSchema>;

export async function gradeSpeaking(transcript: GradeSpeakingInput): Promise<GradeSpeakingOutput> {
  return gradeSpeakingFlow(transcript);
}

const gradeSpeakingPrompt = ai.definePrompt({
  name: 'gradeSpeakingPrompt',
  input: {schema: GradeSpeakingInputSchema},
  output: {schema: GradeSpeakingOutputSchema},
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `You are an expert IELTS Speaking examiner. Your task is to analyze a student's speaking transcript and provide a structured evaluation.

**Instructions:**

1.  **Evaluate and Score:** Assess the transcript based on the four official IELTS Speaking criteria:
    *   **Fluency and Coherence:** Score from 1-9.
    *   **Lexical Resource:** Score from 1-9.
    *   **Grammatical Range and Accuracy:** Score from 1-9.
    *   **Pronunciation:** Score from 1-9. Assume standard delivery from the text.

2.  **Provide Feedback:** For each of the four criteria, write a brief, constructive feedback paragraph.

3.  **Generate Transcripts (3 Versions):**
    *   **original_transcript:** Return the user's transcript exactly as it was provided.
    *   **corrected_transcript:** Create a clean, corrected version of the transcript with all grammatical and vocabulary errors fixed. This version should not contain any HTML tags.
    *   **annotated_transcript:** Review the original transcript. If you find an error, wrap the incorrect part in \`<span class='error'>\` tags. Immediately after, add the correction in \`<span class='correction'>\` tags. For example: "I <span class='error'>goed</span> <span class='correction'>(went)</span> to the store." Leave correct parts unchanged. Use single quotes for HTML attributes.

**Output Format:**

You **MUST** return your entire response as a single, valid JSON object that strictly follows the schema. Do not include any text, markdown formatting, or explanations outside of the JSON structure.

Here is an example of the required JSON format:

{
  "score": {
    "fluency": 6.5,
    "lexical": 6.0,
    "grammar": 5.5,
    "pronunciation": 6.0
  },
  "feedback": {
    "fluency": "Good flow but noticeable hesitation.",
    "lexical": "Some topic-relevant vocabulary, but limited variety.",
    "grammar": "Frequent verb tense and agreement errors.",
    "pronunciation": "Assumed understandable but not expressive."
  },
  "annotated_transcript": "Well I <span class='error'>have saw</span> <span class='correction'>(should be 'have seen')</span> many cultures...",
  "corrected_transcript": "Well I have seen many cultures...",
  "original_transcript": "Well I have saw many cultures..."
}

The transcript to grade is:
{{{$input}}}
`,
});

const gradeSpeakingFlow = ai.defineFlow(
  {
    name: 'gradeSpeakingFlow',
    inputSchema: GradeSpeakingInputSchema,
    outputSchema: GradeSpeakingOutputSchema,
  },
  async transcript => {
    const {output} = await gradeSpeakingPrompt(transcript);
    if (!output) {
        throw new Error('Failed to get a structured response from the AI model.');
    }
    return output;
  }
);

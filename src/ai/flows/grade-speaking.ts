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
    annotated_transcript: z.string().describe('The transcript with errors highlighted and corrections added.'),
});
export type GradeSpeakingOutput = z.infer<typeof GradeSpeakingOutputSchema>;

export async function gradeSpeaking(transcript: GradeSpeakingInput): Promise<GradeSpeakingOutput> {
  return gradeSpeakingFlow(transcript);
}

const gradeSpeakingPrompt = ai.definePrompt({
  name: 'gradeSpeakingPrompt',
  input: {schema: GradeSpeakingInputSchema},
  output: {schema: GradeSpeakingOutputSchema},
  prompt: `You are an IELTS Speaking examiner.

Given the following transcript of a speaking response by a student, do the following:

1. Score the answer based on the 4 official IELTS Speaking criteria:
- Fluency and Coherence
- Lexical Resource
- Grammatical Range and Accuracy
- Pronunciation (assume standard delivery based on text)

2. Highlight language issues in the transcript:
- Wrap each error (grammar, vocabulary, or cohesion issue) in \`<span class='highlight'>\` tags.
- Right after each error, insert a correction or explanation in parentheses ( ).
- Do not alter correct parts of the sentence.

3. Return ONLY a single valid JSON object that adheres to the schema. Do not include any other text, formatting, or explanations before or after the JSON object.

Example format:
\`\`\`json
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
  "annotated_transcript": "Well I <span class='highlight'>have saw</span> (should be 'have seen') many cultures..."
}
\`\`\`

Here is the transcript to grade:
"""
{{{$input}}}
"""
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

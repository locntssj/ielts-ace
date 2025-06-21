// src/ai/flows/grade-essay.ts
'use server';

/**
 * @fileOverview Grades an IELTS Writing Task 2 essay using the Gemini 2.0 Flash model.
 *
 * - gradeEssay - A function that accepts an essay and returns detailed feedback, including band scores and sentence-by-sentence corrections.
 * - GradeEssayInput - The input type for the gradeEssay function.
 * - GradeEssayOutput - The return type for the gradeEssay function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GradeEssayInputSchema = z.string().describe('The IELTS Writing Task 2 essay to be graded.');
export type GradeEssayInput = z.infer<typeof GradeEssayInputSchema>;

const GradeEssayOutputSchema = z.object({
  annotatedEssayHtml: z
    .string()
    .describe('The full corrected essay in annotated HTML, with errors highlighted in red and corrections in green.'),
  bandScoreSummary: z
    .string()
    .describe(
      'A summary of the band scores for each criterion (Task Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy), and the overall band score, formatted as an HTML block.
      Example: <div><p><strong>Band Scores:</strong></p><ul><li>Task Response: 6.5</li><li>Coherence and Cohesion: 6.0</li><li>Lexical Resource: 6.5</li><li>Grammatical Range and Accuracy: 5.5</li><li><strong>Overall Band: 6.0</strong></li></ul><p>Final comments: ...</p></div>'
    ),
});
export type GradeEssayOutput = z.infer<typeof GradeEssayOutputSchema>;

export async function gradeEssay(essay: GradeEssayInput): Promise<GradeEssayOutput> {
  return gradeEssayFlow(essay);
}

const gradeEssayPrompt = ai.definePrompt({
  name: 'gradeEssayPrompt',
  input: {schema: GradeEssayInputSchema},
  output: {schema: GradeEssayOutputSchema},
  prompt: `You are an IELTS Writing examiner.\n
Please analyze the following IELTS Writing Task 2 essay in detail. Follow these instructions strictly:\n\n---\n\n### 1. Evaluation Criteria (Band Score)\n\nAssess the essay using the 4 IELTS Writing Task 2 criteria:\n- Task Response
- Coherence and Cohesion
- Lexical Resource
- Grammatical Range and Accuracy\n\nFor each:\n- Give a **band score from 1 to 9**
- Explain the score with clear examples from the essay\n\n---\n\n### 2. Sentence-by-Sentence Correction\n\nGo through the essay **line by line**.\n\nFor each sentence:\n- If there are grammar, vocabulary, logic or structure problems:\n  - **Highlight the problematic part using HTML**:\n    - Wrap error in:  
      \`<span style="color: red; font-weight: bold">[wrong phrase]</span>\`
    - Right after it, add a correction note:  
      \`<span style="color: green; font-style: italic">([Correction] ...)</span>\`
- If the sentence is fine, leave it unchanged.\n\n---\n\n### 3. Output Format\n\nAt the end, return:\n\n1. The **full corrected essay in annotated HTML**
2. A separate **band score summary block**, formatted like:\n\n\`\`\`html
<div>
  <p><strong>Band Scores:</strong></p>
  <ul>
    <li>Task Response: 6.5</li>
    <li>Coherence and Cohesion: 6.0</li>
    <li>Lexical Resource: 6.5</li>
    <li>Grammatical Range and Accuracy: 5.5</li>
    <li><strong>Overall Band: 6.0</strong></li>
  </ul>
  <p>Final comments: ...</p>
</div>
\`\`\`\n\nEssay to grade: {{{$input}}}
`,
});

const gradeEssayFlow = ai.defineFlow(
  {
    name: 'gradeEssayFlow',
    inputSchema: GradeEssayInputSchema,
    outputSchema: GradeEssayOutputSchema,
  },
  async essay => {
    const {output} = await gradeEssayPrompt(essay);
    return output!;
  }
);

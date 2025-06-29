'use server';

/**
 * @fileOverview AI feedback display flow for IELTS writing essays.
 *
 * - displayAIFeedback - A function that takes an essay and returns AI-generated feedback with annotated HTML and band scores.
 * - DisplayAIFeedbackInput - The input type for the displayAIFeedback function.
 * - DisplayAIFeedbackOutput - The return type for the displayAIFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DisplayAIFeedbackInputSchema = z.object({
  essay: z.string().describe('The IELTS Writing essay to be graded.'),
  taskType: z.enum(['task1', 'task2']).describe('The type of IELTS writing task.'),
});
export type DisplayAIFeedbackInput = z.infer<typeof DisplayAIFeedbackInputSchema>;

const DisplayAIFeedbackOutputSchema = z.object({
  annotatedHtml: z.string().describe('The full corrected essay in annotated HTML.'),
  bandScoreSummary: z.string().describe('A summary of the band scores for each evaluation criterion, formatted as HTML.'),
});
export type DisplayAIFeedbackOutput = z.infer<typeof DisplayAIFeedbackOutputSchema>;

export async function displayAIFeedback(input: DisplayAIFeedbackInput): Promise<DisplayAIFeedbackOutput> {
  return displayAIFeedbackFlow(input);
}

const promptTask1 = ai.definePrompt({
  name: 'displayAIFeedbackPromptTask1',
  input: {schema: DisplayAIFeedbackInputSchema},
  output: {schema: DisplayAIFeedbackOutputSchema},
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
  prompt: `You are an IELTS Writing examiner.

Please analyze the following IELTS Writing Task 1 (Academic) response. Follow these instructions strictly:

---

### 1. Evaluation Criteria (Band Scores)

Assess the essay based on the 4 official IELTS Writing Task 1 criteria:

- **Task Achievement**
- **Coherence and Cohesion**
- **Lexical Resource**
- **Grammatical Range and Accuracy**

For each:
- Give a **band score from 1 to 9**
- Provide a **clear explanation** of why that score was given, using quotes from the essay

---

### 2. Sentence-by-Sentence Correction and Annotation

Go through the essay **line by line**.

For each sentence:
- If there are problems (grammar, vocabulary, cohesion, formality):
  - Highlight the incorrect part using HTML:
    \`\`\`html
    <span style="color: red; font-weight: bold">[wrong phrase]</span>
    <span style="color: green; font-style: italic">(...)</span>
    \`\`\`
- If the sentence is acceptable, leave it unchanged.

You can annotate multiple errors in one sentence, if needed.

Do **not** rewrite the whole essay — instead, annotate **within the original text**.

---

### 3. Output Format

At the end, return:

- The **full annotated essay as valid HTML**, preserving paragraph breaks
- A **Band Score Summary**, like:

\`\`\`html
<div>
  <p><strong>Band Scores:</strong></p>
  <ul>
    <li>Task Achievement: 6.5</li>
    <li>Coherence and Cohesion: 6.0</li>
    <li>Lexical Resource: 6.5</li>
    <li>Grammatical Range and Accuracy: 5.5</li>
    <li><strong>Overall Band: 6.0</strong></li>
  </ul>
  <p>Final comments: ...</p>
</div>
\`\`\`

Here is the essay to grade:\n{{{essay}}}
`,
});


const promptTask2 = ai.definePrompt({
  name: 'displayAIFeedbackPromptTask2',
  input: {schema: DisplayAIFeedbackInputSchema},
  output: {schema: DisplayAIFeedbackOutputSchema},
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
  prompt: `You are an IELTS Writing examiner.

Please analyze the following IELTS Writing Task 2 essay in detail. Follow these instructions strictly:

---

### 1. Evaluation Criteria (Band Score)

Assess the essay using the 4 IELTS Writing Task 2 criteria:
- Task Response
- Coherence and Cohesion
- Lexical Resource
- Grammatical Range and Accuracy

For each:
- Give a **band score from 1 to 9**
- Explain the score with clear examples from the essay

---

### 2. Sentence-by-Sentence Correction

Go through the essay **line by line**.

For each sentence:
- If there are grammar, vocabulary, logic or structure problems:
  - **Highlight the problematic part using HTML**:
    - Wrap error in:  
      \`\`\`html
      <span style="color: red; font-weight: bold">[wrong phrase]</span>
      \`\`\`
    - Right after it, add a correction note:  
      \`\`\`html
      <span style="color: green; font-style: italic">(...)</span>
      \`\`\`
- If the sentence is fine, leave it unchanged.

---

### 3. Output Format

At the end, return:

1. The **full corrected essay in annotated HTML**
2. A separate **band score summary block**, formatted like:

\`\`\`html
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
\`\`\`

Here is the essay to grade:\n{{{essay}}}
`,
});

const displayAIFeedbackFlow = ai.defineFlow(
  {
    name: 'displayAIFeedbackFlow',
    inputSchema: DisplayAIFeedbackInputSchema,
    outputSchema: DisplayAIFeedbackOutputSchema,
  },
  async input => {
    const prompt = input.taskType === 'task1' ? promptTask1 : promptTask2;
    const {output} = await prompt(input);
    return output!;
  }
);

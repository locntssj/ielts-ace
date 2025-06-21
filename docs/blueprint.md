# **App Name**: IELTS Ace

## Core Features:

- Essay Upload: Allow users to upload a .docx file containing their IELTS writing essay.
- Essay Preview: Display the plain text of the essay in a preview panel after parsing it using mammoth.js.
- AI Essay Grading: Send the essay to the Gemini 2.0 Flash API via a Firebase Function and grade the essay using provided criteria; this includes assigning band scores and suggesting corrections.
- Feedback Display: Display the AI-generated feedback, including the full corrected essay in annotated HTML and a band score summary block.  The AI acts as a tool deciding when to include the information, inline in the essay
- Annotated Essay Export: Enable users to download a .docx file containing the original essay with color-coded annotations and a final score summary, generated via a Firebase Function.

## Style Guidelines:

- Primary color: Saturated blue (#29ABE2) to evoke confidence and intelligence.
- Background color: Light blue (#E0F7FA) to create a clean and calm interface.
- Accent color: Green (#90EE90) for positive feedback and highlighting corrections.
- Body font: 'Inter' (sans-serif) for readability and a modern feel.
- Headline font: 'Space Grotesk' (sans-serif) for a clean and technical look, matching the use case of AI grading.
- Use clear and professional icons for actions like upload, download, and grading, with a focus on simplicity.
- Maintain a clean and structured layout with clear sections for essay input, preview, and feedback.
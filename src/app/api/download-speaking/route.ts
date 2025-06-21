import { NextRequest, NextResponse } from 'next/server';
import htmlToDocx from 'html-to-docx';
import type { GradeSpeakingOutput } from '@/ai/flows/grade-speaking';

// Helper function to format the score labels
const scoreLabels = {
    fluency: 'Fluency & Coherence',
    lexical: 'Lexical Resource',
    grammar: 'Grammatical Range & Accuracy',
    pronunciation: 'Pronunciation'
};

export async function POST(req: NextRequest) {
  try {
    const { feedback }: { feedback: GradeSpeakingOutput } = await req.json();

    if (!feedback) {
      return NextResponse.json({ error: 'Missing content for DOCX generation.' }, { status: 400 });
    }

    // Replace classes with inline styles for docx compatibility
    const styledTranscript = feedback.annotated_transcript
      .replace(/class='error'/g, "style='background-color: #fee2e2; color: #b91c1c; padding: 2px; border-radius: 3px;'")
      .replace(/class='correction'/g, "style='background-color: #dcfce7; color: #166534; padding: 2px; border-radius: 3px; font-weight: bold;'");

    const fullHtmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>IELTS Speaking Feedback</title>
      </head>
      <body>
        <h1>IELTS Speaking Feedback Report</h1>
        <hr />

        <h2>Score Summary</h2>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th style="padding: 8px; text-align: left;">${scoreLabels.fluency}</th>
              <th style="padding: 8px; text-align: left;">${scoreLabels.lexical}</th>
              <th style="padding: 8px; text-align: left;">${scoreLabels.grammar}</th>
              <th style="padding: 8px; text-align: left;">${scoreLabels.pronunciation}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px;">${feedback.score.fluency.toFixed(1)}</td>
              <td style="padding: 8px;">${feedback.score.lexical.toFixed(1)}</td>
              <td style="padding: 8px;">${feedback.score.grammar.toFixed(1)}</td>
              <td style="padding: 8px;">${feedback.score.pronunciation.toFixed(1)}</td>
            </tr>
          </tbody>
        </table>
        <br />

        <h2>Detailed Feedback</h2>
        <h3>${scoreLabels.fluency}</h3>
        <p>${feedback.feedback.fluency}</p>
        <h3>${scoreLabels.lexical}</h3>
        <p>${feedback.feedback.lexical}</p>
        <h3>${scoreLabels.grammar}</h3>
        <p>${feedback.feedback.grammar}</p>
        <h3>${scoreLabels.pronunciation}</h3>
        <p>${feedback.feedback.pronunciation}</p>
        <br />

        <hr />
        <h2>Annotated Transcript</h2>
        <p>${styledTranscript}</p>
        <br />

        <h2>Corrected Transcript</h2>
        <p>${feedback.corrected_transcript}</p>
        <br />

        <h2>Original Transcript</h2>
        <p>${feedback.original_transcript}</p>

      </body>
      </html>
    `;

    const fileBuffer = await htmlToDocx(fullHtmlContent, undefined, {
        table: { row: { cantSplit: true } },
        footer: true,
        header: true,
    });
    
    const newFileName = `ielts-speaking-feedback_graded.docx`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    headers.set('Content-Disposition', `attachment; filename="${newFileName}"`);

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return NextResponse.json({ error: 'Failed to generate DOCX file.' }, { status: 500 });
  }
}

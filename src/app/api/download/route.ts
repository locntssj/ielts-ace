import { NextRequest, NextResponse } from 'next/server';
import htmlToDocx from 'html-to-docx';

export async function POST(req: NextRequest) {
  try {
    const { annotatedHtml, bandScoreSummary, fileName } = await req.json();

    if (!annotatedHtml || !bandScoreSummary) {
      return NextResponse.json({ error: 'Missing content for DOCX generation.' }, { status: 400 });
    }

    const fullHtmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>IELTS Feedback</title>
      </head>
      <body>
        <h1>IELTS Essay Feedback</h1>
        <hr />
        <h2>Annotated Essay</h2>
        ${annotatedHtml}
        <br />
        <hr />
        <h2>Score Summary</h2>
        ${bandScoreSummary}
      </body>
      </html>
    `;

    const fileBuffer = await htmlToDocx(fullHtmlContent, undefined, {
        table: { row: { cantSplit: true } },
        footer: true,
        header: true,
    });
    
    const baseName = fileName ? fileName.replace(/\.docx$/i, '') : 'ielts-feedback';
    const newFileName = `${baseName}_graded.docx`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    headers.set('Content-Disposition', `attachment; filename="${newFileName}"`);

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return NextResponse.json({ error: 'Failed to generate DOCX file.' }, { status: 500 });
  }
}

"use server";

import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generateSummaryFromOpenAI } from "@/lib/openai";
import { generateSummaryFromGemini } from "@/lib/gemini";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function generatePdfText({ fileUrl }: { fileUrl: string }) {
    if (!fileUrl) return { success: false, message: "File Upload Failed", data: null };
    try {
        const pdfText = await fetchAndExtractPdfText(fileUrl);
        if (!pdfText) return { success: false, message: "Failed to extract PDF text", data: null };

        return { success: true, message: "PDF Text Fetched", data: pdfText };
    } catch {
        return { success: false, message: "PDF extraction error" };
    }
}

export async function generatePDFSummary(pdfText: any, fileName: string) {
    try {
        let summary;
        try {
            summary = await generateSummaryFromOpenAI(pdfText);
        } catch (error) {
            if (error instanceof Error && error.message === "RATE_LIMIT_EXCEEDED") {
                summary = await generateSummaryFromGemini(pdfText);
            }
        }

        if (!summary) return { success: false, message: "Summary generation failed", data: null };

        return { success: true, data: { title: fileName, summary } };
    } catch {
        return { success: false, message: "Summary generation error", data: null };
    }
}

async function savePdfSummary({
    userId,
    fileUrl,
    summary,
    title,
    fileName,
}: {
    userId: string;
    fileUrl: string;
    summary: string;
    title: string;
    fileName: string;
}) {
    const sql = await getDbConnection();
    const [row] = await sql`
    INSERT INTO pdf_summaries (
      user_id,
      original_file_url,
      summary_text,
      title,
      file_name,
      status
    ) VALUES (
      ${userId},
      ${fileUrl},
      ${summary},
      ${title},
      ${fileName},
      'completed'
    ) RETURNING id;
  `;
    return row.id;
}

// ✅ New Action: Enqueue
export async function enqueuePdfSummary({
    fileUrl,
    fileName,
    title,
}: {
    fileUrl: string;
    fileName: string;
    title: string;
}) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, message: "Unauthorized" };

        const sql = await getDbConnection();

        // 1. Insert placeholder (status = pending)
        const [row] = await sql`
      INSERT INTO pdf_summaries (
        user_id,
        original_file_url,
        summary_text,
        title,
        file_name,
        status
      ) VALUES (
        ${userId},
        ${fileUrl},
        '',
        ${title},
        ${fileName},
        'pending'
      ) RETURNING id;
    `;

        // 2. Run heavy job asynchronously (not blocking response)
        (async () => {
            try {
                const textRes = await generatePdfText({ fileUrl });
                if (!textRes.success || !textRes.data) throw new Error("PDF extract failed");

                const summaryRes = await generatePDFSummary(textRes.data, title);
                if (!summaryRes.success || !summaryRes.data) throw new Error("Summary failed");

                await sql`
          UPDATE pdf_summaries
          SET summary_text = ${summaryRes.data.summary}, status = 'completed'
          WHERE id = ${row.id};
        `;

                revalidatePath(`/summaries/${row.id}`);
            } catch (err) {
                console.error("Background job failed", err);
                await sql`
          UPDATE pdf_summaries
          SET status = 'failed'
          WHERE id = ${row.id};
        `;
            }
        })();

        return { success: true, data: row.id };
    } catch (err) {
        console.error(err);
        return { success: false, message: "Failed to enqueue" };
    }
}

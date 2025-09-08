"use server";

import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generateSummaryFromOpenAI } from "@/lib/openai";
import { generateSummaryFromGemini } from "@/lib/gemini";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface PdfSummaryType {
    userId?: string;
    fileUrl: string;
    summary: string;
    title: string;
    fileName: string;
}

export async function generatePdfText({ fileUrl }: { fileUrl: string }) {
    if (!fileUrl) {
        return { success: false, message: "No file URL provided", data: null };
    }
    try {
        const pdfText = await fetchAndExtractPdfText(fileUrl);
        if (!pdfText) {
            return { success: false, message: "Failed to extract PDF text", data: null };
        }
        return { success: true, message: "PDF text extracted", data: pdfText };
    } catch (error) {
        console.error("generatePdfText error:", error);
        return { success: false, message: "Error extracting PDF text", data: null };
    }
}

export async function generatePDFSummary(pdfText: string, fileName: string) {
    try {
        let summary;

        try {
            summary = await generateSummaryFromOpenAI(pdfText);
        } catch (error) {
            if (error instanceof Error && error.message === "RATE_LIMIT_EXCEEDED") {
                try {
                    summary = await generateSummaryFromGemini(pdfText);
                } catch (geminiErr) {
                    console.error("Gemini API failed", geminiErr);
                    return { success: false, message: "Both AI providers failed", data: null };
                }
            }
        }

        if (!summary) {
            return { success: false, message: "Summary generation failed", data: null };
        }

        return {
            success: true,
            message: "Summary generated",
            data: { title: fileName, summary },
        };
    } catch (error) {
        console.error("generatePDFSummary error:", error);
        return { success: false, message: "Error generating summary", data: null };
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
    try {
        const sql = await getDbConnection();
        const result = await sql`
      INSERT INTO pdf_summaries (
        user_id, original_file_url, summary_text, title, file_name
      ) VALUES (
        ${userId}, ${fileUrl}, ${summary}, ${title}, ${fileName}
      )
      RETURNING id;
    `;
        return { success: true, message: "Summary stored", data: result[0] };
    } catch (error) {
        console.error("Error saving PDF summary:", error);
        return { success: false, message: "Database error", data: null };
    }
}

export async function storePdfSummaryAction({
    fileUrl,
    summary,
    title,
    fileName,
}: PdfSummaryType) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { success: false, message: "User not authenticated", data: null };
        }

        const savedSummary = await savePdfSummary({ userId, fileUrl, summary, title, fileName });
        if (!savedSummary.success || !savedSummary.data) {
            return { success: false, message: "Failed to store summary", data: null };
        }

        revalidatePath(`/summaries/${savedSummary.data.id}`);
        return { success: true, message: "Summary stored", data: savedSummary.data.id };
    } catch (error) {
        console.error("storePdfSummaryAction error:", error);
        return { success: false, message: "Unexpected error storing summary", data: null };
    }
}

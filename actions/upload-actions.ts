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


export async function generatePdfText({ fileUrl }: {
    fileUrl: string,
}) {
    if (!fileUrl) {
        return {
            success: false,
            message: "File  Uplaod Failed ",
            data: null
        }
    }
    try {
        const pdfText = await fetchAndExtractPdfText(fileUrl);

        if (!pdfText) {
            return {
                success: false,
                message: "Failed to fetch and extract pdf text",
                data: null
            }
        }

        return {
            success: true,
            message: "PDF Text Fetched Successfully",
            data: pdfText

        }
    }
    catch (error) {
        return {
            success: false,
            message: "Failed to Extract PDF Text  Successfully",
        }
    }
}

export async function generatePDFSummary(pdfText: any, fileName: string) {
    try {
        let summary
        try {
            summary = await generateSummaryFromOpenAI(pdfText);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
                try {
                    summary = await generateSummaryFromGemini(pdfText);
                }
                catch (error) {
                    console.error("Gemini API failed after openAi quote exceeded", error)
                    throw new Error("Failed to generate Sumamry with available AI  providers")

                }
            }
        }
        if (!summary) {
            return {
                success: false,
                message: "Summary Generation Failed",
                data: null
            }
        }

        return {
            success: true,
            message: "Summary Generated Successfully",
            data: {
                title: fileName,
                summary
            }
        }
    }
    catch (error) {
        return {
            success: false,
            message: "Filed to generate Summary",
            data: null
        };
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
    // sql inserting pdf summary
    let savedSummary
    try {
        const sql = await getDbConnection();
        savedSummary = await sql`
      INSERT INTO pdf_summaries (
        user_id,
        original_file_url,
        summary_text,
        title,
        file_name
      ) VALUES (
        ${userId},
        ${fileUrl},
        ${summary},
        ${title},
        ${fileName}
      ) RETURNING id;
    `;


    } catch (error) {
        console.error('Error saving PDF summary', error);
        throw error;
    }
    return {
        success: true,
        message: "Summary Stored Successfully",
        data: savedSummary
    }
}

export async function storePdfSummaryAction({ fileUrl, summary, title, fileName }: PdfSummaryType) {
    let savedSummary: any;
    try {
        const { userId } = await auth();
        if (!userId) {
            return {
                success: false,
                message: "User Not Authenticated"
            }
        }
        savedSummary = await savePdfSummary({ userId, fileUrl, summary, title, fileName });
        if (!savedSummary) {
            return {
                success: false,
                message: "Storing Summary Failed",
            }
        }
        revalidatePath(`/summaries/${savedSummary.data.id}`)
        return {
            success: true,
            message: "Summary Stored Successfully",
            data: savedSummary.data[0].id
        }
    }
    catch (error) {
        return {
            success: false,
            message: "Storing Summary Failed",
        }
    }

}

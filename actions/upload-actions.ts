"use server";
import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generateSummaryFromOpenAI } from "@/lib/openai";
import { generateSummaryFromGemini } from "@/lib/gemini";
import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "@/lib/db";
import { formatFileNameAsTitle } from "@/utils/formatutil";
import { revalidatePath } from "next/cache";

interface PdfSummaryType {
    userId?: string;
    fileUrl: string;
    summary: string;
    title: string;
    fileName: string;
}


export async function generatePDFSummary(uploadResponse: any) {
    if (!uploadResponse) {
        return {
            success: false,
            message: "File Upload Failed",
            data: null
        }
    }
    const { serverData: { userId, file: { url: pdfUrl, name: pdfName } } } = uploadResponse[0];

    if (!pdfUrl) {
        return {
            success: false,
            message: "File Upload Failed",
            data: null
        };
    }

    try {
        const pdfText = await fetchAndExtractPdfText(pdfUrl);
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

        const formatedFileName = formatFileNameAsTitle(pdfName)
        return {
            success: true,
            message: "Summary Generated Successfully",
            data: {
                title: formatedFileName,
                summary
            }
        }
    }
    catch (error) {
        return {
            success: false,
            message: "File Upload Failed",
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
        console.log("saved Sumamry", savedSummary)
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
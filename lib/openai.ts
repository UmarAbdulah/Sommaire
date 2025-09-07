import OpenAI from 'openai';
import { SUMMARY_SYSTEM_PROMPT } from '@/utils/prompts';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummaryFromOpenAI(pdfText: string) {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            messages: [
                { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: `Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n ${pdfText}`,
                },
            ],
        });
        return completion.choices[0].message.content;
    }
    catch (error: any) {
        if (error?.status === 429) {
            throw new Error("Rate limit exceeded. Please try again later.");
        }
        console.log("Error in genrating sumamry", error)
        throw error;
    }
}



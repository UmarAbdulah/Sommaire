import { getDbConnection } from "./db";

export async function getSummaries(userId: string) {
    const sql = await getDbConnection();
    const summaries = await sql`
    SELECT * FROM pdf_summaries WHERE user_id = ${userId} ORDER BY created_at DESC;
    `;
    return summaries;
}

export async function getSummaryById(id: any) {
    try {
        const sql = await getDbConnection();

        const [summary] = await sql`
        SELECT
            id,
            user_id,
            title,
            original_file_url,
            summary_text,
            status,
            created_at,
            updated_at,
            file_name,
            LENGTH(summary_text) - LENGTH(REPLACE(summary_text, ' ', '')) + 1 as word_count
        from pdf_summaries where id = ${id}
`;

        return summary;
    } catch (err) {
        return null;
    }
}


export async function getUserUploadCount(userId: string) {
    const sql = await getDbConnection();
    try {
        const [result] = await sql`SELECT COUNT(*) as count FROM pdf_summaries WHERE user_id = ${userId}`;
        return result.count;
    } catch (err) {
        console.error('Error fetching user upload count', err);
        return 0;
    }
}
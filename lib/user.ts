import { getDbConnection } from './db';
import { getUserUploadCount } from './summaries';
import { plans } from '@/utils/constant';
export async function getPriceId(email: string) {
    const sql = await getDbConnection();

    const query = await sql`SELECT price_id FROM users where email = ${email} AND status = 'active'`;

    return query?.[0]?.price_id || null;
}



export async function hasReachedUploadLimit(userId: string) {
    const uploadCount = await getUserUploadCount(userId);

    const priceId = await getPriceId(userId);

    const isPro = plans.find((plan) => plan.priceId === priceId)?.id === 'pro';

    const uploadLimit: number = isPro ? 1000 : 5;

    return { hasReachedLimit: uploadCount >= uploadLimit, uploadLimit };
}
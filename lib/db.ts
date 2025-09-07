'use server';
// @ts-ignore
import { neon } from '@neondatabase/serverless';

export async function getDbConnection() {
    if (!process.env.DATA_BASE_URL) {
        throw new Error('Neon Database URL is not defined');
    }
    const sql = neon(process.env.DATA_BASE_URL);
    return sql;
}
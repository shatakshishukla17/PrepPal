// db.js
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sqlUrl = process.env.NEXT_PUBLIC_DRIZZLE_DB_URL;

if (!sqlUrl) {
    throw new Error('Database URL is not defined in the environment variables.');
}

console.log('Database URL:', sqlUrl);  

const sql = neon(sqlUrl);

export const db = drizzle(sql, { schema });

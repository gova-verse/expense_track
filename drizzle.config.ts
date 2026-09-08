import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Use MIGRATE_DATABASE_URL (non-pooled Neon URL) for drizzle-kit commands.
    // drizzle-kit migrate hangs on Neon's pooled endpoint.
    // Get the non-pooled URL from: Neon Dashboard → Connection Details → toggle off "Connection pooling"
    url: process.env.MIGRATE_DATABASE_URL || process.env.DATABASE_URL || '',
  },
});

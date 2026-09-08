import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  const result = await client.query(
    'SELECT id, name, type, user_id, is_default FROM categories ORDER BY id LIMIT 20'
  );
  console.log(JSON.stringify(result.rows, null, 2));
  client.release();
  await pool.end();
}

main().catch(console.error);

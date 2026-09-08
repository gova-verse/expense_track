import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    // Check current columns in users table
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log('Current users columns:', cols.rows.map(r => r.column_name));

    const hasGoogleId = cols.rows.some(r => r.column_name === 'google_id');
    
    if (!hasGoogleId) {
      console.log('Column missing! Adding it now...');
      await client.query(`ALTER TABLE users ADD COLUMN google_id VARCHAR(255)`);
      console.log('✅ Added google_id column (no unique constraint yet)');
      
      // Add unique constraint separately
      await client.query(`ALTER TABLE users ADD CONSTRAINT users_google_id_unique UNIQUE (google_id)`);
      console.log('✅ Added unique constraint');
    } else {
      console.log('✅ google_id column already exists');
    }

    // Final verification
    const verify = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'google_id'
    `);
    console.log('Verified:', verify.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const p = new Pool({ connectionString: process.env.DATABASE_URL });
p.query("UPDATE categories SET name = 'Food' WHERE id = 1 AND name = 'food'")
  .then(r => { console.log('Fixed rows:', r.rowCount); p.end(); })
  .catch(e => { console.error(e.message); p.end(); });

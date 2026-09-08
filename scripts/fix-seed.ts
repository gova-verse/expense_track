import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const defaultCategories = [
  // Expenses
  { name: 'Food', type: 'expense', is_default: true },
  { name: 'Transport', type: 'expense', is_default: true },
  { name: 'Shopping', type: 'expense', is_default: true },
  { name: 'Entertainment', type: 'expense', is_default: true },
  { name: 'Bills', type: 'expense', is_default: true },
  { name: 'Rent', type: 'expense', is_default: true },
  { name: 'Health', type: 'expense', is_default: true },
  { name: 'Education', type: 'expense', is_default: true },
  { name: 'Travel', type: 'expense', is_default: true },
  { name: 'Personal', type: 'expense', is_default: true },
  { name: 'Other', type: 'expense', is_default: true },
  // Income
  { name: 'Salary', type: 'income', is_default: true },
  { name: 'Freelance', type: 'income', is_default: true },
  { name: 'Business', type: 'income', is_default: true },
  { name: 'Investment', type: 'income', is_default: true },
  { name: 'Interest', type: 'income', is_default: true },
  { name: 'Rental', type: 'income', is_default: true },
  { name: 'Gift', type: 'income', is_default: true },
  { name: 'Refund', type: 'income', is_default: true },
  { name: 'Other Income', type: 'income', is_default: true },
];

async function main() {
  const client = await pool.connect();
  try {
    // Step 1: Fix existing categories that have user_id set — make them global (NULL)
    const fix = await client.query(`UPDATE categories SET user_id = NULL, is_default = TRUE WHERE user_id IS NOT NULL`);
    console.log(`Fixed ${fix.rowCount} categories → user_id set to NULL`);

    // Step 2: Get existing category names to avoid duplicates
    const existing = await client.query(`SELECT name, type FROM categories WHERE user_id IS NULL`);
    const existingSet = new Set(existing.rows.map((r: {name: string, type: string}) => `${r.name}|${r.type}`));

    // Step 3: Insert only missing default categories
    let inserted = 0;
    for (const cat of defaultCategories) {
      const key = `${cat.name}|${cat.type}`;
      if (!existingSet.has(key)) {
        await client.query(
          `INSERT INTO categories (name, type, is_default, user_id) VALUES ($1, $2, $3, NULL)`,
          [cat.name, cat.type, cat.is_default]
        );
        inserted++;
      }
    }
    console.log(`✅ Inserted ${inserted} missing default categories`);

    // Verify
    const check = await client.query(`SELECT id, name, type, user_id, is_default FROM categories ORDER BY type, name`);
    console.log(JSON.stringify(check.rows, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);

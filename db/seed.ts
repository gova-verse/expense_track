import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

const defaultCategories = [
  
  { name: 'Food', type: 'expense' as const, isDefault: true },
  { name: 'Transport', type: 'expense' as const, isDefault: true },
  { name: 'Shopping', type: 'expense' as const, isDefault: true },
  { name: 'Entertainment', type: 'expense' as const, isDefault: true },
  { name: 'Bills', type: 'expense' as const, isDefault: true },
  { name: 'Rent', type: 'expense' as const, isDefault: true },
  { name: 'Health', type: 'expense' as const, isDefault: true },
  { name: 'Education', type: 'expense' as const, isDefault: true },
  { name: 'Travel', type: 'expense' as const, isDefault: true },
  { name: 'Personal', type: 'expense' as const, isDefault: true },
  { name: 'Other', type: 'expense' as const, isDefault: true },
  
  
  { name: 'Salary', type: 'income' as const, isDefault: true },
  { name: 'Freelance', type: 'income' as const, isDefault: true },
  { name: 'Business', type: 'income' as const, isDefault: true },
  { name: 'Investment', type: 'income' as const, isDefault: true },
  { name: 'Interest', type: 'income' as const, isDefault: true },
  { name: 'Rental', type: 'income' as const, isDefault: true },
  { name: 'Gift', type: 'income' as const, isDefault: true },
  { name: 'Refund', type: 'income' as const, isDefault: true },
  { name: 'Other Income', type: 'income' as const, isDefault: true },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Cannot run seed.');
    process.exit(1);
  }

  console.log('Seeding default categories...');
  try {
    await db.delete(schema.categories).where(eq(schema.categories.isDefault, true));
    await db.insert(schema.categories).values(defaultCategories);
    console.log('Seeding done.');
  } catch (e) {
    console.log('Failed to seed categories. You may need to truncate the table first if foreign keys exist.', e);
  }
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

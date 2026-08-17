import { pgTable, serial, varchar, text, integer, timestamp, boolean, decimal, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }),
  name: varchar('name', { length: 255 }),
  emailVerifiedAt: timestamp('email_verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).unique(),
  theme: varchar('theme', { length: 50 }).default('system').notNull(),
  colorTheme: varchar('color_theme', { length: 50 }).default('default').notNull(),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  numberFormat: varchar('number_format', { length: 50 }).default('en-IN').notNull(),
  dateFormat: varchar('date_format', { length: 50 }).default('DD/MM/YYYY').notNull(),
  timezone: varchar('timezone', { length: 100 }).default('Asia/Kolkata').notNull(),
  // Notification preferences
  notifySecurityAlerts: boolean('notify_security_alerts').default(true).notNull(),
  notifyAccountActivity: boolean('notify_account_activity').default(true).notNull(),
  notifyMonthlySummary: boolean('notify_monthly_summary').default(false).notNull(),
  notifyBudgetApproaching: boolean('notify_budget_approaching').default(true).notNull(),
  notifyBudgetExceeded: boolean('notify_budget_exceeded').default(true).notNull(),
  notifyHighSpending: boolean('notify_high_spending').default(false).notNull(),
  notifyProductUpdates: boolean('notify_product_updates').default(false).notNull(),
  notifyNewFeatures: boolean('notify_new_features').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const authTokenTypeEnum = pgEnum('auth_token_type', ['email_verification', 'password_reset']);

export const authTokens = pgTable('auth_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  type: authTokenTypeEnum('type').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const categoryTypeEnum = pgEnum('category_type', ['expense', 'income']);

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: categoryTypeEnum('type').notNull(),
  icon: varchar('icon', { length: 255 }),
  color: varchar('color', { length: 255 }),
  isDefault: boolean('is_default').default(false).notNull(),
  userId: integer('user_id').references(() => users.id), // Nullable for global defaults
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transactionTypeEnum = pgEnum('transaction_type', ['expense', 'income', 'transfer']);

export const accountTypeEnum = pgEnum('account_type', ['cash', 'bank', 'wallet', 'credit', 'savings']);

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: accountTypeEnum('type').notNull(),
  openingBalance: decimal('opening_balance', { precision: 12, scale: 2 }).default('0').notNull(),
  userId: integer('user_id').references(() => users.id), // Prepared for auth
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  date: timestamp('date').notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => categories.id),
  accountId: integer('account_id').references(() => accounts.id), // Optional for now at DB level to allow migration, but application requires it
  destinationAccountId: integer('destination_account_id').references(() => accounts.id),
  paymentMethod: varchar('payment_method', { length: 255 }),
  notes: text('notes'),
  userId: integer('user_id').references(() => users.id), // Prepared for auth
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return [
    index('date_idx').on(table.date),
    index('type_idx').on(table.type),
    index('category_idx').on(table.categoryId),
    index('account_idx').on(table.accountId),
  ];
});

export const budgetPeriodEnum = pgEnum('budget_period', ['daily', 'weekly', 'monthly']);

export const budgets = pgTable('budgets', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  period: budgetPeriodEnum('period').notNull(),
  categoryId: integer('category_id').references(() => categories.id), // Nullable for overall budget
  userId: integer('user_id').references(() => users.id), // Prepared for auth
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'), // Nullable for ongoing budgets
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  categories: many(categories),
  transactions: many(transactions),
  budgets: many(budgets),
  accounts: many(accounts),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  transactions: many(transactions, { relationName: 'account_transactions' }),
  incomingTransfers: many(transactions, { relationName: 'destination_account_transactions' }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
    relationName: 'account_transactions'
  }),
  destinationAccount: one(accounts, {
    fields: [transactions.destinationAccountId],
    references: [accounts.id],
    relationName: 'destination_account_transactions'
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
}));

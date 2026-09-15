import { pgTable, text, varchar, integer, timestamp, boolean, decimal, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';



export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});



export const userPreferences = pgTable('user_preferences', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => user.id).unique(),
  theme: varchar('theme', { length: 50 }).default('system').notNull(),
  colorTheme: varchar('color_theme', { length: 50 }).default('default').notNull(),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  numberFormat: varchar('number_format', { length: 50 }).default('en-IN').notNull(),
  dateFormat: varchar('date_format', { length: 50 }).default('DD/MM/YYYY').notNull(),
  timezone: varchar('timezone', { length: 100 }).default('Asia/Kolkata').notNull(),
  
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

export const categoryTypeEnum = pgEnum('category_type', ['expense', 'income']);

export const categories = pgTable('categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  type: categoryTypeEnum('type').notNull(),
  icon: varchar('icon', { length: 255 }),
  color: varchar('color', { length: 255 }),
  isDefault: boolean('is_default').default(false).notNull(),
  userId: text('user_id').references(() => user.id), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transactionTypeEnum = pgEnum('transaction_type', ['expense', 'income', 'transfer']);

export const accountTypeEnum = pgEnum('account_type', ['cash', 'bank', 'wallet', 'credit', 'savings']);

export const accounts = pgTable('accounts', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  type: accountTypeEnum('type').notNull(),
  openingBalance: decimal('opening_balance', { precision: 12, scale: 2 }).default('0').notNull(),
  userId: text('user_id').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  date: timestamp('date').notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => categories.id),
  accountId: integer('account_id').references(() => accounts.id),
  destinationAccountId: integer('destination_account_id').references(() => accounts.id),
  paymentMethod: varchar('payment_method', { length: 255 }),
  notes: text('notes'),
  userId: text('user_id').references(() => user.id),
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
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  period: budgetPeriodEnum('period').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  userId: text('user_id').references(() => user.id),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});



export const userRelations = relations(user, ({ one, many }) => ({
  preferences: one(userPreferences, {
    fields: [user.id],
    references: [userPreferences.userId],
  }),
  sessions: many(session),
  authAccounts: many(account),
  categories: many(categories),
  transactions: many(transactions),
  budgets: many(budgets),
  financialAccounts: many(accounts),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(user, {
    fields: [userPreferences.userId],
    references: [user.id],
  }),
}));

export const financialAccountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(user, {
    fields: [accounts.userId],
    references: [user.id],
  }),
  transactions: many(transactions, { relationName: 'account_transactions' }),
  incomingTransfers: many(transactions, { relationName: 'destination_account_transactions' }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(user, {
    fields: [categories.userId],
    references: [user.id],
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
  user: one(user, {
    fields: [transactions.userId],
    references: [user.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
  user: one(user, {
    fields: [budgets.userId],
    references: [user.id],
  }),
}));

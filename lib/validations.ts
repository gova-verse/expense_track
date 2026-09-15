import { z } from 'zod';
import { categoryTypeEnum, transactionTypeEnum, budgetPeriodEnum } from '../db/schema';


export const insertTransactionSchema = z.object({
  type: z.enum(transactionTypeEnum.enumValues),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.coerce.date(),
  description: z.string().optional(),
  categoryId: z.number().int().optional(),
  accountId: z.number().int().min(1, "Account is required"),
  destinationAccountId: z.number().int().optional().nullable(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

export const updateTransactionSchema = insertTransactionSchema.partial();


export const insertTransferSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.coerce.date(),
  accountId: z.number().int().min(1, "Source account is required"),
  destinationAccountId: z.number().int().min(1, "Destination account is required"),
  description: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => data.accountId !== data.destinationAccountId, {
  message: "Source and destination accounts must be different.",
  path: ["destinationAccountId"],
});

export const updateTransferSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0").optional(),
  date: z.coerce.date().optional(),
  accountId: z.number().int().min(1, "Source account is required").optional(),
  destinationAccountId: z.number().int().min(1, "Destination account is required").optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});


export const insertAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(['cash', 'bank', 'wallet', 'credit', 'savings']),
  openingBalance: z.coerce.number().default(0),
});

export const updateAccountSchema = insertAccountSchema.partial();


export const insertCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(categoryTypeEnum.enumValues),
  icon: z.string().optional(),
  color: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const updateCategorySchema = insertCategorySchema.partial();


export const insertBudgetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  period: z.enum(budgetPeriodEnum.enumValues),
  categoryId: z.number().int().nullable().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
});

export const updateBudgetSchema = insertBudgetSchema.partial();


export const passwordRules = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: passwordRules,
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: passwordRules,
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
});


export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordRules,
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


export const notificationPreferencesSchema = z.object({
  notifySecurityAlerts: z.boolean(),
  notifyAccountActivity: z.boolean(),
  notifyMonthlySummary: z.boolean(),
  notifyBudgetApproaching: z.boolean(),
  notifyBudgetExceeded: z.boolean(),
  notifyHighSpending: z.boolean(),
  notifyProductUpdates: z.boolean(),
  notifyNewFeatures: z.boolean(),
});

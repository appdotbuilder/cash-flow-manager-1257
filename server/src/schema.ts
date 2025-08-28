import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum(['admin', 'member']);
export type UserRole = z.infer<typeof userRoleSchema>;

// User authentication schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password_hash: z.string(),
  full_name: z.string(),
  phone: z.string().nullable(),
  role: userRoleSchema,
  is_active: z.boolean(),
  google_id: z.string().nullable(),
  avatar_url: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Auth input schemas
export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const googleLoginInputSchema = z.object({
  google_id: z.string(),
  email: z.string().email(),
  full_name: z.string(),
  avatar_url: z.string().nullable()
});

export type GoogleLoginInput = z.infer<typeof googleLoginInputSchema>;

export const registerUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string(),
  phone: z.string().nullable(),
  role: userRoleSchema
});

export type RegisterUserInput = z.infer<typeof registerUserInputSchema>;

// Member profile schema
export const memberProfileSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  membership_number: z.string(),
  monthly_contribution: z.number(),
  join_date: z.coerce.date(),
  is_active: z.boolean(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type MemberProfile = z.infer<typeof memberProfileSchema>;

export const createMemberInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string(),
  phone: z.string().nullable(),
  membership_number: z.string(),
  monthly_contribution: z.number().positive(),
  join_date: z.coerce.date(),
  notes: z.string().nullable()
});

export type CreateMemberInput = z.infer<typeof createMemberInputSchema>;

export const updateMemberInputSchema = z.object({
  id: z.number(),
  full_name: z.string().optional(),
  phone: z.string().nullable().optional(),
  membership_number: z.string().optional(),
  monthly_contribution: z.number().positive().optional(),
  is_active: z.boolean().optional(),
  notes: z.string().nullable().optional()
});

export type UpdateMemberInput = z.infer<typeof updateMemberInputSchema>;

// Transaction type enum
export const transactionTypeSchema = z.enum(['contribution', 'expense']);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

// Transaction status enum
export const transactionStatusSchema = z.enum(['pending', 'verified', 'rejected']);
export type TransactionStatus = z.infer<typeof transactionStatusSchema>;

// Transaction schema
export const transactionSchema = z.object({
  id: z.number(),
  member_id: z.number().nullable(),
  admin_id: z.number(),
  type: transactionTypeSchema,
  amount: z.number(),
  description: z.string(),
  proof_url: z.string().nullable(),
  status: transactionStatusSchema,
  transaction_date: z.coerce.date(),
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Transaction = z.infer<typeof transactionSchema>;

export const createContributionInputSchema = z.object({
  member_id: z.number(),
  amount: z.number().positive(),
  description: z.string(),
  proof_url: z.string().nullable(),
  transaction_date: z.coerce.date(),
  month: z.number().int().min(1).max(12),
  year: z.number().int()
});

export type CreateContributionInput = z.infer<typeof createContributionInputSchema>;

export const createExpenseInputSchema = z.object({
  amount: z.number().positive(),
  description: z.string(),
  proof_url: z.string().nullable(),
  transaction_date: z.coerce.date()
});

export type CreateExpenseInput = z.infer<typeof createExpenseInputSchema>;

export const updateTransactionStatusInputSchema = z.object({
  transaction_id: z.number(),
  status: transactionStatusSchema,
  admin_notes: z.string().nullable()
});

export type UpdateTransactionStatusInput = z.infer<typeof updateTransactionStatusInputSchema>;

// Payment reminder schema
export const paymentReminderSchema = z.object({
  id: z.number(),
  member_id: z.number(),
  admin_id: z.number(),
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  reminder_type: z.enum(['whatsapp', 'email']),
  message: z.string(),
  sent_at: z.coerce.date(),
  created_at: z.coerce.date()
});

export type PaymentReminder = z.infer<typeof paymentReminderSchema>;

export const sendReminderInputSchema = z.object({
  member_ids: z.array(z.number()),
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  reminder_type: z.enum(['whatsapp', 'email']),
  message: z.string()
});

export type SendReminderInput = z.infer<typeof sendReminderInputSchema>;

// QR Code schema
export const qrCodeSchema = z.object({
  id: z.number(),
  name: z.string(),
  qr_image_url: z.string(),
  account_details: z.string(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type QrCode = z.infer<typeof qrCodeSchema>;

export const createQrCodeInputSchema = z.object({
  name: z.string(),
  qr_image_url: z.string(),
  account_details: z.string()
});

export type CreateQrCodeInput = z.infer<typeof createQrCodeInputSchema>;

export const updateQrCodeInputSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  qr_image_url: z.string().optional(),
  account_details: z.string().optional(),
  is_active: z.boolean().optional()
});

export type UpdateQrCodeInput = z.infer<typeof updateQrCodeInputSchema>;

// Notification schema
export const notificationSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['payment_reminder', 'transaction_verified', 'transaction_rejected', 'general']),
  is_read: z.boolean(),
  created_at: z.coerce.date()
});

export type Notification = z.infer<typeof notificationSchema>;

export const createNotificationInputSchema = z.object({
  user_id: z.number(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['payment_reminder', 'transaction_verified', 'transaction_rejected', 'general'])
});

export type CreateNotificationInput = z.infer<typeof createNotificationInputSchema>;

// Dashboard data schemas
export const adminDashboardDataSchema = z.object({
  total_balance: z.number(),
  total_members: z.number(),
  active_members: z.number(),
  monthly_income: z.number(),
  monthly_expenses: z.number(),
  pending_transactions: z.number(),
  monthly_cash_flow: z.array(z.object({
    month: z.string(),
    income: z.number(),
    expenses: z.number(),
    net: z.number()
  })),
  recent_transactions: z.array(transactionSchema)
});

export type AdminDashboardData = z.infer<typeof adminDashboardDataSchema>;

export const memberDashboardDataSchema = z.object({
  personal_balance: z.number(),
  current_month_due: z.number(),
  total_contributions: z.number(),
  payment_history: z.array(transactionSchema),
  pending_transactions: z.array(transactionSchema),
  upcoming_due_date: z.string().nullable()
});

export type MemberDashboardData = z.infer<typeof memberDashboardDataSchema>;

// Report schemas
export const reportPeriodSchema = z.object({
  start_date: z.coerce.date(),
  end_date: z.coerce.date()
});

export type ReportPeriod = z.infer<typeof reportPeriodSchema>;

export const monthlyReportInputSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  format: z.enum(['pdf', 'excel']).optional().default('pdf')
});

export type MonthlyReportInput = z.infer<typeof monthlyReportInputSchema>;

export const yearlyReportInputSchema = z.object({
  year: z.number().int(),
  format: z.enum(['pdf', 'excel']).optional().default('pdf')
});

export type YearlyReportInput = z.infer<typeof yearlyReportInputSchema>;

// File upload schema
export const fileUploadInputSchema = z.object({
  file: z.string(), // base64 encoded file
  filename: z.string(),
  mime_type: z.string()
});

export type FileUploadInput = z.infer<typeof fileUploadInputSchema>;

export const fileUploadResponseSchema = z.object({
  url: z.string(),
  filename: z.string()
});

export type FileUploadResponse = z.infer<typeof fileUploadResponseSchema>;
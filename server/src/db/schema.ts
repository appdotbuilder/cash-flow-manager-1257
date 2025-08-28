import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'member']);
export const transactionTypeEnum = pgEnum('transaction_type', ['contribution', 'expense']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'verified', 'rejected']);
export const reminderTypeEnum = pgEnum('reminder_type', ['whatsapp', 'email']);
export const notificationTypeEnum = pgEnum('notification_type', ['payment_reminder', 'transaction_verified', 'transaction_rejected', 'general']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  full_name: text('full_name').notNull(),
  phone: text('phone'),
  role: userRoleEnum('role').notNull().default('member'),
  is_active: boolean('is_active').notNull().default(true),
  google_id: text('google_id'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Member profiles table
export const memberProfilesTable = pgTable('member_profiles', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => usersTable.id).notNull(),
  membership_number: text('membership_number').notNull().unique(),
  monthly_contribution: numeric('monthly_contribution', { precision: 10, scale: 2 }).notNull(),
  join_date: timestamp('join_date').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Transactions table
export const transactionsTable = pgTable('transactions', {
  id: serial('id').primaryKey(),
  member_id: integer('member_id').references(() => memberProfilesTable.id),
  admin_id: integer('admin_id').references(() => usersTable.id).notNull(),
  type: transactionTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  proof_url: text('proof_url'),
  status: transactionStatusEnum('status').notNull().default('pending'),
  transaction_date: timestamp('transaction_date').notNull(),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  admin_notes: text('admin_notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Payment reminders table
export const paymentRemindersTable = pgTable('payment_reminders', {
  id: serial('id').primaryKey(),
  member_id: integer('member_id').references(() => memberProfilesTable.id).notNull(),
  admin_id: integer('admin_id').references(() => usersTable.id).notNull(),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  reminder_type: reminderTypeEnum('reminder_type').notNull(),
  message: text('message').notNull(),
  sent_at: timestamp('sent_at').defaultNow().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// QR codes table
export const qrCodesTable = pgTable('qr_codes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  qr_image_url: text('qr_image_url').notNull(),
  account_details: text('account_details').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Notifications table
export const notificationsTable = pgTable('notifications', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => usersTable.id).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: notificationTypeEnum('type').notNull(),
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ one, many }) => ({
  memberProfile: one(memberProfilesTable, {
    fields: [usersTable.id],
    references: [memberProfilesTable.user_id]
  }),
  adminTransactions: many(transactionsTable, { relationName: 'admin' }),
  notifications: many(notificationsTable),
  sentReminders: many(paymentRemindersTable)
}));

export const memberProfilesRelations = relations(memberProfilesTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [memberProfilesTable.user_id],
    references: [usersTable.id]
  }),
  transactions: many(transactionsTable),
  reminders: many(paymentRemindersTable)
}));

export const transactionsRelations = relations(transactionsTable, ({ one }) => ({
  member: one(memberProfilesTable, {
    fields: [transactionsTable.member_id],
    references: [memberProfilesTable.id]
  }),
  admin: one(usersTable, {
    fields: [transactionsTable.admin_id],
    references: [usersTable.id],
    relationName: 'admin'
  })
}));

export const paymentRemindersRelations = relations(paymentRemindersTable, ({ one }) => ({
  member: one(memberProfilesTable, {
    fields: [paymentRemindersTable.member_id],
    references: [memberProfilesTable.id]
  }),
  admin: one(usersTable, {
    fields: [paymentRemindersTable.admin_id],
    references: [usersTable.id]
  })
}));

export const notificationsRelations = relations(notificationsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [notificationsTable.user_id],
    references: [usersTable.id]
  })
}));

// TypeScript types for the tables
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type MemberProfile = typeof memberProfilesTable.$inferSelect;
export type NewMemberProfile = typeof memberProfilesTable.$inferInsert;

export type Transaction = typeof transactionsTable.$inferSelect;
export type NewTransaction = typeof transactionsTable.$inferInsert;

export type PaymentReminder = typeof paymentRemindersTable.$inferSelect;
export type NewPaymentReminder = typeof paymentRemindersTable.$inferInsert;

export type QrCode = typeof qrCodesTable.$inferSelect;
export type NewQrCode = typeof qrCodesTable.$inferInsert;

export type Notification = typeof notificationsTable.$inferSelect;
export type NewNotification = typeof notificationsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  users: usersTable,
  memberProfiles: memberProfilesTable,
  transactions: transactionsTable,
  paymentReminders: paymentRemindersTable,
  qrCodes: qrCodesTable,
  notifications: notificationsTable
};
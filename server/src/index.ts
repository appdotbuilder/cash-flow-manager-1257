import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  loginInputSchema,
  googleLoginInputSchema,
  registerUserInputSchema,
  createMemberInputSchema,
  updateMemberInputSchema,
  createContributionInputSchema,
  createExpenseInputSchema,
  updateTransactionStatusInputSchema,
  sendReminderInputSchema,
  createNotificationInputSchema,
  createQrCodeInputSchema,
  updateQrCodeInputSchema,
  monthlyReportInputSchema,
  yearlyReportInputSchema,
  fileUploadInputSchema
} from './schema';

// Import handlers
import { loginUser, loginWithGoogle, registerUser, validateToken } from './handlers/auth';
import {
  createMember,
  updateMember,
  getMember,
  getAllMembers,
  getActiveMembers,
  deleteMember,
  toggleMemberStatus
} from './handlers/members';
import {
  createContribution,
  createExpense,
  updateTransactionStatus,
  getTransactionById,
  getTransactionsByMember,
  getTransactionsByDateRange,
  getTransactionsByMonth,
  getPendingTransactions,
  getRecentTransactions
} from './handlers/transactions';
import {
  getAdminDashboardData,
  getMemberDashboardData,
  calculateTotalBalance,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  getMonthlyCashFlow,
  getMemberBalance,
  getCurrentMonthDue
} from './handlers/dashboard';
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendPaymentReminder,
  getPaymentReminders,
  notifyTransactionStatusChange
} from './handlers/notifications';
import {
  createQrCode,
  updateQrCode,
  getQrCode,
  getAllQrCodes,
  getActiveQrCodes,
  deleteQrCode,
  toggleQrCodeStatus
} from './handlers/qr_codes';
import {
  generateMonthlyReport,
  generateYearlyReport,
  generateMemberStatement,
  getMonthlyReportData,
  getYearlyReportData,
  getDefaultersReport
} from './handlers/reports';
import {
  uploadFile,
  uploadTransactionProof,
  uploadQrCodeImage,
  uploadUserAvatar
} from './handlers/file_upload';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

// Auth middleware for protected routes
const protectedProcedure = publicProcedure.use(async ({ next, ctx }) => {
  // This should validate JWT token from headers
  // For now, just passing through
  return next({ ctx });
});

// Admin-only middleware
const adminProcedure = protectedProcedure.use(async ({ next, ctx }) => {
  // This should check if user role is 'admin'
  // For now, just passing through
  return next({ ctx });
});

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication routes
  auth: router({
    login: publicProcedure
      .input(loginInputSchema)
      .mutation(({ input }) => loginUser(input)),
    
    loginWithGoogle: publicProcedure
      .input(googleLoginInputSchema)
      .mutation(({ input }) => loginWithGoogle(input)),
    
    register: publicProcedure
      .input(registerUserInputSchema)
      .mutation(({ input }) => registerUser(input)),
    
    validateToken: protectedProcedure
      .input(z.object({ token: z.string() }))
      .query(({ input }) => validateToken(input.token))
  }),

  // Member management routes (admin only)
  members: router({
    create: adminProcedure
      .input(createMemberInputSchema)
      .mutation(({ input }) => createMember(input)),
    
    update: adminProcedure
      .input(updateMemberInputSchema)
      .mutation(({ input }) => updateMember(input)),
    
    get: protectedProcedure
      .input(z.object({ memberId: z.number() }))
      .query(({ input }) => getMember(input.memberId)),
    
    getAll: adminProcedure
      .query(() => getAllMembers()),
    
    getActive: protectedProcedure
      .query(() => getActiveMembers()),
    
    delete: adminProcedure
      .input(z.object({ memberId: z.number() }))
      .mutation(({ input }) => deleteMember(input.memberId)),
    
    toggleStatus: adminProcedure
      .input(z.object({ memberId: z.number() }))
      .mutation(({ input }) => toggleMemberStatus(input.memberId))
  }),

  // Transaction routes
  transactions: router({
    createContribution: protectedProcedure
      .input(createContributionInputSchema)
      .mutation(({ input }) => createContribution(input, 1)), // TODO: get admin ID from context
    
    createExpense: adminProcedure
      .input(createExpenseInputSchema)
      .mutation(({ input }) => createExpense(input, 1)), // TODO: get admin ID from context
    
    updateStatus: adminProcedure
      .input(updateTransactionStatusInputSchema)
      .mutation(({ input }) => updateTransactionStatus(input)),
    
    getById: protectedProcedure
      .input(z.object({ transactionId: z.number() }))
      .query(({ input }) => getTransactionById(input.transactionId)),
    
    getByMember: protectedProcedure
      .input(z.object({ memberId: z.number() }))
      .query(({ input }) => getTransactionsByMember(input.memberId)),
    
    getByDateRange: adminProcedure
      .input(z.object({ startDate: z.coerce.date(), endDate: z.coerce.date() }))
      .query(({ input }) => getTransactionsByDateRange(input.startDate, input.endDate)),
    
    getByMonth: adminProcedure
      .input(z.object({ month: z.number(), year: z.number() }))
      .query(({ input }) => getTransactionsByMonth(input.month, input.year)),
    
    getPending: adminProcedure
      .query(() => getPendingTransactions()),
    
    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().optional().default(10) }))
      .query(({ input }) => getRecentTransactions(input.limit))
  }),

  // Dashboard routes
  dashboard: router({
    admin: adminProcedure
      .query(() => getAdminDashboardData()),
    
    member: protectedProcedure
      .input(z.object({ memberId: z.number() }))
      .query(({ input }) => getMemberDashboardData(input.memberId)),
    
    totalBalance: adminProcedure
      .query(() => calculateTotalBalance()),
    
    monthlyIncome: adminProcedure
      .input(z.object({ month: z.number(), year: z.number() }))
      .query(({ input }) => calculateMonthlyIncome(input.month, input.year)),
    
    monthlyExpenses: adminProcedure
      .input(z.object({ month: z.number(), year: z.number() }))
      .query(({ input }) => calculateMonthlyExpenses(input.month, input.year)),
    
    monthlyCashFlow: adminProcedure
      .input(z.object({ months: z.number().optional().default(12) }))
      .query(({ input }) => getMonthlyCashFlow(input.months)),
    
    memberBalance: protectedProcedure
      .input(z.object({ memberId: z.number() }))
      .query(({ input }) => getMemberBalance(input.memberId)),
    
    currentMonthDue: protectedProcedure
      .input(z.object({ memberId: z.number() }))
      .query(({ input }) => getCurrentMonthDue(input.memberId))
  }),

  // Notification routes
  notifications: router({
    create: adminProcedure
      .input(createNotificationInputSchema)
      .mutation(({ input }) => createNotification(input)),
    
    getUserNotifications: protectedProcedure
      .input(z.object({ userId: z.number(), unreadOnly: z.boolean().optional().default(false) }))
      .query(({ input }) => getUserNotifications(input.userId, input.unreadOnly)),
    
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(({ input }) => markNotificationAsRead(input.notificationId)),
    
    markAllAsRead: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(({ input }) => markAllNotificationsAsRead(input.userId)),
    
    sendPaymentReminder: adminProcedure
      .input(sendReminderInputSchema)
      .mutation(({ input }) => sendPaymentReminder(input, 1)), // TODO: get admin ID from context
    
    getPaymentReminders: adminProcedure
      .input(z.object({ memberId: z.number().optional() }))
      .query(({ input }) => getPaymentReminders(input.memberId))
  }),

  // QR Code routes
  qrCodes: router({
    create: adminProcedure
      .input(createQrCodeInputSchema)
      .mutation(({ input }) => createQrCode(input)),
    
    update: adminProcedure
      .input(updateQrCodeInputSchema)
      .mutation(({ input }) => updateQrCode(input)),
    
    get: protectedProcedure
      .input(z.object({ qrCodeId: z.number() }))
      .query(({ input }) => getQrCode(input.qrCodeId)),
    
    getAll: adminProcedure
      .query(() => getAllQrCodes()),
    
    getActive: protectedProcedure
      .query(() => getActiveQrCodes()),
    
    delete: adminProcedure
      .input(z.object({ qrCodeId: z.number() }))
      .mutation(({ input }) => deleteQrCode(input.qrCodeId)),
    
    toggleStatus: adminProcedure
      .input(z.object({ qrCodeId: z.number() }))
      .mutation(({ input }) => toggleQrCodeStatus(input.qrCodeId))
  }),

  // Report routes
  reports: router({
    generateMonthly: adminProcedure
      .input(monthlyReportInputSchema)
      .mutation(({ input }) => generateMonthlyReport(input)),
    
    generateYearly: adminProcedure
      .input(yearlyReportInputSchema)
      .mutation(({ input }) => generateYearlyReport(input)),
    
    generateMemberStatement: adminProcedure
      .input(z.object({ memberId: z.number(), startDate: z.coerce.date(), endDate: z.coerce.date() }))
      .mutation(({ input }) => generateMemberStatement(input.memberId, input.startDate, input.endDate)),
    
    getMonthlyData: adminProcedure
      .input(z.object({ month: z.number(), year: z.number() }))
      .query(({ input }) => getMonthlyReportData(input.month, input.year)),
    
    getYearlyData: adminProcedure
      .input(z.object({ year: z.number() }))
      .query(({ input }) => getYearlyReportData(input.year)),
    
    getDefaulters: adminProcedure
      .input(z.object({ month: z.number(), year: z.number() }))
      .query(({ input }) => getDefaultersReport(input.month, input.year))
  }),

  // File upload routes
  files: router({
    upload: protectedProcedure
      .input(fileUploadInputSchema)
      .mutation(({ input }) => uploadFile(input)),
    
    uploadTransactionProof: protectedProcedure
      .input(fileUploadInputSchema.extend({ transactionId: z.number() }))
      .mutation(({ input }) => uploadTransactionProof(input, input.transactionId)),
    
    uploadQrCodeImage: adminProcedure
      .input(fileUploadInputSchema)
      .mutation(({ input }) => uploadQrCodeImage(input)),
    
    uploadUserAvatar: protectedProcedure
      .input(fileUploadInputSchema.extend({ userId: z.number() }))
      .mutation(({ input }) => uploadUserAvatar(input, input.userId))
  })
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
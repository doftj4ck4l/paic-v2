import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { db } from "@/db";
import { accounts, authEvents, sessions, users, verifications } from "@/db/schema";
import { sendEmail } from "./email";
import { resetPasswordEmail, verifyEmailTemplate } from "./email-templates";

async function recordAuthEvent(event: string, userId: string | null, detail?: Record<string, unknown>) {
  try {
    await db.insert(authEvents).values({ event, userId, detail });
  } catch {
    // audit logging must never break authentication
  }
}

export const auth = betterAuth({
  appName: "Pixelspace AI Classroom",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    /** Hard verification: sign-in only works after the email link is clicked. */
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 30,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({ to: user.email, ...resetPasswordEmail(user.name, url) });
    },
    onPasswordReset: async ({ user }) => {
      await recordAuthEvent("password_reset", user.id);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({ to: user.email, ...verifyEmailTemplate(user.name, url) });
    },
  },
  user: {
    additionalFields: {
      schoolId: { type: "string", required: true },
      displayName: { type: "string", required: false },
      yearLabel: { type: "string", required: false },
      className: { type: "string", required: false },
      role: { type: "string", required: false, defaultValue: "student", input: false },
      status: { type: "string", required: false, defaultValue: "active", input: false },
      language: { type: "string", required: false, defaultValue: "bm", input: false },
      xp: { type: "number", required: false, defaultValue: 0, input: false },
      streakDays: { type: "number", required: false, defaultValue: 0, input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/request-password-reset": { window: 60, max: 3 },
      "/send-verification-email": { window: 60, max: 3 },
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-in/username": { window: 60, max: 10 },
      "/sign-up/email": { window: 60, max: 5 },
    },
  },
  plugins: [username()],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await recordAuthEvent("register", user.id, { email: user.email });
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          await recordAuthEvent("login", session.userId, { ip: session.ipAddress });
        },
      },
      delete: {
        after: async (session) => {
          await recordAuthEvent("logout", session.userId);
        },
      },
    },
  },
});

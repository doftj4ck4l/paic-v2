import nodemailer from "nodemailer";

export type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const DEFAULT_FROM = "Pixelspace AI Classroom <no-reply@pixelspace.my>";

/** Ring buffer of recently "sent" emails for local development (no SMTP configured). */
const devMailbox: Mail[] = [];
const DEV_MAILBOX_LIMIT = 50;

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST);
}

export function isDevMailboxEnabled() {
  return !smtpConfigured();
}

export function getDevMailbox(): Mail[] {
  return devMailbox;
}

export async function sendEmail(mail: Mail) {
  if (smtpConfigured()) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
    await transporter.sendMail({ from: process.env.EMAIL_FROM ?? DEFAULT_FROM, ...mail });
    return;
  }

  devMailbox.push(mail);
  if (devMailbox.length > DEV_MAILBOX_LIMIT) devMailbox.shift();
  console.log(`[email:dev] → ${mail.to} — ${mail.subject}\n${mail.text}\n`);
}

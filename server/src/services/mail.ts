import crypto from "crypto";
import nodemailer from "nodemailer";
import { env } from "../config/env";

export function createVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function verificationExpiry(hours = 24) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export type SendMailResult = {
  verifyUrl: string;
  previewUrl?: string;
};

export async function sendVerificationEmail(params: {
  to: string;
  fullName: string;
  orgId: string;
  userId: string;
  token: string;
}): Promise<SendMailResult> {
  const verifyUrl = `${env.FRONTEND_URL}/verify?token=${params.token}`;
  const subject = "Verify your Fleet Management account";
  const text = [
    `Hi ${params.fullName},`,
    "",
    "Thanks for registering as an admin.",
    `Organization ID: ${params.orgId}`,
    `User ID: ${params.userId}`,
    "",
    "Verify your email to sign in:",
    verifyUrl,
    "",
    "This link expires in 24 hours.",
  ].join("\n");
  const html = `
    <p>Hi ${params.fullName},</p>
    <p>Thanks for registering as an admin.</p>
    <p><strong>Organization ID:</strong> ${params.orgId}<br/>
    <strong>User ID:</strong> ${params.userId}</p>
    <p><a href="${verifyUrl}">Verify your email to sign in</a></p>
    <p>This link expires in 24 hours.</p>
  `;

  if (env.MAIL_MODE === "console") {
    console.log("\n========== VERIFICATION EMAIL ==========");
    console.log(`To: ${params.to}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log("========================================\n");
    return { verifyUrl };
  }

  if (env.MAIL_MODE === "ethereal") {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: env.MAIL_FROM,
      to: params.to,
      subject,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log("\n========== ETHEREAL VERIFICATION EMAIL ==========");
    console.log(`To: ${params.to}`);
    console.log(`Preview: ${previewUrl}`);
    console.log(`Verify URL: ${verifyUrl}`);
    console.log("=================================================\n");
    return { verifyUrl, previewUrl };
  }

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error("SMTP settings are required when MAIL_MODE=smtp");
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: params.to,
    subject,
    text,
    html,
  });

  return { verifyUrl };
}

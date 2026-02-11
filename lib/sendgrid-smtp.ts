/**
 * SMTP email module - delegates to Gmail SMTP (lib/smtp-mail.ts).
 * This file re-exports for backwards compatibility with existing imports.
 */

export {
  sendEmail,
  testSmtpConnection as testSendGridConnection,
  verifySMTPConnection,
  isSmtpConfigured,
  type EmailAttachment,
  type EmailOptions,
} from "@/lib/smtp-mail";

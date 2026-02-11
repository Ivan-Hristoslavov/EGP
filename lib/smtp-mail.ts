import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { createClient } from "@/lib/supabase/server";

let cachedTransporter: Transporter | null = null;

function getSmtpTransporter(): Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const smtpServer = process.env.SMTP_SERVER;
  const smtpPort = process.env.SMTP_PORT;
  const smtpSecurity = process.env.SMTP_SECURITY;
  const smtpUsername = process.env.SMTP_USERNAME;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpServer || !smtpPort || !smtpUsername || !smtpPassword) {
    throw new Error(
      "SMTP configuration is incomplete. Please check SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, and SMTP_PASSWORD environment variables."
    );
  }

  const port = parseInt(smtpPort, 10);
  const isSecure = smtpSecurity === "SSL" || port === 465;

  cachedTransporter = nodemailer.createTransport({
    host: smtpServer,
    port: port,
    secure: isSecure,
    auth: {
      user: smtpUsername,
      pass: smtpPassword,
    },
    ...(smtpSecurity === "TLS" && !isSecure ? { requireTLS: true } : {}),
  });

  return cachedTransporter;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: EmailAttachment[];
}

const adminEmail = process.env.ADMIN_EMAIL;

/**
 * Get the sender email address with conditional logic:
 * - Use SMTP_FROM_ADDRESS from environment as primary
 * - Fall back to business_email from admin_profile table
 * - Fall back to ADMIN_EMAIL from environment if needed
 */
async function getSenderEmail(): Promise<string> {
  const fromAddress =
    process.env.SMTP_FROM_ADDRESS || process.env.EMAIL_FROM_ADDRESS;
  if (fromAddress) {
    return fromAddress;
  }

  try {
    const supabase = createClient();

    const { data: profile, error } = await supabase
      .from("admin_profile")
      .select("business_email, email")
      .single();

    if (error) {
      console.warn("Could not fetch admin profile business_email:", error);
      return adminEmail || "noreply@egpaesthetics.co.uk";
    }

    return (
      profile?.business_email ||
      profile?.email ||
      adminEmail ||
      "noreply@egpaesthetics.co.uk"
    );
  } catch (error) {
    console.warn("Error getting sender email:", error);
    return adminEmail || "noreply@egpaesthetics.co.uk";
  }
}

/**
 * Check if SMTP configuration is complete
 */
export function isSmtpConfigured(): boolean {
  const smtpServer = process.env.SMTP_SERVER;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUsername = process.env.SMTP_USERNAME;
  const smtpPassword = process.env.SMTP_PASSWORD;
  return !!(smtpServer && smtpPort && smtpUsername && smtpPassword);
}

/**
 * Send email using Gmail SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!isSmtpConfigured()) {
    throw new Error(
      "SMTP configuration is incomplete. Please check SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, and SMTP_PASSWORD environment variables."
    );
  }

  const transporter = getSmtpTransporter();
  const fromEmail = await getSenderEmail();

  try {
    const mailOptions: Parameters<Transporter["sendMail"]>[0] = {
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      text: options.text,
    };

    if (options.html) {
      mailOptions.html = options.html;
    }

    if (options.attachments && options.attachments.length > 0) {
      mailOptions.attachments = options.attachments.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      }));
    }

    console.log("Sending email via SMTP:", {
      to: options.to,
      from: fromEmail,
      subject: options.subject,
      attachments: options.attachments?.length || 0,
    });

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully via SMTP:", {
      messageId: info.messageId,
      response: info.response,
    });

    return true;
  } catch (error) {
    console.error("Error sending email via SMTP:", error);
    throw error;
  }
}

/**
 * Test SMTP configuration and connection
 */
export async function testSmtpConnection(): Promise<boolean> {
  if (!isSmtpConfigured()) {
    console.error("SMTP configuration is incomplete");
    return false;
  }

  try {
    const transporter = getSmtpTransporter();
    const fromEmail = await getSenderEmail();

    console.log("SMTP configuration test:", {
      senderEmail: fromEmail,
      host: process.env.SMTP_SERVER,
      port: process.env.SMTP_PORT,
      security: process.env.SMTP_SECURITY,
    });

    await transporter.verify();
    console.log("SMTP connection verified successfully");

    return true;
  } catch (error) {
    console.error("SMTP configuration test failed:", error);
    return false;
  }
}

/**
 * Verify SMTP connection
 */
export async function verifySMTPConnection(): Promise<boolean> {
  if (!isSmtpConfigured()) {
    return false;
  }

  try {
    const transporter = getSmtpTransporter();
    await transporter.verify();
    console.log("SMTP connection is ready");
    return true;
  } catch (error) {
    console.error("SMTP connection failed:", error);
    return false;
  }
}

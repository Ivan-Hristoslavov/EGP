import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";

// SMTP Configuration for SendGrid
const smtpConfig = {
  host: process.env.SENDGRID_SERVER || "smtp.sendgrid.net",
  port: parseInt(process.env.SENDGRID_PORT || "587"), // Use port 587 for TLS
  secure: process.env.SENDGRID_SECURE === "true", // false for port 587, true for 465
  auth: {
    user: process.env.SENDGRID_USER || "apikey",
    pass: process.env.SENDGRID_SMTP_PASSWORD,
  },
};

const adminEmail = process.env.ADMIN_EMAIL;

// Create transporter
const transporter = nodemailer.createTransport(smtpConfig);

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

/**
 * Get the sender email address with conditional logic:
 * - Use business_email from admin_profile table as primary sender
 * - Fall back to ADMIN_EMAIL from environment if needed
 */
async function getSenderEmail(): Promise<string> {
  try {
    const supabase = createClient();

    const { data: profile, error } = await supabase
      .from("admin_profile")
      .select("business_email, email")
      .single();

    if (error) {
      console.warn("Could not fetch admin profile business_email:", error);
      return adminEmail || "noreply@egp.com";
    }

    // Use business_email if available, otherwise fall back to regular email or env
    return profile?.business_email || profile?.email || adminEmail || "noreply@egp.com";
  } catch (error) {
    console.warn("Error getting sender email:", error);
    return adminEmail || "noreply@egp.com";
  }
}

/**
 * Send email using SendGrid SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const smtpPassword = process.env.SENDGRID_SMTP_PASSWORD;

  if (!smtpPassword) {
    console.error("SendGrid SMTP password not configured");
    throw new Error("Email service not configured");
  }

  try {
    const fromEmail = await getSenderEmail();

    const mailOptions: any = {
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      text: options.text,
    };

    // Add HTML content if provided
    if (options.html) {
      mailOptions.html = options.html;
    }

    // Add attachments if provided
    if (options.attachments && options.attachments.length > 0) {
      mailOptions.attachments = options.attachments.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      }));
    }

    console.log("Sending email via SendGrid SMTP:", {
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
    console.error("Error sending email via SendGrid SMTP:", error);
    throw error;
  }
}

/**
 * Test SendGrid SMTP configuration
 */
export async function testSendGridConnection(): Promise<boolean> {
  const smtpPassword = process.env.SENDGRID_SMTP_PASSWORD;

  if (!smtpPassword) {
    console.error("SendGrid SMTP password not configured");
    return false;
  }

  try {
    const fromEmail = await getSenderEmail();
    console.log("SendGrid SMTP configuration test:", {
      smtpPasswordConfigured: !!smtpPassword,
      senderEmail: fromEmail,
      adminEmailFromEnv: adminEmail,
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.auth.user,
    });

    // Test the connection
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    return true;
  } catch (error) {
    console.error("SendGrid SMTP configuration test failed:", error);
    return false;
  }
}

/**
 * Verify SMTP connection
 */
export async function verifySMTPConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("SMTP connection is ready");
    return true;
  } catch (error) {
    console.error("SMTP connection failed:", error);
    return false;
  }
}

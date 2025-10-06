import sgMail from '@sendgrid/mail';
import { createClient } from '@/lib/supabase/server';

// Initialize SendGrid with API key
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const adminEmail = process.env.ADMIN_EMAIL;

if (!sendgridApiKey) {
  console.warn('SENDGRID_API_KEY is not set. Email functionality will be disabled.');
}

if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
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

/**
 * Get the sender email address with conditional logic:
 * - Use business_email from admin_profile table as primary sender
 * - Fall back to ADMIN_EMAIL from environment if needed
 */
async function getSenderEmail(): Promise<string> {
  try {
    const supabase = createClient();
    
    const { data: profile, error } = await supabase
      .from('admin_profile')
      .select('business_email, email')
      .single();

    if (error) {
      console.warn('Could not fetch admin profile business_email:', error);
      return adminEmail || 'noreply@egp.com';
    }

    // Use business_email if available, otherwise fall back to regular email or env
    return profile?.business_email || profile?.email || adminEmail || 'noreply@egp.com';
  } catch (error) {
    console.warn('Error getting sender email:', error);
    return adminEmail || 'noreply@egp.com';
  }
}

/**
 * Send email using SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!sendgridApiKey) {
    console.error('SendGrid API key not configured');
    throw new Error('Email service not configured');
  }

  try {
    const fromEmail = await getSenderEmail();
    
    const msg: any = {
      to: options.to,
      from: fromEmail,
      subject: options.subject,
      text: options.text,
    };

    // Add HTML content if provided
    if (options.html) {
      msg.html = options.html;
    }

    // Add attachments if provided
    if (options.attachments && options.attachments.length > 0) {
      msg.attachments = options.attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content.toString('base64'),
        type: attachment.contentType,
        disposition: 'attachment'
      }));
    }

    console.log('Sending email via SendGrid:', {
      to: options.to,
      from: fromEmail,
      subject: options.subject,
      attachments: options.attachments?.length || 0
    });

    const response = await sgMail.send(msg);
    
    console.log('Email sent successfully:', {
      statusCode: response[0].statusCode,
      headers: response[0].headers
    });

    return true;
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
    
    if (error instanceof Error) {
      // Log specific SendGrid error details
      if ('response' in error && error.response) {
        const response = (error as any).response;
        console.error('SendGrid response error:', {
          statusCode: response.statusCode,
          body: response.body
        });
      }
    }
    
    throw error;
  }
}

/**
 * Test SendGrid configuration
 */
export async function testSendGridConnection(): Promise<boolean> {
  if (!sendgridApiKey) {
    console.error('SendGrid API key not configured');
    return false;
  }

  try {
    const fromEmail = await getSenderEmail();
    console.log('SendGrid configuration test:', {
      apiKeyConfigured: !!sendgridApiKey,
      senderEmail: fromEmail,
      adminEmailFromEnv: adminEmail
    });
    
    return true;
  } catch (error) {
    console.error('SendGrid configuration test failed:', error);
    return false;
  }
} 
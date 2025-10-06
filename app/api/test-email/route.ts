import { NextRequest, NextResponse } from "next/server";
import { testSendGridConnection, sendEmail } from "@/lib/sendgrid-smtp";

// GET - Test SendGrid configuration
export async function GET() {
  try {
    const isConfigured = await testSendGridConnection();
    
    return NextResponse.json({
      success: true,
      configured: isConfigured,
      message: isConfigured 
        ? "SendGrid is properly configured" 
        : "SendGrid is not configured. Please check SENDGRID_API_KEY environment variable."
    });
  } catch (error) {
    console.error("Error testing SendGrid:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to test SendGrid configuration",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// POST - Send test email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject = "Test Email from FixMyLeak", message = "This is a test email to verify SendGrid configuration." } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    // Send test email
    await sendEmail({
      to: to,
      subject: subject,
      text: message,
      html: `
        <html>
          <body>
            <h2>Test Email from FixMyLeak</h2>
            <p>${message}</p>
            <p>This email was sent to verify that SendGrid is working correctly.</p>
            <p>If you received this email, the email configuration is working properly!</p>
            <hr>
            <p><small>Sent at: ${new Date().toLocaleString()}</small></p>
          </body>
        </html>
      `
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      recipient: to
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 
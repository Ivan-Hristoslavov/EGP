import { NextRequest, NextResponse } from "next/server";
import { testSendGridConnection, sendEmail } from "@/lib/sendgrid-smtp";

// GET - Test SMTP configuration
export async function GET() {
  try {
    const isConfigured = await testSendGridConnection();

    return NextResponse.json({
      success: true,
      configured: isConfigured,
      message: isConfigured
        ? "SMTP (Gmail) is properly configured"
        : "SMTP is not configured. Please check SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, and SMTP_PASSWORD environment variables.",
    });
  } catch (error) {
    console.error("Error testing SMTP:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test SMTP configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Send test email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      to,
      subject = "Test Email from EGP Aesthetics",
      message = "This is a test email to verify SMTP configuration.",
    } = body;

    const toAddress =
      to ||
      process.env.SMTP_TO_ADDRESS ||
      "hristoslavov.ivanov@gmail.com";

    // Send test email
    await sendEmail({
      to: toAddress,
      subject: subject,
      text: message,
      html: `
        <html>
          <body>
            <h2>Test Email</h2>
            <p>${message}</p>
            <p>This email was sent to verify that SMTP (Gmail) is working correctly.</p>
            <p>If you received this email, the email configuration is working properly!</p>
            <hr>
            <p><small>Sent at: ${new Date().toLocaleString()}</small></p>
          </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      recipient: toAddress,
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
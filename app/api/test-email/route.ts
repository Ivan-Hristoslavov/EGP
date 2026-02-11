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
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body{margin:0;padding:0;font-family:Georgia,serif;background:#f5f3ef;color:#1c1917}
.wrap{max-width:560px;margin:0 auto;background:#fff}
.head{background:#1c1917;color:#faf8f5;padding:36px 28px;text-align:center}
.head h1{margin:0;font-size:22px;font-weight:400;letter-spacing:.1em}
.line{width:40px;height:2px;background:#b76e79;margin:14px auto 0}
.main{padding:40px 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7}
.ft{padding:24px;text-align:center;font-size:12px;color:#a8a29e;border-top:1px solid #e7e4df}
</style>
</head>
<body>
<div class="wrap">
<div class="head">
<h1>SMTP Test</h1>
<p style="margin:8px 0 0;font-size:14px;opacity:.9">EGP Aesthetics</p>
<div class="line"></div>
</div>
<div class="main">
<p>${message}</p>
<p>This email confirms that SMTP (Gmail) is configured correctly. If you received this, the setup is working.</p>
</div>
<div class="ft">${new Date().toLocaleString()}</div>
</div>
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
require("dotenv").config({ path: ".env" });
const nodemailer = require("nodemailer");

const smtpServer = process.env.SMTP_SERVER;
const smtpPort = process.env.SMTP_PORT;
const smtpSecurity = process.env.SMTP_SECURITY;
const smtpUsername = process.env.SMTP_USERNAME;
const smtpPassword = process.env.SMTP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM_ADDRESS || smtpUsername;
const smtpTo = process.env.SMTP_TO_ADDRESS || "hristoslavov.ivanov@gmail.com";

if (!smtpServer || !smtpPort || !smtpUsername || !smtpPassword) {
  console.error(
    "❌ SMTP configuration incomplete. Set SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD in .env"
  );
  process.exit(1);
}

const port = parseInt(smtpPort, 10);
const isSecure = smtpSecurity === "SSL" || port === 465;

const smtpConfig = {
  host: smtpServer,
  port: port,
  secure: isSecure,
  auth: { user: smtpUsername, pass: smtpPassword },
  ...(smtpSecurity === "TLS" && !isSecure ? { requireTLS: true } : {}),
};

async function testSMTP() {
  console.log("Testing Gmail SMTP connection...");

  try {
    const transporter = nodemailer.createTransport(smtpConfig);

    console.log("Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully!");

    console.log("Testing email sending...");
    const info = await transporter.sendMail({
      from: smtpFrom,
      to: smtpTo,
      subject: "Test Email from EGP SMTP",
      text: "This is a test email sent via Gmail SMTP.",
      html: `
        <html>
          <body>
            <h2>Test Email from EGP</h2>
            <p>This is a test email sent via Gmail SMTP.</p>
            <p>If you received this email, the SMTP configuration is working correctly!</p>
            <hr>
            <p><small>Sent at: ${new Date().toLocaleString()}</small></p>
          </body>
        </html>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
  } catch (error) {
    console.error("❌ SMTP test failed:", error);
    process.exit(1);
  }
}

testSMTP();

const nodemailer = require("nodemailer");
// Optional: Resend transactional email provider
let Resend;
try {
  Resend = require("resend").Resend;
} catch (e) {
  Resend = null;
}

// Create a transporter depending on env configuration. In production, use configured SMTP (Gmail).
// In development, if no SMTP credentials are set, use Ethereal test account so devs can preview messages.
const createTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback to Ethereal test account for development/testing
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const sendPasswordResetEmail = async (to, resetUrl) => {
  // If RESEND_API_KEY is provided and the SDK is installed, use Resend for delivery
  if (process.env.RESEND_API_KEY && Resend) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.RESEND_FROM || (process.env.EMAIL_USER || `Sadi Fragrances <no-reply@${process.env.CLIENT_URL ? new URL(process.env.CLIENT_URL).hostname : 'example.com'}>`);
      const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e8e8e1;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; color: #111;">Sadi Fragrances</h1>
          <p style="color: #888; font-size: 14px;">Admin Password Reset</p>
        </div>
        <p style="font-size: 16px; color: #444; line-height: 1.6;">You requested a password reset for your admin account.</p>
        <p style="font-size: 16px; color: #444; line-height: 1.6;">Click the button below to reset your password. This link expires in 30 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background-color: #111; color: #fff; text-decoration: none; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #888; line-height: 1.6;">If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e8e8e1; margin: 30px 0;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">Sadi Fragrances Pakistan</p>
      </div>
    `;

      const resp = await resend.emails.send({
        from,
        to,
        subject: "Sadi Fragrances - Admin Password Reset",
        html,
      });

      // In dev, also log the URL
      if (process.env.NODE_ENV !== "production") {
        console.log("[emailService] Resend sent. Response:", resp);
        console.log("[emailService] Reset URL:", resetUrl);
      }

      return resp;
    } catch (err) {
      console.error("[emailService] Resend send error:", err);
      // fall through to nodemailer fallback
    }
  }
  const transporter = await createTransporter();

  const fromAddress = process.env.EMAIL_USER || `"Sadi Fragrances" <no-reply@${process.env.CLIENT_URL ? new URL(process.env.CLIENT_URL).hostname : 'localhost'}>`;

  const mailOptions = {
    from: fromAddress,
    to,
    subject: "Sadi Fragrances - Admin Password Reset",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e8e8e1;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; color: #111;">Sadi Fragrances</h1>
          <p style="color: #888; font-size: 14px;">Admin Password Reset</p>
        </div>
        <p style="font-size: 16px; color: #444; line-height: 1.6;">You requested a password reset for your admin account.</p>
        <p style="font-size: 16px; color: #444; line-height: 1.6;">Click the button below to reset your password. This link expires in 30 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background-color: #111; color: #fff; text-decoration: none; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #888; line-height: 1.6;">If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e8e8e1; margin: 30px 0;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">Sadi Fragrances Pakistan</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    // If using Ethereal or missing real SMTP, log a preview URL for dev testing
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("[emailService] Development mode - reset URL:", resetUrl);
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log("[emailService] Preview message URL:", preview);
    }

    return info;
  } catch (err) {
    // In development, fallback to test account and log the reset URL
    if (process.env.NODE_ENV !== "production") {
      try {
        const testAccount = await nodemailer.createTestAccount();
        const fallbackTransport = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        const info = await fallbackTransport.sendMail(mailOptions);
        console.log("[emailService] Fallback sent via Ethereal. Reset URL:", resetUrl);
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) console.log("[emailService] Preview message URL:", preview);
        return info;
      } catch (fallbackErr) {
        console.error("[emailService] Failed to send fallback email:", fallbackErr);
      }
    }

    // Re-throw the original error so callers can handle it (the controller will clear tokens)
    throw err;
  }
};

module.exports = { sendPasswordResetEmail };
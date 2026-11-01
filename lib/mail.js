import nodemailer from 'nodemailer';

// Same pattern as Academy project
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,  // Accept self-signed certs (Gmail STARTTLS)
  },
  connectionTimeout: 10000,  // 10s to connect
  greetingTimeout: 10000,    // 10s for greeting
  socketTimeout: 15000,      // 15s for socket inactivity
});

export async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_CONTACT || 'HCCSNE'}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    });
    console.log("📧 Email envoyé:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Erreur envoi email:", error.message || error);
    return null;
  }
}

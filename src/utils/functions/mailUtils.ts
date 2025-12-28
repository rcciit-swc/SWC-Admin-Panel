import ejs from 'ejs';
import nodemailer from 'nodemailer';
import path from 'path';

interface MailData {
  to: string;
  subject: string;
  fileName: string;
  data: Record<string, any>;
}

interface MailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends an email using nodemailer and EJS templates
 * @param mailData - Email configuration and template data
 * @returns Promise with success status and message ID or error
 */
export async function sendMail(mailData: MailData): Promise<MailResponse> {
  try {
    const { to, subject, fileName, data } = mailData;

    // Validate environment variables
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      throw new Error('Missing required SMTP environment variables');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // Allow self-signed certificates
        rejectUnauthorized: false,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    // Render EJS template
    const templatePath = path.join(process.cwd(), 'public', 'mails', fileName);
    const html = await ejs.renderFile(templatePath, { data });

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Game of Thrones 2026'}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Sends a registration confirmation email
 * @param to - Recipient email address
 * @param data - Registration data including team name, event details, etc.
 */
export async function sendRegistrationEmail(
  to: string,
  data: {
    teamName: string;
    eventName: string;
    leaderName: string;
    leaderPhone: string;
    email: string;
    eventDate?: string;
    whatsappLink?: string;
    teamMembers?: Array<{ name: string; phone: string }>;
    coordinators?: Array<{ name: string; phone: string }>;
    contactEmail?: string;
  }
): Promise<MailResponse> {
  return sendMail({
    to,
    subject: `Registration Confirmed - ${data.eventName} | Game of Thrones 2026`,
    fileName: 'send-email.ejs',
    data,
  });
}

/**
 * Sends an email verification email
 * @param to - Recipient email address
 * @param data - Verification data including name, link, or code
 */
export async function sendVerificationEmail(
  to: string,
  data: {
    name?: string;
    verificationLink?: string;
    verificationCode?: string;
    expiryTime?: string;
    contactEmail?: string;
  }
): Promise<MailResponse> {
  return sendMail({
    to,
    subject: 'Verify Your Email - Game of Thrones 2026',
    fileName: 'verify-email.ejs',
    data,
  });
}

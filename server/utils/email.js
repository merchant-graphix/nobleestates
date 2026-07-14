import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('Email not configured: SMTP_HOST or SMTP_USER missing. Emails will be logged to console.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: parseInt(process.env.SMTP_PORT || '587') === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

export async function sendInquiryEmail({ agentEmail, agentName, buyerName, buyerEmail, buyerPhone, propertyTitle, message }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@nobleestates.mw',
    to: agentEmail,
    subject: `New Inquiry for "${propertyTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">New Property Inquiry</h2>
        <p>Hello ${agentName},</p>
        <p>You have received a new inquiry for your property <strong>"${propertyTitle}"</strong>.</p>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>From:</strong> ${buyerName}</p>
          <p><strong>Email:</strong> ${buyerEmail}</p>
          ${buyerPhone ? `<p><strong>Phone:</strong> ${buyerPhone}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p style="background: white; padding: 12px; border-radius: 4px;">${message}</p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This inquiry was sent via Noble Estates.</p>
      </div>
    `,
  };

  const transport = getTransporter();
  if (!transport) {
    console.log('[EMAIL] Inquiry email (not sent - no SMTP):', { to: agentEmail, subject: mailOptions.subject });
    return true;
  }

  try {
    await transport.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Failed to send inquiry email:', err.message);
    return false;
  }
}

export async function sendPaymentConfirmationEmail({ userEmail, userName, propertyTitle, amount, method, reference }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@nobleestates.mw',
    to: userEmail,
    subject: `Payment Confirmation - ${reference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Payment Confirmed</h2>
        <p>Hello ${userName},</p>
        <p>Your deposit payment has been successfully received.</p>
        <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #bbf7d0;">
          <p><strong>Property:</strong> ${propertyTitle}</p>
          <p><strong>Amount:</strong> MK ${Number(amount).toLocaleString('en-MW')}</p>
          <p><strong>Method:</strong> ${method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
          <p><strong>Reference:</strong> ${reference}</p>
        </div>
        <p>Our agent will contact you within 24 hours to proceed with the next steps.</p>
        <p style="color: #6b7280; font-size: 14px;">Thank you for choosing Noble Estates.</p>
      </div>
    `,
  };

  const transport = getTransporter();
  if (!transport) {
    console.log('[EMAIL] Payment confirmation (not sent - no SMTP):', { to: userEmail, subject: mailOptions.subject });
    return true;
  }

  try {
    await transport.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Failed to send payment email:', err.message);
    return false;
  }
}

export async function sendPasswordResetEmail({ email, name, resetToken }) {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@nobleestates.mw',
    to: email,
    subject: 'Password Reset Request - Noble Estates',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Password Reset</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  const transport = getTransporter();
  if (!transport) {
    console.log('[EMAIL] Password reset (not sent - no SMTP):', { to: email, resetUrl });
    return true;
  }

  try {
    await transport.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Failed to send reset email:', err.message);
    return false;
  }
}

export async function sendVerificationEmail({ email, name, token }) {
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@nobleestates.mw',
    to: email,
    subject: 'Verify Your Email - Noble Estates',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Email Verification</h2>
        <p>Hello ${name},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${verifyUrl}" style="background: #4f46e5; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
      </div>
    `,
  };

  const transport = getTransporter();
  if (!transport) {
    console.log('[EMAIL] Verification email (not sent - no SMTP):', { to: email, verifyUrl });
    return true;
  }

  try {
    await transport.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Failed to send verification email:', err.message);
    return false;
  }
}

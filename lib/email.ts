import "server-only"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

const APP_URL = process.env.APP_URL || "http://localhost:3000"
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@example.com"

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 32px 32px 0; text-align: center;">
                  <div style="display: inline-block; background-color: #171717; color: #fafafa; width: 36px; height: 36px; border-radius: 8px; line-height: 36px; font-size: 18px; margin-bottom: 16px;">💰</div>
                  <h1 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #171717;">Expense Tracker</h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 24px 32px 32px;">
                  <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46;">Hello ${name || "there"},</p>
                  <p style="margin: 0 0 24px; font-size: 15px; color: #3f3f46;">Thanks for creating your Expense Tracker account. Please verify your email address to activate your account.</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 32px; background-color: #171717; color: #fafafa; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Verify Email</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 24px 0 0; font-size: 13px; color: #71717a;">If the button doesn&apos;t work, copy and paste this link into your browser:</p>
                  <p style="margin: 8px 0 0; font-size: 13px; color: #71717a; word-break: break-all;">${verifyUrl}</p>
                  <p style="margin: 24px 0 0; font-size: 13px; color: #a1a1aa;">This verification link expires in 24 hours.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const text = `Hello ${name || "there"},

Thanks for creating your Expense Tracker account. Please verify your email address to activate your account.

Verify your email: ${verifyUrl}

This verification link expires in 24 hours.

— Expense Tracker`

  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject: "Verify your Expense Tracker email",
    html,
    text,
  })
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 32px 32px 0; text-align: center;">
                  <div style="display: inline-block; background-color: #171717; color: #fafafa; width: 36px; height: 36px; border-radius: 8px; line-height: 36px; font-size: 18px; margin-bottom: 16px;">💰</div>
                  <h1 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #171717;">Expense Tracker</h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 24px 32px 32px;">
                  <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46;">Hello ${name || "there"},</p>
                  <p style="margin: 0 0 24px; font-size: 15px; color: #3f3f46;">We received a request to reset your Expense Tracker password.</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background-color: #171717; color: #fafafa; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Reset Password</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 24px 0 0; font-size: 13px; color: #71717a;">If the button doesn&apos;t work, copy and paste this link into your browser:</p>
                  <p style="margin: 8px 0 0; font-size: 13px; color: #71717a; word-break: break-all;">${resetUrl}</p>
                  <p style="margin: 24px 0 0; font-size: 13px; color: #a1a1aa;">This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const text = `Hello ${name || "there"},

We received a request to reset your Expense Tracker password.

Reset your password: ${resetUrl}

This link expires in 1 hour. If you did not request this, you can safely ignore this email.

— Expense Tracker`

  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject: "Reset your Expense Tracker password",
    html,
    text,
  })
}

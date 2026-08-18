import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
})
export const sendVerificationEmail = async (
  email,
  username,
  token
) => {
  const verificationUrl =
    `${process.env.FRONTEND_URL}/verify/${token}`

  const info = await transporter.sendMail({
    from: `"MessBuddy Team" <${process.env.EMAIL}>`,
    to: email,
    subject: "Verify your MessBuddy account 🍽️",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 30px; ">
        <h1>🍽️ Welcome to MessBuddy, ${username}!</h1>
        <p>
          Thanks for creating your MessBuddy account.
        </p>
        <p>
          Please verify your email address by clicking
          the button below:
        </p>
        <a
          href="${verificationUrl}"
          style="
            display: inline-block;
            padding: 12px 24px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold ">
          Verify My Email
        </a>
        <p style="
          margin-top: 25px;
          color: #666;
          font-size: 13px; ">
          If you didn't create a MessBuddy account,
          you can safely ignore this email.
        </p>
      </div>
    `,
  })

  console.log("✅ Verification email sent:", info.messageId)
}

export const sendFeedbackReplyEmail = async (
  email,
  username,
  message
) => {
  const info = await transporter.sendMail({
    from: `"MessBuddy Team" <${process.env.EMAIL}>`,
    to: email,
    subject: "MessBuddy replied to your feedback 🍽️",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px;
        background: #111827;
        color: #ffffff;
        border-radius: 12px;
      ">

        <h1 style="color: #facc15;">
          🍽️ MessBuddy
        </h1>

        <p style="font-size: 16px;">
          Hi ${username},
        </p>

        <p style="font-size: 16px;">
          Thank you for contacting MessBuddy.
          Our team has replied to your feedback:
        </p>

        <div style="
          background: #1f2937;
          padding: 20px;
          margin: 20px 0;
          border-radius: 10px;
          border-left: 4px solid #facc15;
        ">
          <p style="
            margin: 0;
            font-size: 16px;
            line-height: 1.6;
          ">
            ${message}
          </p>
        </div>

        <p style="font-size: 15px; color: #cbd5e1;">
          We appreciate your feedback and your help in making
          MessBuddy better.
        </p>

        <p style="margin-top: 30px;">
          Regards,<br />
          <strong>MessBuddy Team</strong>
        </p>

      </div>
    `,
  })

  console.log("📧 Feedback reply email sent:", info.messageId)
}
export const sendPasswordResetEmail = async (
    email,
    username,
    token
) => {

    const resetUrl =
        `${process.env.FRONTEND_URL}/reset-password/${token}`

    await transporter.sendMail({
        from: `"MessBuddy Team" <${process.env.EMAIL}>`,
        to: email,
        subject: "Reset your MessBuddy password 🔐",

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 30px;
                background: #f8fafc;
                color: #1e293b;
            ">

                <h1 style="color: #2563eb;">
                    🍽️ MessBuddy
                </h1>

                <h2>
                    Password Reset
                </h2>

                <p>
                    Hi ${username},
                </p>

                <p>
                    We received a request to reset your
                    MessBuddy password.
                </p>

                <div style="text-align: center; margin: 30px 0;">

                    <a
                        href="${resetUrl}"
                        style="
                            display: inline-block;
                            padding: 14px 24px;
                            background: #2563eb;
                            color: white;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: bold;
                        "
                    >
                        Reset My Password
                    </a>

                </div>

                <p>
                    This link will expire in
                    <strong>15 minutes</strong>.
                </p>

                <p style="color: #64748b;">
                    If you didn't request a password reset,
                    you can safely ignore this email.
                </p>

                <hr />

                <p>
                    Regards,<br>
                    <strong>MessBuddy Team</strong>
                </p>

            </div>
        `,
    })
}
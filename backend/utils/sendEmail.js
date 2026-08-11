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
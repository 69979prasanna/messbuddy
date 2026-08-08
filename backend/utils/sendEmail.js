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
      <h1>Welcome to MessBuddy, ${username}!</h1>

      <p>Please verify your email:</p>

      <a href="${verificationUrl}">
        Verify My Email
      </a>
    `,
  })
}
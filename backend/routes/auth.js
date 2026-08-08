import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import dotenv from "dotenv"
import validator from "validator"
import crypto from "crypto"
import { sendVerificationEmail } from "../utils/sendEmail.js"
const router = express.Router()
dotenv.config()
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required.",
      })
    }
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        message: "Username must be between 3 and 20 characters.",
      })
    }
    if (/\s/.test(username)) {
      return res.status(400).json({
        message: "Username cannot contain spaces.",
      })
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email.",
      })
    }
    if (
      !validator.isStrongPassword(password, {
        minLength: 5,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
      })
    ) {
      return res.status(400).json({
        message:
          "Password must contain at least 5 characters, one uppercase letter and one number.",
      })
    }
    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered.",
      })
    }
    const existingUsername = await User.findOne({
      username,
    })
    if (existingUsername) {
      return res.status(400).json({
        message: "Username already taken.",
      })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const newUser = await User.create({
  username,
  email,
  password: hashedPassword,
  verificationToken,
})

await sendVerificationEmail(
  newUser.email,
  newUser.username,
  verificationToken
)
    res.status(201).json({
      message:
        "Account created successfully. Please verify your email.",
    })
  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: "Server error.",
    })
  }
})
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: "Invalid Credential" })
    }
    const ismatch = await bcrypt.compare(password, user.password)
    if (!ismatch) {
      return res.status(400).json({ message: "Invalid Credential" })
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." })
    }
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    )
    res.json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Server error"
    })
  }
})

export default router
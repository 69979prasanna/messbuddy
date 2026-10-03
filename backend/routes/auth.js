import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import dotenv from "dotenv"
import validator from "validator"
import crypto from "crypto"
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendVerificationOTPEmail,
} from "../utils/sendEmail.js"
const router = express.Router()
dotenv.config()

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString()
}

const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp.trim()).digest("hex")
}

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

    const cleanEmail = email.toLowerCase().trim()
    const existingEmail = await User.findOne({ email: cleanEmail })

    if (existingEmail) {
      if (existingEmail.isVerified) {
        return res.status(400).json({
          message: "Email already registered.",
        })
      }

      // Check resend cooldown if previously requested
      if (
        existingEmail.otpLastSentAt &&
        Date.now() - existingEmail.otpLastSentAt.getTime() < 30 * 1000
      ) {
        return res.status(429).json({
          message: "Please wait before requesting another OTP.",
        })
      }

      const existingUsername = await User.findOne({
        username,
        _id: { $ne: existingEmail._id },
      })
      if (existingUsername) {
        return res.status(400).json({
          message: "Username already taken.",
        })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const otp = generateOTP()

      existingEmail.username = username
      existingEmail.password = hashedPassword
      existingEmail.verificationOTP = hashOTP(otp)
      existingEmail.verificationOTPExpires = new Date(Date.now() + 5 * 60 * 1000)
      existingEmail.otpLastSentAt = new Date()
      await existingEmail.save()

      await sendVerificationOTPEmail(
        existingEmail.email,
        existingEmail.username,
        otp
      )

      return res.status(200).json({
        requiresVerification: true,
        email: existingEmail.email,
        message: "Verification code sent to your email. Please verify to continue.",
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
    const otp = generateOTP()

    const newUser = await User.create({
      username,
      email: cleanEmail,
      password: hashedPassword,
      isVerified: false,
      verificationOTP: hashOTP(otp),
      verificationOTPExpires: new Date(Date.now() + 5 * 60 * 1000),
      otpLastSentAt: new Date(),
    })

    await sendVerificationOTPEmail(
      newUser.email,
      newUser.username,
      otp
    )

    res.status(200).json({
      requiresVerification: true,
      email: newUser.email,
      message: "Verification code sent to your email. Please verify to continue.",
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
    if (!email || !password) {
      return res.status(400).json({ message: "Invalid email or password." })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." })
    }
    const ismatch = await bcrypt.compare(password, user.password)
    if (!ismatch) {
      return res.status(400).json({ message: "Invalid email or password." })
    }
    if (!user.isVerified) {
      const otp = generateOTP()
      user.verificationOTP = hashOTP(otp)
      user.verificationOTPExpires = new Date(Date.now() + 5 * 60 * 1000)
      user.otpLastSentAt = new Date()
      await user.save()

      await sendVerificationOTPEmail(user.email, user.username, otp)

      return res.status(200).json({
        requiresVerification: true,
        email: user.email,
        message: "Please verify your email to continue. We've sent a 6-digit code to your email.",
      })
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
        email: user.email,
        role: user.role,
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Server error"
    })
  }
})

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and verification code are required.",
      })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })

    if (!user) {
      return res.status(400).json({
        message: "Account not found.",
      })
    }

    if (!user.verificationOTP || !user.verificationOTPExpires) {
      return res.status(400).json({
        message: "No pending verification found. Please request a new OTP.",
      })
    }

    if (user.verificationOTPExpires.getTime() < Date.now()) {
      return res.status(400).json({
        message: "This OTP has expired. Please request a new one.",
      })
    }

    const hashedInput = hashOTP(otp)
    if (user.verificationOTP !== hashedInput) {
      return res.status(400).json({
        message: "Invalid verification code.",
      })
    }

    user.isVerified = true
    user.verificationOTP = null
    user.verificationOTPExpires = null
    user.verificationToken = null
    await user.save()

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
      message: "Email verified successfully!",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error("❌ Verify OTP error:", err)
    res.status(500).json({
      message: "Server error.",
    })
  }
})

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })

    if (!user) {
      return res.status(400).json({
        message: "Account not found.",
      })
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Account is already verified. Please log in.",
      })
    }

    if (
      user.otpLastSentAt &&
      Date.now() - user.otpLastSentAt.getTime() < 30 * 1000
    ) {
      const remainingSeconds = Math.ceil(
        (30 * 1000 - (Date.now() - user.otpLastSentAt.getTime())) / 1000
      )
      return res.status(429).json({
        message: "Please wait before requesting another OTP.",
        retryAfter: remainingSeconds,
      })
    }

    const otp = generateOTP()
    user.verificationOTP = hashOTP(otp)
    user.verificationOTPExpires = new Date(Date.now() + 5 * 60 * 1000)
    user.otpLastSentAt = new Date()
    await user.save()

    await sendVerificationOTPEmail(user.email, user.username, otp)

    res.json({
      message: "A new verification code has been sent to your email.",
    })
  } catch (err) {
    console.error("❌ Resend OTP error:", err)
    res.status(500).json({
      message: "Server error.",
    })
  }
})
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params

    console.log("🔎 Token received:", token)

    const user = await User.findOne({
      verificationToken: token,
    })

    console.log(
      "👤 User found:",
      user ? user.email : "NO USER"
    )

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification link.",
      })
    }
    user.isVerified = true
    user.verificationToken = null
    await user.save()
    console.log("✅ Email verified:", user.email)
    res.json({
      message:
        "Your email has been verified successfully!",
    })
  } catch (err) {
    console.error("❌ Verification error:", err)
    res.status(500).json({
      message: "Server error.",
    })
  }
})
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email.",
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      })
    }
    const resetToken = crypto.randomBytes(32).toString("hex")
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000
    await user.save()

    await sendPasswordResetEmail(
      user.email,
      user.username,
      resetToken
    )

    res.json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
    })

  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: "Server error.",
    })
  }
})
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    if (!password) {
      return res.status(400).json({
        message: "Password is required.",
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

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    })

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired password reset link.",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    user.password = hashedPassword
    user.resetPasswordToken = null
    user.resetPasswordExpires = null

    await user.save()

    res.json({
      message:
        "Password reset successfully. You can now login.",
    })

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err)

    res.status(500).json({
      message: "Server error.",
    })
  }
})
export default router
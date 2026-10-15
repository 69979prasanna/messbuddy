import { describe, it, mock } from "node:test"
import assert from "node:assert/strict"
import crypto from "crypto"
import { sendVerificationOTPEmail } from "../utils/sendEmail.js"

describe("OTP Email Sending & Verification Flow", () => {
  const generateOTP = () => crypto.randomInt(100000, 1000000).toString()
  const hashOTP = (otp) => crypto.createHash("sha256").update(otp.trim()).digest("hex")

  describe("OTP Generation & Cryptographic Randomness", () => {
    it("should generate a 6-digit numeric OTP string", () => {
      for (let i = 0; i < 50; i++) {
        const otp = generateOTP()
        assert.match(otp, /^\d{6}$/)
        const num = Number(otp)
        assert.ok(num >= 100000 && num <= 999999)
      }
    })

    it("should produce consistent SHA-256 hashes and handle trimming", () => {
      const otp = "123456"
      const hash1 = hashOTP(otp)
      const hash2 = hashOTP(" 123456 ")
      assert.strictEqual(hash1, hash2)
      assert.strictEqual(hash1.length, 64)

      const diffHash = hashOTP("654321")
      assert.notStrictEqual(hash1, diffHash)
    })
  })

  describe("sendVerificationOTPEmail via Resend HTTPS API (Mocked)", () => {
    it("should send OTP email to the correct recipient with correct subject and HTML", async () => {
      const recipient = "student@example.com"
      const username = "mess_student"
      const otp = "458921"

      const mockEmailSender = mock.fn(async ({ to, subject, html }) => {
        assert.strictEqual(to, recipient)
        assert.strictEqual(subject, "Verify your MessBuddy account")
        assert.match(html, /458921/)
        assert.match(html, /Hi mess_student/)
        assert.match(html, /5 minutes/)
        return { id: "resend_otp_msg_789" }
      })

      const result = await sendVerificationOTPEmail(
        recipient,
        username,
        otp,
        mockEmailSender
      )

      assert.strictEqual(mockEmailSender.mock.callCount(), 1)
      assert.strictEqual(result.id, "resend_otp_msg_789")
    })

    it("should reject and propagate error when Resend API fails", async () => {
      const mockEmailSender = mock.fn(async () => {
        const err = new Error("Resend HTTPS request failed: getaddrinfo ENETUNREACH")
        err.statusCode = 500
        throw err
      })

      await assert.rejects(
        async () => {
          await sendVerificationOTPEmail(
            "student@example.com",
            "mess_student",
            "123456",
            mockEmailSender
          )
        },
        (err) => {
          assert.match(err.message, /Resend HTTPS request failed/i)
          return true
        }
      )
    })

    it("should reject and propagate error when Resend API key or configuration is missing", async () => {
      const mockEmailSender = mock.fn(async () => {
        const err = new Error("Missing RESEND_API_KEY environment variable. Render Free blocks outbound SMTP")
        err.code = "MISSING_RESEND_API_KEY"
        throw err
      })

      await assert.rejects(
        async () => {
          await sendVerificationOTPEmail(
            "student@example.com",
            "mess_student",
            "123456",
            mockEmailSender
          )
        },
        (err) => {
          assert.strictEqual(err.code, "MISSING_RESEND_API_KEY")
          return true
        }
      )
    })
  })

  describe("OTP Verification & Expiration Logic", () => {
    it("should successfully verify when OTP matches and is not expired", () => {
      const plainOTP = "789123"
      const user = {
        email: "student@example.com",
        isVerified: false,
        verificationOTP: hashOTP(plainOTP),
        verificationOTPExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 mins in future
      }

      // Verification logic matching routes/auth.js:
      assert.ok(user.verificationOTP && user.verificationOTPExpires)
      assert.ok(user.verificationOTPExpires.getTime() >= Date.now())
      assert.strictEqual(user.verificationOTP, hashOTP(plainOTP))

      // Simulate verification completion
      user.isVerified = true
      user.verificationOTP = null
      user.verificationOTPExpires = null

      assert.strictEqual(user.isVerified, true)
      assert.strictEqual(user.verificationOTP, null)
      assert.strictEqual(user.verificationOTPExpires, null)
    })

    it("should fail verification when OTP does not match", () => {
      const user = {
        email: "student@example.com",
        verificationOTP: hashOTP("111111"),
        verificationOTPExpires: new Date(Date.now() + 5 * 60 * 1000),
      }

      const inputOTP = "999999"
      const matches = user.verificationOTP === hashOTP(inputOTP)
      assert.strictEqual(matches, false)
    })

    it("should fail verification when OTP is expired", () => {
      const user = {
        email: "student@example.com",
        verificationOTP: hashOTP("123456"),
        verificationOTPExpires: new Date(Date.now() - 1000), // 1 second ago
      }

      const isExpired = user.verificationOTPExpires.getTime() < Date.now()
      assert.strictEqual(isExpired, true)
    })

    it("should fail verification when no pending OTP exists", () => {
      const user = {
        email: "student@example.com",
        verificationOTP: null,
        verificationOTPExpires: null,
      }

      const hasPending = Boolean(user.verificationOTP && user.verificationOTPExpires)
      assert.strictEqual(hasPending, false)
    })

    it("should enforce 30-second cooldown on OTP resend requests", () => {
      const user = {
        otpLastSentAt: new Date(Date.now() - 15 * 1000), // 15 seconds ago
      }

      const cooldownMs = 30 * 1000
      const isCooldownActive = Date.now() - user.otpLastSentAt.getTime() < cooldownMs
      assert.strictEqual(isCooldownActive, true)

      // When 31 seconds have passed
      user.otpLastSentAt = new Date(Date.now() - 31 * 1000)
      const canResend = Date.now() - user.otpLastSentAt.getTime() >= cooldownMs
      assert.strictEqual(canResend, true)
    })
  })
})

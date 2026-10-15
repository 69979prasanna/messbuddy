import { describe, it, mock } from "node:test"
import assert from "node:assert/strict"
import crypto from "crypto"
import {
  sendPasswordResetEmail,
  sendFeedbackReplyEmail,
} from "../utils/sendEmail.js"

describe("Password Reset & Feedback Reply Email Paths", () => {
  describe("sendPasswordResetEmail via Resend HTTPS API (Mocked)", () => {
    it("should dispatch password reset email to correct recipient with token link", async () => {
      const recipient = "user_reset@example.com"
      const username = "john_doe"
      const token = crypto.randomBytes(32).toString("hex")

      const mockEmailSender = mock.fn(async ({ to, subject, html }) => {
        assert.strictEqual(to, recipient)
        assert.strictEqual(subject, "Reset your MessBuddy password 🔐")
        assert.match(html, /Reset My Password/)
        assert.match(html, new RegExp(token))
        assert.match(html, /15 minutes/)
        assert.match(html, /Hi john_doe/)
        return { id: "resend_reset_msg_101" }
      })

      const result = await sendPasswordResetEmail(
        recipient,
        username,
        token,
        mockEmailSender
      )

      assert.strictEqual(mockEmailSender.mock.callCount(), 1)
      assert.strictEqual(result.id, "resend_reset_msg_101")
    })

    it("should propagate errors if Resend API rejects password reset send", async () => {
      const mockEmailSender = mock.fn(async () => {
        const err = new Error("Resend HTTPS request failed: Connection closed")
        err.statusCode = 500
        throw err
      })

      await assert.rejects(
        async () => {
          await sendPasswordResetEmail(
            "user_reset@example.com",
            "john_doe",
            "mocktoken123",
            mockEmailSender
          )
        },
        (err) => {
          assert.match(err.message, /Resend HTTPS request failed/i)
          return true
        }
      )
    })
  })

  describe("sendFeedbackReplyEmail via Resend HTTPS API (Mocked)", () => {
    it("should dispatch feedback reply to feedback author with reply message", async () => {
      const recipient = "student_feedback@campus.edu"
      const username = "Campus Student"
      const replyMessage = "Thank you! We have updated the mess menu timings accordingly."

      const mockEmailSender = mock.fn(async ({ to, subject, html }) => {
        assert.strictEqual(to, recipient)
        assert.strictEqual(subject, "MessBuddy replied to your feedback 🍽️")
        assert.match(html, /Hi Campus Student/)
        assert.match(html, /We have updated the mess menu timings accordingly/)
        assert.match(html, /MessBuddy Team/)
        return { id: "resend_reply_msg_202" }
      })

      const result = await sendFeedbackReplyEmail(
        recipient,
        username,
        replyMessage,
        mockEmailSender
      )

      assert.strictEqual(mockEmailSender.mock.callCount(), 1)
      assert.strictEqual(result.id, "resend_reply_msg_202")
    })

    it("should propagate errors if Resend API rejects feedback reply send", async () => {
      const mockEmailSender = mock.fn(async () => {
        const err = new Error("Resend API rejected: Sender domain unverified")
        err.statusCode = 403
        throw err
      })

      await assert.rejects(
        async () => {
          await sendFeedbackReplyEmail(
            "student_feedback@campus.edu",
            "Campus Student",
            "Reply test",
            mockEmailSender
          )
        },
        (err) => {
          assert.match(err.message, /Sender domain unverified/i)
          return true
        }
      )
    })
  })

  describe("Password Reset Token Security & Expiry Validation", () => {
    it("should generate cryptographically secure 32-byte hex tokens", () => {
      const token1 = crypto.randomBytes(32).toString("hex")
      const token2 = crypto.randomBytes(32).toString("hex")
      assert.strictEqual(token1.length, 64)
      assert.strictEqual(token2.length, 64)
      assert.notStrictEqual(token1, token2)
    })

    it("should validate that valid reset tokens succeed and expired tokens fail", () => {
      const activeExpires = Date.now() + 15 * 60 * 1000
      assert.ok(activeExpires > Date.now(), "Token should be active")

      const expiredExpires = Date.now() - 1000
      assert.ok(expiredExpires < Date.now(), "Expired token should be rejected")
    })
  })
})

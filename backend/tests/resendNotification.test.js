import { describe, it, beforeEach, afterEach, mock } from "node:test"
import assert from "node:assert/strict"
import {
  formatFromEmail,
  isResendConfigured,
  validateResendConfig,
  sendResendEmail,
} from "../services/resendEmailService.js"
import { sendNotificationEmail } from "../services/notificationService.js"
import NotificationLog from "../models/NotificationLog.js"
import {
  startNotificationScheduler,
  stopNotificationScheduler,
} from "../services/notificationScheduler.js"

describe("Resend Notification Transport & Configuration", () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  describe("Configuration & Environment Variables", () => {
    it("should report isResendConfigured as false when env vars are missing", () => {
      delete process.env.RESEND_API_KEY
      delete process.env.FROM_EMAIL
      assert.strictEqual(isResendConfigured(), false)

      process.env.RESEND_API_KEY = "re_test_key"
      delete process.env.FROM_EMAIL
      assert.strictEqual(isResendConfigured(), false)

      delete process.env.RESEND_API_KEY
      process.env.FROM_EMAIL = "onboarding@resend.dev"
      assert.strictEqual(isResendConfigured(), false)
    })

    it("should report isResendConfigured as true when both vars are set", () => {
      process.env.RESEND_API_KEY = "re_12345678"
      process.env.FROM_EMAIL = "onboarding@resend.dev"
      assert.strictEqual(isResendConfigured(), true)
    })

    it("should throw actionable error if RESEND_API_KEY is missing", () => {
      delete process.env.RESEND_API_KEY
      process.env.FROM_EMAIL = "onboarding@resend.dev"

      assert.throws(
        () => validateResendConfig(),
        (err) => {
          assert.strictEqual(err.code, "MISSING_RESEND_API_KEY")
          assert.match(err.message, /Missing RESEND_API_KEY environment variable/i)
          assert.match(err.message, /Render Free blocks outbound SMTP/i)
          return true
        }
      )
    })

    it("should throw actionable error if FROM_EMAIL is missing", () => {
      process.env.RESEND_API_KEY = "re_12345678"
      delete process.env.FROM_EMAIL

      assert.throws(
        () => validateResendConfig(),
        (err) => {
          assert.strictEqual(err.code, "MISSING_FROM_EMAIL")
          assert.match(err.message, /Missing FROM_EMAIL environment variable/i)
          return true
        }
      )
    })

    it("should format sender addresses with MessBuddy display name", () => {
      assert.strictEqual(
        formatFromEmail("onboarding@resend.dev"),
        "MessBuddy <onboarding@resend.dev>"
      )
      assert.strictEqual(
        formatFromEmail("MessBuddy Alerts <alerts@messbuddy.app>"),
        "MessBuddy Alerts <alerts@messbuddy.app>"
      )
      assert.strictEqual(
        formatFromEmail('"MessBuddy" <team@messbuddy.app>'),
        '"MessBuddy" <team@messbuddy.app>'
      )
    })
  })

  describe("sendResendEmail Unit Tests (Mocked - No real emails sent)", () => {
    it("should send an email via Resend and return message ID", async () => {
      process.env.RESEND_API_KEY = "re_mock_key_123"
      process.env.FROM_EMAIL = "onboarding@resend.dev"

      const mockSend = mock.fn(async ({ from, to, subject, html }) => {
        assert.strictEqual(from, "MessBuddy <onboarding@resend.dev>")
        assert.deepStrictEqual(to, ["student@example.com"])
        assert.strictEqual(subject, "Lunch is ready!")
        assert.match(html, /Delicious lunch/)
        return {
          data: { id: "resend_msg_abc123" },
          error: null,
        }
      })

      const mockClient = {
        emails: { send: mockSend },
      }

      const result = await sendResendEmail({
        to: "student@example.com",
        subject: "Lunch is ready!",
        html: "<p>Delicious lunch</p>",
        client: mockClient,
      })

      assert.strictEqual(result.id, "resend_msg_abc123")
      assert.strictEqual(mockSend.mock.callCount(), 1)
    })

    it("should handle Resend API error responses gracefully without false success", async () => {
      process.env.RESEND_API_KEY = "re_invalid_key"
      process.env.FROM_EMAIL = "onboarding@resend.dev"

      const mockSend = mock.fn(async () => {
        return {
          data: null,
          error: {
            statusCode: 401,
            name: "validation_error",
            message: "API key is invalid",
          },
        }
      })

      const mockClient = {
        emails: { send: mockSend },
      }

      await assert.rejects(
        async () => {
          await sendResendEmail({
            to: "student@example.com",
            subject: "Notification",
            html: "<p>Test</p>",
            client: mockClient,
          })
        },
        (err) => {
          assert.match(err.message, /API key is invalid/i)
          return true
        }
      )
    })

    it("should provide actionable message on Resend domain / test recipient restrictions", async () => {
      process.env.RESEND_API_KEY = "re_mock_key"
      process.env.FROM_EMAIL = "onboarding@resend.dev"

      const mockSend = mock.fn(async () => {
        return {
          data: null,
          error: {
            statusCode: 403,
            name: "forbidden",
            message: "You can only send testing emails to your own email address (owner@gmail.com). To send to other addresses, add and verify a domain.",
          },
        }
      })

      const mockClient = {
        emails: { send: mockSend },
      }

      await assert.rejects(
        async () => {
          await sendResendEmail({
            to: "unverified_user@campus.edu",
            subject: "Reminder",
            html: "<p>Reminder</p>",
            client: mockClient,
          })
        },
        (err) => {
          assert.match(err.message, /Resend Restriction/i)
          assert.match(err.message, /Verify a custom domain/i)
          return true
        }
      )
    })

    it("should handle network / SDK connection exceptions", async () => {
      process.env.RESEND_API_KEY = "re_mock_key"
      process.env.FROM_EMAIL = "onboarding@resend.dev"

      const mockSend = mock.fn(async () => {
        throw new Error("getaddrinfo ENOTFOUND api.resend.com")
      })

      const mockClient = {
        emails: { send: mockSend },
      }

      await assert.rejects(
        async () => {
          await sendResendEmail({
            to: "student@example.com",
            subject: "Network test",
            html: "<p>Network test</p>",
            client: mockClient,
          })
        },
        (err) => {
          assert.match(err.message, /Resend HTTPS request failed/i)
          return true
        }
      )
    })
  })

  describe("sendNotificationEmail Integration & Deduplication", () => {
    it("should return false if user or email is missing", async () => {
      const res1 = await sendNotificationEmail({ user: null })
      assert.strictEqual(res1, false)

      const res2 = await sendNotificationEmail({ user: { email: "" } })
      assert.strictEqual(res2, false)
    })

    it("should skip sending and return false if notification was already sent (deduplication)", async () => {
      const user = { _id: "user123", email: "student@example.com" }
      const referenceKey = "meal_user123_rest1_lunch_2026-10-15"

      const mockFindOne = mock.method(NotificationLog, "findOne", async () => {
        return { _id: "log_existing_123" }
      })

      const mockEmailSender = mock.fn()

      const sent = await sendNotificationEmail({
        user,
        type: "meal_reminder",
        referenceKey,
        subject: "Lunch reminder",
        html: "<p>Lunch</p>",
        emailSender: mockEmailSender,
      })

      assert.strictEqual(sent, false)
      assert.strictEqual(mockEmailSender.mock.callCount(), 0)

      mockFindOne.mock.restore()
    })

    it("should call emailSender, create NotificationLog, and return true on successful send", async () => {
      const user = { _id: "user123", email: "student@example.com" }
      const referenceKey = "meal_user123_rest1_lunch_2026-10-15"

      const mockFindOne = mock.method(NotificationLog, "findOne", async () => null)
      let createdLog = null
      const mockCreate = mock.method(NotificationLog, "create", async (data) => {
        createdLog = data
        return data
      })

      const mockEmailSender = mock.fn(async () => ({ id: "msg_resend_999" }))

      const sent = await sendNotificationEmail({
        user,
        type: "meal_reminder",
        referenceKey,
        subject: "Lunch is served",
        html: "<p>Lunch menu...</p>",
        metadata: { restaurantName: "South Mess" },
        emailSender: mockEmailSender,
      })

      assert.strictEqual(sent, true)
      assert.strictEqual(mockEmailSender.mock.callCount(), 1)
      assert.strictEqual(createdLog.user, "user123")
      assert.strictEqual(createdLog.type, "meal_reminder")
      assert.strictEqual(createdLog.referenceKey, referenceKey)
      assert.strictEqual(createdLog.metadata.messageId, "msg_resend_999")

      mockFindOne.mock.restore()
      mockCreate.mock.restore()
    })

    it("should catch email sender errors, not create NotificationLog, and return false without crashing", async () => {
      const user = { _id: "user123", email: "student@example.com" }
      const referenceKey = "food_avail_user123_menu1_2026-10-15"

      const mockFindOne = mock.method(NotificationLog, "findOne", async () => null)
      const mockCreate = mock.method(NotificationLog, "create", async () => {
        throw new Error("Should not be called")
      })

      const mockEmailSender = mock.fn(async () => {
        throw new Error("Missing RESEND_API_KEY environment variable.")
      })

      const sent = await sendNotificationEmail({
        user,
        type: "favorite_food_available",
        referenceKey,
        subject: "Paneer Butter Masala is back!",
        html: "<p>Paneer...</p>",
        emailSender: mockEmailSender,
      })

      assert.strictEqual(sent, false)
      assert.strictEqual(mockEmailSender.mock.callCount(), 1)
      assert.strictEqual(mockCreate.mock.callCount(), 0)

      mockFindOne.mock.restore()
      mockCreate.mock.restore()
    })
  })

  describe("Notification Scheduler Lifecycle", () => {
    it("should start and stop scheduler cleanly without crashing", () => {
      stopNotificationScheduler()
      startNotificationScheduler(60000)
      // Call start again to verify idempotent check
      startNotificationScheduler(60000)
      stopNotificationScheduler()
    })
  })
})

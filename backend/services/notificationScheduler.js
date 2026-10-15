import { runNotificationCheckCycle } from "./notificationService.js"
import { isResendConfigured } from "./resendEmailService.js"

let schedulerInterval = null
let initialTimeout = null
let isRunning = false

export const startNotificationScheduler = (intervalMs = 60 * 1000) => {
  if (schedulerInterval) {
    console.log("ℹ️ Notification scheduler is already active.")
    return
  }

  console.log(`⏰ Starting MessBuddy Notification Scheduler (Interval: ${intervalMs / 1000}s)`)
  if (!isResendConfigured()) {
    console.warn("⚠️ [Notification Config] RESEND_API_KEY or FROM_EMAIL is not configured. Render Free blocks outbound SMTP; notification emails require RESEND_API_KEY and FROM_EMAIL to send via Resend HTTPS API.")
  }

  initialTimeout = setTimeout(async () => {
    try {
      await runScheduledTask()
    } catch (err) {
      console.error("❌ Notification scheduler initial run error:", err.message)
    }
  }, 5000)

  schedulerInterval = setInterval(async () => {
    await runScheduledTask()
  }, intervalMs)
}

const runScheduledTask = async () => {
  if (isRunning) {
    return
  }

  isRunning = true
  try {
    const summary = await runNotificationCheckCycle()
    if (
      summary.mealRemindersSent > 0 ||
      summary.restaurantUpdatesSent > 0 ||
      summary.aiSuggestionsSent > 0
    ) {
      console.log("🔔 [Scheduler Run Summary]:", summary)
    }
  } catch (err) {
    console.error("❌ Notification scheduler execution error:", err)
  } finally {
    isRunning = false
  }
}

export const stopNotificationScheduler = () => {
  if (initialTimeout) {
    clearTimeout(initialTimeout)
    initialTimeout = null
  }
  if (schedulerInterval) {
    clearInterval(schedulerInterval)
    schedulerInterval = null
    console.log("🛑 Notification scheduler stopped.")
  }
}

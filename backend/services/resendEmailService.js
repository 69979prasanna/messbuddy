import { Resend } from "resend"

/**
 * Format the sender address cleanly.
 * If user passes "onboarding@resend.dev", it formats as "MessBuddy <onboarding@resend.dev>".
 * If user passes "MessBuddy <notifications@domain.com>", it preserves the display name.
 */
export const formatFromEmail = (from = process.env.FROM_EMAIL) => {
  if (!from) return ""
  const trimmed = from.trim()
  if (trimmed.includes("<") && trimmed.includes(">")) {
    return trimmed
  }
  const clean = trimmed.replace(/^["']|["']$/g, "")
  return `MessBuddy <${clean}>`
}

/**
 * Check if both required Resend environment variables are set.
 */
export const isResendConfigured = () => {
  return Boolean(
    process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY.trim() &&
    process.env.FROM_EMAIL &&
    process.env.FROM_EMAIL.trim()
  )
}

/**
 * Validate Resend environment variables.
 * Produces clear, actionable server-side errors when missing.
 */
export const validateResendConfig = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const fromEmail = process.env.FROM_EMAIL?.trim()

  if (!apiKey) {
    const error = new Error(
      "Missing RESEND_API_KEY environment variable. Render Free blocks outbound SMTP (port 465/587); notification emails require RESEND_API_KEY to send via Resend HTTPS API."
    )
    error.code = "MISSING_RESEND_API_KEY"
    throw error
  }

  if (!fromEmail) {
    const error = new Error(
      "Missing FROM_EMAIL environment variable. Please configure FROM_EMAIL (e.g., 'MessBuddy <onboarding@resend.dev>' for test mode or a verified domain address) in backend environment variables."
    )
    error.code = "MISSING_FROM_EMAIL"
    throw error
  }

  return {
    apiKey,
    fromEmail: formatFromEmail(fromEmail),
  }
}

/**
 * Send an email via Resend's HTTPS API.
 * 
 * @param {Object} params
 * @param {string|string[]} params.to - Recipient email(s)
 * @param {string} params.subject - Email subject
 * @param {string} params.html - Rendered HTML email body
 * @param {Object} [params.client] - Optional Resend client override (useful for testing)
 * @returns {Promise<{ id: string }>} - Object with Resend message ID
 */
export const sendResendEmail = async ({ to, subject, html, client = null }) => {
  const { apiKey, fromEmail } = validateResendConfig()

  const resend = client || new Resend(apiKey)
  const recipients = Array.isArray(to) ? to : [to]

  let response
  try {
    response = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject,
      html,
    })
  } catch (networkOrSdkErr) {
    throw new Error(`Resend HTTPS request failed: ${networkOrSdkErr.message}`)
  }

  const { data, error } = response || {}

  if (error) {
    let message = error.message || "Resend API rejected the email request"
    if (
      error.statusCode === 403 ||
      /only send testing emails/i.test(message) ||
      /verify a domain/i.test(message)
    ) {
      message = `${message} [Resend Restriction: Test accounts using onboarding@resend.dev can only send to the account owner's email. Verify a custom domain in the Resend dashboard to send to all users.]`
    }
    const apiError = new Error(message)
    apiError.statusCode = error.statusCode
    apiError.name = error.name || "ResendApiError"
    throw apiError
  }

  if (!data || !data.id) {
    throw new Error("Resend API response did not contain a valid email ID")
  }

  return { id: data.id }
}

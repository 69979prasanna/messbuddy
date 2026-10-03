import { useState, useEffect } from "react"
import "../../App.css"
import ForgotPassword from "./ForgotPassword"
import { FaShieldAlt } from "react-icons/fa"

export default function AuthModal({ onClose }) {
  const API = process.env.REACT_APP_AUTH
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // OTP Verification state
  const [isOtp, setIsOtp] = useState(false)
  const [otpEmail, setOtpEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [otpSuccess, setOtpSuccess] = useState("")
  const [otpTimer, setOtpTimer] = useState(300)
  const [resendCooldown, setResendCooldown] = useState(30)

  useEffect(() => {
    if (!isOtp) return

    const timer = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0))
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [isOtp])

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const maskEmail = (email) => {
    if (!email || !email.includes("@")) return email
    const [local, domain] = email.split("@")
    if (local.length <= 2) return `${local[0]}*@${domain}`
    const visible = local.slice(0, 2)
    const masked = "*".repeat(Math.min(Math.max(local.length - 2, 4), 8))
    return `${visible}${masked}@${domain}`
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const clearForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
    })
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError("")
    setSuccess("")
    clearForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const endpoint = isLogin
        ? `${API}/login`
        : `${API}/signup`

      const body = isLogin
        ? {
          email: formData.email,
          password: formData.password,
        }
        : formData

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message)
        return
      }

      if (data.requiresVerification) {
        setOtpEmail(data.email || formData.email)
        setIsOtp(true)
        setOtp("")
        setOtpError("")
        setOtpSuccess(data.message || "We sent a 6-digit verification code to your email.")
        setOtpTimer(300)
        setResendCooldown(30)
        return
      }

      if (isLogin) {
        localStorage.setItem("token", data.token)
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        )

        onClose()
        window.location.reload()
      } else {
        setSuccess(
          data.message ||
          "Account created successfully! Please verify your email before logging in."
        )

        clearForm()
        setTimeout(() => {
          onClose()
        }, 2500)
      }
    } catch (err) {
      console.error(err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp.trim() || otp.trim().length !== 6) {
      setOtpError("Please enter a valid 6-digit verification code.")
      return
    }

    setOtpLoading(true)
    setOtpError("")
    setOtpSuccess("")

    try {
      const response = await fetch(`${API}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: otpEmail,
          otp: otp.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setOtpError(data.message || "Invalid verification code.")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      setOtpSuccess("Email verified successfully! Logging you in...")
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 1000)
    } catch (err) {
      console.error(err)
      setOtpError("Unable to verify code. Please try again.")
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return

    setResendLoading(true)
    setOtpError("")
    setOtpSuccess("")

    try {
      const response = await fetch(`${API}/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: otpEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setOtpError(data.message || "Failed to resend verification code.")
        return
      }

      setOtpSuccess(data.message || "New verification code sent!")
      setOtpTimer(300)
      setResendCooldown(30)
      setOtp("")
    } catch (err) {
      console.error(err)
      setOtpError("Unable to resend code. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  if (isForgotPassword) {
    return (
      <ForgotPassword
        onBack={() => setIsForgotPassword(false)}
        onClose={onClose}
      />
    )
  }

  if (isOtp) {
    return (
      <div className="auth-modal-overlay">
        <div className="auth-modal-container">
          <button className="auth-modal-close" onClick={onClose}>
            ✕
          </button>
          <div className="text-center mb-3">
            <FaShieldAlt style={{ fontSize: "36px", color: "#facc15" }} />
          </div>
          <h2 className="auth-modal-title text-center">Verify your email</h2>
          <p className="auth-modal-subtitle text-center">
            We sent a 6-digit code to <br />
            <strong style={{ color: "#facc15" }}>{maskEmail(otpEmail)}</strong>
          </p>
          {otpError && <div className="auth-modal-error">{otpError}</div>}
          {otpSuccess && <div className="auth-modal-success">{otpSuccess}</div>}
          <form className="auth-modal-form" onSubmit={handleVerifyOtp}>
            <input
              className="auth-modal-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6)
                setOtp(val)
              }}
              style={{
                fontSize: "26px",
                letterSpacing: "12px",
                textAlign: "center",
                fontWeight: "bold",
                color: "#facc15",
                fontFamily: "monospace",
              }}
              autoFocus
              required
            />
            <button
              className="auth-modal-submit"
              type="submit"
              disabled={otpLoading || otp.length !== 6}
            >
              {otpLoading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
          <div className="text-center mt-3" style={{ fontSize: "14px" }}>
            <p className="mb-2 text-secondary">
              Didn't receive it?{" "}
              {resendCooldown > 0 ? (
                <span style={{ color: "#94a3b8" }}>Resend in {resendCooldown}s</span>
              ) : (
                <span
                  className="auth-modal-switch"
                  onClick={handleResendOtp}
                  style={{ cursor: "pointer", color: "#60a5fa", fontWeight: "600" }}
                >
                  {resendLoading ? "Sending..." : "Resend OTP"}
                </span>
              )}
            </p>
            <p
              style={{
                color: otpTimer === 0 ? "#f87171" : "#94a3b8",
                fontSize: "13px",
                marginBottom: "10px",
              }}
            >
              {otpTimer > 0
                ? `OTP expires in ${formatTimer(otpTimer)}`
                : "OTP has expired. Please request a new one."}
            </p>
            <span
              onClick={() => {
                setIsOtp(false)
                setOtp("")
                setOtpError("")
                setOtpSuccess("")
              }}
              style={{ color: "#60a5fa", cursor: "pointer", fontSize: "13px" }}
            >
              ← Back to {isLogin ? "Login" : "Sign Up"}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-container">
        <button className="auth-modal-close" onClick={onClose}>
          ✕
        </button>
        <h2 className="auth-modal-title">
          {isLogin
            ? "Welcome Back 👋"
            : "Join MessBuddy 🍽"}
        </h2>
        <p className="auth-modal-subtitle">
          {isLogin
            ? "Login to vote, save favourites and review restaurants."
            : "Create your account to unlock all features."}
        </p>
        {error && (
          <div className="auth-modal-error">
            {error}
          </div>
        )}
        {success && (
          <div className="auth-modal-success">
            {success}
          </div>
        )}
        <form className="auth-modal-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <input className="auth-modal-input" type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} autoComplete="username" required />)}
          <input className="auth-modal-input" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} autoComplete="email" required />
          <input className="auth-modal-input" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} autoComplete={isLogin ? "current-password" : "new-password"} required />
          {isLogin && (
            <div className="text-end">
              <span onClick={() => {
                setIsForgotPassword(true)
                setError("")
                setSuccess("")
              }}
                style={{ color: "#60a5fa", cursor: "pointer", fontSize: "14px" }}>
                Forgot Password?
              </span>
            </div>
          )}
          <button className="auth-modal-submit" type="submit" disabled={loading}>
            {loading ? isLogin ? "Logging in..." : "Creating Account..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <p>
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}
          <span className="auth-modal-switch" onClick={switchMode}>
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  )
}
import { useState } from "react"
import "../../App.css"
export default function AuthModal({ onClose }) {
  const API = process.env.REACT_APP_AUTH
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
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
      }
    } catch (err) {
      console.error(err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
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
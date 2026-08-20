import { useState } from "react"
import "../../App.css"
export default function ForgotPassword({ onBack, onClose }) {
    const API = process.env.REACT_APP_AUTH
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        setLoading(true)
        try {
            const response = await fetch(
                `${API}/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                    }),
                }
            )
            const data = await response.json()
            if (!response.ok) {
                setError(
                    data.message ||
                    "Unable to send reset link."
                )
                return
            }
            setSuccess(
                data.message ||
                "Password reset link sent successfully."
            )
            setEmail("")

        } catch (err) {
            console.error(err)

            setError(
                "Unable to connect to MessBuddy. Please try again."
            )
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="modal-overlay">
            <div className="password-card forgot-password-modal">
                <button className="password-close-btn" onClick={onClose} type="button" >
                    ✕
                </button>
                <div className="password-logo">
                    🍽️
                </div>
                <h1>
                    Forgot Password?
                </h1>
                {!success ? (
                    <>
                        <p className="password-subtitle">
                            Enter your email and we'll send you
                            a password reset link.
                        </p>
                        {error && (
                            <div className="password-error">
                                ⚠️ {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="password-form" >
                            <div className="password-field">
                                <label>
                                    Email Address
                                </label>
                                <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail( e.target.value )} required />
                            </div>
                            <button type="submit" className="reset-password-btn" disabled={loading}>
                                {loading ? "Sending..." : "📧 Send Reset Link"}
                            </button>
                        </form>
                        <button className="back-login-btn" onClick={onBack} type="button"  >
                            ← Back to Login
                        </button>
                    </>
                ) : (
                    <div className="password-success">
                        <div className="success-icon">
                            ✓
                        </div>
                        <h2>
                            Check Your Email
                        </h2>
                        <p>
                            We've sent a password reset
                            link to your email address.
                        </p>
                        <p className="success-small">
                            The link will expire in 15 minutes.
                            Check your spam folder if you don't
                            see it in your inbox.
                        </p>
                        <button className="reset-password-btn" onClick={onBack} type="button">
                            ← Back to Login
                        </button>
                    </div>
                )}
            </div>
            <p className="password-footer">
                © {new Date().getFullYear()} MessBuddy
            </p>
        </div>
    )
}
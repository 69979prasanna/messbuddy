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
        setLoading(true)
        setError("")
        setSuccess("")
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
                setError(data.message)
                return
            }
            setSuccess(data.message)
        } catch (err) {
            console.error(err)
            setError(
                "Something went wrong. Please try again."
            )
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="modal-overlay">
            <div className="auth-modal">
                <button className="close-btn" onClick={onClose} >
                    ✕
                </button>
                <h2>
                    🔐 Forgot Password?
                </h2>
                <p>
                    Enter your email and we'll send you
                    a password reset link.
                </p>
                {error && (
                    <div className="alert alert-danger py-2">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="alert alert-success py-2">
                        {success}
                    </div>
                )}
                {!success && (
                    <form onSubmit={handleSubmit}>
                        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <button type="submit" disabled={loading} >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                )}
                <p style={{ marginTop: "20px", textAlign: "center" }} >
                    <span  onClick={onBack} className="back-link">
                        ← Back to Login
                    </span>
                </p>
            </div>
        </div>
    )
}
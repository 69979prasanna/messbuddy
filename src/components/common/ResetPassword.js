import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "../../App.css"
export default function ResetPassword() {
    const API = process.env.REACT_APP_AUTH
    const { token } = useParams()
    const navigate = useNavigate()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }
        setLoading(true)
        try {
            const response = await fetch(
                `${API}/reset-password/${token}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        password,
                    }),
                }
            )
            const data = await response.json()
            if (!response.ok) {
                setError(
                    data.message ||
                    "Unable to reset your password."
                )
                return
            }
            setSuccess(
                data.message ||
                "Password reset successfully."
            )
            setPassword("")
            setConfirmPassword("")
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
        <div className="password-page">
            <div className="password-card">
                <div className="password-logo">
                    🍽️
                </div>
                <h1>
                    Reset Password
                </h1>
                {!success ? (
                    <>
                        <p className="password-subtitle">
                            Create a new password for your
                            MessBuddy account.
                        </p>
                        {error && (
                            <div className="password-error">
                                ⚠️ {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="password-form">
                            <div className="password-field">
                                <label>
                                    New Password
                                </label>
                                <div className="password-input-wrapper">
                                    <input  type={showPassword ? "text"  : "password" } placeholder="Enter new password" value={password} onChange={(e) => setPassword( e.target.value ) } required />
                                    <button type="button" className="password-toggle" onClick={() =>   setShowPassword( !showPassword ) } >
                                        {showPassword  ? "🙈"  : "👁️"}
                                    </button>
                                </div>
                            </div>
                            <div className="password-field">
                                <label>
                                    Confirm Password
                                </label>
                                <div className="password-input-wrapper">
                                    <input type={ showConfirmPassword  ? "text"  : "password" } placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword( e.target.value ) } required />
                                    <button type="button" className="password-toggle" onClick={() =>  setShowConfirmPassword( !showConfirmPassword ) } >
                                        {showConfirmPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>
                            <div className="password-requirements">
                                <strong>
                                    Password must contain:
                                </strong>
                                <span>
                                    ✓ At least 5 characters
                                </span>
                                <span>
                                    ✓ One uppercase letter
                                </span>
                                <span>
                                    ✓ One number
                                </span>
                            </div>
                            <button type="submit" className="reset-password-btn" disabled={loading} >
                                {loading
                                    ? "Resetting..."
                                    : "🔐 Reset Password"}
                            </button>
                        </form>
                        <button className="back-login-btn" onClick={() => navigate("/")}>
                            ← Back to MessBuddy
                        </button>
                    </>
                ) : (
                    <div className="password-success">
                        <div className="success-icon">
                            ✓
                        </div>
                        <h2>
                            Password Updated!
                        </h2>
                        <p>
                            Your MessBuddy password has
                            been changed successfully.
                        </p>
                        <p className="success-small">
                            You can now log in using your
                            new password.
                        </p>

                        <button className="reset-password-btn" onClick={() => navigate("/")}  >
                            🍽️ Go to MessBuddy
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
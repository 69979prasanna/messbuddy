import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "../../App.css"
export default function ResetPassword() {
    const API = process.env.REACT_APP_AUTH
    const { token } = useParams()
    const navigate = useNavigate()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
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
                <h2>
                    🔐 Reset Password
                </h2>
                <p>
                    Create a new password for your
                    MessBuddy account.
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
                        <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={5} required />
                        <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={5} required />
                        <button type="submit" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}
                {success && (
                    <button type="button" className="success-button" onClick={() => navigate("/")} >
                        Go to MessBuddy
                    </button>
                )}
            </div>
        </div>
    )
}
import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

export default function VerifyEmail({onClose}) {
  const { token } = useParams()
  const navigate = useNavigate()
  const API = process.env.REACT_APP_AUTH
  const [status, setStatus] = useState("verifying")
  const [message, setMessage] = useState("")
  const verificationStarted = useRef(false)
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || verificationStarted.current) return
      verificationStarted.current = true
      try {
        const response = await fetch(
          `${API}/verify/${token}`
        )
        const data = await response.json()
        if (!response.ok) {
          setStatus("error")
          setMessage(
            data.message ||
            "This verification link is invalid or expired."
          )
          return
        }
        sessionStorage.setItem(
          `verified_${token}`,
          "true"
        )
        setStatus("success")
        setMessage(
          data.message ||
          "Your email has been verified successfully!"
        )
      } catch (err) {
        console.error(err)
        setStatus("error")
        setMessage(
          "Unable to verify your email. Please try again."
        )
      }
    }
    const alreadyVerified = sessionStorage.getItem(
      `verified_${token}`
    )
    if (alreadyVerified === "true") {
      setStatus("success")
      setMessage(
        "Your email has already been verified."
      )
      return
    }
    verifyEmail()
  }, [token, API])

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#0f172a", padding: "20px" }}>
      <div className="text-center text-light" style={{ width: "460px", maxWidth: "100%", background: "#111827", padding: "45px 35px", borderRadius: "24px", boxShadow: "0 15px 50px rgba(0,0,0,.45)" }}>
        {status === "verifying" && (
          <>
            <div className="spinner-border text-warning mb-4" style={{ width: "3rem", height: "3rem" }} />
            <h2 className="fw-bold">
              Verifying your email
            </h2>
            <p className="text-secondary mt-3">
              Please wait while we activate your
              MessBuddy account...
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <div
              style={{ width: "90px", height: "90px", margin: "0 auto 20px", borderRadius: "50%", background: "rgba(34,197,94,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "45px" }}>
              ✓
            </div>
            <h2 className="fw-bold" style={{ color: "#4ade80" }}>
              Email Verified!
            </h2>
            <p className="text-secondary mt-3">
              {message}
            </p>
            <p className="text-secondary" style={{ fontSize: "14px" }}>
              Your MessBuddy account is ready.
            </p>
            <button
              className="btn btn-warning px-4 py-2"
              onClick={() => {
                if (onClose) {
                  onClose()
                } navigate("/")
              }}>
              🍽️ Continue to MessBuddy
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <div
              style={{ width: "90px", height: "90px", margin: "0 auto 20px", borderRadius: "50%", background: "rgba(239,68,68,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>
              !
            </div>
            <h2 className="fw-bold" style={{ color: "#f87171" }}>
              Verification Failed
            </h2>
            <p className="text-secondary mt-3">
              {message}
            </p>
            <div className="d-flex justify-content-center gap-2 mt-4">
              <button className="btn btn-warning px-4" onClick={() => navigate("/")} >
                Back to MessBuddy
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
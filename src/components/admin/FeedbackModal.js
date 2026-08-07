import { Modal } from "react-bootstrap"
import { FaEnvelope, FaCalendarAlt, FaStar } from "react-icons/fa"
import { useState } from "react"
export default function FeedbackModal({ show, onClose, feedback }) {
    const [reply, setReply] = useState("")
    const [loading, setLoading] = useState(false)
    const API = process.env.REACT_APP_APIKEY
    const handleReply = async () => {
        if (!reply.trim()) return
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const res = await fetch(
                `${API}/feedback/${feedback._id}/reply`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        message: reply,
                    }),
                }
            )
            const data = await res.json()
            if (!res.ok) {
                alert(data.message)
                return
            }
            alert("Reply sent successfully!")
            setReply("")
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }
    if (!feedback) return null
    const badgeColor = () => {
        switch (feedback.type) {
            case "Suggestion":
                return "#22c55e"
            case "Bug Report":
                return "#ef4444"
            case "Restaurant Request":
                return "#3b82f6"
            case "Wrong Price":
                return "#f59e0b"
            case "Wrong Timing":
                return "#8b5cf6"
            default:
                return "#6b7280"
        }
    }
    return (
        <Modal show={show} onHide={onClose} centered size="lg" >
            <Modal.Header closeButton style={{ background: "#1f2937", color: "white", borderBottom: "1px solid #374151", }}>
                <Modal.Title>
                    ⭐ Feedback Details
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ background: "#111827", color: "white" }}>
                <div className="d-flex justify-content-between mb-4">
                    <div>
                        {[...Array(feedback.rating)].map((_, i) => (
                            <FaStar
                                key={i}
                                color="#facc15"
                            />
                        ))}
                    </div>
                    <span className="badge" style={{ background: badgeColor(), padding: "8px 18px", borderRadius: "20px" }}>
                        {feedback.type}
                    </span>
                </div>
                <h4>{feedback.name}</h4>
                <p className="text-secondary">
                    <FaEnvelope className="me-2" />
                    {feedback.email}
                </p>
                <p className="text-secondary">
                    <FaCalendarAlt className="me-2" />
                    {new Date(
                        feedback.createdAt
                    ).toLocaleString()}
                </p>
                <hr />
                <div style={{ background: "#24304a", borderRadius: "12px", padding: "20px", whiteSpace: "pre-wrap", lineHeight: "1.8", wordBreak: "break-all", overflowWrap: "break-word", overflow: "hidden", boxSizing: "border-box" }}>
                    {feedback.message}
                    <hr />
                    <h5 className="mb-3">
                        💬 Replies
                    </h5>
                    {feedback.replies?.length === 0 ? (
                        <p className="text-secondary">
                            No replies yet.
                        </p>
                    ) : (
                        feedback.replies.map((reply) => (
                            <div key={reply._id} className="mb-3 p-3 rounded" style={{ background: "#1f2937" }}>
                                <strong>
                                    {reply.username}
                                </strong>
                                <small className="ms-2 text-secondary">
                                    {new Date(reply.createdAt).toLocaleString()}
                                </small>
                                <p className="mt-2 mb-0">
                                    {reply.message}
                                </p>
                            </div>

                        ))
                    )}
                    <textarea className="form-control bg-dark text-light border-secondary" rows={5} placeholder="Write a official response..." value={reply} onChange={(e) => { setReply(e.target.value) }} />
                    <div className="text-end mt-3">
                        <button className="btn btn-warning" disabled={loading} onClick={handleReply}>
                            💬 Send Reply
                        </button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}
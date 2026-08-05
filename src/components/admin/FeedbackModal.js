import { Modal } from "react-bootstrap"
import {
    FaEnvelope,
    FaCalendarAlt,
    FaStar,
} from "react-icons/fa"

export default function FeedbackModal({
    show,
    onClose,
    feedback,
}) {
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
                <div style={{ background: "#24304a", borderRadius: "12px", padding: "20px", whiteSpace: "pre-wrap", lineHeight: "1.8", }}>
                    {feedback.message}
                </div>
            </Modal.Body>
        </Modal>
    )
}
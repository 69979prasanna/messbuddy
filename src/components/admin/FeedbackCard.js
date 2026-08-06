import {FaEnvelope,FaCalendarAlt, FaStar} from "react-icons/fa"
import "../../styles/feedback.css"
export default function FeedbackCard({
    feedback,
    onDelete,
    onView
}) {
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
        <div className="col-xl-4 col-lg-6 col-md-6 mb-4">
            <div className="feedback-card" style={{ minHeight: "320px", display: "flex", flexDirection: "column" }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="feedback-stars">
                        {[...Array(feedback.rating)].map((_, i) => (
                            <FaStar
                                key={i}
                                color="#facc15"
                                size={16} />
                        ))}
                    </div>
                    <span className="feedback-type" style={{ background: badgeColor(), fontSize: "12px", padding: "6px 14px", borderRadius: "20px" }}>
                        {feedback.type}
                    </span>
                </div>
                <div className="d-flex align-items-center mb-3">
                    <div className="feedback-avatar me-3">
                        {(feedback.name || "A")
                            .charAt(0)
                            .toUpperCase()}
                    </div>
                    <div>
                        <h6 className="mb-1 text-white fw-bold">
                            {feedback.name || "Anonymous"}
                        </h6>
                        <small className="text-secondary">
                            <FaCalendarAlt className="me-2" />
                            {new Date(
                                feedback.createdAt
                            ).toLocaleDateString()}
                        </small>
                    </div>
                </div>
                <div className="text-secondary mb-3">
                    <FaEnvelope className="me-2" />
                    {feedback.email || "No Email"}
                </div>
                <div className="feedback-message" style={{ background: "#2b364d", borderRadius: "12px", padding: "16px", lineHeight: "0.9", whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-all", overflow: "hidden" }} >
                    <p style={{ marginBottom: "8px", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "break-word" }}>
                        {feedback.message.length > 180
                            ? feedback.message.slice(0, 180) + "..."
                            : feedback.message}
                    </p>
                    {feedback.message.length > 180 && (
                        <button className="btn btn-link p-0" style={{ color: "#60a5fa", textDecoration: "none", fontSize: "14px" }} onClick={onView}>
                            Read More ▼
                        </button>
                    )}
                </div>
                <div className="mt-3 d-flex justify-content-end">
                    <button
  className="btn btn-outline-primary btn-sm"
  onClick={onView}
>
  💬 Reply
</button>
                </div>
            </div>
        </div>
    )
}
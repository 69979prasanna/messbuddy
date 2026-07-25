import {
    FaTrash,
    FaUser,
    FaEnvelope,
    FaCalendarAlt,
    FaStar,
} from "react-icons/fa";

export default function FeedbackCard({
    feedback,
    onDelete,
}) {

    const badgeColor = () => {
        switch (feedback.type) {
            case "Suggestion":
                return "#22c55e";
            case "Bug Report":
                return "#ef4444";
            case "Restaurant Request":
                return "#3b82f6";
            case "Wrong Price":
                return "#f59e0b";
            case "Wrong Timing":
                return "#8b5cf6";
            default:
                return "#6b7280";
        }
    }
    return (
        <div className="col-lg-6">
            <div className="feedback-card">
                <div className="feedback-card-header">
                    <div className="feedback-stars">
                        {[...Array(feedback.rating)].map((_, i) => (
                            <FaStar key={i} color="#facc15" />
                        ))}
                    </div>
                    <span className="feedback-type" style={{ background: badgeColor(), }} >
                        {feedback.type}
                    </span>
                </div>
                <div className="feedback-user">

                    <div className="feedback-avatar">
                        {(feedback.name || "A").charAt(0).toUpperCase()}
                    </div>

                    <span>{feedback.name || "Anonymous"}</span>

                </div>
                <div className="feedback-email">
                    <FaEnvelope />
                    <span>
                        {feedback.email || "No Email"}
                    </span>
                </div>
                <div className="feedback-message">
                    {feedback.message}
                </div>
                <div className="feedback-footer">
                    <div className="feedback-date">
                        <FaCalendarAlt />
                        <span>
                            {new Date(
                                feedback.createdAt
                            ).toLocaleDateString()}
                        </span>
                    </div>
                    <button className="delete-feedback-btn" onClick={() => onDelete(feedback._id)}>
                        <FaTrash />
                    </button>
                </div>
            </div>
        </div>
    )
}
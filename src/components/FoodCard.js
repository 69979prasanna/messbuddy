
import { useNavigate } from "react-router-dom";

export default function FoodCard({ food, onVote, userVote }) {
  const navigate = useNavigate();

  const openPlace = () => {
    navigate(`/place/${encodeURIComponent(food.source)}`);
  };

  return (
    <div
      className="card bg-dark text-light shadow-sm h-100"
      style={{ cursor: "pointer" }}
      onClick={openPlace}
    >
      <div className="card-body">
        <h5 className="card-title">{food.source}</h5>
        <h6 className="card-subtitle mb-2 fw-semibold text-light mb-1">
          {food.dish}
        </h6>

        <p className="mb-1">💰 ₹{food.price}</p>
        <p className="mb-2">⭐ {food.rating}</p>

        {/* Voting */}
        <div
          className="d-flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={`btn btn-sm ${
              userVote === "up"
                ? "btn-outline-success"
                : "btn-outline-secondary"
            }`}
            disabled={userVote !== undefined}
            onClick={() => onVote(food.id, "up")}
          >
            👍 {food.upvotes}
          </button>

          <button
            className={`btn btn-sm ${
              userVote === "down"
                ? "btn-outline-danger"
                : "btn-outline-secondary"
            }`}
            disabled={userVote !== undefined}
            onClick={() => onVote(food.id, "down")}
          >
            👎 {food.downvotes}
          </button>
        </div>

        {food.downvotes >= 3 && (
          <div className="alert alert-danger mt-2 py-1">
            ⚠️ Not recommended today
          </div>
        )}
      </div>
    </div>
  );
}

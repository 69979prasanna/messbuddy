import { useNavigate } from "react-router-dom";
import { restaurantTimings } from "../data/restaurantTimings";

export default function FoodCard({ food, onVote, userVote }) {
  const navigate = useNavigate();

  const normalize = (str) => str?.trim().toLowerCase();

  const getStatus = (source) => {
    const timing = restaurantTimings[normalize(source)];
    if (!timing) return { open: false, closingSoon: false };

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = timing.open.split(":").map(Number);
    const [closeH, closeM] = timing.close.split(":").map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    const open =
      currentMinutes >= openMinutes &&
      currentMinutes < closeMinutes;

    const closingSoon =
      open && closeMinutes - currentMinutes <= 30;

    return { open, closingSoon };
  };

  // ✅ THIS WAS MISSING
  const { open, closingSoon } = getStatus(food.source);

  const openPlace = () => {
    navigate(`/place/${encodeURIComponent(food.source)}`);
  };

  const handleUpvote = (e) => {
    e.stopPropagation();
    onVote(food.id, "up");
  };

  const handleDownvote = (e) => {
    e.stopPropagation();
    onVote(food.id, "down");
  };

  return (
    <div
      className="card bg-dark text-light shadow-sm h-100"
      style={{ cursor: "pointer" }}
      onClick={openPlace}
    >
      <div className="card-body">
        <h5 className="card-title">{food.source}</h5>
        <h6 className="card-subtitle mb-2 fw-semibold text-light">
          {food.dish}
        </h6>

        {/* ✅ STATUS BADGES */}
        <div className="mb-2">
          {!open && (
            <span className="badge bg-danger">🔴 Closed</span>
          )}

          {open && !closingSoon && (
            <span className="badge bg-success">🟢 Open now</span>
          )}

          {closingSoon && (
            <span className="badge bg-warning text-dark">
              ⚠️ Closing Soon
            </span>
          )}
        </div>

        <p className="mb-1">💰 ₹{food.price}</p>
        <p className="mb-2">⭐ {food.rating}</p>

        {/* Voting */}
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${
              userVote === "up"
                ? "btn-success"
                : "btn-outline-secondary"
            }`}
            onClick={handleUpvote}
          >
            👍 {food.upvotes}
          </button>

          <button
            className={`btn btn-sm ${
              userVote === "down"
                ? "btn-danger"
                : "btn-outline-secondary"
            }`}
            onClick={handleDownvote}
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

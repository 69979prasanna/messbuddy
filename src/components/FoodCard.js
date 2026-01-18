export default function FoodCard({ food, onVote, userVote }) {
  const isBadToday = food.downvotes >= 3;

  return (
    <div className="card">
      <h3>{food.source}</h3>
      <p><strong>{food.dish}</strong></p>
      <p className="price">💰 ₹{food.price}</p>
      <p className="rating">⭐ {food.rating}</p>

      <div className="vote-row">
      <button
  disabled={userVote !== undefined}
  className={userVote === "up" ? "active" : ""}
  onClick={() => onVote(food.id, "up")}
>
  👍 {food.upvotes}
</button>

<button
  disabled={userVote !== undefined}
  className={userVote === "down" ? "active" : ""}
  onClick={() => onVote(food.id, "down")}
>
  👎 {food.downvotes}
</button>

      </div>

      {userVote && (
        <p className="voted-text">✔ You voted</p>
      )}

      {isBadToday && (
        <div className="warning">
          ⚠️ People are saying this is bad today
        </div>
      )}
    </div>
  );
}

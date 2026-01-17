export default function FoodCard({ food }) {
  return (
    <div className="card">
      <h3>{food.source}</h3>
      <p><strong>{food.dish}</strong></p>
      <p>💰 ₹{food.price}</p>
      <p>⭐ {food.rating}</p>
      {food.rating < 3 && (
        <p className="warning">⚠️ Not recommended today</p>
      )}
    </div>
  );
}

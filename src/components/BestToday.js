import { useState } from "react";
import FoodCard from "./FoodCard";
import { foodData } from "../data/foodData";

export default function BestToday() {
  const [dietMode, setDietMode] = useState("all");

  // Filter based on diet mode
  const filteredFood =
    dietMode === "all"
      ? foodData
      : foodData.filter(food => food.tags.includes(dietMode));

  // Sort by rating (best first)
  const sortedFood = [...filteredFood].sort(
    (a, b) => b.rating - a.rating
  );

  return (
    <div>
      <h2>🍽️ Best Food Options Today</h2>

      {/* Diet Selector */}
      <div className="diet-filter">
        <label>Diet Mode:</label>
        <select
          value={dietMode}
          onChange={e => setDietMode(e.target.value)}
        >
          <option value="all">All</option>
          <option value="balanced">Balanced</option>
          <option value="light">Light / Healthy</option>
          <option value="high-protein">High Protein</option>
          <option value="budget">Budget Friendly</option>
          <option value="oily">Avoid Oily</option>
        </select>
      </div>

      {/* Results */}
      <div className="grid">
        {sortedFood.length > 0 ? (
          sortedFood.map(food => (
            <FoodCard key={food.id} food={food} />
          ))
        ) : (
          <p>❌ No food matches this diet preference today.</p>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import FoodCard from "./FoodCard";
import { foodData } from "../data/foodData";

export default function BestToday() {
  const [foods, setFoods] = useState(foodData);
  const [userVotes, setUserVotes] = useState({});

  // Load previous votes
  useEffect(() => {
    const savedVotes = JSON.parse(localStorage.getItem("votes")) || {};
    setUserVotes(savedVotes);
  }, []);

  // Save votes whenever updated
  useEffect(() => {
    localStorage.setItem("votes", JSON.stringify(userVotes));
  }, [userVotes]);

  const handleVote = (id, type) => {
  // prevent double voting
  if (userVotes[id] === "up" || userVotes[id] === "down") {
    return;
  }

  setFoods(prev =>
    prev.map(food =>
      food.id === id
        ? {
            ...food,
            upvotes: type === "up" ? food.upvotes + 1 : food.upvotes,
            downvotes: type === "down" ? food.downvotes + 1 : food.downvotes
          }
        : food
    )
  );

  setUserVotes(prev => ({
    ...prev,
    [id]: type
  }));
};


  return (
    <div>
      <h2>🍽️ Best Food Options Today</h2>

      <div className="grid">
        {foods.map(food => (
          <FoodCard
            key={food.id}
            food={food}
            onVote={handleVote}
            userVote={userVotes[food.id]}
          />
        ))}
      </div>
    </div>
  );
}

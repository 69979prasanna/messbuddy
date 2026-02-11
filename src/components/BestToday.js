import { useState, useEffect } from "react";
import FoodCard from "./FoodCard";
import { foodData } from "../data/foodData";

export default function BestToday() {
  const [foods, setFoods] = useState(
  foodData.map(item => ({
    ...item,
    upvotes: 0,
    downvotes: 0
  }))
);

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
  const previousVote = userVotes[id]; // "up" | "down" | undefined

  setFoods(prev =>
    prev.map(food => {
      if (food.id !== id) return food;

      let { upvotes, downvotes } = food;

      // 🔁 Remove vote if same button clicked again
      if (previousVote === type) {
        if (type === "up") upvotes = Math.max(0, upvotes - 1);
        if (type === "down") downvotes = Math.max(0, downvotes - 1);
      }

      // 🔄 Switch vote (up ↔ down)
      else if (previousVote) {
        if (previousVote === "up") {
          upvotes = Math.max(0, upvotes - 1);
          downvotes += 1;
        } else {
          downvotes = Math.max(0, downvotes - 1);
          upvotes += 1;
        }
      }

      // ➕ Fresh vote
      else {
        if (type === "up") upvotes += 1;
        if (type === "down") downvotes += 1;
      }

      return { ...food, upvotes, downvotes };
    })
  );

  setUserVotes(prev => {
    // ❌ remove vote
    if (previousVote === type) {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    }

    // ✅ add / switch vote
    return {
      ...prev,
      [id]: type
    };
  });
};


  return (
    <div className="row g-3">
  {foods.map(food => (
    <div className="col-md-4 col-sm-6" key={food.id}>
      <FoodCard 
        food={food}
        onVote={handleVote}
        userVote={userVotes[food.id]}
      />
    </div>
  ))}
</div>

  );
}

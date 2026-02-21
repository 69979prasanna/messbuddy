import { useState, useEffect } from "react";
import FoodCard from "./FoodCard";
import { foodData } from "../data/foodData";

export default function BestToday() {
  const [search, setSearch] = useState("");

  // ⭐ votes state
  const [foods, setFoods] = useState(
    foodData.map(item => ({
      ...item,
      upvotes: item.upvotes || 0,
      downvotes: item.downvotes || 0
    }))
  );

  const [userVotes, setUserVotes] = useState({});

  // 🔁 Load votes from localStorage
  useEffect(() => {
    const savedVotes =
      JSON.parse(localStorage.getItem("votes")) || {};
    setUserVotes(savedVotes);
  }, []);

  // 💾 Save votes
  useEffect(() => {
    localStorage.setItem(
      "votes",
      JSON.stringify(userVotes)
    );
  }, [userVotes]);

  // 👍👎 Vote handler
  const handleVote = (id, type) => {
    const prevVote = userVotes[id];

    setFoods(prev =>
      prev.map(food => {
        if (food.id !== id) return food;

        let { upvotes, downvotes } = food;

        if (prevVote === type) {
          // remove vote
          if (type === "up") upvotes--;
          if (type === "down") downvotes--;
        } else if (prevVote) {
          // switch vote
          if (prevVote === "up") {
            upvotes--;
            downvotes++;
          } else {
            downvotes--;
            upvotes++;
          }
        } else {
          // new vote
          if (type === "up") upvotes++;
          if (type === "down") downvotes++;
        }

        return {
          ...food,
          upvotes: Math.max(0, upvotes),
          downvotes: Math.max(0, downvotes)
        };
      })
    );

    setUserVotes(prev => {
      if (prevVote === type) {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      }
      return { ...prev, [id]: type };
    });
  };

  // 🔍 Search filter
  const filteredPlaces = foods.filter(place =>
    place.source
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      {/* Search */}
      <input
        className="form-control bg-dark text-light border-secondary mb-3"
        placeholder="🔍 Search restaurant"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Cards */}
      <div className="row g-3">
        {filteredPlaces.map(place => (
          <div
            className="col-md-4 col-sm-6"
            key={place.id}
          >
            <FoodCard
              food={place}
              onVote={handleVote}          // ✅ FIX
              userVote={userVotes[place.id]}
            />
          </div>
        ))}
      </div>
    </>
  );
}
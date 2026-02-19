import { useState } from "react";
import FoodCard from "./FoodCard";
import { foodData } from "../data/foodData";

export default function BestToday() {
  const [search, setSearch] = useState("");

  const filteredPlaces = foodData.filter(place =>
    place.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <input
        className="form-control bg-dark text-light border-secondary mb-3"
        placeholder="🔍 Search restaurant"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="row g-3">
        {filteredPlaces.map(place => (
          <div className="col-md-4 col-sm-6" key={place.id}>
            <FoodCard food={place} />
          </div>
        ))}
      </div>
    </>
  );
}

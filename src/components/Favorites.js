import { useEffect, useState } from "react";
import { getFavorites } from "../utils/favorites";
import FoodCard from "./FoodCard";

function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  return (
 <div className="container text-light">
  <h2 className="mb-3">My Favorites ❤️</h2>

  {favorites.length === 0 ? (
    <p>No favorites yet</p>
  ) : (
    <div className="row g-3">
      {favorites.map((item) => (
        <div className="col-md-4 col-sm-6" key={item.id}>
          <FoodCard food={item} />
        </div>
      ))}
    </div>
  )}
</div>
  );
}

export default Favorites;
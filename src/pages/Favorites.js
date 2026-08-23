import { useEffect, useState } from "react"
import {
  getFavorites,
  getMenuFavorites,
} from "../utils/favorites"
import FoodCard from "../components/home/FoodCard"
export default function Favorites({
  setShowAuthModal,
}) {
  const [favorites, setFavorites] = useState([])
  const [menuFavorites, setMenuFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    loadFavorites()
  }, [])
  const loadFavorites = async () => {
    try {
      setLoading(true)
      const restaurantData =
        await getFavorites()
      setFavorites(
        restaurantData
          .filter(
            (fav) => fav.restaurant
          )
          .map(
            (fav) => fav.restaurant
          )
      )
      const menuData =
        await getMenuFavorites()
      setMenuFavorites(
        menuData
          .filter(
            (fav) => fav.menu
          )
          .map(
            (fav) => fav.menu
          )
      )
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  if (loading) {
    return (
      <div className="container py-5 text-center text-light">
        <div className="spinner-border text-warning" />
        <p className="mt-3">
          Loading Favorites...
        </p>
      </div>
    )
  }
  return (
    <div className="container py-4 text-light">
      <h2 className="fw-bold mb-5">
        ❤️ My Favorites
      </h2>
      <section className="mb-5">
        <div className="d-flex align-items-center mb-4">
          <h3 className="fw-bold mb-0">
            🏪 Favorite Restaurants
          </h3>
          <span className="badge bg-warning text-dark ms-3">
            {favorites.length}
          </span>
        </div>
        {favorites.length === 0 ? (
          <div className="text-center py-4">
            <h5>
              No favorite restaurants yet
            </h5>
            <p className="text-secondary">
              Tap ❤️ on a restaurant to add it here.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {favorites.map((restaurant) => (
              <div className="col-lg-4 col-md-6" key={restaurant._id}  >
                <FoodCard food={restaurant} setShowAuthModal={setShowAuthModal} />
              </div>
            ))}
          </div>
        )}
      </section>
      <section>
        <div className="d-flex align-items-center mb-4">
          <h3 className="fw-bold mb-0">
            🍽️ Favorite Menu Items
          </h3>
          <span className="badge bg-warning text-dark ms-3">
            {menuFavorites.length}
          </span>
        </div>
        {menuFavorites.length === 0 ? (
          <div className="text-center py-4">
            <h5>
              No favorite dishes yet
            </h5>
            <p className="text-secondary">
              Tap ❤️ on any dish to add it here.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {menuFavorites.map((menu) => (
              <div className="col-lg-4 col-md-6" key={menu._id}>
                <div className="card bg-dark text-light border-0 shadow-lg h-100" style={{ borderRadius: "18px", overflow: "hidden" }}>
                  <div className="position-relative">
                    <img src={menu.image || "https://placehold.co/600x400?text=No+Image"} alt={menu.dish} className="w-100" style={{ height: "190px", objectFit: "cover", }} />
                    <div className="position-absolute top-0 end-0 m-3" style={{ fontSize: "1.5rem", background: "rgba(0,0,0,.45)", width: "42px", height: "42px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", }} >
                      ❤️
                    </div>
                    <div className="position-absolute bottom-0 start-0 p-3">
                      {menu.isAvailable ? (
                        <span className="badge bg-success rounded-pill px-3 py-2">
                          🟢 Available
                        </span>
                      ) : (
                        <span className="badge bg-danger rounded-pill px-3 py-2">
                          🔴 Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <h5 className="fw-bold mb-1">
                      {menu.dish}
                    </h5>
                    {menu.restaurant?.name && (
                      <p className="text-info mb-2">
                        🍽️ {menu.restaurant.name}
                      </p>
                    )}
                    <p className="text-secondary mb-3" style={{ minHeight: "45px", }} >
                      {menu.description ||
                        "No description available."}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="text-warning fw-bold mb-0">
                        ₹{menu.price}
                      </h4>
                      {menu.price <= 60 && (
                        <span className="badge bg-warning text-dark rounded-pill px-3 py-2">
                          💸 Student Friendly
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  getFavorites,
  getMenuFavorites,
  toggleMenuFavorite,
} from "../utils/favorites"
import "../styles/PlaceDetails.css"
import ReviewForm from "../components/restaurantDetails/ReviewForm"
import ReviewList from "../components/restaurantDetails/ReviewList"
import LiveMealStatus from "../components/restaurantDetails/LiveMealStatus"
import WeeklySchedule from "../components/restaurantDetails/WeeklySchedule"
const API = process.env.REACT_APP_APIKEY
export default function PlaceDetails({
  setShowAuthModal,
}) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [favoriteIds, setFavoriteIds] = useState([])
  const [menuFavoriteIds, setMenuFavoriteIds] =
    useState([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  useEffect(() => {
    loadFavorites()
  }, [])
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true)
        const restaurantRes = await fetch(
          `${API}/restaurants/${id}`
        )
        if (!restaurantRes.ok) {
          throw new Error(
            "Restaurant not found"
          )
        }
        const restaurantData =
          await restaurantRes.json()
        setRestaurant(restaurantData)
        const menuRes = await fetch(
          `${API}/menus/restaurant/${id}`
        )
        if (!menuRes.ok) {
          throw new Error(
            "Couldn't load menu"
          )
        }
        const menuData =
          await menuRes.json()
        setMenus(menuData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRestaurant()
  }, [id])
  const loadFavorites = async () => {
    const token =
      localStorage.getItem("token")
    if (!token) {
      setFavoriteIds([])
      setMenuFavoriteIds([])
      return
    }
    try {
      const restaurantFavorites =
        await getFavorites()
      setFavoriteIds(
        restaurantFavorites
          .filter(
            (fav) => fav.restaurant
          )
          .map(
            (fav) => fav.restaurant._id
          )
      )
      const menuFavorites =
        await getMenuFavorites()
      setMenuFavoriteIds(
        menuFavorites
          .filter(
            (fav) => fav.menu
          )
          .map(
            (fav) => fav.menu._id
          )
      )
    } catch (err) {
      console.error(err)
    }
  }
  const toggleFavourite = async (item) => {
    const token =
      localStorage.getItem("token")
    if (!token) {
      setShowAuthModal(true)
      return
    }
    try {
      const result =
        await toggleMenuFavorite(
          item._id
        )
      if (!result) return
      if (result.favorite) {
        setMenuFavoriteIds(
          (prev) => [
            ...prev,
            item._id,
          ]
        )
      }
      else {
        setMenuFavoriteIds(
          (prev) =>
            prev.filter(
              (menuId) =>
                menuId !== item._id
            )
        )
      }
    } catch (err) {
      console.error(err)
    }
  }
  const filteredMenus = (
    filter === "top"
      ? menus.filter(
        (item) => item.rating >= 4.3
      )
      : filter === "cheap"
        ? menus.filter(
          (item) => item.price <= 60
        )
        : menus
  ).filter((item) =>
    item.dish
      .toLowerCase()
      .includes(
        search.toLowerCase()
      )
  )
  const avgPrice =
    menus.length > 0
      ? menus.reduce(
        (sum, item) =>
          sum + item.price,
        0
      ) / menus.length
      : 0
  if (loading || !restaurant) {
    return (
      <div className="container py-5 text-center text-light">
        <div className="spinner-border text-warning" />
        <p className="mt-3">
          Loading restaurant...
        </p>
      </div>
    )
  }
  return (
    <div className="container py-4 text-light">
      <button className="btn btn-outline-light rounded-pill px-4 mb-4" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="position-relative overflow-hidden rounded-4 shadow-lg" style={{ height: "300px" }}>
            <img src={restaurant.image} alt={restaurant.name} className="w-100 h-100" style={{ objectFit: "cover" }} />
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: "linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.9))" }} />
            <div className="position-absolute bottom-0 start-0 w-100 p-4" >
              <h1 className="fw-bold text-white mb-2">
                {restaurant?.name || "Loading..."}
              </h1>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-success px-3 py-2 fs-6">
                  ⭐{" "}
                  {(restaurant?.averageRating ??
                    0
                  ).toFixed(1)}
                </span>
                <span className="badge bg-dark border border-secondary px-3 py-2">
                  🍽 {menus.length} Items
                </span>
                <span className="badge bg-warning text-dark px-3 py-2">
                  ₹{avgPrice.toFixed(0)}
                  {" "}Avg Price
                </span>
                <span className="badge bg-info text-dark px-3 py-2">
                  🕒 {restaurant.openingTime} - {restaurant.closingTime}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <a href={restaurant.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name}, ${restaurant.address || ""}`)}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none" >
            <div className="location-card position-relative overflow-hidden rounded-4 shadow-lg" style={{ height: "300px", cursor: "pointer" }}>
              <div className="location-background">
                <div className="location-grid"></div>
                <div className="location-pin">
                  📍
                </div>
                <div className="location-ripple"></div>
              </div>
              <div className="location-overlay"></div>
              <div className="position-absolute bottom-0 start-0 w-100 p-4">
                <h3 className="text-white fw-bold mb-2">
                  📍 Location
                </h3>
                <p className="text-light mb-2">
                  {restaurant.address || "View restaurant location"}
                </p>
                <span className="badge bg-warning text-dark px-3 py-2">
                  🗺️ Open in Google Maps
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Prominent Live Meal Period Status */}
      <LiveMealStatus
        weeklySchedule={restaurant.weeklySchedule}
        restaurantName={restaurant.name}
        menus={menus}
      />

      {/* Interactive Weekly Meal Timetable */}
      <WeeklySchedule
        weeklySchedule={restaurant.weeklySchedule}
        restaurantName={restaurant.name}
        restaurantId={restaurant._id}
        menus={menus}
        setShowAuthModal={setShowAuthModal}
      />

      {/* A-La-Carte Full Restaurant Menu Section */}
      <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
        <div>
          <h3 className="fw-bold text-light mb-1">
            🍽️ Full Restaurant Menu
          </h3>
          <p className="text-secondary mb-0 small">
            Explore all individual items, prices, and availability
          </p>
        </div>
      </div>

      <div className="mb-4">
        <input type="text" className="form-control restaurant-search" placeholder="🔍 Search your favourite dish..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="d-flex flex-wrap gap-3 mb-4">
        <button className={`btn rounded-pill px-4 ${filter === "all" ? "btn-warning text-dark" : "btn-outline-warning"}`} onClick={() => setFilter("all")}  >
          🍽 All
        </button>
        <button className={`btn rounded-pill px-4 ${filter === "top" ? "btn-warning text-dark" : "btn-outline-warning"}`} onClick={() => setFilter("top")}>
          ⭐ Top Rated
        </button>
        <button className={`btn rounded-pill px-4 ${filter === "cheap" ? "btn-warning text-dark" : "btn-outline-warning"}`} onClick={() => setFilter("cheap")} >
          💸 Under ₹60
        </button>
      </div>
      {filteredMenus.length === 0 ? (
        <div className="text-center mt-5">
          <h3>
            🍽 No Menu Available
          </h3>
          <p className="text-secondary">
            This restaurant doesn't have
            any menu items yet.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredMenus.map((item) => (
            <div className="col-lg-4 col-md-6" key={item._id}  >
              <div className="card bg-dark text-light border-0 shadow-lg h-100 menu-card" style={{ borderRadius: "18px", overflow: "hidden", transition: ".3s" }} >
                <div className="position-relative">
                  <img src={item.image} alt={item.dish} className="w-100" style={{ height: "190px", objectFit: "cover" }} />
                  <button className="btn position-absolute top-0 end-0 m-3 p-0" style={{ background: "rgba(0, 0, 0, 0.45)", border: "none", width: "42px", height: "42px", borderRadius: "50%", fontSize: "1.35rem", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", transition: "transform 0.2s ease" }} onClick={(e) => {
                    e.stopPropagation()
                    toggleFavourite(item)
                  }} >
                    {menuFavoriteIds.includes(item._id) ? "❤️" : "🤍"}
                  </button>
                  <div className="position-absolute bottom-0 start-0 p-3" >
                    {item.isAvailable ? (
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
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="fw-bold mb-1">
                        {item.dish}
                      </h5>
                      <p className="text-secondary mb-3" style={{ minHeight: "45px" }} >
                        {item.description || "No description available."}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="text-warning fw-bold mb-0">
                      ₹{item.price}
                    </h4>
                    {item.price <= 60 && (
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
      <div className="mt-5">
        <ReviewForm place={restaurant?.name} onReviewAdded={() => window.location.reload()} setShowAuthModal={setShowAuthModal} />
      </div>
      <div className="mt-4">
        <ReviewList place={restaurant?.name} />
      </div>
    </div>

  )
}
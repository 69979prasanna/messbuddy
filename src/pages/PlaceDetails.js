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
import { FaStar, FaUtensils } from "react-icons/fa"
import { FiArrowLeft, FiClock, FiMapPin, FiExternalLink } from "react-icons/fi"
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
      <button
        className="btn btn-sm btn-outline-secondary text-light px-3 mb-4 rounded-2 d-inline-flex align-items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft /> Back
      </button>
      {/* Restaurant Hero & Location Section */}
      <div className="row g-3 g-lg-4 mb-4 align-items-stretch">
        <div className="col-lg-8">
          <div className="restaurant-hero position-relative overflow-hidden rounded-4 shadow-sm h-100">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-100 h-100 position-absolute top-0 start-0"
              style={{ objectFit: "cover" }}
            />
            <div
              className="position-absolute top-0 start-0 w-100 h-100 hero-overlay"
              style={{
                background:
                  "linear-gradient(to top, rgba(11, 17, 32, 0.95) 0%, rgba(11, 17, 32, 0.6) 45%, rgba(0, 0, 0, 0.25) 100%)",
              }}
            />
            <div
              className="position-relative p-4 p-md-4 d-flex flex-column justify-content-end h-100"
              style={{ minHeight: "250px" }}
            >
              <h1 className="fw-bold text-white mb-2 fs-2">
                {restaurant?.name || "Loading..."}
              </h1>
              <div className="hero-meta-row d-flex flex-wrap align-items-center gap-2 text-light-50 small">
                <span className="d-inline-flex align-items-center text-white fw-semibold">
                  <FaStar className="text-warning me-1" style={{ fontSize: "0.85rem" }} />
                  {(restaurant?.averageRating ?? 0).toFixed(1)}
                </span>
                <span className="meta-separator text-secondary opacity-50">·</span>
                <span>{menus.length} items</span>
                <span className="meta-separator text-secondary opacity-50">·</span>
                <span className="text-light">₹{avgPrice.toFixed(0)} avg</span>
                <span className="meta-separator text-secondary opacity-50">·</span>
                <span className="d-inline-flex align-items-center gap-1">
                  <FiClock className="opacity-75" />
                  {restaurant.openingTime} – {restaurant.closingTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="location-card position-relative overflow-hidden rounded-4 shadow-sm">
            <div className="location-background">
              <div className="location-grid"></div>
              <div className="location-pin-container">
                <div className="location-ripple"></div>
                <div className="location-pin">
                  <FiMapPin className="text-info" />
                </div>
              </div>
            </div>
            <div className="location-overlay"></div>
            <div className="location-content">
              <div>
                <h4 className="location-heading text-white fw-semibold mb-1 d-flex align-items-center gap-1">
                  <FiMapPin className="text-info opacity-75" style={{ fontSize: "0.95rem" }} />
                  Location
                </h4>
                <p className="location-address mb-3">
                  {restaurant.address || "View restaurant location"}
                </p>
              </div>
              <div>
                <a
                  href={
                    restaurant.googleMapsUrl ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${restaurant.name}, ${restaurant.address || ""}`
                    )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-google-maps"
                >
                  <FiExternalLink style={{ fontSize: "0.85rem" }} />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Live Meal Period Status */}
      <LiveMealStatus
        weeklySchedule={restaurant.weeklySchedule}
        restaurantName={restaurant.name}
        menus={menus}
        setShowAuthModal={setShowAuthModal}
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
          <h3 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <FaUtensils className="text-secondary opacity-75" style={{ fontSize: "1.05rem" }} />
            Full Restaurant Menu
          </h3>
          <p className="text-secondary mb-0 small">
            Explore all individual items, prices, and availability
          </p>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="form-control restaurant-search"
          placeholder="Search dish name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          className={`btn btn-sm px-3 rounded-2 ${filter === "all" ? "btn-warning text-dark fw-semibold" : "btn-outline-secondary text-light"}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`btn btn-sm px-3 rounded-2 d-inline-flex align-items-center gap-1 ${filter === "top" ? "btn-warning text-dark fw-semibold" : "btn-outline-secondary text-light"}`}
          onClick={() => setFilter("top")}
        >
          <FaStar style={{ fontSize: "0.75rem" }} /> Top Rated
        </button>
        <button
          className={`btn btn-sm px-3 rounded-2 ${filter === "cheap" ? "btn-warning text-dark fw-semibold" : "btn-outline-secondary text-light"}`}
          onClick={() => setFilter("cheap")}
        >
          Under ₹60
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
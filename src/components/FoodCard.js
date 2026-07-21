import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  addFavorite,
  removeFavorite,
  isFavorite,
} from "../utils/favorites"
export default function FoodCard({
  food, setShowAuthModal,}) {
  const navigate = useNavigate()
  const [fav, setFav] = useState(false)
  useEffect(() => {
    if (food?._id) {
      setFav(isFavorite(food._id))
    } else {
      setFav(false)
    }
  }, [food])
  const toggleFavorite = (e) => {
    e.stopPropagation()
    const token = localStorage.getItem("token")
    if (!token) {
      setShowAuthModal(true)
      return
    }
    if (!food) return
    if (fav) {
      removeFavorite(food._id)
    } else {
      addFavorite({
        id: food._id,
        name: food.name,
        featuredDish: food.featuredDish,
        featuredPrice: food.featuredPrice,
        image: food.image,
        averageRating: food.averageRating,
      })
    }

    setFav(isFavorite(food._id))
  }

  const getStatus = () => {
    if (!food?.openingTime || !food?.closingTime) {
      return {
        open: false,
        closingSoon: false,
      }
    }

    const now = new Date()
    const currentMinutes =
      now.getHours() * 60 + now.getMinutes()
    const [openHour, openMinute] =
      food.openingTime.split(":").map(Number)
    const [closeHour, closeMinute] =
      food.closingTime.split(":").map(Number)
    const openMinutes = openHour * 60 + openMinute
    const closeMinutes = closeHour * 60 + closeMinute
    const open =
      currentMinutes >= openMinutes &&
      currentMinutes < closeMinutes
    const closingSoon =
      open &&
      closeMinutes - currentMinutes <= 30
    return {
      open,
      closingSoon,
    }
  }

  const { open, closingSoon } = getStatus()
  const openPlace = () => {
    navigate(`/place/${food._id}`)
  }
  if (!food) return null
    return (
  <div
    className="card bg-dark text-light shadow food-card border-0"
    style={{
      cursor: "pointer",
      borderRadius: "16px",
      overflow: "hidden",
      transition: "0.25s",
    }}
    onClick={openPlace}
  >
    <div className="position-relative">

      <img
        src={food.image}
        alt={food.name}
        className="w-100"
        style={{
          height: "190px",
          objectFit: "cover",
        }}
      />

      <button
        onClick={toggleFavorite}
        className="btn position-absolute top-0 end-0 m-2 p-0"
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1.5rem",
        }}
      >
        {fav ? "❤️" : "🤍"}
      </button>

      <div
        className="position-absolute bottom-0 start-0 w-100 px-3 py-2"
        style={{
          background:
            "linear-gradient(transparent, rgba(0,0,0,.88))",
        }}
      >
        <div className="d-flex justify-content-between align-items-center">

          <h5 className="text-white fw-bold mb-0">
            {food.name}
          </h5>

          <span className="badge bg-success fs-6">
            ⭐ {(food.averageRating ?? 0).toFixed(1)}
          </span>
        </div>
      </div>
    </div>

    <div className="card-body">

      <div className="d-flex justify-content-between align-items-center mb-3">

        <span className="text-info">
          🍽 {food.featuredDish}
        </span>

        <span
          className="fw-bold text-warning"
          style={{ fontSize: "1.15rem" }}
        >
          ₹{food.featuredPrice}
        </span>

      </div>

      <div className="mb-3">

        {!open && (
          <span className="badge rounded-pill bg-danger px-3 py-2">
            🔴 Closed
          </span>
        )}
        {open && !closingSoon && (
          <span className="badge rounded-pill bg-success px-3 py-2">
            🟢 Open
          </span>
        )}
        {closingSoon && (
          <span className="badge rounded-pill bg-warning text-dark px-3 py-2">
            ⚠️ Closing Soon
          </span>
        )}
      </div>
      {food.tags?.length > 0 && (
        <div className="d-flex flex-wrap gap-2">

          {food.tags.map((tag) => (
            <span key={tag} className="badge rounded-pill bg-secondary">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
)
}
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  addFavorite,
  removeFavorite,
  isFavorite,
} from "../utils/favorites"
export default function FoodCard({
  food,
  onVote,
  userVote,
  setShowAuthModal,
}) {
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
  const handleUpvote = (e) => {
    e.stopPropagation()
    const token = localStorage.getItem("token")
    if (!token) {
      setShowAuthModal(true)
      return
    }
    onVote?.(food._id, "up")
  }
  const handleDownvote = (e) => {
    e.stopPropagation()
    const token = localStorage.getItem("token")
    if (!token) {
      setShowAuthModal(true)
      return
    }
    onVote?.(food._id, "down")
  }
  if (!food) return null
    return (
    <div
      className="card bg-dark text-light shadow-sm h-100 position-relative"
      style={{
        cursor: "pointer",
        borderRadius: "12px",
      }}
      onClick={openPlace}
    >
      <button
        onClick={toggleFavorite}
        className="btn position-absolute top-0 end-0 m-2"
        style={{
          fontSize: "1.4rem",
          border: "none",
          background: "transparent",
          zIndex: 10,
        }}
      >
        {fav ? "❤️" : "🤍"}
      </button>

      {food.image && (
        <img
          src={food.image}
          alt={food.name}
          className="card-img-top"
          style={{
            height: "220px",
            objectFit: "cover",
          }}
        />
      )}

      <div className="card-body d-flex flex-column">

        <h5 className="fw-bold">
          {food.name}
        </h5>

        <h6 className="text-info">
          🍽 {food.featuredDish}
        </h6>

        <p className="mb-2">
          💰 ₹{food.featuredPrice}
        </p>

        <div className="mb-2">

          {!open && (
            <span className="badge bg-danger">
              🔴 Closed
            </span>
          )}

          {open && !closingSoon && (
            <span className="badge bg-success">
              🟢 Open
            </span>
          )}

          {closingSoon && (
            <span className="badge bg-warning text-dark">
              ⚠️ Closing Soon
            </span>
          )}

        </div>

        <p className="mb-2">
          ⭐ {(food.averageRating ?? 0).toFixed(1)}
        </p>

        {food.tags?.length > 0 && (
          <div className="mb-3">

            {food.tags.map((tag) => (
              <span
                key={tag}
                className="badge bg-secondary me-1"
              >
                {tag}
              </span>
            ))}

          </div>
        )}

        {onVote && (
          <div className="d-flex gap-2 mt-auto">

            <button
              className={`btn btn-sm ${
                userVote === "up"
                  ? "btn-success"
                  : "btn-outline-light"
              }`}
              onClick={handleUpvote}
            >
              👍 {food.upvotes ?? 0}
            </button>
            <button
              className={`btn btn-sm ${
                userVote === "down"
                  ? "btn-danger"
                  : "btn-outline-light"
              }`}
              onClick={handleDownvote}
            >
              👎 {food.downvotes ?? 0}
            </button>
          </div>
        )}
        {(food.downvotes ?? 0) >= 3 && (
          <div className="alert alert-danger mt-3 py-2 mb-0">
            ⚠️ Not recommended today
          </div>
        )}
      </div>
    </div>
  )
}
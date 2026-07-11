import { useNavigate } from "react-router-dom"
import { restaurantTimings } from "../data/restaurantTimings"
import { useState, useEffect } from "react"
import {
  addFavorite,
  removeFavorite,
  isFavorite,
} from "../utils/favorites"

export default function FoodCard({ food, onVote, userVote, setShowAuthModal }) {
  const navigate = useNavigate()

  const [fav, setFav] = useState(false)

 useEffect(() => {
  if (food?.id) {
    setFav(isFavorite(food.id));
  } else {
    setFav(false);
  }
}, [food])

  const toggleFavorite = (e) => {
    e.stopPropagation()
    console.log("heart clicked")
    const token = localStorage.getItem("token")
     console.log("token:", token)

    if(!token){
      console.log("no token")
      setShowAuthModal(true)
      return
    }
    if (!food) return

    if (fav) {
  removeFavorite(food.id);
} else {
  addFavorite(food);
}

const updatedFav = isFavorite(food.id);
setFav(updatedFav)
  }

  const normalize = (str) => str?.trim().toLowerCase()

  const getStatus = (source) => {
    const timing = restaurantTimings[normalize(source)]
    if (!timing) return { open: false, closingSoon: false }

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const [openH, openM] = timing.open.split(":").map(Number)
    const [closeH, closeM] = timing.close.split(":").map(Number)

    const openMinutes = openH * 60 + openM
    const closeMinutes = closeH * 60 + closeM

    const open =
      currentMinutes >= openMinutes &&
      currentMinutes < closeMinutes

    const closingSoon =
      open && closeMinutes - currentMinutes <= 30

    return { open, closingSoon }
  }

  const { open, closingSoon } = getStatus(food?.source)

  const openPlace = () => {
    if (!food) return
    navigate(`/place/${encodeURIComponent(food.source)}`)
  }

  const handleUpvote = (e) => {
    e.stopPropagation()
    const token = localStorage.getItem("token")

  if (!token) {
    setShowAuthModal(true)
    return
  }
    onVote?.(food?.id, "up")
  }

  const handleDownvote = (e) => {
    e.stopPropagation()
    const token = localStorage.getItem("token")

  if (!token) {
    setShowAuthModal(true)
    return
  }
    onVote?.(food?.id, "down")
  }

  if (!food) return null

  return (
    <div
      className="card bg-dark text-light shadow-sm h-100 position-relative"
      style={{ cursor: "pointer", borderRadius: "12px" }}
      onClick={openPlace}
    >
  
      <button
        onClick={toggleFavorite}
        className="btn position-absolute top-0 end-0 m-2"
        style={{ fontSize: "1.3rem", border: "none", background: "transparent" }}
      >
        {fav ? "❤️" : "🤍"}
      </button>

      <div className="card-body">
        <h5>{food.source}</h5>
        <h6>{food.dish}</h6>

        <div className="mb-2">
          {!open && <span className="badge bg-danger">🔴 Closed</span>}
          {open && !closingSoon && <span className="badge bg-success">🟢 Open</span>}
          {closingSoon && <span className="badge bg-warning text-dark">⚠️ Closing Soon</span>}
        </div>

        <p>💰 ₹{food.price}</p>
        <p>⭐ {food.rating}</p>

        {onVote && (
          <div className="d-flex gap-2">
            <button
              className={`btn btn-sm ${
                userVote === "up" ? "btn-success" : "btn-outline-light"
              }`}
              onClick={handleUpvote}
            >
              👍 {food.upvotes}
            </button>

            <button
              className={`btn btn-sm ${
                userVote === "down" ? "btn-danger" : "btn-outline-light"
              }`}
              onClick={handleDownvote}
            >
              👎 {food.downvotes}
            </button>
          </div>
        )}

        {food.downvotes >= 3 && (
          <div className="alert alert-danger mt-2 py-1">
            ⚠️ Not recommended today
          </div>
        )}
      </div>
    </div>
  )
}
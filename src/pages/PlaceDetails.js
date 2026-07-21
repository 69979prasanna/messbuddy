import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  addFavorite,
  removeFavorite,
  isFavorite,
} from "../utils/favorites"
import "../styles/PlaceDetails.css"
import ReviewForm from "../components/ReviewForm"
import ReviewList from "../components/ReviewList"

const API = process.env.REACT_APP_APIKEY

export default function PlaceDetails({ setShowAuthModal }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [restaurant, setRestaurant] = useState(null)
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)

  const [favoriteIds, setFavoriteIds] = useState([])

  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const favs =
      JSON.parse(localStorage.getItem("favorites")) || []

    setFavoriteIds(favs.map((item) => item.id))
  }, [])

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true)
        const restaurantRes = await fetch(
          `${API}/restaurants/${id}`
        )

        if (!restaurantRes.ok) {
          throw new Error("Restaurant not found")
        }

        const restaurantData =
          await restaurantRes.json()
        setRestaurant(restaurantData)
        const menuRes = await fetch(
          `${API}/menus/restaurant/${id}`
        )
        if (!menuRes.ok) {
          throw new Error("Couldn't load menu")
        }
        const menuData = await menuRes.json()
        setMenus(menuData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [id])

  const toggleFavourite = (item) => {
    const token = localStorage.getItem("token")

    if (!token) {
      setShowAuthModal(true)
      return
    }

    if (isFavorite(item._id)) {

      removeFavorite(item._id)

      setFavoriteIds((prev) =>
        prev.filter((favId) => favId !== item._id)
      )

    } else {

      addFavorite({
        id: item._id,
        place: restaurant?.name,
        dish: item.dish,
        price: item.price,
        rating: item.rating,
        image: item.image,
      })

      setFavoriteIds((prev) => [
        ...prev,
        item._id,
      ])
    }
  }

  const filteredMenus = (
    filter === "top"
      ? menus.filter((item) => item.rating >= 4.3)
      : filter === "cheap"
      ? menus.filter((item) => item.price <= 60)
      : menus
  ).filter((item) =>
    item.dish
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const avgPrice =
    menus.length > 0
      ? menus.reduce(
          (sum, item) => sum + item.price,
          0
        ) / menus.length
      : 0
        return (
  <div className="container py-4 text-light">

    <button
      className="btn btn-outline-light rounded-pill px-4 mb-4"
      onClick={() => navigate(-1)}
    >
      ← Back
    </button>
    <div
      className="position-relative overflow-hidden rounded-4 shadow-lg mb-4"
      style={{
        height: "300px",
        backgroundImage: `url(${restaurant?.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background:
            "linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.92))",
        }}
      />
      <div className="position-absolute bottom-0 start-0 w-100 p-4">
        <div className="d-flex justify-content-between align-items-end flex-wrap">
          <div>
            <h1 className="fw-bold text-white mb-2">
              {restaurant?.name || "Loading..."}
            </h1>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-success px-3 py-2 fs-6">
                ⭐ {(restaurant?.averageRating ?? 0).toFixed(1)}
              </span>
              <span className="badge bg-dark border border-secondary px-3 py-2">
                🍽 {menus.length} Items
              </span>

              <span className="badge bg-warning text-dark px-3 py-2">
                ₹{avgPrice.toFixed(0)} Avg Price
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="input-group mb-4">
      <span className="input-group-text bg-dark text-light border-secondary">
        🔍
      </span>
      <input
        type="text"
        className="form-control bg-dark text-light border-secondary"
        placeholder="Search your favourite dish..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

    </div>

    <div className="d-flex flex-wrap gap-3 mb-4">

      <button
        className={`btn rounded-pill px-4 ${
          filter === "all"
            ? "btn-warning text-dark"
            : "btn-outline-warning"
        }`}
        onClick={() => setFilter("all")}
      >
        🍽 All
      </button>

      <button
        className={`btn rounded-pill px-4 ${
          filter === "top"
            ? "btn-success"
            : "btn-outline-success"
        }`}
        onClick={() => setFilter("top")}
      >
        ⭐ Top Rated
      </button>

      <button
        className={`btn rounded-pill px-4 ${
          filter === "cheap"
            ? "btn-info text-dark"
            : "btn-outline-info"
        }`}
        onClick={() => setFilter("cheap")}
      >
        💸 Budget
      </button>

    </div>
      {loading ? (
        <div className="text-center py-5">
          <div
            className="spinner-border text-info"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>
          <p className="mt-3">
            Loading Menu...
          </p>
        </div>
      ) : filteredMenus.length === 0 ? (
        <div className="text-center mt-5">
          <h3>🍽 No Menu Available</h3>
          <p className="text-secondary">
            This restaurant doesn't have any menu items yet.
          </p>
        </div>
      ) : (
        <div className="row g-4">

  {filteredMenus.map((item) => (

    <div
      className="col-lg-4 col-md-6"
      key={item._id}
    >

      <div
        className="card bg-dark text-light border-0 shadow-lg h-100 menu-card"
        style={{
          borderRadius: "18px",
          overflow: "hidden",
          transition: ".3s",
        }}
      >
        <div className="position-relative">

          <img
            src={item.image}
            alt={item.dish}
            className="w-100"
            style={{
              height: "190px",
              objectFit: "cover",
            }}
          />
          <button
            className="btn position-absolute top-0 end-0 m-3 p-0"
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.6rem",
            }}
            onClick={(e) => {
              e.stopPropagation()
              toggleFavourite(item)
            }}
          >
            {favoriteIds.includes(item._id)
              ? "❤️"
              : "🤍"}
          </button>

          <div
            className="position-absolute bottom-0 start-0 p-3"
          >

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

              <p
                className="text-secondary mb-3"
                style={{
                  minHeight: "45px",
                }}
              >
                {item.description}
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
        <ReviewForm
          place={restaurant?.name}
          onReviewAdded={() => window.location.reload()}
          setShowAuthModal={setShowAuthModal}
        />
      </div>
      <div className="mt-4">
        <ReviewList
          place={restaurant?.name}
        />
      </div>
    </div>
  )
}
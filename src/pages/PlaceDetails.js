import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  addFavorite,
  removeFavorite,
  isFavorite,
} from "../utils/favorites"

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
        className="btn btn-outline-light mb-4"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <div className="mb-4">
        <h2 className="fw-bold">
          {restaurant?.name || "Loading..."}
        </h2>
        <p className="text-secondary mb-2">
          {menus.length} items · Avg price ₹{avgPrice.toFixed(0)}
        </p>
        <input
          type="text"
          className="form-control bg-dark text-light border-secondary mb-3"
          placeholder="🔍 Search dish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="d-flex gap-2 flex-wrap">
          <button
            className={`btn btn-sm ${
              filter === "all"
                ? "btn-info"
                : "btn-outline-info"
            }`}
            onClick={() => setFilter("all")}
          >
            🍽 All
          </button>
          <button
            className={`btn btn-sm ${
              filter === "top"
                ? "btn-success"
                : "btn-outline-success"
            }`}
            onClick={() => setFilter("top")}
          >
            ⭐ Top Rated
          </button>
          <button
            className={`btn btn-sm ${
              filter === "cheap"
                ? "btn-warning"
                : "btn-outline-warning"
            }`}
            onClick={() => setFilter("cheap")}
          >
            💸 Budget
          </button>
        </div>
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
        <div className="row g-3">
          {filteredMenus.map((item) => (
            <div
              className="col-md-4 col-sm-6"
              key={item._id}
            >
              <div className="card bg-dark text-light shadow-sm h-100 position-relative">
                <button className="btn position-absolute top-0 end-0 m-2" style={{ border: "none", background: "transparent", fontSize: "1.4rem", zIndex: 2}}
                  onClick={() => toggleFavourite(item)}
                >
                  {favoriteIds.includes(item._id)
                    ? "❤️"
                    : "🤍"}
                </button>
                {item.image && (
                  <img src={item.image} alt={item.dish} className="card-img-top" style={{   height: "220px",   objectFit: "cover"}}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="fw-bold">
                    {item.dish}
                  </h5>
                  <p className="text-secondary">
                    {item.description}
                  </p>
                  <p>
                    💰 ₹{item.price}
                  </p>
                  <p>
                    ⭐ {item.rating}
                  </p>
                  <div className="mb-3">
                    {item.isAvailable ? (
                      <span className="badge bg-success">
                        Available
                      </span>
                    ) : (
                      <span className="badge bg-danger">
                        Out of Stock
                      </span>
                    )}
                    {item.price <= 60 && (
                      <span className="badge bg-warning text-dark ms-2">
                        💸 Budget
                      </span>
                    )}
                    {item.rating >= 4.3 && (
                      <span className="badge bg-info text-dark ms-2">
                        ⭐ Top Pick
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
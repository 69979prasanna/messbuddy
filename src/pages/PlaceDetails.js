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

  const { name } = useParams()
  const navigate = useNavigate()
  const placeName = decodeURIComponent(name)
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [favoriteIds, setFavoriteIds] = useState([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {

    const favs =
      JSON.parse(localStorage.getItem("favorites")) || []
    setFavoriteIds(favs.map(item => item.id))
  }, [])

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true)
        const restaurantRes = await fetch(
          `${API}/restaurants`
        )

        const restaurants = await restaurantRes.json()
        const restaurant = restaurants.find(
          r => r.name === placeName
        )

        if (!restaurant) {
          setMenus([])
          setLoading(false)
          return
        }
        const menuRes = await fetch(
          `${API}/menus/restaurant/${restaurant._id}`
        )
        const data = await menuRes.json()
        setMenus(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMenus()
  }, [placeName])

  const toggleFavourite = (item) => {

    const token = localStorage.getItem("token")

    if (!token) {
      setShowAuthModal(true)
      return
    }

    if (isFavorite(item._id)) {
      removeFavorite(item._id)
      setFavoriteIds(prev =>
        prev.filter(id => id !== item._id)
      )
    } else {

      addFavorite({
        id: item._id,
        place: placeName,
        dish: item.dish,
        price: item.price,
        rating: item.rating,
        image: item.image,
      })

      setFavoriteIds(prev => [
        ...prev,
        item._id,
      ])
    }
  }

  const filteredMenus = (
    filter === "top"
      ? menus.filter(item => item.rating >= 4.3)
      : filter === "cheap"
      ? menus.filter(item => item.price <= 60)
      : menus
  ).filter(item =>
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

      <div className="mb-3">

        <h2 className="fw-bold">
          {placeName}
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

        <div className="d-flex gap-2">

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
            💸 Cheap
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

      ) : (
        <div className="row g-3">

          {filteredMenus.map((item) => (

            <div
              className="col-md-4 col-sm-6"
              key={item._id}
            >

              <div className="card bg-dark text-light h-100 shadow-sm position-relative">

                <button
                  className="btn position-absolute top-0 end-0 m-2"
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "1.4rem",
                    zIndex: 2,
                  }}
                  onClick={() => toggleFavourite(item)}
                >
                  {favoriteIds.includes(item._id)
                    ? "❤️"
                    : "🤍"}
                </button>

                {item.image && (
                  <img
                    src={item.image}
                    alt={item.dish}
                    className="card-img-top"
                    style={{
                      height: "220px",
                      objectFit: "cover",
                    }}
                  />
                )}

                <div className="card-body">

                  <h5 className="card-title fw-bold">
                    {item.dish}
                  </h5>

                  <p className="mb-2 text-secondary">
                    {item.description}
                  </p>

                  <p className="mb-1">
                    💰 ₹{item.price}
                  </p>

                  <p className="mb-2">
                    ⭐ {item.rating}
                  </p>

                  {!item.isAvailable ? (

                    <span className="badge bg-danger">
                      Out of Stock
                    </span>

                  ) : (

                    <span className="badge bg-success">
                      Available
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
          ))}
        </div>

      )}
      {!loading && filteredMenus.length === 0 && (
        <div className="text-center mt-5">

          <h4>
            🍽 No Menu Available
          </h4>

          <p className="text-secondary">
            This restaurant doesn't have any menu items yet.
          </p>
        </div>
      )}
      <ReviewForm
        place={placeName}
        onReviewAdded={() => window.location.reload()}
        setShowAuthModal={setShowAuthModal}
      />
      <ReviewList place={placeName} />
    </div>
  )
}
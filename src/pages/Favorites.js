import { useEffect, useState } from "react"
import { getFavorites } from "../utils/favorites"
import FoodCard from "../components/home/FoodCard"
export default function Favorites({ setShowAuthModal }) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    loadFavorites()
  }, [])
  const loadFavorites = async () => {
    try {
      setLoading(true)
      const data = await getFavorites()
      setFavorites(data.map((fav) => fav.restaurant))
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
        <p className="mt-3">Loading Favorites...</p>
      </div>
    )
  }
  return (
    <div className="container py-4 text-light">
      <h2 className="fw-bold mb-4">
        ❤️ My Favorites
      </h2>
      {favorites.length === 0 ? (
        <div className="text-center mt-5">
          <h4>No Favorites Yet</h4>
          <p className="text-secondary">
            Tap the ❤️ icon on any restaurant to add it here.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {favorites.map((restaurant) => (
            <div className="col-lg-4 col-md-6" key={restaurant._id}>
              <FoodCard food={restaurant} setShowAuthModal={setShowAuthModal} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
import { useState, useEffect } from "react"
import FoodCard from "./FoodCard"

const API = process.env.REACT_APP_APIKEY

export default function BestToday({ setShowAuthModal }) {
  const [foods, setFoods] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [userVotes, setUserVotes] = useState({})

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch(`${API}/restaurants`)
        if (!res.ok) {
          throw new Error("Failed to fetch restaurants")
        }
        const data = await res.json()
        const restaurants = data.map((restaurant) => ({
          ...restaurant,
          upvotes: 0,
          downvotes: 0,
        }))
        setFoods(restaurants)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  useEffect(() => {
    const savedVotes =
      JSON.parse(localStorage.getItem("votes")) || {}

    setUserVotes(savedVotes)
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "votes",
      JSON.stringify(userVotes)
    )
  }, [userVotes])

  const handleVote = (id, type) => {
    const prevVote = userVotes[id]

    setFoods((prev) =>
      prev.map((food) => {
        if (food._id !== id) return food

        let upvotes = food.upvotes || 0
        let downvotes = food.downvotes || 0

        if (prevVote === type) {
          if (type === "up") upvotes--
          else downvotes--
        } else if (prevVote) {
          if (prevVote === "up") {
            upvotes--
            downvotes++
          } else {
            downvotes--
            upvotes++
          }
        } else {
          if (type === "up") upvotes++
          else downvotes++
        }

        return {
          ...food,
          upvotes: Math.max(0, upvotes),
          downvotes: Math.max(0, downvotes),
        }
      })
    )

    setUserVotes((prev) => {
      if (prevVote === type) {
        const updated = { ...prev }
        delete updated[id]
        return updated
      }

      return {
        ...prev,
        [id]: type,
      }
    })
  }

  const filteredRestaurants = foods.filter((restaurant) =>
    restaurant.name
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <>
      <input
        className="form-control bg-dark text-light border-secondary mb-3"
        placeholder="🔍 Search restaurant"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
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
          <p className="mt-3 text-light">
            Loading restaurants...
          </p>
        </div>
      ) : (<div className="row g-3">
          {filteredRestaurants.length === 0 ? (
            <p className="text-light">
              No restaurants found.
            </p>
          ) : (filteredRestaurants.map((restaurant) => (
              <div
                className="col-md-4 col-sm-6"
                key={restaurant._id}
              >
                <FoodCard
                  food={restaurant}
                  onVote={handleVote}
                  userVote={userVotes[restaurant._id]}
                  setShowAuthModal={setShowAuthModal}
                />
              </div>
            ))
          )}
        </div>
      )}
    </>
  )
}
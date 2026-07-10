import { useState, useEffect } from "react"
import FoodCard from "./FoodCard"
import { foodData } from "../data/foodData"

export default function BestToday({setShowAuthModal}) {
  const [search, setSearch] = useState("")


  const [foods, setFoods] = useState(
    foodData.map(item => ({
      ...item,
      upvotes: item.upvotes || 0,
      downvotes: item.downvotes || 0
    }))
  )

  const [userVotes, setUserVotes] = useState({})


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

    setFoods(prev =>
      prev.map(food => {
        if (food.id !== id) return food

        let { upvotes, downvotes } = food

        if (prevVote === type) {

          if (type === "up") upvotes--
          if (type === "down") downvotes--
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
          if (type === "down") downvotes++
        }

        return {
          ...food,
          upvotes: Math.max(0, upvotes),
          downvotes: Math.max(0, downvotes)
        }
      })
    )

    setUserVotes(prev => {
      if (prevVote === type) {
        const updated = { ...prev }
        delete updated[id]
        return updated
      }
      return { ...prev, [id]: type }
    })
  }


  const filteredPlaces = foods.filter(place =>
    place.source.toLowerCase().includes(search.toLowerCase())
    
  )

  return (
    <>
 
      <input
        className="form-control bg-dark text-light border-secondary mb-3"
        placeholder="🔍 Search restaurant"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

 
   <div className="row g-3">
  {filteredPlaces.length === 0 ? (
    <p className="text-light">No results found</p>
  ) : (
    filteredPlaces.map(place => (
      <div
        className="col-md-4 col-sm-6"
        key={place.id}
      >
        <FoodCard
          food={place}
          onVote={handleVote}
          userVote={userVotes[place.id]}
           setShowAuthModal={setShowAuthModal}
        />
      </div>
    ))
  )}
</div>
    </>
  )
}
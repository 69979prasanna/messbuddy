import { useEffect, useState } from "react"
import FeedbackCard from "../../components/admin/FeedbackCard"

const API = process.env.REACT_APP_APIKEY

export default function FeedbackManager() {

  const [reviews, setReviews] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {

      const res = await fetch(`${API}/feedback`)
      const data = await res.json()
      setReviews(data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteReview = async (id) => {

    if (!window.confirm("Delete this review?"))
      return
    await fetch(`${API}/feedback/${id}`, {
      method: "DELETE",
    })
    setReviews(prev =>
      prev.filter(r => r._id !== id)
    )
  }

  const filtered = reviews.filter(review =>

    (review.name || "")
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    (review.email || "")
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    (review.type || "")
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    (review.message || "")
      .toLowerCase()
      .includes(search.toLowerCase())

  )
  return (

    <div className="container py-5">
      <h1 className="text-white fw-bold mb-4">
        ⭐ Feedback Manager
      </h1>
      <input className="menu-search mb-4" placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {loading ? (
        <h4 className="text-white">
          Loading...
        </h4>
      ) : (
        <div className="row">
          {filtered.map(review => (

            <FeedbackCard
              key={review._id}
              feedback={review}
              onDelete={deleteReview}
            />
          ))}
        </div>
      )}
    </div>
  )
}
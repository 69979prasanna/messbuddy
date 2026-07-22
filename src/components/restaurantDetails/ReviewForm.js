import { useState } from "react"

export default function ReviewForm({ place, onReviewAdded, setShowAuthModal }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  const submitReview = async (e) => {
  e.preventDefault()
const token = localStorage.getItem("token")

if (!token) {
  setShowAuthModal(true)
  return
}
const api = process.env.REACT_APP_APIKEY

  const res = await fetch(`${api}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      place,
      rating,
      comment,
    }),
  })

  
  const data = await res.json()
  
  if (res.status === 401) {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  
    setShowAuthModal(true)
    return
  }
  console.log("Status:", res.status)
  console.log("Response:", data)
  if (!res.ok) {
  alert(data.message)
  return
}
  if (res.ok) {
    setComment("")
    setRating(5)

    onReviewAdded()
  }
}

  return (
    <form onSubmit={submitReview} className="mb-4">

      <div className="mb-3 text-center">
  {[1,2,3,4,5].map((star)=>(
    <span
      key={star}
      onClick={()=>setRating(star)}
      style={{
        fontSize:"2rem",
        cursor:"pointer",
        color: star<=rating ? "#FFD700" : "#666",
        transition:"0.2s"
      }}
    >
      ★
    </span>
  ))}
</div>

    <textarea
  className="form-control bg-dark text-light border-secondary"
  rows="4"
  placeholder="Share your experience..."
  value={comment}
  onChange={(e)=>setComment(e.target.value)}
/>

     <div className="d-flex justify-content-center mt-4">
  <button
    className="btn btn-primary fw-bold px-5 py-2 rounded-pill"
  >
    ⭐ Submit Review
  </button>
</div>

    </form>
  )
}
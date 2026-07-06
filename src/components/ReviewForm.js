import { useState } from "react";

export default function ReviewForm({ place, onReviewAdded }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submitReview = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/reviews", {
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
  });

  const data = await res.json();

  console.log("Status:", res.status);
  console.log("Response:", data);

  if (res.ok) {
    setComment("");
    setRating(5);

    onReviewAdded();
  }
};

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

      <button className="btn btn-primary fw-bold mt-3 w-100">
        Submit Review
      </button>

    </form>
  );
}
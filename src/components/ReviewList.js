import { useEffect, useState, useCallback } from "react";

export default function ReviewList({ place }) {
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [editComment, setEditComment] = useState("")
  const [editRating, setEditRating] = useState(5)

  const currentUser = JSON.parse(localStorage.getItem("user"))
  const api = process.env.REACT_APP_APIKEY
  const fetchReviews = useCallback(async () => {
  try {
    const res = await fetch(
      `${api}/reviews/${encodeURIComponent(place)}`
    );

    const data = await res.json();

    setReviews(data.reviews || []);
    setAverageRating(data.averageRating);
    setTotalReviews(data.totalReviews);

  } catch (err) {
    console.error(err);
  }
}, [place, api])

useEffect(() => {
  fetchReviews();
}, [fetchReviews]);
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token")

    const res = await fetch(
      `${api}/reviews/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      fetchReviews()
    }
  }

  const handleEdit = (review) => {
  setEditingId(review._id)
  setEditComment(review.comment)
  setEditRating(review.rating)
}
const handleSave = async () => {
  const token = localStorage.getItem("token")

  const res = await fetch(
    `${api}/reviews/${editingId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        rating: editRating,
        comment: editComment,
      }),
    }
  )

  if (res.ok) {
    await res.json()

    setEditingId(null)

   fetchReviews()
  }
}
const handleCancel = () => {
  setEditingId(null)
}

  return (
    <div className="mt-5">

      <div className="mb-4 text-center">

  <h2 className="text-warning mb-1">
    ⭐ {averageRating}/5
  </h2>

  <p className="text-secondary">
    {totalReviews} Reviews
  </p>

</div>

      {reviews.length === 0 ? (
        <p className="text-secondary">
          No reviews yet.
        </p>
      ) : (
        <div className="row g-4">

          {reviews.map((review) => (
            <div
              className="col-lg-6"
              key={review._id}
            >
              <div
                className="card bg-dark text-light border-secondary shadow h-100"
                style={{ borderRadius: "15px" }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">

                    <div>
                      <h5 className="mb-1 fw-bold">
                        👤 {review.username}
                      </h5>

                      <small className="text-secondary">
                        {new Date(
                          review.createdAt
                        ).toLocaleString()}
                      </small>
                    </div>

                    <span
                      className="text-warning"
                      style={{ fontSize: "1.2rem" }}
                    >
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>

                  </div>

                  {editingId === review._id ? (
  <>
    <div className="mb-3 text-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setEditRating(star)}
          style={{
            cursor: "pointer",
            fontSize: "1.7rem",
            color: star <= editRating ? "#FFD700" : "#666",
          }}
        >
          ★
        </span>
      ))}
    </div>

    <textarea
      className="form-control bg-dark text-light border-secondary mb-3"
      value={editComment}
      onChange={(e) => setEditComment(e.target.value)}
    />

    <div className="d-flex gap-2">
      <button
        className="btn btn-success btn-sm"
        onClick={handleSave}
      >
        💾 Save
      </button>

      <button
        className="btn btn-secondary btn-sm"
        onClick={handleCancel}
      >
        Cancel
      </button>
    </div>
  </>
) : (
  <p>{review.comment}</p>
)}
                  {currentUser &&
                    currentUser.id === review.user && (
                      <div className="d-flex gap-2 mt-3">

                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleEdit(review)}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleDelete(review._id)
                          }
                        >
                          🗑 Delete
                        </button>

                      </div>
                    )}

                </div>
              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}
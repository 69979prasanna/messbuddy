import { useEffect, useState } from "react";

export default function ReviewList({ place }) {
  const [reviews, setReviews] = useState([])

  const currentUser = JSON.parse(localStorage.getItem("user"))

useEffect(() => {
  const fetchReviews = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/reviews/${encodeURIComponent(place)}`
      );

      const data = await res.json();

      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  fetchReviews()
}, [place])


  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token")

    const res = await fetch(
      `http://localhost:5000/api/reviews/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      setReviews((prev) =>
        prev.filter((review) => review._id !== id)
      );
    }
  };

  return (
    <div className="mt-5">

      <h3 className="fw-bold mb-4">
        Reviews ({reviews.length})
      </h3>

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

                  <p
                    style={{
                      lineHeight: "1.6"
                    }}
                  >
                    {review.comment}
                  </p>
                  {currentUser &&
                    currentUser.id === review.user && (
                      <div className="d-flex gap-2 mt-3">

                        <button
                          className="btn btn-warning btn-sm"
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
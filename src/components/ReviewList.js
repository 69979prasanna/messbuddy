import { useEffect, useState } from "react";

export default function ReviewList({ place }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/reviews/${encodeURIComponent(place)}`
        );

        const data = await res.json();

        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchReviews();
  }, [place]);

  return (
    <div className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">
          Reviews ({reviews.length})
        </h3>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center text-secondary py-5">
          <h5>No reviews yet 🍽️</h5>
          <p>Be the first one to review this place.</p>
        </div>
      ) : (
        <div className="row g-4">
          {reviews.map((review) => (
            <div
              className="col-lg-6 col-md-6"
              key={review._id}
            >
              <div
                className="card bg-dark text-light border-secondary shadow h-100"
                style={{
                  borderRadius: "15px"
                }}
              >
                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center mb-3">

                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-primary d-flex justify-content-center align-items-center"
                        style={{
                          width: "40px",
                          height: "40px",
                          fontWeight: "bold",
                          fontSize: "18px"
                        }}
                      >
                        {review.username.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h6 className="mb-0 fw-bold">
                          {review.username}
                        </h6>

                        <small className="text-secondary">
                          {new Date(
                            review.createdAt
                          ).toLocaleDateString()}
                        </small>
                      </div>
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
                    className="mb-0"
                    style={{
                      lineHeight: "1.7"
                    }}
                  >
                    {review.comment}
                  </p>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
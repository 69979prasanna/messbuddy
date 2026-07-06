import { useEffect, useState } from "react";

export default function ReviewList({ place }) {

  const [reviews,setReviews]=useState([]);

  useEffect(()=>{
    fetchReviews();
  },[place]);

  const fetchReviews=async()=>{

    const res=await fetch(
      `http://localhost:5000/api/reviews/${encodeURIComponent(place)}`
    );

    const data=await res.json();

    setReviews(data);

  };

  return(
    <>
      <h4 className="mb-3">
        Reviews
      </h4>

      {
        reviews.map(review=>(
          <div
            key={review._id}
            className="card bg-dark text-light mb-3"
          >
            <div className="card-body">

              <h6>{review.username}</h6>

              <p>
                ⭐ {review.rating}/5
              </p>

              <p>{review.comment}</p>

            </div>
          </div>
        ))
      }
    </>
  );

}
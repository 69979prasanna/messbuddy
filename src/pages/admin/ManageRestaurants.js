import { useEffect, useState } from "react"

const API = process.env.REACT_APP_APIKEY

export default function ManageRestaurants() {

  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {

    try {

      const res = await fetch(`${API}/restaurants`)

      const data = await res.json()

      setRestaurants(data)

    } catch (err) {

      console.error(err)

    } finally {

      setLoading(false)

    }

  }

  if (loading) {
    return (
      <div className="container py-5 text-light">
        <h3>Loading Restaurants...</h3>
      </div>
    )
  }

  return (
    <div className="container py-5 text-light">

      <h1 className="mb-4">
        🍽 Manage Restaurants
      </h1>

      <div className="row g-4">

        {restaurants.map((restaurant) => (

          <div
            key={restaurant._id}
            className="col-md-4"
          >

            <div className="card bg-dark text-light shadow h-100">

              <img
                src={restaurant.image}
                className="card-img-top"
                alt={restaurant.name}
                style={{
                  height: "220px",
                  objectFit: "cover",
                }}
              />

              <div className="card-body">

                <h4>{restaurant.name}</h4>

                <p>
                  🍽 {restaurant.featuredDish}
                </p>

                <p>
                  💰 ₹{restaurant.featuredPrice}
                </p>

                <p>
                  ⭐ {restaurant.averageRating}
                </p>

                <p>

                  🏷

                  {restaurant.tags.map(tag => (

                    <span
                      key={tag}
                      className="badge bg-info me-2"
                    >
                      {tag}
                    </span>

                  ))}

                </p>

                <p>

                  🕒

                  {restaurant.openingTime}

                  -

                  {restaurant.closingTime}

                </p>

              </div>

              <div className="card-footer d-flex gap-2">

                <button
                  className="btn btn-warning w-50"
                >
                  ✏ Edit
                </button>

                <button
                  className="btn btn-danger w-50"
                >
                  🗑 Delete
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}
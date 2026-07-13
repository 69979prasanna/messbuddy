import { useState } from "react"

export default function MenuForm({
  restaurants = [],
  onSubmit,
  initialData = {},
  loading = false,
}) {

  const [formData, setFormData] = useState({
    restaurant: initialData.restaurant || "",
    dish: initialData.dish || "",
    price: initialData.price || "",
    rating: initialData.rating || "",
    category: initialData.category || "",
    description: initialData.description || "",
    image: null,
  })

  const handleChange = (e) => {

    const { name, value, files } = e.target

    if (name === "image") {
      setFormData({
        ...formData,
        image: files[0],
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = (e) => {

    e.preventDefault()

    if (onSubmit) {
      onSubmit(formData)
    }
  }

  return (
    <div className="card bg-dark text-light shadow-lg border-secondary">

      <div className="card-body p-4">

        <h2 className="text-center mb-4">
          🍕 Menu Item
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="mb-3">

            <label className="form-label">
              Restaurant
            </label>

            <select
              className="form-select bg-dark text-light border-secondary"
              name="restaurant"
              value={formData.restaurant}
              onChange={handleChange}
              required
            >

              <option value="">
                Select Restaurant
              </option>

              {restaurants.map((restaurant) => (
                <option
                  key={restaurant._id}
                  value={restaurant.name}
                >
                  {restaurant.name}
                </option>
              ))}

            </select>

          </div>

          <div className="mb-3">

            <label className="form-label">
              Dish Name
            </label>

            <input
              className="form-control bg-dark text-light border-secondary"
              name="dish"
              value={formData.dish}
              onChange={handleChange}
              required
            />

          </div>

          <div className="row">

            <div className="col-md-4 mb-3">

              <label className="form-label">
                Price
              </label>

              <input
                type="number"
                className="form-control bg-dark text-light border-secondary"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />

            </div>

            <div className="col-md-4 mb-3">

              <label className="form-label">
                Rating
              </label>

              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                className="form-control bg-dark text-light border-secondary"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
              />

            </div>

            <div className="col-md-4 mb-3">

              <label className="form-label">
                Category
              </label>

              <input
                className="form-control bg-dark text-light border-secondary"
                placeholder="Pizza, Chinese..."
                name="category"
                value={formData.category}
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="mb-3">

            <label className="form-label">
              Description
            </label>

            <textarea
              rows="4"
              className="form-control bg-dark text-light border-secondary"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />

          </div>

          <div className="mb-4">

            <label className="form-label">
              Dish Image
            </label>

            <input
              type="file"
              accept="image/*"
              className="form-control bg-dark text-light border-secondary"
              name="image"
              onChange={handleChange}
            />

          </div>

          <button
            className="btn btn-primary w-100 fw-bold"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "🍕 Save Menu Item"}
          </button>

        </form>

      </div>

    </div>
  )
}
import { useState } from "react"

export default function RestaurantForm({
  onSubmit,
  initialData = {},
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    featuredDish: initialData.featuredDish || "",
    featuredPrice: initialData.featuredPrice || "",
    tags: initialData.tags
  ? initialData.tags.join(", ")
  : "",
    openingTime: initialData.openingTime || "",
    closingTime: initialData.closingTime || "",
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
          🍽 Restaurant Details
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label className="form-label">
              Restaurant Name
            </label>

            <input
              type="text"
              className="form-control bg-dark text-light border-secondary"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Featured Dish
            </label>

            <input
              type="text"
              className="form-control bg-dark text-light border-secondary"
              name="featuredDish"
              value={formData.featuredDish}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Featured Price
            </label>

            <input
              type="number"
              className="form-control bg-dark text-light border-secondary"
              name="featuredPrice"
              value={formData.featuredPrice}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Tags
            </label>

            <input
              type="text"
              className="form-control bg-dark text-light border-secondary"
              placeholder="budget, spicy, veg..."
              name="tags"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div className="row">

            <div className="col-md-6 mb-3">
              <label className="form-label">
                Opening Time
              </label>

              <input
                type="time"
                className="form-control bg-dark text-light border-secondary"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">
                Closing Time
              </label>

              <input
                type="time"
                className="form-control bg-dark text-light border-secondary"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="mb-4">
            <label className="form-label">
              Restaurant Image
            </label>

            <input
              type="file"
              className="form-control bg-dark text-light border-secondary"
              accept="image/*"
              name="image"
              onChange={handleChange}
            />
          </div>

          <button
            className="btn btn-success w-100 fw-bold"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "💾 Save Restaurant"}
          </button>

        </form>

      </div>
    </div>
  )
}
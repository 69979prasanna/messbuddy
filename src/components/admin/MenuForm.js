import { useState } from "react"
export default function MenuForm({
  restaurants = [],
  onSubmit,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    restaurant: "",
    dish: "",
    price: "",
    rating: 0,
    category: "",
    description: "",
    isAvailable: true,
    image: null,
  })
  const handleChange = (e) => {
    const { name, value, files, type } = e.target
    if (type === "file") {
      setFormData(prev => ({
        ...prev,
        image: files[0],
      }))

      return
    }

    if (name === "isAvailable") {

      setFormData(prev => ({
        ...prev,
        isAvailable: value === "true",
      }))

      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {

    e.preventDefault()

    onSubmit(formData)

  }

  return (

    <div className="card bg-dark text-light border-secondary shadow-lg">

      <div className="card-body p-4">

        <h2 className="text-center mb-4">
          🍽 Add Menu Item
        </h2>

        <form onSubmit={handleSubmit}>

          {/* Restaurant */}

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
                  value={restaurant._id}
                >
                  {restaurant.name}
                </option>

              ))}

            </select>

          </div>

          {/* Dish */}

          <div className="mb-3">

            <label className="form-label">
              Dish Name
            </label>

            <input
              type="text"
              className="form-control bg-dark text-light border-secondary"
              name="dish"
              value={formData.dish}
              onChange={handleChange}
              required
            />

          </div>

          <div className="row">

            {/* Price */}

            <div className="col-md-4 mb-3">

              <label className="form-label">
                Price
              </label>

              <input
                type="number"
                min="0"
                className="form-control bg-dark text-light border-secondary"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />

            </div>

            {/* Rating */}

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

            {/* Category */}

            <div className="col-md-4 mb-3">

              <label className="form-label">
                Category
              </label>

              <select
                className="form-select bg-dark text-light border-secondary"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Category
                </option>

                <option value="Starter">Starter</option>
                <option value="Main Course">Main Course</option>
                <option value="Rice">Rice</option>
                <option value="Bread">Bread</option>
                <option value="Chinese">Chinese</option>
                <option value="Pizza">Pizza</option>
                <option value="Dessert">Dessert</option>
                <option value="Beverage">Beverage</option>
                <option value="South Indian">South Indian</option>
                <option value="North Indian">North Indian</option>

              </select>

            </div>

          </div>

          {/* Description */}

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
          <div className="mb-3">
            <label className="form-label">
              Availability
            </label>
            <select
              className="form-select bg-dark text-light border-secondary"
              name="isAvailable"
              value={String(formData.isAvailable)}
              onChange={handleChange}
            >
              <option value="true">
                Available
              </option>
              <option value="false">
                Out of Stock
              </option>

            </select>

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
            type="submit"
            className="btn btn-primary w-100 fw-bold"
            disabled={loading}
          >
            {loading ? "Saving..." : "🍽 Save Menu Item"}
          </button>
        </form>
      </div>
    </div>
  )
}
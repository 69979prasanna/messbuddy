import { useEffect, useState } from "react"
import "../../styles/RestaurantForm.css"
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
  const [preview, setPreview] = useState(
    initialData.image || ""
  )
  useEffect(() => {
    if (initialData.image) {
      setPreview(initialData.image)
    }
  }, [initialData.image])
  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === "image") {
      const file = files[0]
      if (file) {
        setFormData((prev) => ({
          ...prev,
          image: file,
        }))
        setPreview(URL.createObjectURL(file))
      }
      return
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(formData)
    }
  }
  return (
    <div className="restaurant-form-card">
      <div className="restaurant-form-header">
        <div>
          <h1>
            🍽️ Restaurant Details
          </h1>
          <p>
            Add or update your restaurant information
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="restaurant-form">
        <div className="form-section">
          <div className="section-heading">
            <span>🏪</span>
            <div>
              <h3>Basic Information</h3>
              <p>Tell users about your restaurant</p>
            </div>
          </div>
          <div className="form-group">
            <label>
              Restaurant Name
            </label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Please Enter Your Restaurant Name" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>
                Featured Dish
              </label>
              <input type="text" name="featuredDish" value={formData.featuredDish} onChange={handleChange} placeholder="e.g. Puneri Unlimited Misal" required />
            </div>
            <div className="form-group">
              <label>
                Featured Price
              </label>
              <div className="input-with-symbol">
                <span>₹</span>
                <input type="number" min="0" name="featuredPrice" value={formData.featuredPrice} onChange={handleChange} placeholder="120" required />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>
              Tags
            </label>
            <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="budget, spicy, veg..." />
            <small>
              Separate multiple tags with commas.
            </small>
          </div>
        </div>
        <div className="form-section">
          <div className="section-heading">
            <span>🕐</span>
            <div>
              <h3>Restaurant Hours</h3>
              <p>Set when your restaurant is open</p>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>
                Opening Time
              </label>
              <input type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>
                Closing Time
              </label>
              <input type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="form-section">
          <div className="section-heading">
            <span>📸</span>
            <div>
              <h3>Restaurant Image</h3>
              <p>Upload a beautiful image of your restaurant</p>
            </div>
          </div>
          <label className="image-upload">
            {preview ? (
              <img src={preview} alt="Restaurant preview" />
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">
                  📷
                </div>
                <strong>
                  Choose Restaurant Image
                </strong>
                <span>
                  PNG, JPG or WEBP
                </span>
              </div>
            )}
            <input type="file" accept="image/*" name="image" onChange={handleChange} />
          </label>
          {preview && (
            <div className="image-selected">
              ✅ Image selected
            </div>
          )}

        </div>
        <button type="submit"className="save-restaurant-btn"disabled={loading} >
          {loading ? (
            <>
              <span className="save-spinner"></span>
              Saving Restaurant...
            </>
          ) : (
            <>
              💾 Save Restaurant
            </>
          )}
        </button>
      </form>
    </div>
  )
}
import { useEffect, useState } from "react"
import axios from "axios"

const API = process.env.REACT_APP_APIKEY
export default function EditMenuModal({
  show,
  onClose,
  menu,
  restaurants,
  refreshMenus,
}) {
  const [formData, setFormData] = useState({
    restaurant: "",
    dish: "",
    category: "",
    price: "",
    description: "",
    image: "",
    rating: 0,
    isAvailable: true,
  })
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    if (menu) {
      setFormData({
        restaurant: menu.restaurant?._id || "",
        dish: menu.dish || "",
        category: menu.category || "",
        price: menu.price || "",
        description: menu.description || "",
        image: menu.image || "",
        rating: menu.rating || 0,
        isAvailable: menu.isAvailable,
      })
    }
  }, [menu])
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }))
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await axios.put(
        `${API}/menus/${menu._id}`,
        formData
      )
      alert("✅ Menu updated successfully")
      refreshMenus()
      onClose()
    } catch (err) {
      if (err.response?.data?.message) {
        alert(err.response.data.message)
      } else {
        alert("Unable to update menu.")
      }
    } finally {
      setSaving(false)
    }
  }
  if (!show) return null
  return (
    <div
      className="modal d-block"
      style={{
        background:
          "rgba(0,0,0,.55)",
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h4>Edit Menu</h4>
            <button
              className="btn-close"
              onClick={onClose}
            />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">
                  Restaurant
                </label>
                <select className="form-select" name="restaurant" value={formData.restaurant} onChange={handleChange} required >
                  {restaurants.map((restaurant) => (
                    <option key={restaurant._id} value={restaurant._id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Dish
                </label>
                <input className="form-control" name="dish" value={formData.dish} onChange={handleChange} required/>
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Category
                </label>
                <input className="form-control" name="category" value={formData.category} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Price
                </label>
                <input type="number" className="form-control" name="price" value={formData.price} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Description
                </label>
                <textarea rows="3" className="form-control" name="description" value={formData.description} onChange={handleChange}/>
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Image URL
                </label>
                <input className="form-control" name="image" value={formData.image} onChange={handleChange}/>
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Rating
                </label>
                <input type="number" min="0" max="5" step="0.1" className="form-control" name="rating" value={formData.rating} onChange={handleChange}/>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" name="isAvailable" checked={ formData.isAvailable}
                  onChange={handleChange}/>
                <label className="form-check-label">
                  Available
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} >
                Cancel
              </button>
              <button className="btn btn-success" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/EditMenuModal.css";

const API = process.env.REACT_APP_APIKEY;
export default function EditMenuModal({
  show,
  menu,
  restaurants,
  onClose,
  refreshMenus,
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
  if (!show) return null;
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }))
  }
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const imageData = new FormData();
      imageData.append("image", file);
      const res = await fetch(`${API}/upload`, {
        method: "POST",
        body: imageData,
      })
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }
      setFormData((prev) => ({
        ...prev,
        image: data.imageUrl,
      }))
    } catch (err) {
      console.error(err);
      alert("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await axios.put(
        `${API}/menus/${menu._id}`,
        formData
      );

      refreshMenus();
      onClose();

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to update menu."
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="edit-overlay">
      <div className="edit-modal">
        <div className="edit-header">
          <div>
            <h2>🍽 Edit Menu Item</h2>
            <p>
              Update menu details for your restaurant
            </p>
          </div>
          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="edit-body">
          <div className="image-section">
            <img src={formData.image || "https://placehold.co/500x350?text=Food+Image"} alt="Preview" className="preview-image" />
            <label className="upload-btn">
              {uploading ? "Uploading..." : "📷 Choose Image"}
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </label>
            {formData.image && (
              <small className="upload-success">
                ✅ Image uploaded
              </small>
            )}
          </div>
          <div className="form-section">
            <div className="input-group">
              <label>
                Dish Name
              </label>
              <input type="text" name="dish" value={formData.dish} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>
                Restaurant
              </label>
              <select name="restaurant" value={formData.restaurant} onChange={handleChange}>
                {restaurants.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="triple-grid">
              <div className="input-group">
                <label>
                  Category
                </label>
                <input name="category" value={formData.category} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>
                  Price
                </label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>
                  Rating
                </label>
                <input type="number" step="0.1" min="0" max="5" name="rating" value={formData.rating} onChange={handleChange} />
              </div>
            </div>
            <div className="input-group">
              <label>
                Description
              </label>
              <textarea rows={5} name="description" value={formData.description} onChange={handleChange} />
            </div>
            <div className="availability">
              <label className="switch">
                <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} />
                <span className="slider"></span>
              </label>
              <span>
                Available
              </span>
            </div>
            <div className="button-row">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="save-btn">
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
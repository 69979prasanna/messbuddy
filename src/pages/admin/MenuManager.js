import { useEffect, useState } from "react"
import MenuForm from "../../components/admin/MenuForm"
import "../../styles/MenuManager.css"
const API = process.env.REACT_APP_APIKEY
export default function MenuManager() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    fetchRestaurants()
  }, [])
  const fetchRestaurants = async () => {
    try {
      const res = await fetch(
        `${API}/restaurants`
      )
      const data = await res.json()
      setRestaurants(data)
    } catch (err) {
      console.error(err)
    }
  }
  const handleSubmit = async (formData) => {
    try {
      setLoading(true)
      let imageUrl = ""
      if (formData.image) {
        const imageData = new FormData()
        imageData.append(
          "image",
          formData.image
        )
        const uploadRes = await fetch(
          `${API}/upload`,
          {
            method: "POST",
            body: imageData,
          }
        )
        const uploadResult =
          await uploadRes.json()
        imageUrl = uploadResult.imageUrl
      }
      const menu = {
        restaurant: formData.restaurant,
        dish: formData.dish,
        price: Number(formData.price),
        rating: Number(formData.rating),
        category: formData.category,
        description: formData.description,
        image: imageUrl,
        isAvailable: formData.isAvailable,
      }
      const res = await fetch(
        `${API}/menus`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(menu),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(
          data.message ||
          "Failed to create menu item"
        )
      }
      alert(
        "🍽️ Menu Item Added Successfully!"
      )
    } catch (err) {
      console.error(err)
      alert(
        err.message ||
        "Something went wrong!"
      )
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="menu-manager-page">
      <div className="menu-manager-container">
        <div className="menu-manager-header">
          <div className="menu-manager-icon">
            🍽️
          </div>
          <div>
            <h1>
              Add Menu Item
            </h1>
            <p>
              Add a new dish to your restaurant menu
            </p>
          </div>
        </div>
        <div className="menu-manager-panel">
          <MenuForm restaurants={restaurants} onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  )
}
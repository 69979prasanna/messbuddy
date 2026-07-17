import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RestaurantForm from "../../components/admin/RestaurantForm";
const API = process.env.REACT_APP_APIKEY;
export default function EditRestaurant() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchRestaurant();
  }, [])
  const fetchRestaurant = async () => {
    try {
      const res = await fetch(`${API}/restaurants/${id}`);
      const data = await res.json();
      setRestaurant(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }
  const handleSubmit = async (formData) => {
    try {
      let imageUrl = restaurant.image
      if (formData.image) {
        const imageData = new FormData();
        imageData.append("image", formData.image);
        const uploadRes = await fetch(`${API}/upload`, {
          method: "POST",
          body: imageData,
        })
        const uploadResult = await uploadRes.json();
        imageUrl = uploadResult.imageUrl;
      }
      const updatedRestaurant = {
        name: formData.name,
        featuredDish: formData.featuredDish,
        featuredPrice: Number(formData.featuredPrice),
        image: imageUrl,
        tags: formData.tags
          .split(",")
          .map(tag => tag.trim())
          .filter(tag => tag),
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
      }
      await fetch(`${API}/restaurants/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRestaurant),
      })
      alert("Restaurant Updated!");
      navigate("/admin/restaurants");
    } catch (err) {
      console.log(err);
    }
  }
  if (loading) {
    return (
      <div className="container py-5 text-light">
        Loading...
      </div>
    )
  }
  return (
    <div className="container py-5">
      <RestaurantForm
        initialData={restaurant}
        onSubmit={handleSubmit}
      />
    </div>
  )

}
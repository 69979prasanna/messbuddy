import { useEffect, useState } from "react";
import MenuForm from "../../components/admin/MenuForm";

const API = process.env.REACT_APP_APIKEY;

export default function MenuManager() {

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {

    try {

      const res = await fetch(`${API}/restaurants`);

      const data = await res.json();

      setRestaurants(data);

    } catch (err) {

      console.error(err);

    }

  };

  const handleSubmit = async (formData) => {

    try {

      setLoading(true);

      let imageUrl = "";

      // Upload image first
      if (formData.image) {

        const imageData = new FormData();

        imageData.append("image", formData.image);

        const uploadRes = await fetch(`${API}/upload`, {
          method: "POST",
          body: imageData,
        });

        const uploadResult = await uploadRes.json();

        imageUrl = uploadResult.imageUrl;

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

      };

      const res = await fetch(`${API}/menus`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(menu),

      });

      if (!res.ok) {

        throw new Error("Failed to create menu item");

      }

      alert("🍽 Menu Item Added Successfully!");

    } catch (err) {

      console.error(err);

      alert("Something went wrong!");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="container py-5 text-light">

      <h1 className="text-center mb-4">
        🍽 Menu Manager
      </h1>

      <MenuForm
        restaurants={restaurants}
        onSubmit={handleSubmit}
        loading={loading}
      />

    </div>

  );

}
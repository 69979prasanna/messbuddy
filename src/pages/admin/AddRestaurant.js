import RestaurantForm from "../../components/admin/RestaurantForm";

const API = process.env.REACT_APP_APIKEY;

export default function AddRestaurant() {

  const handleSubmit = async (formData) => {

    try {

      // Upload image to Supabase
      const imageData = new FormData();
      imageData.append("image", formData.image);

      const uploadRes = await fetch(`${API}/upload`, {
        method: "POST",
        body: imageData,
      });

      const uploadResult = await uploadRes.json();

      if (!uploadRes.ok) {
        alert(uploadResult.message);
        return;
      }
      const restaurant = {
  name: formData.name,
  featuredDish: formData.featuredDish,
  featuredPrice: Number(formData.featuredPrice), 
  image: uploadResult.imageUrl,
  tags: formData.tags
    .split(",")
    .map(tag => tag.trim())
    .filter(tag => tag !== ""),
  openingTime: formData.openingTime,
  closingTime: formData.closingTime,
};

      const res = await fetch(`${API}/restaurants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(restaurant),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("🎉 Restaurant Added Successfully!");

      console.log(data);

    } catch (err) {

      console.error(err);

      alert("Something went wrong.");

    }

  };

  return (
    <div className="container py-5">
      <RestaurantForm onSubmit={handleSubmit} />
    </div>
  );
}
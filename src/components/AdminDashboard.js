import { useState } from "react";

const API = process.env.REACT_APP_APIKEY;

export default function AdminDashboard() {
  const [form, setForm] = useState({
    name: "",
    featuredDish: "",
    featuredPrice: "",
    tags: "",
    open: "",
    close: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImage = (e) => {
    setForm((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image) {
      alert("Please choose an image.");
      return;
    }

    try {
      setLoading(true);

      const imageData = new FormData();

      imageData.append("image", form.image);

      const uploadRes = await fetch(`${API}/upload`, {
        method: "POST",
        body: imageData,
      });

      const upload = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(upload.message);
      }

      const restaurantRes = await fetch(
        `${API}/restaurants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            featuredDish: form.featuredDish,
            featuredPrice: Number(form.featuredPrice),
            image: upload.imageUrl,
            tags: form.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),

            timings: {
              open: form.open,
              close: form.close,
            },
          }),
        }
      );

      const restaurant = await restaurantRes.json();

      if (!restaurantRes.ok) {
        throw new Error(restaurant.message);
      }

      alert("Restaurant Added Successfully 🎉");

      setForm({
        name: "",
        featuredDish: "",
        featuredPrice: "",
        tags: "",
        open: "",
        close: "",
        image: null,
      });

      document.getElementById("restaurantImage").value = "";
    } catch (err) {
      alert(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 text-light">

      <h1 className="text-center fw-bold mb-5">
        🍽 Admin Dashboard
      </h1>

      <div className="card bg-dark border-secondary shadow">

        <div className="card-body p-4">

          <form onSubmit={handleSubmit}>

            <div className="mb-3">

              <label className="form-label">
                Restaurant Name
              </label>

              <input
                type="text"
                name="name"
                className="form-control bg-dark text-light border-secondary"
                value={form.name}
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
                name="featuredDish"
                className="form-control bg-dark text-light border-secondary"
                value={form.featuredDish}
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
                name="featuredPrice"
                className="form-control bg-dark text-light border-secondary"
                value={form.featuredPrice}
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
                name="tags"
                placeholder="Pizza, Fast Food"
                className="form-control bg-dark text-light border-secondary"
                value={form.tags}
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
                  name="open"
                  className="form-control bg-dark text-light border-secondary"
                  value={form.open}
                  onChange={handleChange}
                />

              </div>

              <div className="col-md-6 mb-3">

                <label className="form-label">
                  Closing Time
                </label>

                <input
                  type="time"
                  name="close"
                  className="form-control bg-dark text-light border-secondary"
                  value={form.close}
                  onChange={handleChange}
                />

              </div>

            </div>

            <div className="mb-4">

              <label className="form-label">
                Restaurant Image
              </label>

              <input
                id="restaurantImage"
                type="file"
                accept="image/*"
                className="form-control bg-dark text-light border-secondary"
                onChange={handleImage}
                required
              />

            </div>

            <button
              className="btn btn-success w-100 fw-bold py-2"
              disabled={loading}
            >
              {loading
                ? "Uploading..."
                : "➕ Add Restaurant"}
            </button>

          </form>

        </div>

      </div>

    </div>
  )
}
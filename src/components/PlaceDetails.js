import { useParams, useNavigate } from "react-router-dom";

import { menuData } from "../data/menuData"
export default function PlaceDetails() {
  const { name } = useParams();
  const navigate = useNavigate();
  const placeName = decodeURIComponent(name);
const menus = menuData.filter(
  item => item.place === placeName
);

  const avgPrice =
    menus.reduce((sum, item) => sum + item.price, 0) / menus.length || 0;

  return (
    <div className="container py-4 text-light">
      {/* Back Button */}
      <button
        className="btn btn-outline-light mb-4"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold">{placeName}</h2>
        <p className="text-secondary mb-1">
          {menus.length} items available · Avg price ₹{avgPrice.toFixed(0)}
        </p>
      </div>

      {/* Menu Cards */}
      <div className="row g-3">
        {menus.map(item => (
          <div className="col-md-4 col-sm-6" key={item.id}>
            <div className="card bg-dark text-light h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title fw-semibold">
                  {item.dish}
                </h5>

                <p className="mb-1">💰 ₹{item.price}</p>
                <p className="mb-2">⭐ {item.rating}</p>

                {item.downvotes >= 3 && (
                  <span className="badge bg-danger">
                    Not recommended today
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {menus.length === 0 && (
        <p className="text-secondary mt-4">
          No menu data available for this place.
        </p>
      )}
    </div>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { menuData } from "../data/menuData";

export default function PlaceDetails() {
  const { name } = useParams();
  const navigate = useNavigate();
  const placeName = decodeURIComponent(name);

  const [filter, setFilter] = useState("all"); // all | top | cheap
  const [search, setSearch] = useState(""); // 🔍 NEW

  const menus = menuData.filter(
    item => item.place === placeName
  );

  // 🔍 Apply filter + search together
  const filteredMenus =
    (filter === "top"
      ? menus.filter(item => item.rating >= 4.3)
      : filter === "cheap"
      ? menus.filter(item => item.price <= 60)
      : menus
    ).filter(item =>
      item.dish.toLowerCase().includes(search.toLowerCase())
    );

  const avgPrice =
    menus.reduce((sum, item) => sum + item.price, 0) /
      menus.length || 0;

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
      <div className="mb-3">
        <h2 className="fw-bold">{placeName}</h2>
        <p className="text-secondary mb-2">
          {menus.length} items · Avg price ₹{avgPrice.toFixed(0)}
        </p>

        {/* 🔍 Search Bar */}
        <input
          type="text"
          className="form-control bg-dark text-light border-secondary mb-3"
          placeholder="🔍 Search dish..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Filters */}
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${
              filter === "all"
                ? "btn-info"
                : "btn-outline-info"
            }`}
            onClick={() => setFilter("all")}
          >
            🍽 All
          </button>

          <button
            className={`btn btn-sm ${
              filter === "top"
                ? "btn-success"
                : "btn-outline-success"
            }`}
            onClick={() => setFilter("top")}
          >
            ⭐ Top Rated
          </button>

          <button
            className={`btn btn-sm ${
              filter === "cheap"
                ? "btn-warning"
                : "btn-outline-warning"
            }`}
            onClick={() => setFilter("cheap")}
          >
            💸 Cheap
          </button>
        </div>
      </div>

      {/* Menu Cards */}
      <div className="row g-3">
        {filteredMenus.map(item => (
          <div className="col-md-4 col-sm-6" key={item.id}>
            <div className="card bg-dark text-light h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title fw-semibold">
                  {item.dish}
                </h5>

                <p className="mb-1">💰 ₹{item.price}</p>
                <p className="mb-2">⭐ {item.rating}</p>

                {item.price <= 60 && (
                  <span className="badge bg-warning text-dark me-2">
                    💸 Budget
                  </span>
                )}

                {item.rating >= 4.3 && (
                  <span className="badge bg-success">
                    ⭐ Top Pick
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMenus.length === 0 && (
        <p className="text-secondary mt-4">
          No items match this search or filter.
        </p>
      )}
    </div>
  );
}

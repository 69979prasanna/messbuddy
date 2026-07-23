import React from "react"
import "../../styles/menu.css"
export default function MenuCard({
  menu,
  onEdit,
  onDelete,
}) {
  return (
    <div className="card border-0 shadow h-100"
      style={{   borderRadius: "18px", overflow: "hidden", transition: "0.3s"}}>
      <img
        src={ menu.image ||  "https://placehold.co/600x400?text=No+Image"} alt={menu.dish} className="card-img-top"
        style={{  height: "220px", objectFit: "cover",}}/>
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start">
          <h5 className="fw-bold mb-0">
            {menu.dish}
          </h5>
          <span className={`badge ${ menu.isAvailable ? "bg-success" :"bg-danger"}`}>
            {menu.isAvailable ? "Available" : "Out of Stock"}
          </span>
        </div>
        <small className="text-muted mt-2">
          {menu.restaurant?.name}
        </small>
        <span className="badge bg-warning text-dark mt-3 align-self-start">
          {menu.category}
        </span>
        <p className="text-muted mt-3 mb-3"
          style={{ minHeight: "50px" }}>
          {menu.description || "No description"}
        </p>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <h4 className="text-success fw-bold mb-0">
            ₹{menu.price}
          </h4>
          <div>
            <button className="btn btn-outline-primary btn-sm me-2"
              onClick={() => onEdit(menu)}>
              ✏ Edit
            </button>
            <button className="btn btn-outline-danger btn-sm" onClick={() =>
                onDelete(menu._id)}
            >
              🗑 Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import MealScheduleManager from "../../components/admin/MealScheduleManager"
import "../../styles/MealSchedule.css"

const API = process.env.REACT_APP_APIKEY

export default function ManageSchedule() {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])
  const [selectedId, setSelectedId] = useState(restaurantId || "")
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API}/restaurants`)
        if (res.ok) {
          const data = await res.json()
          setRestaurants(data)
          if (!restaurantId && data.length > 0) {
            setSelectedId(data[0]._id)
          }
        }
      } catch (err) {
        console.error("Error loading restaurants:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [restaurantId])

  useEffect(() => {
    if (!selectedId) return

    const fetchSelected = async () => {
      try {
        const res = await fetch(`${API}/restaurants/${selectedId}`)
        if (res.ok) {
          const data = await res.json()
          setSelectedRestaurant(data)
        }
      } catch (err) {
        console.error("Error fetching restaurant details:", err)
      }
    }

    fetchSelected()
  }, [selectedId])

  const handleRestaurantChange = (newId) => {
    setSelectedId(newId)
    navigate(`/admin/schedule/${newId}`)
  }

  if (loading) {
    return (
      <div className="container py-5 text-center text-light">
        <div className="spinner-border text-warning" />
        <p className="mt-3">Loading restaurant data...</p>
      </div>
    )
  }

  return (
    <div className="container py-4 text-light">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm mb-2"
            onClick={() => navigate("/admin")}
          >
            ← Back to Dashboard
          </button>
          <h1 className="fw-bold text-white mb-0">
            ⏰ Manage Meal Schedules
          </h1>
        </div>

        {/* Restaurant Switcher Dropdown */}
        <div style={{ minWidth: "260px" }}>
          <label className="text-secondary small mb-1">
            Select Restaurant / Mess:
          </label>
          <select
            className="form-select bg-dark text-light border-secondary"
            value={selectedId}
            onChange={(e) => handleRestaurantChange(e.target.value)}
          >
            {restaurants.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedRestaurant ? (
        <MealScheduleManager
          restaurantId={selectedRestaurant._id}
          restaurantName={selectedRestaurant.name}
          initialSchedule={selectedRestaurant.weeklySchedule || []}
          onSaved={(updated) =>
            setSelectedRestaurant((prev) => ({
              ...prev,
              weeklySchedule: updated,
            }))
          }
        />
      ) : (
        <div className="text-center py-5">
          <p className="text-secondary">
            No restaurants found. Please add a restaurant first.
          </p>
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect } from "react"
import {
  MEAL_PERIODS,
  generateDefaultWeeklySchedule,
} from "../../utils/mealTiming"
import MenuItemPickerModal from "./MenuItemPickerModal"
import "../../styles/MealSchedule.css"

const API = process.env.REACT_APP_APIKEY

export default function MealScheduleManager({
  restaurantId,
  restaurantName,
  initialSchedule = [],
  onSaved,
}) {
  const [schedule, setSchedule] = useState(() =>
    generateDefaultWeeklySchedule(initialSchedule)
  )
  const [restaurantMenus, setRestaurantMenus] = useState([])
  const [saving, setSaving] = useState(false)

  // Modal State
  const [activeModal, setActiveModal] = useState({
    show: false,
    day: null,
    mealKey: null,
  })

  // Fetch menus for this restaurant so owner can pick from them
  useEffect(() => {
    if (!restaurantId) return

    const fetchMenus = async () => {
      try {
        const res = await fetch(`${API}/menus/restaurant/${restaurantId}`)
        if (res.ok) {
          const data = await res.json()
          setRestaurantMenus(data)
        }
      } catch (err) {
        console.error("Error fetching restaurant menus:", err)
      }
    }

    fetchMenus()
  }, [restaurantId])

  // Sync initialSchedule when restaurant changes
  useEffect(() => {
    if (initialSchedule && initialSchedule.length > 0) {
      setSchedule(generateDefaultWeeklySchedule(initialSchedule))
    } else {
      setSchedule(generateDefaultWeeklySchedule([]))
    }
  }, [initialSchedule])

  const handleTimeChange = (day, mealKey, field, value) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d
        return {
          ...d,
          meals: {
            ...d.meals,
            [mealKey]: {
              ...d.meals[mealKey],
              [field]: value,
            },
          },
        }
      })
    )
  }

  const handleOpenItemPicker = (day, mealKey) => {
    setActiveModal({
      show: true,
      day,
      mealKey,
    })
  }

  const handleSaveModalItems = (itemIds, customItems) => {
    const { day, mealKey } = activeModal
    if (!day || !mealKey) return

    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d
        return {
          ...d,
          meals: {
            ...d.meals,
            [mealKey]: {
              ...d.meals[mealKey],
              items: itemIds,
              customItems: customItems,
            },
          },
        }
      })
    )
  }

  // Quick helper: Apply standard timings to all 7 days
  const applyStandardTimingsToAll = () => {
    setSchedule((prev) =>
      prev.map((d) => ({
        ...d,
        meals: {
          breakfast: {
            ...d.meals.breakfast,
            startTime: "07:30",
            endTime: "10:00",
          },
          lunch: {
            ...d.meals.lunch,
            startTime: "12:00",
            endTime: "15:00",
          },
          snacks: {
            ...d.meals.snacks,
            startTime: "16:00",
            endTime: "18:00",
          },
          dinner: {
            ...d.meals.dinner,
            startTime: "19:00",
            endTime: "22:00",
          },
        },
      }))
    )
    alert("⚡ Standard timings applied to all 7 days!")
  }

  // Quick helper: Copy Monday's full schedule to Tuesday through Friday
  const copyMondayToWeekdays = () => {
    const monday = schedule.find((d) => d.day === "Monday")
    if (!monday) return

    setSchedule((prev) =>
      prev.map((d) => {
        if (["Tuesday", "Wednesday", "Thursday", "Friday"].includes(d.day)) {
          return {
            ...d,
            meals: JSON.parse(JSON.stringify(monday.meals)),
          }
        }
        return d
      })
    )
    alert("📋 Copied Monday's meals and timings to Tue, Wed, Thu & Fri!")
  }

  const handleSaveSchedule = async () => {
    if (!restaurantId) {
      alert("Please select a restaurant first.")
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem("token")

      const res = await fetch(`${API}/restaurants/${restaurantId}/schedule`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ weeklySchedule: schedule }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to save weekly schedule.")
      }

      if (onSaved) onSaved(data.weeklySchedule)
      alert("🎉 Weekly Meal Schedule Saved Successfully!")
    } catch (err) {
      console.error(err)
      alert(err.message || "Error saving weekly schedule.")
    } finally {
      setSaving(false)
    }
  }

  // Helper to render summary text for dishes in a cell
  const getMealItemsSummary = (mealData) => {
    const items = mealData?.items || []
    const custom = mealData?.customItems || []
    const names = []

    items.forEach((item) => {
      if (typeof item === "object" && item !== null) {
        names.push(item.dish)
      } else {
        const found = restaurantMenus.find((m) => m._id === item)
        names.push(found ? found.dish : "Dish")
      }
    })

    custom.forEach((c) => {
      if (c) names.push(c)
    })

    if (names.length === 0) {
      return <span className="text-secondary fst-italic">No dishes set</span>
    }

    return (
      <span className="text-light">
        {names.slice(0, 3).join(", ")}
        {names.length > 3 && (
          <span className="text-warning small"> +{names.length - 3} more</span>
        )}
      </span>
    )
  }

  const currentModalMealData =
    activeModal.day && activeModal.mealKey
      ? schedule.find((d) => d.day === activeModal.day)?.meals?.[
          activeModal.mealKey
        ]
      : null

  const currentModalMealMeta = activeModal.mealKey
    ? MEAL_PERIODS.find((m) => m.key === activeModal.mealKey)
    : null

  return (
    <div className="schedule-manager-container">
      {/* Top Header & Actions */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-white mb-1">
            📅 Weekly Meal Timetable Matrix
          </h2>
          <p className="text-secondary mb-0">
            {restaurantName
              ? `Configuring meal periods for ${restaurantName}`
              : "Set breakfast, lunch, snacks & dinner timings and dishes for all 7 days"}
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-warning"
            onClick={applyStandardTimingsToAll}
          >
            ⚡ Auto-Fill Standard Timings
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-info"
            onClick={copyMondayToWeekdays}
          >
            📋 Copy Mon → Fri
          </button>
          <button
            type="button"
            className="btn btn-warning px-4 fw-bold text-dark"
            onClick={handleSaveSchedule}
            disabled={saving}
          >
            {saving ? "Saving Schedule..." : "💾 Save Schedule"}
          </button>
        </div>
      </div>

      {/* Desktop / Large Screen Matrix Table */}
      <div className="d-none d-lg-block">
        <div className="matrix-table-wrapper">
          <table className="schedule-matrix-table">
            <thead>
              <tr>
                <th style={{ width: "130px" }}>Day</th>
                {MEAL_PERIODS.map((period) => (
                  <th key={period.key} style={{ width: "22%" }}>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: "1.25rem" }}>{period.icon}</span>
                      <span>{period.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.map((dayRow) => (
                <tr key={dayRow.day}>
                  {/* Day Name */}
                  <td>
                    <div className="day-cell-label">
                      <span>{dayRow.day}</span>
                    </div>
                  </td>

                  {/* 4 Meal Period Cells */}
                  {MEAL_PERIODS.map((period) => {
                    const meal = dayRow.meals[period.key] || {}
                    return (
                      <td key={period.key}>
                        <div className="matrix-meal-cell">
                          {/* Timings Inputs */}
                          <div className="matrix-time-inputs">
                            <input
                              type="time"
                              className="matrix-time-input"
                              value={meal.startTime || period.defaultStart}
                              onChange={(e) =>
                                handleTimeChange(
                                  dayRow.day,
                                  period.key,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              title="Start Time"
                            />
                            <span className="text-secondary small">to</span>
                            <input
                              type="time"
                              className="matrix-time-input"
                              value={meal.endTime || period.defaultEnd}
                              onChange={(e) =>
                                handleTimeChange(
                                  dayRow.day,
                                  period.key,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              title="End Time"
                            />
                          </div>

                          {/* Dishes Summary */}
                          <div className="matrix-items-summary">
                            {getMealItemsSummary(meal)}
                          </div>

                          {/* Edit Dishes Button */}
                          <button
                            type="button"
                            className="matrix-edit-btn"
                            onClick={() =>
                              handleOpenItemPicker(dayRow.day, period.key)
                            }
                          >
                            ✏️ Edit Dishes (
                            {(meal.items?.length || 0) +
                              (meal.customItems?.length || 0)}
                            )
                          </button>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile / Tablet Responsive Stacked Cards */}
      <div className="d-lg-none">
        {schedule.map((dayRow) => (
          <div key={dayRow.day} className="mobile-matrix-day-card">
            <div className="mobile-matrix-day-header">
              <h4 className="text-warning fw-bold mb-0">📅 {dayRow.day}</h4>
            </div>

            <div className="row g-3">
              {MEAL_PERIODS.map((period) => {
                const meal = dayRow.meals[period.key] || {}
                return (
                  <div key={period.key} className="col-md-6">
                    <div className="matrix-meal-cell">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold text-white">
                          {period.icon} {period.label}
                        </span>
                        <div className="d-flex align-items-center gap-1">
                          <input
                            type="time"
                            className="matrix-time-input"
                            value={meal.startTime || period.defaultStart}
                            onChange={(e) =>
                              handleTimeChange(
                                dayRow.day,
                                period.key,
                                "startTime",
                                e.target.value
                              )
                            }
                          />
                          <span className="text-secondary small">-</span>
                          <input
                            type="time"
                            className="matrix-time-input"
                            value={meal.endTime || period.defaultEnd}
                            onChange={(e) =>
                              handleTimeChange(
                                dayRow.day,
                                period.key,
                                "endTime",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="matrix-items-summary mb-2">
                        {getMealItemsSummary(meal)}
                      </div>

                      <button
                        type="button"
                        className="matrix-edit-btn"
                        onClick={() =>
                          handleOpenItemPicker(dayRow.day, period.key)
                        }
                      >
                        ✏️ Edit Dishes (
                        {(meal.items?.length || 0) +
                          (meal.customItems?.length || 0)}
                        )
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button Bottom */}
      <div className="d-flex justify-content-end mt-4">
        <button
          type="button"
          className="btn btn-warning px-5 py-2 fw-bold text-dark shadow"
          onClick={handleSaveSchedule}
          disabled={saving}
        >
          {saving ? "Saving Schedule..." : "💾 Save Complete Weekly Schedule"}
        </button>
      </div>

      {/* Menu Item Picker Modal */}
      {activeModal.show && (
        <MenuItemPickerModal
          show={activeModal.show}
          onClose={() =>
            setActiveModal({ show: false, day: null, mealKey: null })
          }
          day={activeModal.day}
          mealMeta={currentModalMealMeta}
          selectedItemIds={currentModalMealData?.items || []}
          selectedCustomItems={currentModalMealData?.customItems || []}
          restaurantMenus={restaurantMenus}
          onSave={handleSaveModalItems}
        />
      )}
    </div>
  )
}

import React, { useState, useEffect, useMemo } from "react"
import {
  DAYS_OF_WEEK,
  MEAL_PERIODS,
  getDayName,
  formatTime12Hour,
  timeStringToDate,
} from "../../utils/mealTiming"
import "../../styles/MealSchedule.css"
import NotificationModal from "../notifications/NotificationModal"
import { getNotificationPreferences } from "../../utils/notificationPreferences"
import "../../styles/NotificationModal.css"
import { FiCalendar, FiBell, FiClock } from "react-icons/fi"

export default function WeeklySchedule({
  weeklySchedule = [],
  restaurantName = "",
  menus = [],
  setShowAuthModal,
}) {
  const todayName = useMemo(() => getDayName(), [])
  const [selectedDay, setSelectedDay] = useState(todayName)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      getNotificationPreferences().then((res) => {
        if (res.success && res.preferences?.enabled) {
          setNotificationsEnabled(true)
        }
      })
    }
  }, [])

  const handleNotifyClick = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      if (typeof setShowAuthModal === "function") {
        setShowAuthModal(true)
      }
      return
    }
    setIsNotificationModalOpen(true)
  }

  // Current local time to check if a card is actively being served right now
  const now = new Date()

  const selectedDaySchedule = useMemo(() => {
    if (!Array.isArray(weeklySchedule)) return null
    return (
      weeklySchedule.find(
        (s) => s.day?.toLowerCase() === selectedDay.toLowerCase()
      ) || null
    )
  }, [weeklySchedule, selectedDay])

  const isTodaySelected = selectedDay.toLowerCase() === todayName.toLowerCase()

  const checkIsActiveMeal = (mealKey, startTime, endTime) => {
    if (!isTodaySelected || !startTime || !endTime) return false
    const start = timeStringToDate(startTime, now)
    let end = timeStringToDate(endTime, now)
    if (end <= start) {
      end = new Date(end.getTime() + 24 * 60 * 60 * 1000)
    }
    return now >= start && now < end
  }

  if (!Array.isArray(weeklySchedule) || weeklySchedule.length === 0) {
    return (
      <div
        className="weekly-schedule-section mb-5 p-4 rounded-4 text-center border border-secondary border-opacity-25"
        style={{ background: "rgba(22, 27, 38, 0.6)" }}
      >
        <span style={{ fontSize: "2rem" }}>📅</span>
        <h4 className="text-white fw-bold mt-2 mb-1">
          Weekly Meal Timetable
        </h4>
        <p className="text-secondary small mb-0">
          The weekly meal schedule for {restaurantName || "this mess"} has not been published yet.
        </p>
      </div>
    )
  }

  return (
    <div className="weekly-schedule-section mb-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
            <FiCalendar className="text-secondary opacity-75" style={{ fontSize: "1.1rem" }} />
            Weekly Meal Timetable
          </h3>
          <p className="text-secondary mb-0 small">
            Browse daily breakfast, lunch, snacks, and dinner menus
          </p>
        </div>
        <button
          type="button"
          className={`timetable-notify-btn ${notificationsEnabled ? "is-active" : ""}`}
          onClick={handleNotifyClick}
          id="timetable-notify-me-btn"
          title="Manage MessBuddy Email Notifications"
        >
          <FiBell style={{ fontSize: "0.85rem" }} />
          <span>{notificationsEnabled ? "Notifications On" : "Notify Me"}</span>
        </button>
      </div>

      {/* Day Selector Navigation Pills */}
      <div className="schedule-day-tabs mb-4">
        {DAYS_OF_WEEK.map((day) => {
          const isToday = day.toLowerCase() === todayName.toLowerCase()
          const isSelected = day.toLowerCase() === selectedDay.toLowerCase()
          const shortName = day.substring(0, 3)

          return (
            <button
              key={day}
              type="button"
              className={`schedule-day-tab-btn ${isSelected ? "active" : ""}`}
              onClick={() => setSelectedDay(day)}
            >
              <span>{shortName}</span>
              {isToday && (
                <span className="today-indicator badge bg-danger text-white">
                  Today
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Meals Grid for Selected Day */}
      <div className="row g-3">
        {MEAL_PERIODS.map((period) => {
          const mealData = selectedDaySchedule?.meals?.[period.key] || {}
          const startTime = mealData.startTime || period.defaultStart
          const endTime = mealData.endTime || period.defaultEnd
          const items = mealData.items || []
          const customItems = mealData.customItems || []
          const isActive = checkIsActiveMeal(period.key, startTime, endTime)

          // Collect all dish names/objects
          const allDishes = []
          if (Array.isArray(items)) {
            items.forEach((item) => {
              if (typeof item === "object" && item !== null) {
                allDishes.push({
                  name: item.dish || "Dish",
                  price: item.price,
                  available: item.isAvailable !== false,
                })
              } else if (typeof item === "string" && item.trim()) {
                const found = Array.isArray(menus)
                  ? menus.find((m) => m._id === item)
                  : null
                if (found) {
                  allDishes.push({
                    name: found.dish,
                    price: found.price,
                    available: found.isAvailable !== false,
                  })
                }
              }
            })
          }
          if (Array.isArray(customItems)) {
            customItems.forEach((name) => {
              if (name && name.trim()) {
                allDishes.push({
                  name: name.trim(),
                  price: null,
                  available: true,
                })
              }
            })
          }

          return (
            <div key={period.key} className="col-lg-3 col-md-6">
              <div
                className={`meal-period-card ${isActive ? "is-active-meal" : ""
                  }`}
              >
                {isActive && (
                  <div
                    className="position-absolute top-0 end-0 m-2 badge bg-success-subtle text-success border border-success-subtle px-2 py-1 d-inline-flex align-items-center gap-1"
                    style={{ fontSize: "0.7rem", borderRadius: "6px" }}
                  >
                    <span className="pulse-dot" style={{ width: "6px", height: "6px" }}></span>
                    <span>Active Now</span>
                  </div>
                )}

                <div className="meal-period-header">
                  <div className="meal-period-title text-white">
                    <span style={{ fontSize: "1.2rem" }}>{period.icon}</span>
                    <span>{period.label}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="meal-period-timing d-inline-flex align-items-center gap-1">
                    <FiClock className="opacity-75" style={{ fontSize: "0.75rem" }} />
                    {formatTime12Hour(startTime)} – {formatTime12Hour(endTime)}
                  </span>
                </div>

                <div className="meal-items-container">
                  {allDishes.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {allDishes.map((dish, idx) => (
                        <div
                          key={idx}
                          className="d-flex justify-content-between align-items-center py-1 border-bottom border-secondary border-opacity-25"
                        >
                          <span
                            className="text-light small fw-medium"
                            style={{
                              opacity: dish.available ? 1 : 0.6,
                              textDecoration: dish.available
                                ? "none"
                                : "line-through",
                            }}
                          >
                            • {dish.name}
                          </span>
                          {dish.price !== null && dish.price !== undefined && (
                            <span className="text-warning small fw-bold">
                              ₹{dish.price}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary small fst-italic mb-0">
                      Standard {period.label.toLowerCase()} thali / menu
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {isNotificationModalOpen && (
        <NotificationModal
          onClose={() => setIsNotificationModalOpen(false)}
          onPreferencesUpdated={(updatedPrefs) => {
            setNotificationsEnabled(Boolean(updatedPrefs?.enabled))
          }}
        />
      )}
    </div>
  )
}

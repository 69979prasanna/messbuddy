import React, { useState, useEffect, useMemo } from "react"
import {
  getLiveMealStatus,
  formatCountdown,
  formatDurationShort,
  formatTime12Hour,
} from "../../utils/mealTiming"
import "../../styles/MealSchedule.css"

export default function LiveMealStatus({ weeklySchedule = [], restaurantName }) {
  const [tick, setTick] = useState(0)
  const [simulatedHourMinute, setSimulatedHourMinute] = useState("") // e.g. "13:30" or "" for live
  const [showSimControls, setShowSimControls] = useState(false)

  // 1-second interval timer with clean unmount
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Calculate current effective Date (live or simulated)
  const effectiveTime = useMemo(() => {
    const now = new Date()
    if (!simulatedHourMinute) {
      return now
    }
    const [h, m] = simulatedHourMinute.split(":").map(Number)
    const simulatedDate = new Date(now)
    simulatedDate.setHours(h, m, now.getSeconds(), 0)
    return simulatedDate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, simulatedHourMinute])

  const liveData = useMemo(() => {
    return getLiveMealStatus(weeklySchedule, effectiveTime)
  }, [weeklySchedule, effectiveTime])

  const renderDishChips = (items = [], customItems = []) => {
    const allDishes = []

    if (Array.isArray(items)) {
      items.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          allDishes.push({
            name: item.dish || "Dish",
            price: item.price,
            available: item.isAvailable !== false,
          })
        } else if (typeof item === "string") {
          allDishes.push({ name: item, price: null, available: true })
        }
      })
    }

    if (Array.isArray(customItems)) {
      customItems.forEach((name) => {
        if (name && name.trim()) {
          allDishes.push({ name: name.trim(), price: null, available: true })
        }
      })
    }

    if (allDishes.length === 0) {
      return (
        <span className="text-secondary small fst-italic">
          Standard meal menu
        </span>
      )
    }

    return (
      <div className="meal-items-chip-list">
        {allDishes.map((dish, idx) => (
          <span key={idx} className="meal-item-chip">
            <span>🍽️</span>
            <span>{dish.name}</span>
            {dish.price !== null && dish.price !== undefined && (
              <span className="chip-price">₹{dish.price}</span>
            )}
          </span>
        ))}
      </div>
    )
  }

  if (liveData.status === "NO_SCHEDULE") {
    return null
  }

  return (
    <div
      className={`live-status-card mb-4 ${
        liveData.status === "CURRENTLY_SERVING"
          ? "status-serving"
          : liveData.status === "UPCOMING_TODAY"
          ? "status-upcoming"
          : "status-closed"
      }`}
    >
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
        {/* Status Badge */}
        <div>
          {liveData.status === "CURRENTLY_SERVING" && (
            <div className="live-badge serving">
              <span className="pulse-dot"></span>
              <span>Currently Serving</span>
            </div>
          )}

          {liveData.status === "UPCOMING_TODAY" && (
            <div className="live-badge upcoming">
              <span>🕐</span>
              <span>Next Meal Today</span>
            </div>
          )}

          {liveData.status === "NO_MORE_MEALS_TODAY" && (
            <div className="live-badge closed">
              <span>🌙</span>
              <span>No More Meals Today</span>
            </div>
          )}
        </div>

        {/* Real-time Countdown Box */}
        {liveData.status === "CURRENTLY_SERVING" && (
          <div className="countdown-timer-box">
            <span className="text-secondary small">⏳ Closes in:</span>
            <span className="countdown-digits">
              {formatCountdown(liveData.secondsRemaining)}
            </span>
          </div>
        )}

        {liveData.status === "UPCOMING_TODAY" && (
          <div className="countdown-timer-box">
            <span className="text-secondary small">⏳ Starts in:</span>
            <span className="countdown-digits">
              {formatCountdown(liveData.secondsUntilStart)}
            </span>
          </div>
        )}

        {liveData.status === "NO_MORE_MEALS_TODAY" && liveData.nextMeal && (
          <div className="countdown-timer-box">
            <span className="text-secondary small">⏳ Next meal in:</span>
            <span className="countdown-digits">
              {formatDurationShort(liveData.secondsUntilStart)}
            </span>
          </div>
        )}
      </div>

      {/* Main Meal Content */}
      {liveData.status === "CURRENTLY_SERVING" && liveData.currentMeal && (
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <h2 className="text-white fw-bold mb-0">
              {liveData.currentMeal.icon} {liveData.currentMeal.label}
            </h2>
            <span className="badge bg-dark border border-secondary text-light px-2 py-1 small">
              {formatTime12Hour(liveData.currentMeal.startTime)} –{" "}
              {formatTime12Hour(liveData.currentMeal.endTime)}
            </span>
          </div>

          <p className="text-light-50 mb-1 small">Serving right now:</p>
          {renderDishChips(
            liveData.currentMeal.items,
            liveData.currentMeal.customItems
          )}
        </div>
      )}

      {liveData.status === "UPCOMING_TODAY" && liveData.nextMeal && (
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <h3 className="text-white fw-bold mb-0">
              {liveData.nextMeal.icon} {liveData.nextMeal.label}
            </h3>
            <span className="badge bg-warning text-dark px-2 py-1 small">
              Starts at {formatTime12Hour(liveData.nextMeal.startTime)}
            </span>
          </div>

          <p className="text-light-50 mb-1 small">Upcoming menu:</p>
          {renderDishChips(
            liveData.nextMeal.items,
            liveData.nextMeal.customItems
          )}
        </div>
      )}

      {liveData.status === "NO_MORE_MEALS_TODAY" && (
        <div>
          <p className="text-secondary mb-2">
            All meal services for today have concluded.
          </p>
          {liveData.nextMeal && (
            <div className="d-flex align-items-center gap-2">
              <span className="text-light">
                Next meal:{" "}
                <strong className="text-warning">
                  {liveData.nextMeal.icon} {liveData.nextMeal.label}
                </strong>{" "}
                ({liveData.nextMeal.day}{" "}
                {liveData.nextMeal.isTomorrow ? "Tomorrow" : ""} at{" "}
                {formatTime12Hour(liveData.nextMeal.startTime)})
              </span>
            </div>
          )}
        </div>
      )}

      {/* Test / Time-Warp Simulation Drawer */}
      <div className="mt-3 pt-2 border-top border-secondary border-opacity-25">
        <div className="d-flex justify-content-between align-items-center">
          <button
            type="button"
            className="btn btn-link btn-sm text-secondary text-decoration-none p-0"
            onClick={() => setShowSimControls((prev) => !prev)}
            style={{ fontSize: "0.78rem" }}
          >
            ⚙️ {showSimControls ? "Hide Time Simulation" : "Preview Meal Periods (Test Mode)"}
          </button>
          {simulatedHourMinute && (
            <span className="badge bg-danger text-white small">
              ⏱ Simulating: {formatTime12Hour(simulatedHourMinute)}
            </span>
          )}
        </div>

        {showSimControls && (
          <div className="time-simulation-bar mt-2">
            <span className="text-warning fw-semibold">Quick Time Warp:</span>
            <div className="btn-group btn-group-sm flex-wrap gap-1">
              <button
                type="button"
                className={`btn btn-sm ${
                  !simulatedHourMinute
                    ? "btn-warning text-dark fw-bold"
                    : "btn-outline-secondary text-light"
                }`}
                onClick={() => setSimulatedHourMinute("")}
              >
                🔴 Live Clock
              </button>
              <button
                type="button"
                className={`btn btn-sm ${
                  simulatedHourMinute === "08:30"
                    ? "btn-warning text-dark fw-bold"
                    : "btn-outline-secondary text-light"
                }`}
                onClick={() => setSimulatedHourMinute("08:30")}
              >
                🌅 Breakfast (8:30 AM)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${
                  simulatedHourMinute === "11:00"
                    ? "btn-warning text-dark fw-bold"
                    : "btn-outline-secondary text-light"
                }`}
                onClick={() => setSimulatedHourMinute("11:00")}
              >
                ⏳ Pre-Lunch (11:00 AM)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${
                  simulatedHourMinute === "13:00"
                    ? "btn-warning text-dark fw-bold"
                    : "btn-outline-secondary text-light"
                }`}
                onClick={() => setSimulatedHourMinute("13:00")}
              >
                🍛 Lunch (1:00 PM)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${
                  simulatedHourMinute === "16:30"
                    ? "btn-warning text-dark fw-bold"
                    : "btn-outline-secondary text-light"
                }`}
                onClick={() => setSimulatedHourMinute("16:30")}
              >
                ☕ Snacks (4:30 PM)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${
                  simulatedHourMinute === "20:00"
                    ? "btn-warning text-dark fw-bold"
                    : "btn-outline-secondary text-light"
                }`}
                onClick={() => setSimulatedHourMinute("20:00")}
              >
                🌙 Dinner (8:00 PM)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${
                  simulatedHourMinute === "23:30"
                    ? "btn-warning text-dark fw-bold"
                    : "btn-outline-secondary text-light"
                }`}
                onClick={() => setSimulatedHourMinute("23:30")}
              >
                🌌 Night Closed (11:30 PM)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

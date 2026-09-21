import React, { useState, useEffect, useMemo } from "react"
import {
  getLiveMealStatus,
  formatCountdown,
  formatDurationShort,
  formatTime12Hour,
} from "../../utils/mealTiming"
import "../../styles/MealSchedule.css"

export default function LiveMealStatus({
  weeklySchedule = [],
  restaurantName,
  menus = [],
  setShowAuthModal,
}) {
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

  // Hide Test Mode from normal users; show only for admins or dev testing flags
  const isDevOrAdmin = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null")
      const mail = process.env.REACT_APP_MYMAIL
      const isAdminUser = Boolean(user && (user.role === "admin" || (mail && user.email === mail)))
      const hasDevQuery = typeof window !== "undefined" && (
        window.location.search.includes("dev=true") ||
        window.location.search.includes("test=true") ||
        localStorage.getItem("messbuddy_dev_mode") === "true"
      )
      return isAdminUser || hasDevQuery
    } catch {
      return false
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
    const timetableNotifyBtn = document.getElementById("timetable-notify-me-btn")
    if (timetableNotifyBtn) {
      timetableNotifyBtn.click()
    }
  }

  const handleAskAI = () => {
    window.dispatchEvent(
      new CustomEvent("messbuddy:open-ai-chat", {
        detail: { restaurantName },
      })
    )
    const launcher = document.querySelector(".ai-chat-launcher")
    const windowEl = document.querySelector(".ai-chat-window")
    if (launcher && !windowEl) {
      launcher.click()
    }
  }

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
      {/* Status Header Badge */}
      <div className="d-flex align-items-center justify-content-between mb-3">
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

      {/* Main Meal + Countdown Focus Row */}
      {liveData.status === "CURRENTLY_SERVING" && liveData.currentMeal && (
        <>
          <div className="live-meal-hero-row d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h2 className="live-meal-title text-white fw-bold mb-1">
                {liveData.currentMeal.icon} {liveData.currentMeal.label}
              </h2>
              <div className="live-meal-timing-text text-success fw-semibold">
                {formatTime12Hour(liveData.currentMeal.startTime)} – {formatTime12Hour(liveData.currentMeal.endTime)}
              </div>
            </div>

            <div className="countdown-timer-box">
              <span className="countdown-label text-secondary small">Closes in:</span>
              <span className="countdown-digits">
                {formatCountdown(liveData.secondsRemaining)}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <p className="live-menu-heading text-secondary mb-2 small text-uppercase fw-semibold">
              Serving right now:
            </p>
            {renderDishChips(
              liveData.currentMeal.items,
              liveData.currentMeal.customItems
            )}
          </div>
        </>
      )}

      {liveData.status === "UPCOMING_TODAY" && liveData.nextMeal && (
        <>
          <div className="live-meal-hero-row d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h2 className="live-meal-title text-white fw-bold mb-1">
                {liveData.nextMeal.icon} {liveData.nextMeal.label}
              </h2>
              <div className="live-meal-timing-text text-warning fw-semibold">
                Starts at {formatTime12Hour(liveData.nextMeal.startTime)}
              </div>
            </div>

            <div className="countdown-timer-box">
              <span className="countdown-label text-secondary small">Starts in:</span>
              <span className="countdown-digits">
                {formatCountdown(liveData.secondsUntilStart)}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <p className="live-menu-heading text-secondary mb-2 small text-uppercase fw-semibold">
              Upcoming menu:
            </p>
            {renderDishChips(
              liveData.nextMeal.items,
              liveData.nextMeal.customItems
            )}
          </div>
        </>
      )}

      {liveData.status === "NO_MORE_MEALS_TODAY" && (
        <>
          <div className="live-meal-hero-row d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h3 className="live-meal-title text-white fw-bold mb-1">
                All meals for today concluded
              </h3>
              {liveData.nextMeal ? (
                <div className="text-light-50 small">
                  Next meal:{" "}
                  <strong className="text-warning">
                    {liveData.nextMeal.icon} {liveData.nextMeal.label}
                  </strong>{" "}
                  ({liveData.nextMeal.day}{" "}
                  {liveData.nextMeal.isTomorrow ? "Tomorrow" : ""} at{" "}
                  {formatTime12Hour(liveData.nextMeal.startTime)})
                </div>
              ) : (
                <div className="text-secondary small">
                  Check weekly timetable for upcoming timings.
                </div>
              )}
            </div>

            {liveData.nextMeal && (
              <div className="countdown-timer-box">
                <span className="countdown-label text-secondary small">Next meal in:</span>
                <span className="countdown-digits">
                  {formatDurationShort(liveData.secondsUntilStart)}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Subtle Actions Row */}
      <div className="live-status-actions d-flex flex-wrap align-items-center gap-2 pt-3 mt-3 border-top border-secondary border-opacity-25">
        <button
          type="button"
          className="live-action-btn live-action-notify"
          onClick={handleNotifyClick}
          id="live-meal-notify-btn"
          title="Get meal reminder notifications"
        >
          <span>🔔</span>
          <span>Notify Me</span>
        </button>

        <button
          type="button"
          className="live-action-btn live-action-ai"
          onClick={handleAskAI}
          id="live-meal-ai-btn"
          title="Ask MessBuddy AI about this meal"
        >
          <span>🤖</span>
          <span>Ask MessBuddy AI</span>
        </button>
      </div>

      {/* Test / Time-Warp Simulation Drawer (Hidden for normal users; shown for admin/dev) */}
      {isDevOrAdmin && (
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
      )}
    </div>
  )
}

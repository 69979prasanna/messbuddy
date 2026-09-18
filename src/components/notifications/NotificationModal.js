import React, { useState, useEffect } from "react"
import "../../App.css"
import "../../styles/NotificationModal.css"
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "../../utils/notificationPreferences"

export default function NotificationModal({ onClose, onPreferencesUpdated }) {
  const [preferences, setPreferences] = useState(DEFAULT_NOTIFICATION_PREFERENCES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    let isMounted = true
    const fetchPrefs = async () => {
      setLoading(true)
      const res = await getNotificationPreferences()
      if (isMounted) {
        if (res.preferences) {
          setPreferences({
            ...DEFAULT_NOTIFICATION_PREFERENCES,
            ...res.preferences,
            mealReminders: {
              ...DEFAULT_NOTIFICATION_PREFERENCES.mealReminders,
              ...(res.preferences.mealReminders || {}),
            },
          })
        }
        setLoading(false)
      }
    }
    fetchPrefs()
    return () => {
      isMounted = false
    }
  }, [])

  const handleToggle = (path) => {
    setSuccess("")
    setError("")
    setPreferences((prev) => {
      if (path === "enabled") {
        return { ...prev, enabled: !prev.enabled }
      }
      if (path === "mealReminders.enabled") {
        return {
          ...prev,
          mealReminders: {
            ...prev.mealReminders,
            enabled: !prev.mealReminders.enabled,
          },
        }
      }
      return {
        ...prev,
        [path]: !prev[path],
      }
    })
  }

  const handleTimingChange = (e) => {
    const val = Number(e.target.value)
    setPreferences((prev) => ({
      ...prev,
      mealReminders: {
        ...prev.mealReminders,
        minutesBefore: val,
      },
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    const result = await updateNotificationPreferences(preferences)
    setSaving(false)

    if (result.success) {
      setSuccess("✅ Notification preferences saved!")
      if (onPreferencesUpdated) {
        onPreferencesUpdated(preferences)
      }
      setTimeout(() => {
        onClose()
      }, 1400)
    } else {
      setError(result.message || "Failed to save notification preferences.")
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className="notification-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="notification-modal-header">
          <h2>🔔 MessBuddy Notifications</h2>
          <p>Never miss what's happening at your mess.</p>
        </div>

        {error && <div className="auth-modal-error mb-3">{error}</div>}
        {success && <div className="auth-modal-success mb-3">{success}</div>}

        {loading ? (
          <div className="text-center py-4 text-secondary">
            <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
            Loading preferences...
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="notification-master-card">
              <div className="notification-master-info">
                <span className="notification-master-title">
                  Allow Email Notifications
                </span>
                <span className="notification-master-subtitle">
                  Turn on or off all MessBuddy email alerts
                </span>
              </div>
              <label className="switch-wrapper">
                <input
                  type="checkbox"
                  checked={preferences.enabled}
                  onChange={() => handleToggle("enabled")}
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            <div className={!preferences.enabled ? "disabled-section" : ""}>
              <div className="notification-section">
                <div className="notification-section-title">
                  <span>🍛</span> Meal Reminders
                </div>

                <div className="notification-row">
                  <div className="notification-row-content">
                    <label
                      className="notification-row-label"
                      onClick={() => handleToggle("mealReminders.enabled")}
                    >
                      Meal reminders
                    </label>
                    <div className="notification-row-desc">
                      Notify me before my meal starts
                    </div>
                  </div>
                  <label className="switch-wrapper">
                    <input
                      type="checkbox"
                      checked={preferences.mealReminders?.enabled}
                      onChange={() => handleToggle("mealReminders.enabled")}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                {preferences.mealReminders?.enabled && (
                  <div className="meal-timing-dropdown-row">
                    <span className="text-light small">Reminder timing:</span>
                    <select
                      className="meal-timing-select"
                      value={preferences.mealReminders?.minutesBefore || 15}
                      onChange={handleTimingChange}
                    >
                      <option value={10}>10 minutes before</option>
                      <option value={15}>15 minutes before</option>
                      <option value={30}>30 minutes before</option>
                      <option value={60}>1 hour before</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="notification-section">
                <div className="notification-section-title">
                  <span>❤️</span> Favorite Food
                </div>

                <div className="notification-row">
                  <div className="notification-row-content">
                    <label
                      className="notification-row-label"
                      onClick={() => handleToggle("favoriteFoodAvailable")}
                    >
                      Favorite food available
                    </label>
                    <div className="notification-row-desc">
                      Notify me when a food item I have favorited becomes available.
                    </div>
                  </div>
                  <label className="switch-wrapper">
                    <input
                      type="checkbox"
                      checked={preferences.favoriteFoodAvailable}
                      onChange={() => handleToggle("favoriteFoodAvailable")}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                <div className="notification-row mt-3">
                  <div className="notification-row-content">
                    <label
                      className="notification-row-label"
                      onClick={() => handleToggle("favoriteFoodAlmostFinished")}
                    >
                      Favorite food almost finished
                    </label>
                    <div className="notification-row-desc">
                      Notify me when a favorited food item is running low.
                    </div>
                  </div>
                  <label className="switch-wrapper">
                    <input
                      type="checkbox"
                      checked={preferences.favoriteFoodAlmostFinished}
                      onChange={() => handleToggle("favoriteFoodAlmostFinished")}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>
              </div>

              <div className="notification-section">
                <div className="notification-section-title">
                  <span>🏪</span> Favorite Restaurants
                </div>

                <div className="notification-row">
                  <div className="notification-row-content">
                    <label
                      className="notification-row-label"
                      onClick={() => handleToggle("favoriteRestaurantUpdates")}
                    >
                      Favorite restaurant updates
                    </label>
                    <div className="notification-row-desc">
                      Notify me when my favorite restaurant opens or starts serving.
                    </div>
                  </div>
                  <label className="switch-wrapper">
                    <input
                      type="checkbox"
                      checked={preferences.favoriteRestaurantUpdates}
                      onChange={() => handleToggle("favoriteRestaurantUpdates")}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>
              </div>

              <div className="notification-section">
                <div className="notification-section-title">
                  <span>🤖</span> MessBuddy AI
                </div>

                <div className="notification-row">
                  <div className="notification-row-content">
                    <label
                      className="notification-row-label"
                      onClick={() => handleToggle("aiSuggestions")}
                    >
                      Personalized AI food suggestions
                    </label>
                    <div className="notification-row-desc">
                      Let MessBuddy AI occasionally suggest something based on your preferences.
                    </div>
                  </div>
                  <label className="switch-wrapper">
                    <input
                      type="checkbox"
                      checked={preferences.aiSuggestions}
                      onChange={() => handleToggle("aiSuggestions")}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="notification-modal-actions">
              <button
                type="button"
                className="btn-cancel-notifications"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-save-notifications"
                disabled={saving}
              >
                {saving ? "Saving..." : "💾 Save Preferences"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

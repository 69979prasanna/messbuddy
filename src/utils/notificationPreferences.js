const API = process.env.REACT_APP_APIKEY || "http://localhost:5000/api"

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  enabled: true,
  mealReminders: {
    enabled: true,
    minutesBefore: 15,
  },
  favoriteFoodAvailable: true,
  favoriteFoodAlmostFinished: true,
  favoriteRestaurantUpdates: false,
  aiSuggestions: false,
}

export const getNotificationPreferences = async () => {
  const token = localStorage.getItem("token")
  if (!token) return { success: false, preferences: DEFAULT_NOTIFICATION_PREFERENCES }

  try {
    const res = await fetch(`${API}/notifications/preferences`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      return { success: false, preferences: DEFAULT_NOTIFICATION_PREFERENCES }
    }

    const data = await res.json()
    return {
      success: true,
      preferences: data.preferences || DEFAULT_NOTIFICATION_PREFERENCES,
    }
  } catch (err) {
    console.error("Error fetching notification preferences:", err)
    return { success: false, preferences: DEFAULT_NOTIFICATION_PREFERENCES }
  }
}

export const updateNotificationPreferences = async (preferences) => {
  const token = localStorage.getItem("token")
  if (!token) {
    return { success: false, message: "Please log in to save preferences" }
  }

  try {
    const res = await fetch(`${API}/notifications/preferences`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ preferences }),
    })

    const data = await res.json()
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Failed to save preferences",
      }
    }

    return {
      success: true,
      message: data.message || "Notification preferences saved!",
      preferences: data.preferences,
    }
  } catch (err) {
    console.error("Error updating notification preferences:", err)
    return { success: false, message: "Network error saving preferences" }
  }
}

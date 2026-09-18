import express from "express"
import auth from "../middleware/authMiddleware.js"
import User from "../models/User.js"
import { runNotificationCheckCycle } from "../services/notificationService.js"

const router = express.Router()

const DEFAULT_PREFERENCES = {
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

router.get("/preferences", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("notificationPreferences username email").lean()
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const preferences = {
      ...DEFAULT_PREFERENCES,
      ...(user.notificationPreferences || {}),
      mealReminders: {
        ...DEFAULT_PREFERENCES.mealReminders,
        ...(user.notificationPreferences?.mealReminders || {}),
      },
    }

    res.json({
      success: true,
      preferences,
    })
  } catch (err) {
    console.error("❌ Error fetching notification preferences:", err)
    res.status(500).json({ message: "Failed to fetch notification preferences" })
  }
})

router.put("/preferences", auth, async (req, res) => {
  try {
    const { preferences } = req.body
    if (!preferences || typeof preferences !== "object") {
      return res.status(400).json({ message: "Invalid preferences data provided" })
    }

    const updatePayload = {
      notificationPreferences: {
        enabled: preferences.enabled !== false,
        mealReminders: {
          enabled: preferences.mealReminders?.enabled !== false,
          minutesBefore: [10, 15, 30, 60].includes(Number(preferences.mealReminders?.minutesBefore))
            ? Number(preferences.mealReminders.minutesBefore)
            : 15,
        },
        favoriteFoodAvailable: preferences.favoriteFoodAvailable !== false,
        favoriteFoodAlmostFinished: preferences.favoriteFoodAlmostFinished !== false,
        favoriteRestaurantUpdates: Boolean(preferences.favoriteRestaurantUpdates),
        aiSuggestions: Boolean(preferences.aiSuggestions),
      },
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).select("notificationPreferences")

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      success: true,
      message: "Notification preferences saved successfully!",
      preferences: updatedUser.notificationPreferences,
    })
  } catch (err) {
    console.error("❌ Error saving notification preferences:", err)
    res.status(500).json({ message: "Failed to update notification preferences" })
  }
})

router.post("/check-now", async (req, res) => {
  try {
    const result = await runNotificationCheckCycle()
    res.json({
      success: true,
      message: "Notification check cycle completed",
      result,
    })
  } catch (err) {
    console.error("❌ Error executing manual notification cycle:", err)
    res.status(500).json({ message: "Failed to run notification cycle", error: err.message })
  }
})

export default router

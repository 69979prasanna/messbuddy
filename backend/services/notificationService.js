import User from "../models/User.js"
import Restaurant from "../models/Restaurant.js"
import Menu from "../models/Menu.js"
import Favorite from "../models/Favourite.js"
import NotificationLog from "../models/NotificationLog.js"
import { transporter } from "../utils/sendEmail.js"
import {
  renderMealReminderEmail,
  renderFavoriteFoodAvailableEmail,
  renderAlmostFinishedEmail,
  renderRestaurantOpenEmail,
  renderAISuggestionEmail,
} from "./notificationEmailTemplates.js"
import {
  formatTime12Hour,
  getMessBuddyDataContext,
} from "./messDataService.js"

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

const MEAL_PERIOD_CONFIG = [
  { key: "breakfast", label: "Breakfast", defaultStart: "07:30", defaultEnd: "10:00" },
  { key: "lunch", label: "Lunch", defaultStart: "12:00", defaultEnd: "15:00" },
  { key: "snacks", label: "Snacks", defaultStart: "16:00", defaultEnd: "18:00" },
  { key: "dinner", label: "Dinner", defaultStart: "19:00", defaultEnd: "22:00" },
]

const getTodayDateString = (date = new Date()) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const timeStringToMinutes = (timeStr) => {
  if (!timeStr) return null
  const [h, m] = timeStr.split(":").map(Number)
  if (isNaN(h) || isNaN(m)) return null
  return h * 60 + m
}

export const sendNotificationEmail = async ({
  user,
  type,
  referenceKey,
  subject,
  html,
  metadata = {},
}) => {
  if (!user || !user.email) return false

  try {
    const existing = await NotificationLog.findOne({
      user: user._id,
      type,
      referenceKey,
    })
    if (existing) {
      return false
    }

    const info = await transporter.sendMail({
      from: `"MessBuddy" <${process.env.EMAIL}>`,
      to: user.email,
      subject,
      html,
    })

    await NotificationLog.create({
      user: user._id,
      type,
      referenceKey,
      metadata: { ...metadata, messageId: info.messageId },
    })

    console.log(`🔔 [Notification Sent] ${type} -> ${user.email} (${referenceKey})`)
    return true
  } catch (err) {
    console.error(`❌ [Notification Send Failed] to ${user.email}:`, err.message)
    return false
  }
}
export const processMealReminders = async (now = new Date()) => {
  const todayDateStr = getTodayDateString(now)
  const todayDayName = DAYS_OF_WEEK[now.getDay()]
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes()
  const users = await User.find({
    isVerified: true,
    "notificationPreferences.enabled": { $ne: false },
    "notificationPreferences.mealReminders.enabled": { $ne: false },
  }).lean()

  if (!users || users.length === 0) return 0

  const restaurants = await Restaurant.find().populate("weeklySchedule.meals.breakfast.items weeklySchedule.meals.lunch.items weeklySchedule.meals.snacks.items weeklySchedule.meals.dinner.items").lean()
  const menus = await Menu.find().lean()
  const menuMap = new Map()
  menus.forEach((m) => menuMap.set(m._id.toString(), m))

  let sentCount = 0

  for (const user of users) {
    const minutesBefore =
      user.notificationPreferences?.mealReminders?.minutesBefore || 15
    const favs = await Favorite.find({
      user: user._id,
      restaurant: { $ne: null },
    })
      .select("restaurant")
      .lean()

    const targetRestaurants =
      favs.length > 0
        ? restaurants.filter((r) =>
          favs.some((f) => f.restaurant?.toString() === r._id.toString())
        )
        : restaurants

    for (const rest of targetRestaurants) {
      const todaySched = (rest.weeklySchedule || []).find(
        (s) => s.day?.toLowerCase() === todayDayName.toLowerCase()
      )
      if (!todaySched?.meals) continue

      for (const period of MEAL_PERIOD_CONFIG) {
        const meal = todaySched.meals[period.key]
        const startTime = meal?.startTime || period.defaultStart
        const endTime = meal?.endTime || period.defaultEnd
        const startMinutes = timeStringToMinutes(startTime)

        if (startMinutes === null) continue

        const diff = startMinutes - currentTotalMinutes
        if (diff >= minutesBefore - 1 && diff <= minutesBefore + 1) {
          const referenceKey = `meal_${user._id}_${rest._id}_${period.key}_${todayDateStr}`

          const alreadySent = await NotificationLog.exists({
            user: user._id,
            type: "meal_reminder",
            referenceKey,
          })
          if (alreadySent) continue

          const dishNames = []
          if (Array.isArray(meal?.items)) {
            meal.items.forEach((it) => {
              if (it && typeof it === "object" && it.dish) {
                dishNames.push(`• ${it.dish} (₹${it.price})`)
              } else if (it) {
                const found = menuMap.get(it.toString())
                if (found) dishNames.push(`• ${found.dish} (₹${found.price})`)
              }
            })
          }
          if (Array.isArray(meal?.customItems)) {
            meal.customItems.forEach((c) => {
              if (c && c.trim()) dishNames.push(`• ${c.trim()}`)
            })
          }

          const template = renderMealReminderEmail({
            username: user.username,
            restaurantName: rest.name,
            mealName: period.label,
            minutesBefore,
            timing: `${formatTime12Hour(startTime)} – ${formatTime12Hour(endTime)}`,
            dishes: dishNames,
            ctaUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/place/${rest._id}`,
          })

          const sent = await sendNotificationEmail({
            user,
            type: "meal_reminder",
            referenceKey,
            subject: template.subject,
            html: template.html,
            metadata: {
              restaurantId: rest._id,
              restaurantName: rest.name,
              mealKey: period.key,
              minutesBefore,
            },
          })

          if (sent) sentCount++
        }
      }
    }
  }

  return sentCount
}

export const notifyFavoriteFoodAvailable = async (menuId) => {
  if (!menuId) return 0
  const menu = await Menu.findById(menuId).populate("restaurant", "name").lean()
  if (!menu || !menu.isAvailable || menu.status === "Out of Stock") return 0

  const todayDateStr = getTodayDateString()

  const favs = await Favorite.find({ menu: menu._id }).select("user").lean()
  if (!favs || favs.length === 0) return 0

  const userIds = favs.map((f) => f.user)
  const users = await User.find({
    _id: { $in: userIds },
    isVerified: true,
    "notificationPreferences.enabled": { $ne: false },
    "notificationPreferences.favoriteFoodAvailable": { $ne: false },
  }).lean()

  let sentCount = 0
  for (const user of users) {
    const referenceKey = `food_avail_${user._id}_${menu._id}_${todayDateStr}`

    const alreadySent = await NotificationLog.exists({
      user: user._id,
      type: "favorite_food_available",
      referenceKey,
    })
    if (alreadySent) continue

    const template = renderFavoriteFoodAvailableEmail({
      username: user.username,
      restaurantName: menu.restaurant?.name || "Mess",
      dish: menu.dish,
      price: menu.price,
      ctaUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/place/${menu.restaurant?._id || ""}`,
    })

    const sent = await sendNotificationEmail({
      user,
      type: "favorite_food_available",
      referenceKey,
      subject: template.subject,
      html: template.html,
      metadata: { menuId: menu._id, dish: menu.dish },
    })

    if (sent) sentCount++
  }

  return sentCount
}

export const notifyFavoriteFoodAlmostFinished = async (menuId) => {
  if (!menuId) return 0
  const menu = await Menu.findById(menuId).populate("restaurant", "name").lean()
  if (!menu) return 0

  const todayDateStr = getTodayDateString()

  const favs = await Favorite.find({ menu: menu._id }).select("user").lean()
  if (!favs || favs.length === 0) return 0

  const userIds = favs.map((f) => f.user)
  const users = await User.find({
    _id: { $in: userIds },
    isVerified: true,
    "notificationPreferences.enabled": { $ne: false },
    "notificationPreferences.favoriteFoodAlmostFinished": { $ne: false },
  }).lean()

  let sentCount = 0
  for (const user of users) {
    const referenceKey = `almost_finished_${user._id}_${menu._id}_${todayDateStr}`

    const alreadySent = await NotificationLog.exists({
      user: user._id,
      type: "almost_finished",
      referenceKey,
    })
    if (alreadySent) continue

    const template = renderAlmostFinishedEmail({
      username: user.username,
      restaurantName: menu.restaurant?.name || "Mess",
      dish: menu.dish,
      ctaUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/place/${menu.restaurant?._id || ""}`,
    })

    const sent = await sendNotificationEmail({
      user,
      type: "almost_finished",
      referenceKey,
      subject: template.subject,
      html: template.html,
      metadata: { menuId: menu._id, dish: menu.dish },
    })

    if (sent) sentCount++
  }

  return sentCount
}

export const processRestaurantUpdates = async (now = new Date()) => {
  const todayDateStr = getTodayDateString(now)
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes()

  const users = await User.find({
    isVerified: true,
    "notificationPreferences.enabled": { $ne: false },
    "notificationPreferences.favoriteRestaurantUpdates": true,
  }).lean()

  if (!users || users.length === 0) return 0

  let sentCount = 0

  for (const user of users) {
    const favs = await Favorite.find({
      user: user._id,
      restaurant: { $ne: null },
    })
      .populate("restaurant")
      .lean()

    for (const fav of favs) {
      const rest = fav.restaurant
      if (!rest || !rest.openingTime) continue

      const openMinutes = timeStringToMinutes(rest.openingTime)
      if (openMinutes === null) continue

      const diff = currentTotalMinutes - openMinutes
      if (diff >= 0 && diff <= 4) {
        const referenceKey = `rest_open_${user._id}_${rest._id}_${todayDateStr}`

        const alreadySent = await NotificationLog.exists({
          user: user._id,
          type: "restaurant_update",
          referenceKey,
        })
        if (alreadySent) continue

        let currentMeal = ""
        for (const period of MEAL_PERIOD_CONFIG) {
          const start = timeStringToMinutes(period.defaultStart)
          const end = timeStringToMinutes(period.defaultEnd)
          if (start && end && currentTotalMinutes >= start && currentTotalMinutes < end) {
            currentMeal = period.label
            break
          }
        }

        const template = renderRestaurantOpenEmail({
          username: user.username,
          restaurantName: rest.name,
          currentMeal: currentMeal || "Fresh meals",
          ctaUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/place/${rest._id}`,
        })

        const sent = await sendNotificationEmail({
          user,
          type: "restaurant_update",
          referenceKey,
          subject: template.subject,
          html: template.html,
          metadata: { restaurantId: rest._id, restaurantName: rest.name },
        })

        if (sent) sentCount++
      }
    }
  }

  return sentCount
}

export const processAISuggestions = async () => {
  const users = await User.find({
    isVerified: true,
    "notificationPreferences.enabled": { $ne: false },
    "notificationPreferences.aiSuggestions": true,
  }).lean()

  if (!users || users.length === 0) return 0

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  let sentCount = 0

  const availableMenus = await Menu.find({
    isAvailable: true,
    status: { $ne: "Out of Stock" },
  })
    .populate("restaurant", "name")
    .lean()

  if (!availableMenus || availableMenus.length === 0) return 0

  for (const user of users) {
    const recentSuggestion = await NotificationLog.findOne({
      user: user._id,
      type: "ai_suggestion",
      sentAt: { $gte: sevenDaysAgo },
    })

    if (recentSuggestion) continue

    const userDiet = user.preferences?.diet || user.aiProfile?.dietaryPreference
    const userBudget = user.preferences?.budget || user.aiProfile?.budgetRange?.max
    const favoriteFoods = user.aiProfile?.favoriteFoods || []

    let matchedDishes = availableMenus.filter((m) => {
      if (userDiet && userDiet.toLowerCase() === "veg") {
        const cat = (m.category || "").toLowerCase()
        if (cat.includes("non-veg") || cat.includes("chicken") || cat.includes("egg") || cat.includes("fish")) {
          return false
        }
      }
      if (userBudget && m.price > userBudget) {
        return false
      }
      return true
    })

    if (matchedDishes.length === 0) {
      matchedDishes = availableMenus
    }

    matchedDishes.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    const selectedDish = matchedDishes[Math.floor(Math.random() * Math.min(3, matchedDishes.length))]
    if (!selectedDish) continue

    const referenceKey = `ai_sugg_${user._id}_${selectedDish._id}_${getTodayDateString()}`

    const template = renderAISuggestionEmail({
      username: user.username,
      restaurantName: selectedDish.restaurant?.name || "Campus Mess",
      dish: selectedDish.dish,
      price: selectedDish.price,
      rating: selectedDish.rating ? selectedDish.rating.toFixed(1) : "4.5",
      note: selectedDish.description || "Freshly prepared and available today.",
      ctaUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/place/${selectedDish.restaurant?._id || ""}`,
    })

    const sent = await sendNotificationEmail({
      user,
      type: "ai_suggestion",
      referenceKey,
      subject: template.subject,
      html: template.html,
      metadata: {
        dish: selectedDish.dish,
        price: selectedDish.price,
        restaurantName: selectedDish.restaurant?.name,
      },
    })

    if (sent) sentCount++
  }

  return sentCount
}

export const runNotificationCheckCycle = async () => {
  const now = new Date()
  const results = {
    timestamp: now.toISOString(),
    mealRemindersSent: 0,
    restaurantUpdatesSent: 0,
    aiSuggestionsSent: 0,
  }

  try {
    results.mealRemindersSent = await processMealReminders(now)
  } catch (err) {
    console.error("❌ Error running processMealReminders:", err)
  }

  try {
    results.restaurantUpdatesSent = await processRestaurantUpdates(now)
  } catch (err) {
    console.error("❌ Error running processRestaurantUpdates:", err)
  }

  try {
    results.aiSuggestionsSent = await processAISuggestions()
  } catch (err) {
    console.error("❌ Error running processAISuggestions:", err)
  }

  return results
}

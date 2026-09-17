import Restaurant from "../models/Restaurant.js"
import Menu from "../models/Menu.js"
import Review from "../models/Review.js"
import Favorite from "../models/Favourite.js"
import User from "../models/User.js"

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

const MEAL_PERIODS = [
  { key: "breakfast", label: "Breakfast", defaultStart: "07:30", defaultEnd: "10:00" },
  { key: "lunch", label: "Lunch", defaultStart: "12:00", defaultEnd: "15:00" },
  { key: "snacks", label: "Snacks", defaultStart: "16:00", defaultEnd: "18:00" },
  { key: "dinner", label: "Dinner", defaultStart: "19:00", defaultEnd: "22:00" },
]
export const formatTime12Hour = (timeStr) => {
  if (!timeStr) return ""
  const parts = timeStr.split(":")
  if (parts.length < 2) return timeStr
  let hour = parseInt(parts[0], 10)
  const minute = parts[1]
  const ampm = hour >= 12 ? "PM" : "AM"
  hour = hour % 12 || 12
  return `${hour}:${minute} ${ampm}`
}
const timeStringToDate = (timeStr, baseDate = new Date()) => {
  if (!timeStr) return null
  const [hours, minutes] = timeStr.split(":").map(Number)
  const date = new Date(baseDate)
  date.setHours(hours, minutes, 0, 0)
  return date
}
const isRestaurantOpen = (openingTime, closingTime, now = new Date()) => {
  if (!openingTime || !closingTime) return false
  const [openH, openM] = openingTime.split(":").map(Number)
  const [closeH, closeM] = closingTime.split(":").map(Number)

  const currentH = now.getHours()
  const currentM = now.getMinutes()
  const currentTotal = currentH * 60 + currentM
  const openTotal = openH * 60 + openM
  let closeTotal = closeH * 60 + closeM

  if (closeTotal <= openTotal) {
    return currentTotal >= openTotal || currentTotal < closeTotal
  }
  return currentTotal >= openTotal && currentTotal < closeTotal
}
export const getMessBuddyDataContext = async (userId = null) => {
  const now = new Date()
  const todayDayName = DAYS_OF_WEEK[now.getDay()]
  const tomorrowDayName = DAYS_OF_WEEK[(now.getDay() + 1) % 7]
  const currentTime12 = formatTime12Hour(
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  )
  const restaurants = await Restaurant.find().lean()
  const menus = await Menu.find().populate("restaurant", "name").lean()
  const reviews = await Review.find().sort({ createdAt: -1 }).lean()
  let userProfile = null
  let favoriteRestaurants = []
  let favoriteMenuItems = []
  if (userId) {
    const userDoc = await User.findById(userId).lean()
    if (userDoc) {
      userProfile = {
        username: userDoc.username,
        diet: userDoc.preferences?.diet || null,
        budget: userDoc.preferences?.budget || null,
        aiProfile: userDoc.aiProfile || {},
      }
    }
    const favDocs = await Favorite.find({ user: userId })
      .populate("restaurant", "name")
      .populate({
        path: "menu",
        select: "dish price category",
        populate: { path: "restaurant", select: "name" },
      })
      .lean()
    for (const fav of favDocs) {
      if (fav.restaurant) favoriteRestaurants.push(fav.restaurant.name)
      if (fav.menu) {
        favoriteMenuItems.push(
          `${fav.menu.dish} (${fav.menu.restaurant?.name || "Mess"}) - ₹${fav.menu.price}`
        )
      }
    }
  }
  const timetableToday = []
  const timetableTomorrow = []
  let activeMealToday = null
  let nextMealToday = null
  const menuMap = new Map()
  menus.forEach((m) => {
    menuMap.set(m._id.toString(), {
      dish: m.dish,
      price: m.price,
      category: m.category,
      isAvailable: m.isAvailable,
    })
  })
  restaurants.forEach((rest) => {
    const schedule = rest.weeklySchedule || []
    const todaySched = schedule.find(
      (s) => s.day?.toLowerCase() === todayDayName.toLowerCase()
    )
    const tomorrowSched = schedule.find(
      (s) => s.day?.toLowerCase() === tomorrowDayName.toLowerCase()
    )

    if (todaySched?.meals) {
      MEAL_PERIODS.forEach((mp) => {
        const meal = todaySched.meals[mp.key]
        if (meal && (meal.startTime || meal.endTime || meal.items?.length || meal.customItems?.length)) {
          const itemNames = []
          if (Array.isArray(meal.items)) {
            meal.items.forEach((id) => {
              const found = menuMap.get(id?.toString())
              if (found) itemNames.push(`${found.dish} (₹${found.price})`)
            })
          }
          if (Array.isArray(meal.customItems)) {
            meal.customItems.forEach((c) => {
              if (c && c.trim()) itemNames.push(c.trim())
            })
          }

          timetableToday.push({
            restaurant: rest.name,
            meal: mp.label,
            mealKey: mp.key,
            startTime: meal.startTime || mp.defaultStart,
            endTime: meal.endTime || mp.defaultEnd,
            formattedTiming: `${formatTime12Hour(meal.startTime || mp.defaultStart)} – ${formatTime12Hour(meal.endTime || mp.defaultEnd)}`,
            dishes: itemNames,
          })
        }
      })
    }

    if (tomorrowSched?.meals) {
      MEAL_PERIODS.forEach((mp) => {
        const meal = tomorrowSched.meals[mp.key]
        if (meal && (meal.items?.length || meal.customItems?.length)) {
          const itemNames = []
          if (Array.isArray(meal.items)) {
            meal.items.forEach((id) => {
              const found = menuMap.get(id?.toString())
              if (found) itemNames.push(`${found.dish} (₹${found.price})`)
            })
          }
          if (Array.isArray(meal.customItems)) {
            meal.customItems.forEach((c) => {
              if (c && c.trim()) itemNames.push(c.trim())
            })
          }

          timetableTomorrow.push({
            restaurant: rest.name,
            meal: mp.label,
            mealKey: mp.key,
            formattedTiming: `${formatTime12Hour(meal.startTime || mp.defaultStart)} – ${formatTime12Hour(meal.endTime || mp.defaultEnd)}`,
            dishes: itemNames,
          })
        }
      })
    }
  })
  for (const mp of MEAL_PERIODS) {
    const start = timeStringToDate(mp.defaultStart, now)
    const end = timeStringToDate(mp.defaultEnd, now)
    if (now >= start && now < end) {
      activeMealToday = {
        meal: mp.label,
        timing: `${formatTime12Hour(mp.defaultStart)} – ${formatTime12Hour(mp.defaultEnd)}`,
      }
      break
    }
  }

  for (const mp of MEAL_PERIODS) {
    const start = timeStringToDate(mp.defaultStart, now)
    if (now < start) {
      nextMealToday = {
        meal: mp.label,
        timing: `${formatTime12Hour(mp.defaultStart)} – ${formatTime12Hour(mp.defaultEnd)}`,
      }
      break
    }
  }
  const restaurantSummary = restaurants.map((r) => {
    const open = isRestaurantOpen(r.openingTime, r.closingTime, now)
    return `- ${r.name}: ${open ? "🟢 Open Now" : "🔴 Closed"} (Hours: ${formatTime12Hour(r.openingTime)} to ${formatTime12Hour(r.closingTime)}), Rating: ${r.averageRating ? r.averageRating + "★" : "New / No ratings yet"} (${r.totalReviews || 0} reviews), Featured: ${r.featuredDish} (₹${r.featuredPrice}), Tags: [${(r.tags || []).join(", ")}], Address: ${r.address || "Campus area"}`
  }).join("\n")
  const menuSummary = menus.map((m) => {
    const restName = m.restaurant?.name || "Unknown Mess"
    return `- ${m.dish} | Mess: ${restName} | Price: ₹${m.price} | Category: ${m.category} | Status: ${m.isAvailable ? "Available" : "Unavailable"} | Rating: ${m.rating ? m.rating + "★" : "Unrated"}${m.description ? " | Note: " + m.description : ""}`
  }).join("\n")
  const reviewsSummary = reviews.length > 0
    ? reviews.slice(0, 30).map((rev) => {
        const matchedRest = restaurants.find((r) => r._id.toString() === rev.place)
        const placeName = matchedRest ? matchedRest.name : rev.place
        return `- [${placeName}] ${rev.rating}★ by ${rev.username}: "${rev.comment}"`
      }).join("\n")
    : "No customer reviews submitted yet in the database."

  const timetableTodaySummary = timetableToday.length > 0
    ? timetableToday.map((t) =>
        `- ${t.restaurant} | ${t.meal} (${t.formattedTiming}): ${t.dishes.length > 0 ? t.dishes.join(", ") : "Standard mess menu"}`
      ).join("\n")
    : "No specific timetable entries for today."

  const timetableTomorrowSummary = timetableTomorrow.length > 0
    ? timetableTomorrow.map((t) =>
        `- ${t.restaurant} | ${t.meal} (${t.formattedTiming}): ${t.dishes.length > 0 ? t.dishes.join(", ") : "Standard mess menu"}`
      ).join("\n")
    : "No specific timetable entries for tomorrow."

  return {
    raw: {
      now,
      todayDayName,
      tomorrowDayName,
      currentTime12,
      activeMealToday,
      nextMealToday,
      restaurants,
      menus,
      reviews,
      userProfile,
      favoriteRestaurants,
      favoriteMenuItems,
      timetableToday,
      timetableTomorrow,
    },
    promptContext: `
==================== CURRENT TIME & MEAL STATUS ====================
- Today: ${todayDayName}, Current Time: ${currentTime12}
- Active Meal Right Now: ${activeMealToday ? `${activeMealToday.meal} (${activeMealToday.timing})` : "Between scheduled meal service times"}
- Next Upcoming Meal: ${nextMealToday ? `${nextMealToday.meal} (${nextMealToday.timing})` : "All today's meals have concluded (Next is tomorrow's breakfast)"}

==================== VERIFIED RESTAURANTS IN DATABASE ====================
${restaurantSummary || "No restaurants found."}

==================== VERIFIED MENU ITEMS IN DATABASE ====================
${menuSummary || "No menu items found."}

==================== TODAY'S WEEKLY TIMETABLE (${todayDayName.toUpperCase()}) ====================
${timetableTodaySummary}

==================== TOMORROW'S WEEKLY TIMETABLE (${tomorrowDayName.toUpperCase()}) ====================
${timetableTomorrowSummary}

==================== ACTUAL CUSTOMER REVIEWS IN DATABASE ====================
${reviewsSummary}

${userProfile ? `
==================== AUTHENTICATED USER CONTEXT ====================
- User: ${userProfile.username}
- General Preferences: Diet: ${userProfile.diet || "Any"}, Budget: ${userProfile.budget ? "₹" + userProfile.budget : "Not set"}
- Learned AI Memory:
  * Budget Range: ${userProfile.aiProfile?.budgetRange?.max ? "Under ₹" + userProfile.aiProfile.budgetRange.max : "Flexible"}
  * Preferred Categories: ${(userProfile.aiProfile?.preferredCategories || []).join(", ") || "None recorded"}
  * Favorite Foods: ${(userProfile.aiProfile?.favoriteFoods || []).join(", ") || "None recorded"}
  * Disliked Foods: ${(userProfile.aiProfile?.dislikedFoods || []).join(", ") || "None recorded"}
  * Spice Preference: ${userProfile.aiProfile?.spicePreference || "Not specified"}
  * Dietary Preference: ${userProfile.aiProfile?.dietaryPreference || userProfile.diet || "Not specified"}
  * Additional Notes: ${(userProfile.aiProfile?.notes || []).join("; ") || "None"}
- Saved Favorite Restaurants: ${favoriteRestaurants.join(", ") || "None yet"}
- Saved Favorite Dishes: ${favoriteMenuItems.join(", ") || "None yet"}
` : `
==================== USER STATUS: GUEST (UNAUTHENTICATED) ====================
- The user is currently browsing as a guest. Provide helpful answers using database facts, without referencing private personal memory.
`}
`.trim(),
  }
}

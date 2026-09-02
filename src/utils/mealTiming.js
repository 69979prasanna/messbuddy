export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

export const MEAL_PERIODS = [
  {
    key: "breakfast",
    label: "Breakfast",
    icon: "🌅",
    color: "#ffb703",
    defaultStart: "07:30",
    defaultEnd: "10:00",
  },
  {
    key: "lunch",
    label: "Lunch",
    icon: "🍛",
    color: "#06d6a0",
    defaultStart: "12:00",
    defaultEnd: "15:00",
  },
  {
    key: "snacks",
    label: "Snacks",
    icon: "☕",
    color: "#f77f00",
    defaultStart: "16:00",
    defaultEnd: "18:00",
  },
  {
    key: "dinner",
    label: "Dinner",
    icon: "🌙",
    color: "#4cc9f0",
    defaultStart: "19:00",
    defaultEnd: "22:00",
  },
]

export const getMealMeta = (mealKey) => {
  return (
    MEAL_PERIODS.find((m) => m.key === mealKey) || {
      key: mealKey,
      label: mealKey,
      icon: "🍽️",
      color: "#ffc107",
    }
  )
}

export const getDayName = (date = new Date()) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]
  return days[date.getDay()]
}

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

export const timeStringToDate = (timeStr, baseDate = new Date()) => {
  if (!timeStr) return null
  const [hours, minutes] = timeStr.split(":").map(Number)
  const date = new Date(baseDate)
  date.setHours(hours, minutes, 0, 0)
  return date
}

export const formatCountdown = (totalSeconds) => {
  if (totalSeconds <= 0) return "00:00"

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${String(seconds).padStart(2, "0")}s`
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export const formatDurationShort = (totalSeconds) => {
  if (totalSeconds <= 0) return "0m"
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export const getLiveMealStatus = (weeklySchedule, currentTime = new Date()) => {
  if (!Array.isArray(weeklySchedule) || weeklySchedule.length === 0) {
    return {
      status: "NO_SCHEDULE",
      message: "No weekly meal schedule configured.",
    }
  }

  const todayName = getDayName(currentTime)
  const todayIndex = DAYS_OF_WEEK.indexOf(todayName)
  const todaySchedule = weeklySchedule.find(
    (s) => s.day?.toLowerCase() === todayName.toLowerCase()
  )

  const activeMealsToday = []
  if (todaySchedule?.meals) {
    for (const mealDef of MEAL_PERIODS) {
      const meal = todaySchedule.meals[mealDef.key]
      if (meal && meal.startTime && meal.endTime) {
        const start = timeStringToDate(meal.startTime, currentTime)
        let end = timeStringToDate(meal.endTime, currentTime)

        // Handle meal ending after midnight
        if (end <= start) {
          end = new Date(end.getTime() + 24 * 60 * 60 * 1000)
        }

        activeMealsToday.push({
          key: mealDef.key,
          label: mealDef.label,
          icon: mealDef.icon,
          color: mealDef.color,
          startTime: meal.startTime,
          endTime: meal.endTime,
          startDate: start,
          endDate: end,
          items: meal.items || [],
          customItems: meal.customItems || [],
        })
      }
    }
  }

  // 1. Check if currently serving any meal
  for (let i = 0; i < activeMealsToday.length; i++) {
    const meal = activeMealsToday[i]
    if (currentTime >= meal.startDate && currentTime < meal.endDate) {
      const secondsRemaining = Math.max(
        0,
        Math.floor((meal.endDate - currentTime) / 1000)
      )
      const nextMeal = activeMealsToday[i + 1] || null

      return {
        status: "CURRENTLY_SERVING",
        currentMeal: meal,
        secondsRemaining,
        nextMeal,
      }
    }
  }

  // 2. Check for next upcoming meal today
  for (const meal of activeMealsToday) {
    if (currentTime < meal.startDate) {
      const secondsUntilStart = Math.max(
        0,
        Math.floor((meal.startDate - currentTime) / 1000)
      )
      return {
        status: "UPCOMING_TODAY",
        nextMeal: meal,
        secondsUntilStart,
      }
    }
  }

  // 3. All meals for today have ended: find tomorrow's (or next available day's) first meal
  for (let offset = 1; offset <= 7; offset++) {
    const nextDayIndex = (todayIndex + offset) % 7
    const nextDayName = DAYS_OF_WEEK[nextDayIndex]
    const nextDaySchedule = weeklySchedule.find(
      (s) => s.day?.toLowerCase() === nextDayName.toLowerCase()
    )

    if (nextDaySchedule?.meals) {
      for (const mealDef of MEAL_PERIODS) {
        const meal = nextDaySchedule.meals[mealDef.key]
        if (meal && meal.startTime && meal.endTime) {
          const nextDayDate = new Date(currentTime)
          nextDayDate.setDate(nextDayDate.getDate() + offset)
          const nextStart = timeStringToDate(meal.startTime, nextDayDate)
          const secondsUntilStart = Math.max(
            0,
            Math.floor((nextStart - currentTime) / 1000)
          )

          return {
            status: "NO_MORE_MEALS_TODAY",
            nextMeal: {
              day: nextDayName,
              isTomorrow: offset === 1,
              key: mealDef.key,
              label: mealDef.label,
              icon: mealDef.icon,
              color: mealDef.color,
              startTime: meal.startTime,
              endTime: meal.endTime,
              startDate: nextStart,
              items: meal.items || [],
              customItems: meal.customItems || [],
            },
            secondsUntilStart,
          }
        }
      }
    }
  }

  return {
    status: "NO_SCHEDULE",
    message: "No scheduled meals found.",
  }
}

export const generateDefaultWeeklySchedule = (existingSchedule = []) => {
  const result = []

  for (const day of DAYS_OF_WEEK) {
    const existingDay = existingSchedule.find(
      (s) => s.day?.toLowerCase() === day.toLowerCase()
    )

    const meals = {}
    for (const mealDef of MEAL_PERIODS) {
      const existingMeal = existingDay?.meals?.[mealDef.key]
      meals[mealDef.key] = {
        startTime: existingMeal?.startTime || mealDef.defaultStart,
        endTime: existingMeal?.endTime || mealDef.defaultEnd,
        items: existingMeal?.items?.map((item) =>
          typeof item === "object" ? item._id || item : item
        ) || [],
        customItems: existingMeal?.customItems || [],
      }
    }

    result.push({
      day,
      meals,
    })
  }

  return result
}

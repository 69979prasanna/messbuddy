import express from "express"
import mongoose from "mongoose"
import Restaurant from "../models/Restaurant.js"
import Review from "../models/Review.js"
import Menu from "../models/Menu.js"
import auth from "../middleware/authMiddleware.js"
import admin from "../middleware/adminMiddleware.js"
const router = express.Router()

const populateSchedule = (query) => {
  return query
    .populate("weeklySchedule.meals.breakfast.items")
    .populate("weeklySchedule.meals.lunch.items")
    .populate("weeklySchedule.meals.snacks.items")
    .populate("weeklySchedule.meals.dinner.items")
}

router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ name: 1 })
    const restaurantsWithRatings = await Promise.all(
      restaurants.map(async (restaurant) => {
        const reviews = await Review.find({
          place: restaurant.name,
        })
        const totalReviews = reviews.length
        const averageRating = totalReviews > 0
            ? reviews.reduce(
                (sum, review) => sum + review.rating,
                0
              ) / totalReviews
            : 0
        return {
          ...restaurant.toObject(),
          averageRating,
          totalReviews,
        }
      })
    )
    res.json(restaurantsWithRatings)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

// GET /api/restaurants/:id/schedule/today
router.get("/:id/schedule/today", async (req, res) => {
  try {
    const restaurant = await populateSchedule(Restaurant.findById(req.params.id))
    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      })
    }
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]
    const todayName = days[new Date().getDay()]
    const todaySchedule =
      restaurant.weeklySchedule?.find(
        (s) => s.day.toLowerCase() === todayName.toLowerCase()
      ) || null

    res.json({
      day: todayName,
      schedule: todaySchedule,
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

// GET /api/restaurants/:id/schedule
router.get("/:id/schedule", async (req, res) => {
  try {
    const restaurant = await populateSchedule(Restaurant.findById(req.params.id))
    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      })
    }
    res.json(restaurant.weeklySchedule || [])
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

// PUT /api/restaurants/:id/schedule
router.put("/:id/schedule", async (req, res) => {
  try {
    const { weeklySchedule } = req.body
    if (!Array.isArray(weeklySchedule)) {
      return res.status(400).json({
        message: "weeklySchedule must be an array of daily schedules",
      })
    }

    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]

    const sanitizedSchedule = weeklySchedule
      .filter((daily) => daily && validDays.includes(daily.day))
      .map((daily) => {
        const sanitizedMeals = {}
        const mealKeys = ["breakfast", "lunch", "snacks", "dinner"]

        for (const key of mealKeys) {
          const meal = daily.meals?.[key] || {}
          const items = Array.isArray(meal.items)
            ? meal.items
                .map((item) =>
                  typeof item === "object" && item !== null ? item._id : item
                )
                .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
            : []

          const customItems = Array.isArray(meal.customItems)
            ? meal.customItems
                .map((c) => (typeof c === "string" ? c.trim() : ""))
                .filter(Boolean)
            : []

          sanitizedMeals[key] = {
            startTime: typeof meal.startTime === "string" ? meal.startTime : "",
            endTime: typeof meal.endTime === "string" ? meal.endTime : "",
            items,
            customItems,
          }
        }

        return {
          day: daily.day,
          meals: sanitizedMeals,
        }
      })

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { weeklySchedule: sanitizedSchedule },
      { new: true, runValidators: true }
    )

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      })
    }

    const populated = await populateSchedule(
      Restaurant.findById(restaurant._id)
    )
    res.json({
      message: "Weekly schedule updated successfully",
      weeklySchedule: populated.weeklySchedule,
    })
  } catch (err) {
    console.error("Error updating schedule:", err)
    res.status(500).json({
      message: err.message,
    })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const restaurant = await populateSchedule(Restaurant.findById(req.params.id))

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      })
    }

    res.json(restaurant)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

router.post("/", async (req, res) => {
  try {
    const {
      name,
      featuredDish,
      featuredPrice,
      image,
      tags,
      openingTime,
      closingTime,
      address,
      latitude,
      longitude,
      googleMapsUrl,
    } = req.body

    const exists = await Restaurant.findOne({
      name,
    })

    if (exists) {
      return res.status(400).json({
        message: "Restaurant already exists",
      })
    }

    const restaurant = await Restaurant.create({
      name,
      featuredDish,
      featuredPrice,
      image,
      tags,
      openingTime,
      closingTime,
      address: address || "",
      latitude: latitude !== undefined ? latitude : null,
      longitude: longitude !== undefined ? longitude : null,
      googleMapsUrl: googleMapsUrl || "",
    })

    res.status(201).json(restaurant)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const restaurant =
      await Restaurant.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      )

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      })
    }

    res.json(restaurant)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const restaurant =
      await Restaurant.findByIdAndDelete(
        req.params.id
      )

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      })
    }

    res.json({
      message: "Restaurant deleted successfully",
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

export default router
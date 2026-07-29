import express from "express"
import Restaurant from "../models/Restaurant.js"
import Review from "../models/Review.js"
const router = express.Router()

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

router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)

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
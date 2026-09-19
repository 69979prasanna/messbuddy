import express from "express"

import Restaurant from "../models/Restaurant.js"
import Menu from "../models/Menu.js"
import Review from "../models/Review.js"
import Feedback from "../models/Feedback.js"

const router = express.Router()

router.get("/dashboard", async (req, res) => {
  try {
    const [
      restaurants,
      menus,
      reviews,
      feedback
    ] = await Promise.all([
      Restaurant.countDocuments(),
      Menu.countDocuments(),
      Review.countDocuments(),
      Feedback.countDocuments()
    ])

    res.json({
      restaurants,
      menus,
      reviews,
      feedback
    })
  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: err.message
    })
  }
})

export default router
import express from "express"

import Restaurant from "../models/Restaurant.js"
import Review from "../models/Review.js"
import Feedback from "../models/Feedback.js"

const router = express.Router()

router.get("/dashboard", async (req, res) => {
    try {
        const [
            restaurants,
            reviews,
            feedback
        ] = await Promise.all([
            Restaurant.countDocuments(),
            Review.countDocuments(),
            Feedback.countDocuments()
        ])
        res.json({
            restaurants,
            menus: 0,  
            reviews,
            feedback
        })
    }
    catch (err) {
        console.error(err)
        res.status(500).json({
            message: err.message
        })
    }
})

export default router
import express from "express"
import Feedback from "../models/Feedback.js"
import auth from "../middleware/authMiddleware.js"
import User from "../models/User.js"
import { sendFeedbackReplyEmail } from "../utils/sendEmail.js"
const router = express.Router()
router.post("/", async (req, res) => {
    try {
        const { name, email, type, rating, message } = req.body
        const feedback = await Feedback.create({
            name,
            email,
            type,
            rating,
            message,
        })
        res.status(201).json(feedback)
    } catch (err) {
        res.status(500).json({
            message: err.message,
        })
    }
})
router.get("/", async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({
            createdAt: -1,
        })
        res.json(feedback)
    } catch (err) {
        res.status(500).json({
            message: err.message,
        })
    }
})
router.delete("/:id", async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(
            req.params.id
        )
        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found",
            })
        }
        res.json({
            message: "Feedback deleted successfully",
        })
    } catch (err) {
        res.status(500).json({
            message: err.message,
        })
    }
})
router.post("/:id/reply", auth, async (req, res) => {
  try {
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Reply cannot be empty.",
      })
    }

    const feedback = await Feedback.findById(req.params.id)

    if (!feedback) {
      return res.status(404).json({
        message: "Feedback not found.",
      })
    }

    const user = await User.findById(req.user.userId)

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      })
    }

    feedback.replies.push({
      user: req.user.userId,
      username: user.username,
      message: message.trim(),
    })

    await feedback.save()

    await sendFeedbackReplyEmail(
      feedback.email,
      feedback.name,
      message.trim()
    )

    res.status(201).json({
      message: "Reply sent successfully to the user's email.",
      replies: feedback.replies,
    })

  } catch (err) {
    console.error("❌ Reply error:", err)

    res.status(500).json({
      message: "Failed to send reply.",
    })
  }
})
export default router
import express from "express"
import optionalAuth from "../middleware/optionalAuth.js"
import {
  processAIChat,
  getUserConversation,
  clearUserConversation,
  getUserAIProfile,
  updateUserAIProfile,
} from "../services/aiService.js"

const router = express.Router()

/**
 * POST /api/ai/chat (Main chat endpoint)
 */
router.post("/chat", optionalAuth, async (req, res) => {
  try {
    const { message } = req.body
    if (!message) {
      return res.status(400).json({ message: "Message is required" })
    }

    const userId = req.user?.userId || null
    const result = await processAIChat({ userId, message })

    res.json(result)
  } catch (err) {
    console.error("AI Chat Error:", err)
    res.status(500).json({
      reply: "⚠️ I encountered an error connecting to MessBuddy AI. Please try again in a moment.",
      error: err.message,
    })
  }
})

/**
 * POST /api/ai (Backwards compatibility endpoint)
 */
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { message } = req.body
    if (!message) {
      return res.status(400).json({ message: "Message is required" })
    }

    const userId = req.user?.userId || null
    const result = await processAIChat({ userId, message })

    res.json(result)
  } catch (err) {
    console.error("AI Chat Error (legacy route):", err)
    res.status(500).json({
      reply: "⚠️ I encountered an error connecting to MessBuddy AI. Please try again.",
      error: err.message,
    })
  }
})

/**
 * GET /api/ai/history (Fetch conversation history for logged-in user)
 */
router.get("/history", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId || null
    if (!userId) {
      return res.json({ messages: [], summary: "", isGuest: true })
    }

    const history = await getUserConversation(userId)
    res.json({ ...history, isGuest: false })
  } catch (err) {
    console.error("AI History Error:", err)
    res.status(500).json({ message: err.message })
  }
})

/**
 * DELETE /api/ai/history (Clear conversation history)
 */
router.delete("/history", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId || null
    if (!userId) {
      return res.json({ success: true, message: "Guest history cleared" })
    }

    await clearUserConversation(userId)
    res.json({ success: true, message: "Conversation history cleared successfully" })
  } catch (err) {
    console.error("AI Clear History Error:", err)
    res.status(500).json({ message: err.message })
  }
})

/**
 * GET /api/ai/profile (Fetch user's learned memory and preferences)
 */
router.get("/profile", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId || null
    if (!userId) {
      return res.json({ profile: null, isGuest: true })
    }

    const profile = await getUserAIProfile(userId)
    res.json({ profile, isGuest: false })
  } catch (err) {
    console.error("AI Profile Error:", err)
    res.status(500).json({ message: err.message })
  }
})

/**
 * PUT /api/ai/profile (Update user's learned memory preferences)
 */
router.put("/profile", optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId || null
    if (!userId) {
      return res.status(401).json({ message: "Authentication required to update AI profile" })
    }

    const updated = await updateUserAIProfile(userId, req.body)
    res.json({ success: true, profile: updated })
  } catch (err) {
    console.error("AI Profile Update Error:", err)
    res.status(500).json({ message: err.message })
  }
})

export default router

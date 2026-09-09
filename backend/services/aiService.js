import Groq from "groq-sdk"
import dotenv from "dotenv"
import { getMessBuddyDataContext } from "./messDataService.js"
import AIConversation from "../models/AIConversation.js"
import User from "../models/User.js"

dotenv.config()

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Primary and fallback models for high reliability
const PRIMARY_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b"
const FALLBACK_MODEL = "qwen/qwen3.8-27b"

/**
 * Heuristically extract user food preferences from user message to update long-term memory
 */
const extractAndSaveUserPreferences = async (userId, userMessage) => {
  if (!userId || !userMessage) return
  const text = userMessage.toLowerCase()

  const updates = {}
  let hasUpdate = false

  // 1. Budget extraction
  const budgetMatch = text.match(/(?:under|below|less than|within|budget of)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i)
  if (budgetMatch && budgetMatch[1]) {
    const budgetVal = parseInt(budgetMatch[1], 10)
    if (budgetVal > 0 && budgetVal < 2000) {
      updates["aiProfile.budgetRange.max"] = budgetVal
      hasUpdate = true
    }
  }

  // 2. Spice preference
  if (
    text.includes("not spicy") ||
    text.includes("don't like spicy") ||
    text.includes("dont like spicy") ||
    text.includes("do not like spicy") ||
    text.includes("no spicy") ||
    text.includes("mild food") ||
    text.includes("mild spice") ||
    text.includes("less spicy") ||
    text.includes("non-spicy") ||
    text.includes("non spicy")
  ) {
    updates["aiProfile.spicePreference"] = "mild"
    hasUpdate = true
  } else if (
    text.includes("very spicy") ||
    text.includes("love spicy") ||
    text.includes("extra spicy") ||
    text.includes("like spicy") ||
    text.includes("prefer spicy")
  ) {
    updates["aiProfile.spicePreference"] = "spicy"
    hasUpdate = true
  } else if (text.includes("medium spice") || text.includes("moderate spice")) {
    updates["aiProfile.spicePreference"] = "medium"
    hasUpdate = true
  }

  // 3. Dietary preference
  if (
    text.includes("pure veg") ||
    text.includes("vegetarian") ||
    text.includes("only veg") ||
    text.includes("i am veg") ||
    text.includes("i'm veg")
  ) {
    updates["aiProfile.dietaryPreference"] = "vegetarian"
    updates["preferences.diet"] = "vegetarian"
    hasUpdate = true
  } else if (
    text.includes("non-veg") ||
    text.includes("non veg") ||
    text.includes("chicken") ||
    text.includes("egg")
  ) {
    updates["aiProfile.dietaryPreference"] = "non-veg"
    updates["preferences.diet"] = "non-veg"
    hasUpdate = true
  }

  // 4. Disliked foods (e.g. "I don't like paneer", "I hate dal")
  const dislikeMatch = text.match(/(?:don't like|dont like|hate|avoid|allergic to)\s+([a-zA-Z\s]{3,20})/i)
  if (dislikeMatch && dislikeMatch[1]) {
    const food = dislikeMatch[1].trim()
    if (!["food", "eating", "spicy", "hot", "anything"].includes(food)) {
      hasUpdate = true
      await User.findByIdAndUpdate(userId, {
        $addToSet: { "aiProfile.dislikedFoods": food },
      })
    }
  }

  // 5. Favorite foods (e.g. "I love misal", "I really like rajma")
  const likeMatch = text.match(/(?:love|really like|craving|favorite is)\s+([a-zA-Z\s]{3,20})/i)
  if (likeMatch && likeMatch[1]) {
    const food = likeMatch[1].trim()
    if (!["food", "eating", "spicy", "hot", "anything"].includes(food)) {
      hasUpdate = true
      await User.findByIdAndUpdate(userId, {
        $addToSet: { "aiProfile.favoriteFoods": food },
      })
    }
  }

  if (hasUpdate && Object.keys(updates).length > 0) {
    await User.findByIdAndUpdate(userId, { $set: updates })
  }
}

/**
 * Execute chat completion with model fallback
 */
const executeChatCompletion = async (messages, maxTokens = 600) => {
  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL]

  for (const model of modelsToTry) {
    try {
      const response = await groq.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.5,
      })

      const replyContent = response.choices?.[0]?.message?.content?.trim()
      if (replyContent && replyContent.length > 0) {
        return replyContent
      }
    } catch (err) {
      console.warn(`Groq model ${model} attempt failed:`, err.message)
    }
  }

  // Fallback direct attempt with fallback model
  const directResponse = await groq.chat.completions.create({
    model: FALLBACK_MODEL,
    messages,
    max_tokens: maxTokens,
  })

  return directResponse.choices?.[0]?.message?.content?.trim() || "I'm having trouble processing that right now. Please try again!"
}

/**
 * Generate a concise 1-sentence summary of the conversation to maintain compact long-term context
 */
const updateConversationSummary = async (conversation) => {
  try {
    if (!conversation || conversation.messages.length < 6) return

    const recentPairs = conversation.messages.slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n")
    const summaryPrompt = [
      {
        role: "system",
        content: "Summarize the key user preferences and topics from this conversation into 1-2 concise sentences for an AI memory profile.",
      },
      {
        role: "user",
        content: recentPairs,
      },
    ]

    const newSummary = await executeChatCompletion(summaryPrompt, 150)
    if (newSummary && newSummary.length > 10) {
      conversation.summary = newSummary
      await conversation.save()
    }
  } catch (err) {
    console.warn("Failed to update conversation summary:", err.message)
  }
}

/**
 * Main AI Chat Processor
 */
export const processAIChat = async ({ userId = null, message }) => {
  if (!message || typeof message !== "string" || !message.trim()) {
    throw new Error("Message is required")
  }

  const cleanMessage = message.trim()

  // 1. Fetch complete database facts & user context
  const { promptContext, raw } = await getMessBuddyDataContext(userId)

  // 2. Fetch or initialize conversation memory
  let conversation = null
  let conversationHistory = []
  let existingSummary = ""

  if (userId) {
    conversation = await AIConversation.findOne({ user: userId })
    if (!conversation) {
      conversation = await AIConversation.create({
        user: userId,
        messages: [],
        summary: "",
      })
    } else {
      existingSummary = conversation.summary || ""
      // Keep last 6 messages (3 user turns) for short-term context
      conversationHistory = conversation.messages.slice(-6).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }))
    }

    // Extract any preferences mentioned in this message asynchronously
    extractAndSaveUserPreferences(userId, cleanMessage).catch((e) =>
      console.warn("Preference extraction error:", e.message)
    )
  }

  // 3. Construct System Prompt
  const systemPrompt = `
You are **MessBuddy AI**, the intelligent, friendly, and personal campus food companion for college students using the MessBuddy app.

--------------------------------------------------
CORE ROLE & RESPONSIBILITIES
--------------------------------------------------
1. **Food Recommendations**:
   - Suggest meals based on today's menu, current meal period, availability, price, ratings, and user preferences (budget, diet, spice, favorites).
   - If user has known preferences (e.g. mild spice, budget under ₹100, vegetarian), acknowledge and factor them in naturally (e.g., "Since you prefer meals under ₹100...").
   - NEVER recommend food that is not in the database.

2. **Restaurant Discovery**:
   - Recommend messes based on ratings, opening hours, featured dishes, and location.
   - Accurately state whether a mess is open or closed right now based on CURRENT TIME provided below.

3. **Weekly Timetable Assistant**:
   - Answer questions about today's or tomorrow's meal schedule (Breakfast, Lunch, Snacks, Dinner).
   - State what is being served right now, what meal is coming next, or what is on the schedule tomorrow using the exact timetable facts below.

4. **Review Assistant**:
   - When a user asks for help writing a review, turn their thoughts/feedback into a clear, helpful, and balanced review.
   - IMPORTANT: Explicitly inform the user: "You can review and copy this draft, then submit it directly on the restaurant's page. (I will never automatically post reviews for you.)"

5. **Review Summarization**:
   - When asked about reviews for a restaurant, summarize actual customer reviews into:
     👍 People commonly like
     ⚠️ Common complaints
   - If a restaurant has 0 reviews in the database, explicitly tell the user: "No customer reviews have been submitted for this mess yet." Never fabricate reviews.

--------------------------------------------------
STRICT ANTI-HALLUCINATION & DATA SAFETY RULES
--------------------------------------------------
- You must ONLY use the verified database facts provided below.
- NEVER fabricate, invent, or hallucinate restaurant names, dishes, prices, ratings, hours, availability, or reviews.
- If the user asks for a dish or restaurant that is NOT in the database facts, politely say:
  "I couldn't find that item/information in MessBuddy right now."
- Always use the Indian Rupee symbol (₹) for prices.

--------------------------------------------------
TONE & STYLE
--------------------------------------------------
- Natural, conversational, warm, and helpful (like a savvy college campus senior/friend).
- Do not dump robotic database rows. Provide tailored, smart suggestions with reasons.
- Keep responses clean, well-formatted with markdown and bullet points where helpful.

--------------------------------------------------
VERIFIED MESSBUDDY DATABASE FACTS (GROUND TRUTH)
--------------------------------------------------
${promptContext}

${existingSummary ? `\nPREVIOUS CONVERSATION SUMMARY FOR THIS USER:\n${existingSummary}\n` : ""}
`.trim()

  // 4. Assemble Groq Messages
  const messagesToSend = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: cleanMessage },
  ]

  // 5. Call Groq
  const aiReply = await executeChatCompletion(messagesToSend, 650)

  // 6. Save message to conversation history (if logged in)
  if (conversation) {
    conversation.messages.push({
      role: "user",
      content: cleanMessage,
      timestamp: new Date(),
    })
    conversation.messages.push({
      role: "assistant",
      content: aiReply,
      timestamp: new Date(),
    })

    await conversation.save()

    // Periodically update summary if needed
    if (conversation.messages.length % 6 === 0) {
      updateConversationSummary(conversation).catch((e) =>
        console.warn("Summary error:", e.message)
      )
    }
  }

  return {
    reply: aiReply,
    isGuest: !userId,
    userProfile: raw.userProfile || null,
  }
}

/**
 * Retrieve conversation history for a user
 */
export const getUserConversation = async (userId) => {
  if (!userId) return { messages: [], summary: "" }
  const conv = await AIConversation.findOne({ user: userId }).lean()
  if (!conv) return { messages: [], summary: "" }
  return {
    messages: conv.messages || [],
    summary: conv.summary || "",
    updatedAt: conv.updatedAt,
  }
}

/**
 * Clear conversation history for a user
 */
export const clearUserConversation = async (userId) => {
  if (!userId) return false
  await AIConversation.findOneAndUpdate(
    { user: userId },
    { $set: { messages: [], summary: "" } }
  )
  return true
}

/**
 * Retrieve user's AI profile (memory)
 */
export const getUserAIProfile = async (userId) => {
  if (!userId) return null
  const user = await User.findById(userId).select("username preferences aiProfile").lean()
  if (!user) return null
  return {
    username: user.username,
    preferences: user.preferences,
    aiProfile: user.aiProfile || {},
  }
}

/**
 * Update user's AI profile (memory)
 */
export const updateUserAIProfile = async (userId, profileData) => {
  if (!userId) return null
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { aiProfile: profileData } },
    { new: true }
  ).select("username preferences aiProfile").lean()
  return updatedUser
}

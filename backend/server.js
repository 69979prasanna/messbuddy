import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import Groq from "groq-sdk"
import { foodContext } from "./data/foodContext.js"
import mongoose from "mongoose"
import authRoutes from "./routes/auth.js"
import reviewRoutes from "./routes/review.js"
import feedbackRoutes from "./routes/feedback.js"
import restaurantRoutes from "./routes/restaurant.js"
import uploadRoutes from "./routes/upload.js"
import adminRoutes from "./routes/admin.js"
import menuRoutes from "./routes/menu.js"
dotenv.config()
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo Error:", err))
const app = express()
app.use(cors())
app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/feedback", feedbackRoutes)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})
app.use("/api/menus", menuRoutes)
app.use("/api/upload", uploadRoutes);
app.use("/api/restaurants", restaurantRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/admin", adminRoutes)
app.post("/api/ai", async (req, res) => {
  try {
    const { message } = req.body

   const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    {
      role: "system",
      content: `
You are MessBuddy AI, a food assistant for college students.

Use ONLY the food options listed below to answer.
Be practical, short, and helpful.

${foodContext}
`
    },
    {
      role: "user",
      content: message
    }
  ],
  max_tokens: 250
})

    res.json({
      reply: completion.choices[0].message.content
    })
  } catch (err) {
    console.error("GROQ ERROR:", err)
    res.json({ reply: "AI error" })
  }
})

app.listen(5000, () =>
  console.log(`running on http://localhost:${process.env.PORT}`)
)
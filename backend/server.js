import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
import authRoutes from "./routes/auth.js"
import reviewRoutes from "./routes/review.js"
import feedbackRoutes from "./routes/feedback.js"
import restaurantRoutes from "./routes/restaurant.js"
import uploadRoutes from "./routes/upload.js"
import adminRoutes from "./routes/admin.js"
import menuRoutes from "./routes/menu.js"
import favoriteRoutes from "./routes/favorite.js"
import aiRoutes from "./routes/ai.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import { startNotificationScheduler } from "./services/notificationScheduler.js"
dotenv.config()
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected")
    startNotificationScheduler()
  })
  .catch((err) => console.error("Mongo Error:", err))
const app = express()
app.use(cors())
app.use(express.json())
app.use("/api/favorites", favoriteRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/feedback", feedbackRoutes)
app.use("/api/menus", menuRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/restaurants", restaurantRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/notifications", notificationRoutes)

app.listen(5000, () =>
  console.log(`running on http://localhost:${process.env.PORT}`)
)
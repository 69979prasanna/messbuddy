import mongoose from "mongoose"

const notificationLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "meal_reminder",
        "favorite_food_available",
        "almost_finished",
        "restaurant_update",
        "ai_suggestion",
      ],
      required: true,
    },
    referenceKey: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    sentAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 30,
    },
  },
  {
    timestamps: true,
  }
)

notificationLogSchema.index({ user: 1, type: 1, referenceKey: 1 }, { unique: true })

export default mongoose.model("NotificationLog", notificationLogSchema)

import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "Suggestion",
        "Bug Report",
        "Restaurant Request",
        "Wrong Price",
        "Wrong Timing",
        "Other",
      ],
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Feedback", feedbackSchema)
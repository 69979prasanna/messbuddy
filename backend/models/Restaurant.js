import mongoose from "mongoose";

const mealPeriodSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      default: "",
    },
    endTime: {
      type: String,
      default: "",
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
      },
    ],
    customItems: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { _id: false }
);

const dailyScheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    meals: {
      breakfast: { type: mealPeriodSchema, default: () => ({}) },
      lunch: { type: mealPeriodSchema, default: () => ({}) },
      snacks: { type: mealPeriodSchema, default: () => ({}) },
      dinner: { type: mealPeriodSchema, default: () => ({}) },
    },
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    featuredDish: {
      type: String,
      required: true,
    },

    featuredPrice: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    tags: [
      {
        type: String,
      },
    ],
    address: {
      type: String,
      default: "",
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    googleMapsUrl: {
      type: String,
      default: "",
    },
    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
    openingTime: {
      type: String,
      required: true,
    },

    closingTime: {
      type: String,
      required: true,
    },

    weeklySchedule: {
      type: [dailyScheduleSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model(
  "Restaurant",
  restaurantSchema
)
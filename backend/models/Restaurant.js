import mongoose from "mongoose";

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
}
  },
  {
    timestamps: true,
  }
)

export default mongoose.model(
  "Restaurant",
  restaurantSchema
)
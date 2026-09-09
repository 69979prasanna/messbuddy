import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: null,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
    favoriteMenus: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
      },
    ],
    preferences: {
      diet: {
        type: String,
        default: null,
      },

      budget: {
        type: Number,
        default: null,
      },
    },
    aiProfile: {
      budgetRange: {
        min: { type: Number, default: null },
        max: { type: Number, default: null },
      },
      preferredCategories: [{ type: String, trim: true }],
      favoriteFoods: [{ type: String, trim: true }],
      dislikedFoods: [{ type: String, trim: true }],
      spicePreference: { type: String, default: null },
      dietaryPreference: { type: String, default: null },
      notes: [{ type: String, trim: true }],
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("User", userSchema);
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
    notificationPreferences: {
      enabled: {
        type: Boolean,
        default: true,
      },
      mealReminders: {
        enabled: {
          type: Boolean,
          default: true,
        },
        minutesBefore: {
          type: Number,
          default: 15,
        },
      },
      favoriteFoodAvailable: {
        type: Boolean,
        default: true,
      },
      favoriteFoodAlmostFinished: {
        type: Boolean,
        default: true,
      },
      favoriteRestaurantUpdates: {
        type: Boolean,
        default: false,
      },
      aiSuggestions: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("User", userSchema);
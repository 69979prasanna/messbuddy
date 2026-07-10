import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password:{
        type: String,
        default:null,
    },
    authProvider:{
        type: String,
      enum: ["local", "google"],
      default: "local"
    },
    googleId: {
      type: String,
      default: null
    },

    favorites: {
      type: [Number],
      default: []
    },

    preferences: {
      diet: {
        type: String,
        default: null
      },

      budget: {
        type: Number,
        default: null
      }
    }
  },
  { timestamps: true }
);
export default mongoose.model("User", userSchema);
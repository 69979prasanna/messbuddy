import mongoose from "mongoose"

const favouriteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            default: null,
        },

        menu: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
            default: null,
        },
    },
    {
        timestamps: true,
    }
)

favouriteSchema.index(
    { user: 1, restaurant: 1 },
    {
        unique: true,
        sparse: true,
    }
)

favouriteSchema.index(
    { user: 1, menu: 1 },
    {
        unique: true,
        sparse: true,
    }
)

export default mongoose.model(
    "Favourite",
    favouriteSchema
)
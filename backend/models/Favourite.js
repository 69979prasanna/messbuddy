import mongoose from "mongoose"
const favouriteSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        requied: true
    },
    restaurant:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        requied: true
    },
},
{
    timestamps: true,
})
favouriteSchema.index(
    {user:1, restaurant:1},
    {unique: true}
)

export default mongoose.model("Favourite", favouriteSchema)
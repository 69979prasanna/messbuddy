import express from "express"
import Review from "../models/Review.js"
import auth from "../middleware/authMiddleware.js"
import User from "../models/User.js"

const router = express.Router()

router.post("/", auth, async (req, res) => {
  try {
    const { place, rating, comment } = req.body

    const user = await User.findById(req.user.userId)
    const existingReview = await Review.findOne({
  user: req.user.userId,
  place,
})

if (existingReview) {
  return res.status(400).json({
    message: "You have already reviewed this restaurant.",
  })
}
    const review = await Review.create({
      user: req.user.userId,
      username: user.username,
      place,
      rating,
      comment,
    })
    res.status(201).json(review)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

router.get("/:place", async (req, res) => {
  try {
    const reviews = await Review.find({
      place: req.params.place,
    }).sort({ createdAt: -1 })

    const averageRating =
      reviews.length > 0
        ? (
            reviews.reduce(
              (sum, review) => sum + review.rating,
              0
            ) / reviews.length
          ).toFixed(1)
        : 0

    res.json({
      reviews,
      averageRating,
      totalReviews: reviews.length,
    })

  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

router.delete("/:id", auth, async(req, res)=>{
  try {
    const review = await Review.findById(req.params.id)

    if(!review){
      return res.status(404).json({message:"Not authorized"})
    }
    await Review.findByIdAndDelete(req.params.id)

    res.json({
      message:"Review deleted successfully"
    })
  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
})

router.put("/:id", auth, async(req,res)=>{
  try {
    const {rating, comment} = req.body
    const review = await Review.findById(req.params.id)

    if(!review){
      return res.status(404).json({
        message: "Review not found"
      })
    }

    if(review.user.toString() !== req.user.userId){
      return res.status(403).json({
        message: "Not authorized",
      })
    }

    review.rating = rating
    review.comment = comment

    await review.save()
    res.json(review)
  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
})
export default router
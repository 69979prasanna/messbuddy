import express from "express";
import Review from "../models/Review.js";
import auth from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

/* Add Review */

router.post("/", auth, async (req, res) => {
  try {
    const { place, rating, comment } = req.body;

    const user = await User.findById(req.user.userId);

    const review = await Review.create({
      user: req.user.userId,
      username: user.username,
      place,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.get("/:place", async (req, res) => {
  try {
    const reviews = await Review.find({
      place: req.params.place,
    }).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;
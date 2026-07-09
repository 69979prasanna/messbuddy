import express from "express";
import Feedback from "../models/Feedback.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, type, rating, message } = req.body;

    const feedback = await Feedback.create({
      name,
      email,
      type,
      rating,
      message,
    });

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

export default router
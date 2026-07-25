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
        })
        res.status(201).json(feedback);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
})
router.get("/", async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({
            createdAt: -1,
        })
        res.json(feedback);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        })
    }
})
router.delete("/:id", async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(
            req.params.id
        )
        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found",
            })
        }
        res.json({
            message: "Feedback deleted successfully",
        })
    } catch (err) {
        res.status(500).json({
            message: err.message,
        })
    }
})
export default router;
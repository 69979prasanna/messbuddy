import express from "express";
import upload from "../middleware/upload.js";
import supabase from "../config/supabase.js";
import { v4 as uuid } from "uuid";

const router = express.Router();

router.post("/", upload.single("image"), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const fileName = `${uuid()}-${req.file.originalname}`;

    const { error } = await supabase.storage
      .from("restaurants")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error) {
  console.error("Supabase Upload Error:", error);
  return res.status(500).json(error);
}

    const { data } = supabase.storage
      .from("restaurants")
      .getPublicUrl(fileName);

    res.status(201).json({
      imageUrl: data.publicUrl,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;
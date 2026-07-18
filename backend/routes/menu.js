import express from "express";
import Menu from "../models/Menu.js";

const router = express.Router();

//
// GET ALL MENUS
//
router.get("/", async (req, res) => {
  try {
    const menus = await Menu.find().populate(
      "restaurant",
      "name"
    );

    res.json(menus);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

//
// GET MENUS OF ONE RESTAURANT
//
router.get("/restaurant/:id", async (req, res) => {
  try {
    const menus = await Menu.find({
      restaurant: req.params.id,
    });

    res.json(menus);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

//
// CREATE MENU
//
router.post("/", async (req, res) => {
  try {
    const menu = await Menu.create(req.body);

    res.status(201).json(menu);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

//
// UPDATE MENU
//
router.put("/:id", async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.json(menu);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

//
// DELETE MENU
//
router.delete("/:id", async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);

    res.json({
      message: "Menu deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

export default router;
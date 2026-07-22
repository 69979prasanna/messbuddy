import express from "express"
import Menu from "../models/Menu.js"

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const menus = await Menu.find().populate(
      "restaurant",
      "name"
    )

    res.json(menus)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

router.get("/restaurant/:id", async (req, res) => {
  try {
    const menus = await Menu.find({
      restaurant: req.params.id,
    })

    res.json(menus)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

router.post("/", async (req, res) => {
  try {
    const { restaurant, dish } = req.body
    const existingMenu = await Menu.findOne({
      restaurant,
      dish: { $regex: new RegExp(`^${dish}$`, "i") }, 
    })
    if (existingMenu) {
      return res.status(400).json({
        message: `"${dish}" already exists for this restaurant.`,
      })
    }
    const menu = await Menu.create(req.body)
    res.status(201).json(menu)
  } catch (err) {
    res.status(400).json({
      message: err.message,
    })
  }
})
router.get("/:id", async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id).populate(
      "restaurant",
      "name"
    )
    if (!menu) {
      return res.status(404).json({
        message: "Menu item not found",
      })
    }
    res.json(menu)
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})
router.put("/:id", async (req, res) => {
  try {
    const { restaurant, dish } = req.body

    const existingMenu = await Menu.findOne({
      restaurant,
      dish: { $regex: new RegExp(`^${dish}$`, "i") },
      _id: { $ne: req.params.id },
    })

    if (existingMenu) {
      return res.status(400).json({
        message: `"${dish}" already exists for this restaurant.`,
      })
    }
    const menu = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!menu) {
      return res.status(404).json({
        message: "Menu item not found",
      })
    }
    res.json(menu)
  } catch (err) {
    res.status(400).json({
      message: err.message,
    })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id)
    if (!menu) {
      return res.status(404).json({
        message: "Menu item not found",
      })
    }
    res.json({
      message: "Menu deleted successfully",
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

export default router
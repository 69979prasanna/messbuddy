import express from "express"
import Favorite from "../models/Favourite.js"
import Restaurant from "../models/Restaurant.js"
import auth from "../middleware/authMiddleware.js"
import Menu from "../models/Menu.js"
const router = express.Router()
router.post("/toggle/:restaurantId", auth, async (req, res) => {
  try {
    const { restaurantId } = req.params

    const restaurant = await Restaurant.findById(restaurantId)

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      })
    }

    const existing = await Favorite.findOne({
      user: req.user.userId,
      restaurant: restaurantId,
    })

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id)

      return res.json({
        favorite: false,
        message: "Removed from favorites",
      })
    }

    await Favorite.create({
      user: req.user.userId,
      restaurant: restaurantId,
    })

    res.json({
      favorite: true,
      message: "Added to favorites",
    })

  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})
router.get("/", auth, async (req, res) => {
  try {

    const favorites = await Favorite.find({
      user: req.user.userId,
    }).populate("restaurant")

    res.json(favorites)

  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})

router.get("/check/:restaurantId", auth, async (req, res) => {
  try {

    const exists = await Favorite.exists({
      user: req.user.userId,
      restaurant: req.params.restaurantId,
    })

    res.json({
      favorite: !!exists,
    })

  } catch (err) {
    res.status(500).json({
      message: err.message,
    })
  }
})
router.post("/menu/toggle/:menuId", auth, async (req, res) => {
  try {
    const { menuId } = req.params

    const menu = await Menu.findById(menuId)

    if (!menu) {
      return res.status(404).json({
        message: "Menu item not found",
      })
    }

    const existing = await Favorite.findOne({
      user: req.user.userId,
      menu: menuId,
    })

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id)

      return res.json({
        favorite: false,
        message: "Removed from favorites",
      })
    }

    await Favorite.create({
      user: req.user.userId,
      menu: menuId,
    })

    res.json({
      favorite: true,
      message: "Added to favorites",
    })

  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: err.message,
    })
  }
})
router.get("/menu/check/:menuId", auth, async (req, res) => {
  try {
    const exists = await Favorite.exists({
      user: req.user.userId,
      menu: req.params.menuId,
    })

    res.json({
      favorite: !!exists,
    })

  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: err.message,
    })
  }
})
router.get("/menu", auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({
      user: req.user.userId,
      menu: { $ne: null },
    }).populate({
      path: "menu",
      populate: {
        path: "restaurant",
        select: "name",
      },
    })

    res.json(favorites)

  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: err.message,
    })
  }
})
export default router
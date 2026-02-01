import express from "express"
import { addToCart, removeAllFromCart, updateQuantity } from "../controllers/cart.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/", protectRoute, getCartProducts)
router.post("/", protectRoute,addToCart)
router.delete("/", protectRoute, removeAllFromCart)
router.put("/", protectRoute, updateQuantity)

export default router
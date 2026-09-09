import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export default function optionalAuth(req, res, next) {
  try {
    const authHeader = req.header("Authorization")
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader?.split(" ")[1] || null

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
      } catch {
        req.user = null
      }
    } else {
      req.user = null
    }
    next()
  } catch {
    req.user = null
    next()
  }
}

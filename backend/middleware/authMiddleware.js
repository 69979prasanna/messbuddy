import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
export default function auth(req, res, next) {
   const authHeader = req.header("Authorization");
const token = authHeader?.split(" ")[1];
    if(!token){
        return res.status(401).json({
            message: "Access denied"
        })
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decode
        next()
    } catch {
        res.status(401).json({
            message: "invalid token"
        })
    }
}
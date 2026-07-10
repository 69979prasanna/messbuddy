import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import  dotenv from "dotenv"
const router = express.Router()
dotenv.config()
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields required"
      })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    })

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Server error"
    })
  }
})
router.post("/login", async(req, res)=>{
    try {
        const {email, password} = req.body
        const user  = await User.findOne({email})

        if(!user){
            return res.status(400).json({message:"Invalid Credential"})
        }
        const ismatch = await bcrypt.compare(password, user.password)
        if(!ismatch){
            return res.status(400).json({message:"Invalid Credential"})
        }
        const token  = jwt.sign(
            {userId: user._id},
            process.env.JWT_SECRET,
            {expiresIn:"7d"}
        )

        res.json({
            message:"Login Successful",
            token,
            user:{
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    
    } catch (err) {
        console.error(err)
    res.status(500).json({
      message: "Server error"
    })
    }
})

export default router
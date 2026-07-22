import { useState } from "react"
import "../../App.css"

export default function AuthModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

const handleSubmit = async (e) => {
  e.preventDefault()
  const api = process.env.REACT_APP_AUTH
  try {
    const endpoint = isLogin ? `${api}/login` : `${api}/signup`

    const body = isLogin
      ? {
          email,
          password
        }
      : {
          username,
          email,
          password
        }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    console.log(data)

    if (data.token) {
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      alert("Login successful!")
      onClose()
    }
    else if (data.user) {
      alert("Signup successful! Please login now.")

      setIsLogin(true)
      setUsername("")
      setEmail("")
      setPassword("")
    }
  } catch (error) {
    console.error("Auth Error:", error)
    alert("Something went wrong")
  }
}
  return (
    <div className="modal-overlay">
      <div className="auth-modal" >
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <h2>{isLogin ? "Welcome Back" : "Join MessBuddy"}</h2>
        <p>
          {isLogin
            ? "Login to vote, save favorites and comment"
            : "Create account to unlock features"}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />

          <button type="submit">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p>
          {isLogin ? "No account?" : "Already have account?"}
          <span
            onClick={() => setIsLogin(!isLogin)}
            style={{
              color: "#4ea1ff",
              cursor: "pointer",
              marginLeft: "6px"
            }}
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  )
}
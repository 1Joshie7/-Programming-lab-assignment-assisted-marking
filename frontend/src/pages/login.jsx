import { useState } from "react"
import axios from "axios"
import "../styles/auth.css"

function Login() {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login/",
        { username, password }
      )

      localStorage.setItem("access", response.data.access)
      localStorage.setItem("refresh", response.data.refresh)

      console.log("Logged in:", response.data)

      alert("Login successful!")
    } catch (error) {
      console.log(error.response?.data || error)
      alert("Login failed")
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Welcome Back</h2>

        <form onSubmit={handleLogin}>

          <input
            className="auth-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="auth-button" type="submit">
            Login
          </button>

        </form>

      </div>
    </div>
  )
}

export default Login
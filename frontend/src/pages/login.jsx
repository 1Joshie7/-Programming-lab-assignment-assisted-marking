import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../api"
import { setAuthSession } from "../auth"
import "../styles/auth.css"
import logo from "../assets/logo.png"

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (event) => {
    event.preventDefault()
    setError("")

    try {
      const { data } = await api.post("/api/auth/login/", { username, password })
      setAuthSession(data)
      navigate(data.user.role === "lecturer" ? "/lecturer" : "/student")
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(detail || "Invalid username or password")
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-wrapper">
  <img src={logo} alt="Logo" className="auth-logo" />
</div>
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <input className="auth-input" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input className="auth-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-button" type="submit">Login</button>
        </form>
        <p className="auth-link">No account? <Link to="/register">Create one</Link></p>
      </div>
    </div>

    
  )
}

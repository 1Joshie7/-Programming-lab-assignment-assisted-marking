import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../api"
import "../styles/auth.css"

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "student" })
  const [error, setError] = useState("")

  const handleRegister = async (event) => {
    event.preventDefault()
    setError("")

    try {
      await api.post("/api/auth/register/", form)
      navigate("/")
    } catch (err) {
      const details = err.response?.data
      if (details && typeof details === "object") {
        const first = Object.values(details)[0]
        setError(Array.isArray(first) ? first[0] : "Registration failed")
      } else {
        setError("Registration failed")
      }
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <form onSubmit={handleRegister}>
          <input className="auth-input" type="text" placeholder="Username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="auth-input" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="auth-input" type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select className="auth-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
          </select>
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-button" type="submit">Register</button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/">Login</Link></p>
      </div>
    </div>
  )
}

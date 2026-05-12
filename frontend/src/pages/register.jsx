import { useState } from "react"
import axios from "axios"
import "../styles/auth.css"

function Register() {

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student")

  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/register/",
        { username, email, password, role }
      )

      console.log(response.data)
      alert("Registration successful!")
    } catch (error) {
      console.log(error.response?.data || error)
      alert("Registration failed")
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>

          <input
            className="auth-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select
            className="auth-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
          </select>

          <button className="auth-button" type="submit">
            Register
          </button>

        </form>

      </div>
    </div>
  )
}

export default Register
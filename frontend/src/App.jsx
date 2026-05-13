import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Login from "./pages/login"
import Register from "./pages/register"
import StudentDashboard from "./pages/studentDashboard"
import LecturerDashboard from "./pages/lecturerDashboard"
import { getStoredUser, isSessionActive } from "./auth"

function RequireAuth({ children, role }) {
  const active = isSessionActive()
  const user = getStoredUser()

  if (!active || !user) return <Navigate to="/" replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === "lecturer" ? "/lecturer" : "/student"} replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<RequireAuth role="student"><StudentDashboard /></RequireAuth>} />
        <Route path="/lecturer" element={<RequireAuth role="lecturer"><LecturerDashboard /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

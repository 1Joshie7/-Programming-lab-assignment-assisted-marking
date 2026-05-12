import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"
import { clearAuthSession, getStoredUser } from "../auth"

export default function LecturerDashboard() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    Promise.all([api.get("/api/assignments/"), api.get("/api/submissions/")])
      .then(([assignmentRes, submissionRes]) => {
        setAssignments(assignmentRes.data)
        setSubmissions(submissionRes.data)
      })
      .catch(() => {
        setAssignments([])
        setSubmissions([])
      })
  }, [])

  const logout = () => {
    clearAuthSession()
    navigate("/")
  }

  return (
    <main className="auth-container">
      <section className="auth-card dashboard-card">
        <div className="dashboard-header">
          <h2>Lecturer Dashboard</h2>
          <button className="auth-button logout-button" onClick={logout}>Logout</button>
        </div>
        <p>Hi {user?.username}, assignments: {assignments.length}, submissions: {submissions.length}</p>

        <h3>Assignments</h3>
        <ul className="dashboard-list">
          {assignments.map((item) => (
            <li key={item.id}>#{item.id} · {item.title} · Due: {new Date(item.deadline).toLocaleString()}</li>
          ))}
        </ul>

        <h3>Recent Submissions</h3>
        <ul className="dashboard-list">
          {submissions.slice(0, 10).map((item) => (
            <li key={item.id}>#{item.id} · {item.student} · {item.assignment_title} · Grade: {item.grade ?? "Pending"}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}

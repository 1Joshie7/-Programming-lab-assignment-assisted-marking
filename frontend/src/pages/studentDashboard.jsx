import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"
import { clearAuthSession, getStoredUser } from "../auth"

export default function StudentDashboard() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [selectedAssignment, setSelectedAssignment] = useState("")
  const [codeFile, setCodeFile] = useState(null)
  const [status, setStatus] = useState("")

  const loadData = async () => {
    const [{ data: assignmentsData }, { data: submissionsData }] = await Promise.all([
      api.get("/api/assignments/"),
      api.get("/api/submissions/"),
    ])
    setAssignments(assignmentsData)
    setSubmissions(submissionsData)
    if (assignmentsData.length && !selectedAssignment) {
      setSelectedAssignment(String(assignmentsData[0].id))
    }
  }

  useEffect(() => {
    loadData().catch(() => setStatus("Failed to load dashboard data"))
  }, [])

  const logout = () => {
    clearAuthSession()
    navigate("/")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus("")

    if (!selectedAssignment || !codeFile) {
      setStatus("Select an assignment and code file")
      return
    }

    const formData = new FormData()
    formData.append("assignment", selectedAssignment)
    formData.append("code_file", codeFile)

    try {
      await api.post("/api/submissions/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setCodeFile(null)
      setStatus("Submission uploaded")
      await loadData()
    } catch {
      setStatus("Submission failed")
    }
  }

  return (
    <main className="auth-container">
      <section className="auth-card dashboard-card">
        <div className="dashboard-header">
          <h2>Student Dashboard</h2>
          <button className="auth-button logout-button" onClick={logout}>Logout</button>
        </div>

        <p>Hi {user?.username}, assignments: {assignments.length}, submissions: {submissions.length}</p>

        <form className="upload-form" onSubmit={handleSubmit}>
          <select className="auth-select" value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)}>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>{assignment.title}</option>
            ))}
          </select>
          <input className="auth-input" type="file" accept=".py" onChange={(e) => setCodeFile(e.target.files?.[0] || null)} />
          <button className="auth-button" type="submit">Submit Code</button>
        </form>

        {status && <p className="auth-error">{status}</p>}

        <ul className="dashboard-list">
          {submissions.map((item) => (
            <li key={item.id}>#{item.id} · {item.assignment_title} · Grade: {item.grade ?? "Pending"}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}

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
  const [statusType, setStatusType] = useState("") // "success" | "error"
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [expandedSubmission, setExpandedSubmission] = useState(null)

  const loadData = async () => {
    try {
      const [{ data: assignmentsData }, { data: submissionsData }] = await Promise.all([
        api.get("/api/assignments/"),
        api.get("/api/submissions/"),
      ])
      setAssignments(assignmentsData)
      setSubmissions(submissionsData)
      if (assignmentsData.length && !selectedAssignment) {
        setSelectedAssignment(String(assignmentsData[0].id))
      }
    } catch (err) {
      setStatus("Failed to load dashboard data. Please try again.")
      setStatusType("error")
    }
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false))
  }, [])

  const logout = () => {
    clearAuthSession()
    navigate("/")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus("")
    setStatusType("")

    if (!selectedAssignment || !codeFile) {
      setStatus("Select an assignment and a code file")
      setStatusType("error")
      return
    }

    const formData = new FormData()
    formData.append("assignment", selectedAssignment)
    formData.append("code_file", codeFile)

    setSubmitting(true)
    try {
      await api.post("/api/submissions/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setCodeFile(null)
      setStatus("Submission uploaded and graded successfully!")
      setStatusType("success")
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ""
      await loadData()
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.assignment?.[0]
      setStatus(detail || "Submission failed. Please try again.")
      setStatusType("error")
    } finally {
      setSubmitting(false)
    }
  }

  const toggleSubmissionDetails = (id) => {
    setExpandedSubmission(expandedSubmission === id ? null : id)
  }

  if (loading) {
    return (
      <main className="auth-container">
        <section className="auth-card dashboard-card">
          <p className="loading-text">Loading dashboard...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-container">
      <section className="auth-card dashboard-card">
        <div className="dashboard-header">
          <h2>Student Dashboard</h2>
          <button className="auth-button logout-button" onClick={logout}>Logout</button>
        </div>

        <p className="welcome-text">Welcome, {user?.username}!</p>

        {/* Submit Code Section */}
        <div className="section">
          <h3>Submit Code</h3>
          <form className="upload-form" onSubmit={handleSubmit}>
            <select className="auth-select" value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)}>
              <option value="">-- Select Assignment --</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title} (Due: {new Date(assignment.deadline).toLocaleString()})
                </option>
              ))}
            </select>
            <input
              className="auth-input"
              type="file"
              accept=".py"
              onChange={(e) => setCodeFile(e.target.files?.[0] || null)}
            />
            <button className="auth-button" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Code"}
            </button>
          </form>

          {status && <p className={statusType === "success" ? "status-success" : "auth-error"}>{status}</p>}
        </div>

        {/* Assignment Details */}
        <div className="section">
          <h3>Assignments</h3>
          {assignments.length === 0 ? (
            <p className="empty-text">No assignments available yet.</p>
          ) : (
            <ul className="dashboard-list">
              {assignments.map((assignment) => (
                <li key={assignment.id} className="list-item">
                  <strong>{assignment.title}</strong>
                  <span className="item-meta">
                    Due: {new Date(assignment.deadline).toLocaleString()}
                  </span>
                  {assignment.description && (
                    <p className="item-description">{assignment.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* My Submissions */}
        <div className="section">
          <h3>My Submissions</h3>
          {submissions.length === 0 ? (
            <p className="empty-text">You haven't submitted anything yet.</p>
          ) : (
            <ul className="dashboard-list">
              {submissions.map((item) => (
                <li key={item.id} className="list-item">
                  <div
                    className="list-item-header"
                    onClick={() => toggleSubmissionDetails(item.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && toggleSubmissionDetails(item.id)}
                  >
                    <strong>#{item.id}</strong> · {item.assignment_title}
                    <span className={`grade-badge ${item.grade !== null ? "grade-graded" : "grade-pending"}`}>
                      {item.grade !== null ? `${item.grade.toFixed(1)}%` : "Pending"}
                    </span>
                    <span className="expand-icon">{expandedSubmission === item.id ? "▼" : "▶"}</span>
                  </div>
                  {expandedSubmission === item.id && item.feedback && (
                    <div className="feedback-panel">
                      <h4>Feedback</h4>
                      <pre className="feedback-text">{item.feedback}</pre>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}

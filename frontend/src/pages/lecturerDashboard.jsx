import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"
import { clearAuthSession, getStoredUser } from "../auth"
import logo from "../assets/logo.png"

export default function LecturerDashboard() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [testCases, setTestCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Assignment creation form
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    deadline: "",
    required_function_name: "",
    required_param_count: "",
  })
  const [creating, setCreating] = useState(false)

  // Test case management
  const [showTestCases, setShowTestCases] = useState(null) // assignment id
  const [testCaseForm, setTestCaseForm] = useState({
    input_data: "",
    expected_output: "",
    is_hidden: false,
  })
  const [addingTestCase, setAddingTestCase] = useState(false)

  // Submission detail view
  const [expandedSubmission, setExpandedSubmission] = useState(null)

  // Tab state
  const [activeTab, setActiveTab] = useState("assignments")

  const loadData = async () => {
    try {
      const [assignRes, subRes] = await Promise.all([
        api.get("/api/assignments/"),
        api.get("/api/submissions/"),
      ])
      setAssignments(assignRes.data)
      setSubmissions(subRes.data)
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.")
    }
  }

  const loadTestCases = async (assignmentId) => {
    try {
      const { data } = await api.get("/api/testcases/", {
        params: { assignment: assignmentId },
      })
      setTestCases(data)
    } catch (err) {
      setError("Failed to load test cases.")
    }
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false))
  }, [])

  const logout = () => {
    clearAuthSession()
    navigate("/")
  }

  // ── Assignment CRUD ──────────────────────────────────────────
  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError("")

    const payload = {
      title: assignmentForm.title,
      description: assignmentForm.description,
      deadline: new Date(assignmentForm.deadline).toISOString(),
    }
    if (assignmentForm.required_function_name) {
      payload.grading_config = {
        function_requirements: {
          required: true,
          name: assignmentForm.required_function_name || null,
          param_count: assignmentForm.required_param_count
            ? parseInt(assignmentForm.required_param_count, 10)
            : null,
        },
      }
    }

    try {
      await api.post("/api/assignments/", payload)
      setAssignmentForm({ title: "", description: "", deadline: "", required_function_name: "", required_param_count: "" })
      setShowCreateForm(false)
      await loadData()
    } catch (err) {
      const detail = err.response?.data
      if (detail && typeof detail === "object") {
        const first = Object.values(detail)[0]
        setError(Array.isArray(first) ? first[0] : "Failed to create assignment")
      } else {
        setError("Failed to create assignment")
      }
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm("Delete this assignment and all its submissions?")) return
    try {
      await api.delete(`/api/assignments/${id}/`)
      await loadData()
    } catch {
      setError("Failed to delete assignment.")
    }
  }

  // ── Test Case CRUD ───────────────────────────────────────────
  const handleViewTestCases = (assignmentId) => {
    if (showTestCases === assignmentId) {
      setShowTestCases(null)
      setTestCases([])
    } else {
      setShowTestCases(assignmentId)
      loadTestCases(assignmentId)
    }
  }

  const handleAddTestCase = async (e) => {
    e.preventDefault()
    setAddingTestCase(true)
    setError("")

    try {
      await api.post("/api/testcases/", {
        assignment: showTestCases,
        input_data: testCaseForm.input_data,
        expected_output: testCaseForm.expected_output,
        is_hidden: testCaseForm.is_hidden,
      })
      setTestCaseForm({ input_data: "", expected_output: "", is_hidden: false })
      await loadTestCases(showTestCases)
    } catch (err) {
      const detail = err.response?.data
      if (detail && typeof detail === "object") {
        const first = Object.values(detail)[0]
        setError(Array.isArray(first) ? first[0] : "Failed to add test case")
      } else {
        setError("Failed to add test case")
      }
    } finally {
      setAddingTestCase(false)
    }
  }

  const handleDeleteTestCase = async (id) => {
    try {
      await api.delete(`/api/testcases/${id}/`)
      await loadTestCases(showTestCases)
    } catch {
      setError("Failed to delete test case.")
    }
  }

  // ── Submission Detail ────────────────────────────────────────
  const toggleSubmissionDetails = (id) => {
    setExpandedSubmission(expandedSubmission === id ? null : id)
  }

  // ── Render ───────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="dash-container">
        <section className="auth-card dashboard-card">
          <p className="loading-text">Loading dashboard...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="dash-container">
      <section className="auth-card dashboard-card">
        <div className="dashboard-header">

  <div className="header-left">
    <img src={logo} alt="Logo" className="dashboard-logo" />
    <h2>Lecturer Dashboard</h2>
  </div>

  <div className="header-right">
    <p className="welcome-text">
      Welcome, {user?.username}!
    </p>

    <button
      className="auth-button logout-button"
      onClick={logout}
    >
      Logout
    </button>
  </div>

</div>

        {error && <p className="auth-error">{error}</p>}

        {/* Tab Navigation */}
        <div className="tab-nav">
          <button
            className={`tab-button ${activeTab === "assignments" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("assignments")}
          >
            Assignments ({assignments.length})
          </button>
          <button
            className={`tab-button ${activeTab === "submissions" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("submissions")}
          >
            Submissions ({submissions.length})
          </button>
        </div>

        {/* ─── Assignments Tab ─── */}
        {activeTab === "assignments" && (
          <div className="section">
            <div className="section-header">
              <h3>Assignments</h3>
              <button
                className="auth-button button-sm"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                {showCreateForm ? "Cancel" : "+ New Assignment"}
              </button>
            </div>

            {/* Create Assignment Form */}
            {showCreateForm && (
              <form className="create-form" onSubmit={handleCreateAssignment}>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Assignment Title"
                  required
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                />
                <textarea
                  className="auth-input"
                  placeholder="Description"
                  rows={3}
                  required
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                />
                <input
                  className="auth-input"
                  type="datetime-local"
                  required
                  value={assignmentForm.deadline}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })}
                />
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Required Function Name (optional)"
                  value={assignmentForm.required_function_name}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, required_function_name: e.target.value })}
                />
                <input
                  className="auth-input"
                  type="number"
                  placeholder="Required Parameter Count (optional)"
                  min="0"
                  value={assignmentForm.required_param_count}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, required_param_count: e.target.value })}
                />
                <button className="auth-button" type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Assignment"}
                </button>
              </form>
            )}

            {/* Assignment List */}
            {assignments.length === 0 ? (
              <p className="empty-text">No assignments created yet.</p>
            ) : (
              <ul className="dashboard-list">
                {assignments.map((item) => (
                  <li key={item.id} className="list-item">
                    <div className="list-item-row">
                      <div>
                        <strong>{item.title}</strong>
                        <span className="item-meta">
                          Due: {new Date(item.deadline).toLocaleString()}
                          {item.created_by && ` · By: ${item.created_by}`}
                        </span>
                      </div>
                      <div className="item-actions">
                        <button
                          className="auth-button button-sm"
                          onClick={() => handleViewTestCases(item.id)}
                        >
                          {showTestCases === item.id ? "Hide Tests" : "Test Cases"}
                        </button>
                        <button
                          className="auth-button button-sm button-danger"
                          onClick={() => handleDeleteAssignment(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {item.description && (
                      <p className="item-description">{item.description}</p>
                    )}

                    {/* Test Cases for this assignment */}
                    {showTestCases === item.id && (
                      <div className="testcase-panel">
                        <h4>Test Cases</h4>
                        {testCases.length === 0 ? (
                          <p className="empty-text">No test cases yet.</p>
                        ) : (
                          <table className="testcase-table">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Input</th>
                                <th>Expected Output</th>
                                <th>Hidden</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {testCases.map((tc, idx) => (
                                <tr key={tc.id}>
                                  <td>{idx + 1}</td>
                                  <td><pre className="code-snippet">{tc.input_data || "(none)"}</pre></td>
                                  <td><pre className="code-snippet">{tc.expected_output}</pre></td>
                                  <td>{tc.is_hidden ? "Yes" : "No"}</td>
                                  <td>
                                    <button
                                      className="auth-button button-sm button-danger"
                                      onClick={() => handleDeleteTestCase(tc.id)}
                                    >
                                      ✕
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {/* Add Test Case Form */}
                        <form className="create-form" onSubmit={handleAddTestCase}>
                          <h5>Add Test Case</h5>
                          <textarea
                            className="auth-input"
                            placeholder="Input data (stdin)"
                            rows={2}
                            value={testCaseForm.input_data}
                            onChange={(e) => setTestCaseForm({ ...testCaseForm, input_data: e.target.value })}
                          />
                          <textarea
                            className="auth-input"
                            placeholder="Expected output (stdout)"
                            rows={2}
                            required
                            value={testCaseForm.expected_output}
                            onChange={(e) => setTestCaseForm({ ...testCaseForm, expected_output: e.target.value })}
                          />
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={testCaseForm.is_hidden}
                              onChange={(e) => setTestCaseForm({ ...testCaseForm, is_hidden: e.target.checked })}
                            />
                            Hidden from students
                          </label>
                          <button className="auth-button" type="submit" disabled={addingTestCase}>
                            {addingTestCase ? "Adding..." : "Add Test Case"}
                          </button>
                        </form>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ─── Submissions Tab ─── */}
        {activeTab === "submissions" && (
          <div className="section">
            <h3>All Submissions</h3>
            {submissions.length === 0 ? (
              <p className="empty-text">No submissions yet.</p>
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
                      <strong>#{item.id}</strong> · {item.student} · {item.assignment_title}
                      <span className={`grade-badge ${item.grade !== null ? "grade-graded" : "grade-pending"}`}>
                        {item.grade !== null ? `${item.grade.toFixed(1)}%` : "Pending"}
                      </span>
                      <span className="expand-icon">{expandedSubmission === item.id ? "▼" : "▶"}</span>
                    </div>
                    <span className="item-meta">
                      Submitted: {new Date(item.submitted_at).toLocaleString()}
                    </span>
                    {expandedSubmission === item.id && (
                      <div className="feedback-panel">
                        {item.feedback ? (
                          <>
                            <h4>Grading Feedback</h4>
                            <pre className="feedback-text">{item.feedback}</pre>
                          </>
                        ) : (
                          <p>Not yet graded.</p>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

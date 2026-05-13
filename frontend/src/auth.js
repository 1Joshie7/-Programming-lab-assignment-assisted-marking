export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null")
  } catch {
    return null
  }
}

export function setAuthSession({ access, refresh, user }) {
  localStorage.setItem("access", access)
  localStorage.setItem("refresh", refresh)
  localStorage.setItem("user", JSON.stringify(user))
}

export function clearAuthSession() {
  localStorage.removeItem("access")
  localStorage.removeItem("refresh")
  localStorage.removeItem("user")
}

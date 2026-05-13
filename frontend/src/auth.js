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

/**
 * Decode JWT payload without a library.
 * Returns the parsed payload or null on failure.
 */
export function decodeTokenPayload(token) {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

/**
 * Returns true if the stored access token looks valid (present and not expired).
 * A small buffer (30s) is applied so we refresh before the server rejects us.
 */
export function isTokenValid() {
  const token = localStorage.getItem("access")
  if (!token) return false

  const payload = decodeTokenPayload(token)
  if (!payload?.exp) return false

  const now = Math.floor(Date.now() / 1000)
  return payload.exp > now + 30 // 30-second buffer
}

/**
 * Check if the current session is alive (has tokens + user data).
 * Use this instead of just checking localStorage.getItem("access").
 */
export function isSessionActive() {
  return !!localStorage.getItem("access") && !!localStorage.getItem("user")
}

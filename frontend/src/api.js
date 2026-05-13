import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Skip refresh attempts for auth endpoints
    if (error.response?.status !== 401 || originalRequest._retry || originalRequest.url?.includes("/auth/")) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = localStorage.getItem("refresh")
    if (!refreshToken) {
      clearAuthSession()
      window.location.href = "/"
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
        refresh: refreshToken,
      })

      localStorage.setItem("access", data.access)
      // Some JWT setups also rotate refresh tokens
      if (data.refresh) {
        localStorage.setItem("refresh", data.refresh)
      }

      originalRequest.headers.Authorization = `Bearer ${data.access}`
      processQueue(null, data.access)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearAuthSession()
      window.location.href = "/"
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

function clearAuthSession() {
  localStorage.removeItem("access")
  localStorage.removeItem("refresh")
  localStorage.removeItem("user")
}

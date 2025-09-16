import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { authService } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const authHeader = await authService.getAuthHeader()
    if (authHeader) {
      config.headers.Authorization = authHeader
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const tokens = await authService.refreshAccessToken()
        if (tokens && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Redirect to login or handle auth failure
        await authService.logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Like/Unlike functions (updated to not require userId in body)
export const likePost = async (postId: number) => {
  return api.post(`/posts/${postId}/like`)
}

export const unlikePost = async (postId: number) => {
  return api.delete(`/posts/${postId}/like`)
}

// User profile functions
export const updateUserProfile = async (
  userId: number,
  profileData: {
    name?: string
    email?: string
    platformPreference?: string
    profileImage?: string
  }
) => {
  return api.put(`/users/${userId}`, profileData)
}

export const updatePlatformPreference = async (userId: number, platformPreference: string) => {
  return api.put(`/users/${userId}`, { platformPreference })
}

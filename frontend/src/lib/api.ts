import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { Capacitor } from '@capacitor/core'
import { authService } from './auth'

// Use different API URLs for different platforms
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  if (Capacitor.isNativePlatform()) {
    // Use your computer's IP address for mobile simulators/devices
    return 'http://192.168.1.139:4000' // Your Mac's IP address on correct port
  }

  return 'http://localhost:4000' // Correct backend port
}

const API_BASE_URL = getApiBaseUrl()

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

// Save/Unsave functions (updated to not require userId in body)
export const savePost = async (postId: number) => {
  return api.post(`/posts/${postId}/save`)
}

export const unsavePost = async (postId: number) => {
  return api.delete(`/posts/${postId}/save`)
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

// Deezer preview functions
export const getDeezerTrackPreview = async (trackId: string) => {
  return api.get(`/posts/deezer-preview/${trackId}`)
}

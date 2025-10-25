import axios, { AxiosResponse } from 'axios'
import { Capacitor } from '@capacitor/core'
import { setTokens, getAccessToken, getRefreshToken, clearAuth, setUser, getUser, AuthTokens, User } from './storage'

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

// Create axios instance for auth requests
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

export interface RefreshResponse {
  token: string
  refreshToken: string
  user: User
}

class AuthService {
  private isRefreshing = false
  private refreshPromise: Promise<AuthTokens | null> | null = null

  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await authApi.post('/auth/login', credentials)
      const { token, refreshToken, user } = response.data

      // Store tokens and user data
      await setTokens({ accessToken: token, refreshToken })
      await setUser(user)

      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Signup with email and password
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await authApi.post('/auth/signup', credentials)
      const { token, refreshToken, user } = response.data

      // Store tokens and user data
      await setTokens({ accessToken: token, refreshToken })
      await setUser(user)

      return response.data
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  // Email-only authentication (for existing users)
  async loginWithEmail(email: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await authApi.post('/auth/email', { email })
      const { token, refreshToken, user } = response.data

      // Store tokens and user data
      await setTokens({ accessToken: token, refreshToken })
      await setUser(user)

      return response.data
    } catch (error) {
      console.error('Email login error:', error)
      throw error
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<AuthTokens | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this._performRefresh()

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async _performRefresh(): Promise<AuthTokens | null> {
    try {
      const refreshToken = await getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response: AxiosResponse<RefreshResponse> = await authApi.post('/auth/refresh', {
        refreshToken
      })

      const { token, refreshToken: newRefreshToken, user } = response.data
      const tokens = { accessToken: token, refreshToken: newRefreshToken }

      // Store new tokens and user data
      await setTokens(tokens)
      await setUser(user)

      return tokens
    } catch (error) {
      console.error('Token refresh error:', error)
      // If refresh fails, clear all auth data
      await this.logout()
      return null
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Call logout endpoint (optional)
      const accessToken = await getAccessToken()
      if (accessToken) {
        await authApi.post(
          '/auth/logout',
          {},
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        )
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local data
      await clearAuth()
    }
  }

  // Get current access token
  async getAccessToken(): Promise<string | null> {
    return getAccessToken()
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    return getUser()
  }

  // Get user data from server
  async getUserFromServer(userId: number): Promise<User | null> {
    try {
      const accessToken = await getAccessToken()
      const response = await authApi.get(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      const userData = response.data
      // Mettre à jour les données locales
      await setUser(userData)
      return userData
    } catch (error) {
      console.error('Error fetching user from server:', error)
      return null
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await getAccessToken()
    return !!token
  }

  // Get authorization header
  async getAuthHeader(): Promise<string | null> {
    const token = await getAccessToken()
    return token ? `Bearer ${token}` : null
  }
}

export const authService = new AuthService()
export default authService

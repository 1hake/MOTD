import { Preferences } from '@capacitor/preferences'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface User {
  id: number
  email: string
  name?: string
  profileImage?: string
  platformPreference?: string
}

// Token management
export const setTokens = async (tokens: AuthTokens) => {
  await Promise.all([
    Preferences.set({ key: 'accessToken', value: tokens.accessToken }),
    Preferences.set({ key: 'refreshToken', value: tokens.refreshToken })
  ])
}

export const getAccessToken = async (): Promise<string | null> => {
  const { value } = await Preferences.get({ key: 'accessToken' })
  return value
}

export const getRefreshToken = async (): Promise<string | null> => {
  const { value } = await Preferences.get({ key: 'refreshToken' })
  return value
}

export const clearTokens = async () => {
  await Promise.all([Preferences.remove({ key: 'accessToken' }), Preferences.remove({ key: 'refreshToken' })])
}

// User data management
export const setUser = async (user: User) => {
  await Preferences.set({ key: 'user', value: JSON.stringify(user) })
}

export const getUser = async (): Promise<User | null> => {
  const { value } = await Preferences.get({ key: 'user' })
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export const clearUser = async () => {
  await Preferences.remove({ key: 'user' })
}

// Clear all auth data
export const clearAuth = async () => {
  await Promise.all([clearTokens(), clearUser()])
}

// Decode JWT token to get user ID
export const getUserIdFromToken = (token: string): number | null => {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    // Handle base64url decoding properly
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const obj = JSON.parse(json)
    const id = Number(obj.userId)
    return Number.isFinite(id) ? id : null
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

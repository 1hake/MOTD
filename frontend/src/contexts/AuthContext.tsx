import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService, LoginCredentials, SignupCredentials } from '../lib/auth'
import { User } from '../lib/storage'
import { SearchHistoryService } from '../lib/searchHistory'
import SplashScreen from '../components/SplashScreen'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (credentials: SignupCredentials) => Promise<void>
  loginWithEmail: (email: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      const isAuth = await authService.isAuthenticated()

      if (isAuth && currentUser) {
        setUser(currentUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      const response = await authService.login(credentials)
      setUser(response.user)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (credentials: SignupCredentials) => {
    try {
      setIsLoading(true)
      const response = await authService.signup(credentials)
      setUser(response.user)
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithEmail = async (email: string) => {
    try {
      setIsLoading(true)
      const response = await authService.loginWithEmail(email)
      setUser(response.user)
    } catch (error) {
      console.error('Email login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)
      // Clear search history on logout
      SearchHistoryService.clearHistory()
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, clear local state and search history
      setUser(null)
      SearchHistoryService.clearHistory()
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser?.id) {
        // Récupérer les données fraîches du serveur
        const response = await authService.getUserFromServer(currentUser.id)
        if (response) {
          setUser(response)
        } else {
          setUser(currentUser)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    loginWithEmail,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {isLoading && <SplashScreen />}
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext

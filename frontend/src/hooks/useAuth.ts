import { useAuth as useAuthContext } from '../contexts/AuthContext'

export const useAuth = useAuthContext

// Hook for protected routes
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth()

  return {
    isAuthenticated,
    isLoading,
    shouldRedirect: !isLoading && !isAuthenticated
  }
}

// Hook for auth actions with loading states
export const useAuthActions = () => {
  const { login, signup, loginWithEmail, logout, isLoading } = useAuth()

  return {
    login,
    signup,
    loginWithEmail,
    logout,
    isLoading
  }
}

// Hook for user data
export const useUser = () => {
  const { user, refreshUser } = useAuth()

  return {
    user,
    refreshUser,
    isAuthenticated: !!user
  }
}

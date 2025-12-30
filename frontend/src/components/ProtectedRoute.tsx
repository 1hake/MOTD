import React, { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useRequireAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading, shouldRedirect } = useRequireAuth()

  if (isLoading) {
    return null
  }

  if (shouldRedirect) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

import React, { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useRequireAuth } from '../hooks/useAuth'
import LoadingState from './LoadingState'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading, shouldRedirect } = useRequireAuth()

  if (isLoading) {
    return <LoadingState />
  }

  if (shouldRedirect) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

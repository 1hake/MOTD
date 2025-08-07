import { Navigate, Outlet } from 'react-router-dom'

import { useApp } from '../contexts/AppContext/AppContext'

interface Props {
  children?: JSX.Element
}

export const ProtectedRoute = ({ children }: Props) => {
  const {
    state: { isAuthenticated }
  } = useApp()

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />
  }

  return children ? children : <Outlet />
}

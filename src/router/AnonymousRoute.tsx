import { Navigate, Outlet } from 'react-router-dom'

import { useApp } from '../contexts/AppContext/AppContext'

interface Props {
  children?: JSX.Element
}

export const AnonymousRoute = ({ children }: Props) => {
  const {
    state: { isAuthenticated }
  } = useApp()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children ? children : <Outlet />
}

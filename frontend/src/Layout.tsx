import React from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './components/Navigation'
import { useAuth } from './hooks/useAuth'
import LoadingState from './components/LoadingState'
import { AudioProvider } from './contexts/AudioContext'

const Layout: React.FC = () => {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <AudioProvider>
      <div className="pb-24 relative min-h-screen">
        <main className="relative z-10">
          <Outlet />
        </main>
        <Navigation />
      </div>
    </AudioProvider>
  )
}

export default Layout

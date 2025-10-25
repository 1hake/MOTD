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
      <div className="pb-24 relative bg-[#181616]">
        {/* Background with gradient */}
        <div className="fixed inset-0  via-white to-music-50/50 -z-10" />

        {/* Subtle background patterns */}
        <div className="fixed inset-0 -z-10 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-music-400/20 to-accent-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-accent-400/20 to-music-400/20 rounded-full blur-3xl" />
        </div>

        <main className="relative z-10">
          <Outlet />
        </main>
        <Navigation />
      </div>
    </AudioProvider>
  )
}

export default Layout

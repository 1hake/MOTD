import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type NavItem = { path: string; label: string; icon: React.ReactNode }

const navItems: NavItem[] = [
  {
    path: '/feed',
    label: 'Feed',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-1.636-.525-3.15-1.415-4.243a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 12a5.983 5.983 0 01-.757 2.829 1 1 0 11-1.415-1.415A3.987 3.987 0 0013 12a3.987 3.987 0 00-.172-1.172 1 1 0 010-1.415z"
          clipRule="evenodd"
        />
      </svg>
    )
  },
  {
    path: '/friends',
    label: 'Friends',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    )
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    )
  }
]

const Navigation: React.FC = () => {
  const { pathname } = useLocation()
  const { isAuthenticated } = useAuth()

  // Don't show navigation if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const isActive = (path: string) => {
    if (path === '/profile') return pathname.startsWith('/profile')
    if (path === '/feed') return pathname === '/feed' || pathname === '/home'
    return pathname === path
  }

  return (
    <nav className="fixed bottom-6 left-8 right-8 flex justify-center z-50">
      <div className="bg-white/50 backdrop-blur-md border border-white/30 shadow-lg rounded-3xl px-3 py-2 max-w-sm w-full">
        <ul className="flex justify-between items-center gap-1">
          {navItems.map(({ path, label, icon }) => {
            const active = isActive(path)
            const base =
              'relative flex items-center justify-center w-10 h-10 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-music-500/40'
            const activeCls = 'text-music-600'
            const inactiveCls = 'text-primary-500 hover:text-primary-700'
            return (
              <li key={path} className="flex-1 flex justify-center">
                <Link
                  to={path}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={`${base} ${active ? activeCls : inactiveCls}`}
                >
                  {icon}
                  <span className="sr-only">{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

export default Navigation

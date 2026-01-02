import React, { useRef, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { motion, useMotionValue, animate } from 'framer-motion'

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
    path: '/explorer',
    label: 'Explorer',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
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
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const isDragging = useRef(false)

  const getActiveIndex = () => {
    if (pathname === '/profile' || pathname === '/profile/edit') return 2
    if (pathname === '/explorer' || pathname === '/friends' || pathname.startsWith('/friends/')) return 1
    if (pathname === '/feed' || pathname === '/home') return 0
    return 0
  }

  const activeIndex = getActiveIndex()

  // Internal width after padding (px-3 = 12px * 2 = 24px)
  const internalWidth = Math.max(0, containerWidth - 24)
  const pillWidth = (internalWidth - 16) / 3 // 16 is total gap (2 * 8px)
  const step = pillWidth + 8

  const x = useMotionValue(activeIndex * step)

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  useEffect(() => {
    if (!isDragging.current && containerWidth > 0) {
      animate(x, activeIndex * step, {
        type: "spring",
        stiffness: 500,
        damping: 40
      })
    }
  }, [activeIndex, containerWidth, step, x])

  const handleDrag = () => {
    const currentX = x.get()
    let targetIndex = 0
    if (currentX > step * 1.5) {
      targetIndex = 2
    } else if (currentX > step * 0.5) {
      targetIndex = 1
    }

    if (targetIndex !== activeIndex) {
      navigate(navItems[targetIndex].path)
    }
  }

  const handleDragStart = () => {
    isDragging.current = true
  }

  const handleDragEnd = () => {
    isDragging.current = false
    animate(x, activeIndex * step, {
      type: "spring",
      stiffness: 500,
      damping: 40
    })
  }

  // Don't show navigation if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <nav className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-8 right-8 flex justify-center z-50">
      <div
        ref={containerRef}
        className="relative bg-white border-3 border-black shadow-neo rounded-full px-3 py-2 max-w-sm w-full select-none cursor-pointer"
        onClick={(e) => {
          if (containerWidth === 0) return
          const rect = e.currentTarget.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          const width = rect.width

          let targetIndex = 0
          if (clickX > (width * 2) / 3) targetIndex = 2
          else if (clickX > width / 3) targetIndex = 1

          if (targetIndex !== activeIndex) {
            navigate(navItems[targetIndex].path)
          }
        }}
      >
        {/* Animated Background Indicator / Draggable Pill */}
        {containerWidth > 0 && (
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 2 * step }}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()}
            style={{ x, left: '12px', width: pillWidth }}
            className="absolute z-10 h-[calc(100%-16px)] rounded-full bg-pop-pink border-3 border-black cursor-grab active:cursor-grabbing shadow-neo-sm touch-none"
          />
        )}

        <ul className="relative z-20 flex justify-between items-center gap-2 pointer-events-none">
          {navItems.map(({ path, label, icon }, index) => {
            const active = index === activeIndex
            return (
              <li key={path} className="flex-1 flex justify-center">
                <Link
                  to={path}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={`nav-item flex items-center justify-center w-full h-14 rounded-full transition-colors duration-200 border-none hover:bg-transparent hover:border-none shadow-none hover:shadow-none ${active ? 'text-black' : 'text-black/40'
                    }`}
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

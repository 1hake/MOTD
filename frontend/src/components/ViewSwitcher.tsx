import React, { useRef } from 'react'
import { motion, PanInfo, useMotionValue, animate } from 'framer-motion'

interface ViewSwitcherProps {
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ viewMode, setViewMode }) => {
  const x = useMotionValue(viewMode === 'grid' ? 0 : 124)
  const isDragging = useRef(false)

  // Synchronize motion value when viewMode changes externally (like clicks)
  // BUT only if we aren't currently dragging
  React.useEffect(() => {
    if (!isDragging.current) {
      animate(x, viewMode === 'grid' ? 0 : 124, {
        type: "spring",
        stiffness: 500,
        damping: 40
      })
    }
  }, [viewMode, x])

  const handleDrag = () => {
    const currentX = x.get()
    const targetMode = currentX > 62 ? 'list' : 'grid'

    // Change state immediately when crossing the threshold without waiting for release
    if (targetMode !== viewMode) {
      setViewMode(targetMode)
    }
  }

  const handleDragStart = () => {
    isDragging.current = true
  }

  const handleDragEnd = () => {
    isDragging.current = false
    // Final snap to ensure it's perfectly at 0 or 124
    animate(x, viewMode === 'grid' ? 0 : 124, {
      type: "spring",
      stiffness: 500,
      damping: 40
    })
  }

  return (
    <div className="flex justify-center">
      <div
        className="relative flex items-center p-1.5 bg-white border-3 border-black rounded-xl shadow-neo-sm w-[260px] h-14 select-none cursor-pointer overflow-hidden"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          setViewMode(clickX < rect.width / 2 ? 'grid' : 'list')
        }}
      >
        {/* Animated Background Indicator / Draggable Pill */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 124 }}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{ x, left: '6px' }}
          className="absolute z-10 w-[calc(50%-6px)] h-[calc(100%-12px)] rounded-lg bg-pop-pink border-2 border-black cursor-grab active:cursor-grabbing shadow-sm"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Labels */}
        <div className="relative z-20 flex-1 flex items-center justify-center gap-2 h-full rounded-lg text-sm font-black uppercase pointer-events-none">
          <svg className={`w-5 h-5 transition-colors ${viewMode === 'grid' ? 'text-black' : 'text-black/40'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className={viewMode === 'grid' ? 'text-black' : 'text-black/40'}>Grille</span>
        </div>

        <div className="relative z-20 flex-1 flex items-center justify-center gap-2 h-full rounded-lg text-sm font-black uppercase pointer-events-none">
          <svg className={`w-5 h-5 transition-colors ${viewMode === 'list' ? 'text-black' : 'text-black/40'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span className={viewMode === 'list' ? 'text-black' : 'text-black/40'}>Liste</span>
        </div>
      </div>
    </div>
  )
}

export default ViewSwitcher

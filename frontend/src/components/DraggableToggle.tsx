import React, { useRef, useEffect } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'

interface DraggableToggleProps {
  active: boolean
  onChange: (active: boolean) => void
  activeColor?: string
  inactiveColor?: string
}

const DraggableToggle: React.FC<DraggableToggleProps> = ({
  active,
  onChange,
  activeColor = 'bg-pop-mint',
  inactiveColor = 'bg-gray-300'
}) => {
  const x = useMotionValue(active ? 20 : 0)
  const isDragging = useRef(false)

  // Synchronize motion value when active changes externally
  useEffect(() => {
    if (!isDragging.current) {
      animate(x, active ? 20 : 0, {
        type: "spring",
        stiffness: 500,
        damping: 30
      })
    }
  }, [active, x])

  const handleDrag = () => {
    const currentX = x.get()
    const targetActive = currentX > 10

    if (targetActive !== active) {
      onChange(targetActive)
    }
  }

  const handleDragStart = () => {
    isDragging.current = true
  }

  const handleDragEnd = () => {
    isDragging.current = false
    animate(x, active ? 20 : 0, {
      type: "spring",
      stiffness: 500,
      damping: 30
    })
  }

  return (
    <div
      className={`relative inline-flex h-7 w-12 items-center rounded-full border-3 border-black transition-colors duration-200 cursor-pointer overflow-hidden ${active ? activeColor : inactiveColor
        }`}
      onClick={() => onChange(!active)}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 20 }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x, left: '4px' }}
        className="absolute z-10 h-3.5 w-3.5 rounded-full bg-black cursor-grab active:cursor-grabbing touch-none"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

export default DraggableToggle


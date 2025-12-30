import React from 'react'

type AudioLevelIndicatorProps = {
  isPlaying: boolean
  barCount?: number
  className?: string
}

export default function AudioLevelIndicator({
  isPlaying,
  barCount = 5,
  className = ''
}: AudioLevelIndicatorProps) {
  return (
    <div className={`flex items-end justify-center gap-1.5 ${className}`}>
      {Array.from({ length: barCount }).map((_, index) => (
        <div
          key={index}
          className="relative"
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        >
          <div
            className={`w-2 bg-black border-2 border-black rounded-full transition-all duration-300 ${isPlaying ? 'animate-audio-bar' : 'h-2'
              }`}
            style={{
              animationDelay: `${index * 0.15}s`,
              animationDuration: `${0.6 + (index * 0.1)}s`
            }}
          />
        </div>
      ))}
    </div>
  )
}


import React from 'react'

type PlatformOption = {
  id: string
  name: string
  iconSvg: (className?: string) => React.ReactNode
  activeColor: string
  hoverColor: string
}

type PlatformSelectorProps = {
  selectedPlatform: string
  onPlatformChange: (platformId: string) => void
  disabled?: boolean
  showClearOption?: boolean
}

const platformOptions: PlatformOption[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    activeColor: 'bg-[#1DB954]',
    hoverColor: 'hover:bg-[#1DB954]/20',
    iconSvg: (className = "w-8 h-8") => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    )
  },
  {
    id: 'apple',
    name: 'Apple Music',
    activeColor: 'bg-[#FC3C44]',
    hoverColor: 'hover:bg-[#FC3C44]/20',
    iconSvg: (className = "w-8 h-8") => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
    )
  },
  {
    id: 'deezer',
    name: 'Deezer',
    activeColor: 'bg-black text-white',
    hoverColor: 'hover:bg-black/10',
    iconSvg: (className = "w-8 h-8") => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.81 8.1h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm-3.7-5.55h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm-3.7-5.55h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31z" />
      </svg>
    )
  },
  {
    id: 'youtube',
    name: 'YouTube',
    activeColor: 'bg-[#FF0000] text-white',
    hoverColor: 'hover:bg-[#FF0000]/20',
    iconSvg: (className = "w-8 h-8") => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    )
  }
]

export default function PlatformSelector({
  selectedPlatform,
  onPlatformChange,
  disabled = false,
  showClearOption = true
}: PlatformSelectorProps) {
  return (
    <div className="card p-8 space-y-8">
      <div className="border-b-3 border-black pb-4">
        <h3 className="text-xl font-black text-black uppercase italic">Plateforme préférée</h3>
        <p className="text-sm text-black opacity-60 font-bold uppercase tracking-tight">Pour vos redirections musicales</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {platformOptions.map((platform) => {
          const isSelected = selectedPlatform === platform.id
          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => onPlatformChange(platform.id)}
              disabled={disabled}
              className={`
                group relative flex flex-col items-center justify-center p-6 rounded-2xl border-3 border-black transition-all duration-200
                ${isSelected
                  ? `${platform.activeColor} shadow-neo translate-x-[-2px] translate-y-[-2px]`
                  : `bg-white ${platform.hoverColor} hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-sm active:translate-x-0 active:translate-y-0 active:shadow-none`
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Icon Container */}
              <div className={`transition-transform duration-200 group-hover:scale-110 mb-3 ${isSelected ? 'scale-110' : ''}`}>
                {platform.iconSvg(isSelected ? 'w-10 h-10' : 'w-8 h-8')}
              </div>

              {/* Label */}
              <span className={`text-xs font-black uppercase italic tracking-wider ${isSelected ? '' : 'opacity-60'}`}>
                {platform.name}
              </span>

              {/* Selected Indicator Dot */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-white border-2 border-black rounded-full shadow-sm" />
              )}
            </button>
          )
        })}
      </div>

      {showClearOption && selectedPlatform && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => onPlatformChange('')}
            disabled={disabled}
            className="px-4 py-2 text-xs font-black text-black/40 hover:text-red-500 uppercase italic underline transition-colors decoration-2 underline-offset-4"
          >
            Réinitialiser ma préférence
          </button>
        </div>
      )}
    </div>
  )
}

export { platformOptions }
export type { PlatformOption }

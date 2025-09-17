import React, { useState } from 'react'
import { updatePlatformPreference } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

type PlatformOption = {
  id: string
  name: string
  icon: string
  color: string
  iconSvg: React.ReactNode
}

type PlatformSelectorProps = {
  selectedPlatform: string
  onPlatformChange: (platformId: string) => void
  disabled?: boolean
  showClearOption?: boolean
  autoSave?: boolean // Nouvelle prop pour activer la sauvegarde automatique
}

const platformOptions: PlatformOption[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    icon: '🎵',
    color: 'from-green-400 to-green-500',
    iconSvg: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    )
  },
  {
    id: 'apple',
    name: 'Apple Music',
    icon: '🍎',
    color: 'from-pink-500 to-rose-500',
    iconSvg: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
    )
  },
  {
    id: 'deezer',
    name: 'Deezer',
    icon: '🎧',
    color: 'from-purple-500 to-indigo-600',
    iconSvg: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.81 8.1h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm-3.7-5.55h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm-3.7-5.55h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31z" />
      </svg>
    )
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '📺',
    color: 'from-red-500 to-red-600',
    iconSvg: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    )
  }
]

export default function PlatformSelector({
  selectedPlatform,
  onPlatformChange,
  disabled = false,
  showClearOption = true,
  autoSave = false
}: PlatformSelectorProps) {
  const { user, refreshUser } = useAuth()

  // État local pour la sélection immédiate quand autoSave est activé
  const [localSelectedPlatform, setLocalSelectedPlatform] = useState(selectedPlatform)

  // Synchroniser l'état local avec les props quand selectedPlatform change
  React.useEffect(() => {
    setLocalSelectedPlatform(selectedPlatform)
  }, [selectedPlatform])

  // Utiliser l'état local si autoSave est activé, sinon utiliser selectedPlatform directement
  const currentSelectedPlatform = autoSave ? localSelectedPlatform : selectedPlatform

  const handlePlatformChange = async (platformId: string) => {
    // Appeler la fonction de callback parent en premier
    onPlatformChange(platformId)

    // Si autoSave est activé, gérer la sauvegarde automatique et l'état local
    if (autoSave) {
      // Mettre à jour immédiatement l'état local pour un feedback visuel instantané
      setLocalSelectedPlatform(platformId)

      // Si on a un utilisateur connecté, sauvegarder silencieusement
      if (user?.id) {
        try {
          await updatePlatformPreference(user.id, platformId)
          // Rafraîchir les données utilisateur
          await refreshUser()
        } catch (error) {
          console.error('Erreur lors de la sauvegarde de la préférence:', error)
          // En cas d'erreur, revenir à la sélection précédente
          setLocalSelectedPlatform(selectedPlatform)
          // Notifier le parent de l'échec en renvoyant la valeur précédente
          onPlatformChange(selectedPlatform)
        }
      }
    }
  }
  return (
    <div className="space-y-6 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800/30 p-6">
      <div className="border-b border-gray-700/50 pb-3">
        <h3 className="text-lg font-semibold text-white">Plateforme musicale préférée</h3>
        <p className="text-sm text-gray-400 mt-1">Sélectionnez votre plateforme préférée pour les liens musicaux</p>
      </div>

      {/* Platform options grid - responsive */}
      <div className="grid grid-cols-4 gap-3 sm:flex sm:overflow-x-auto sm:pb-2 sm:-mx-2 sm:px-2">
        <div className="contents sm:flex sm:gap-3 sm:min-w-max">
          {platformOptions.map((platform) => (
            <button
              key={platform.id}
              type="button"
              onClick={() => handlePlatformChange(platform.id)}
              disabled={disabled}
              className={`
                                aspect-square w-full sm:w-20 sm:aspect-auto sm:flex-shrink-0 
                                p-3 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 group relative overflow-hidden
                                ${
                                  currentSelectedPlatform === platform.id
                                    ? `border-transparent bg-gradient-to-br ${platform.color} text-white shadow-lg transform scale-105`
                                    : 'border-gray-700/50 bg-gray-800/40 text-gray-300 hover:border-gray-600/50 hover:bg-gray-800/60 hover:scale-105 hover:shadow-lg'
                                }
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
            >
              {/* Background glow effect when selected */}
              {currentSelectedPlatform === platform.id && (
                <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-20 blur-xl`}></div>
              )}

              <div className="relative flex flex-col items-center justify-center h-full gap-1 sm:gap-2">
                {/* Platform Icon */}
                <div
                  className={`
                                    transition-all duration-300 group-hover:scale-110
                                    ${
                                      currentSelectedPlatform === platform.id
                                        ? 'text-white drop-shadow-lg'
                                        : 'text-gray-400 group-hover:text-gray-200'
                                    }
                                `}
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7">
                    {React.cloneElement(platform.iconSvg as React.ReactElement, {
                      className: 'w-full h-full'
                    })}
                  </div>
                </div>

                {/* Platform Name - responsive text */}
                <span className="font-medium text-[10px] sm:text-xs text-center leading-tight max-w-full truncate">
                  {platform.name.split(' ')[0]} {/* Show only first word on mobile */}
                  <span className="hidden sm:inline">
                    {platform.name.includes(' ') ? ` ${platform.name.split(' ').slice(1).join(' ')}` : ''}
                  </span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Clear selection option */}
      {showClearOption && currentSelectedPlatform && (
        <div className="pt-4 border-t border-gray-700/30">
          <button
            type="button"
            onClick={() => handlePlatformChange('')}
            disabled={disabled}
            className="text-sm text-gray-400 hover:text-gray-300 underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Effacer la sélection
          </button>
        </div>
      )}
    </div>
  )
}

export { platformOptions }
export type { PlatformOption }

import React, { useState } from 'react'
import PlatformSelector from './PlatformSelector'
import { useAuth } from '../contexts/AuthContext'
import { updatePlatformPreference } from '../lib/api'

type AutoSavePlatformSelectorProps = {
  disabled?: boolean
  showClearOption?: boolean
  user?: {
    id: number
    platformPreference?: string
  } // Prop optionnelle pour passer les données utilisateur
  onUserUpdate?: (updatedUser: any) => void // Callback pour mettre à jour les données utilisateur
  onPlatformChange?: (platformId: string) => void // Callback optionnel lors du clic
}

export default function AutoSavePlatformSelector({
  disabled = false,
  showClearOption = true,
  user: propUser,
  onUserUpdate,
  onPlatformChange
}: AutoSavePlatformSelectorProps) {
  const { user: contextUser, refreshUser } = useAuth()
  const user = propUser || contextUser
  const [isSaving, setIsSaving] = useState(false)
  const [isGlitching, setIsGlitching] = useState(false)

  const handlePlatformChange = async (platformId: string) => {
    // Effet de glitch visuel
    setIsGlitching(true)
    setTimeout(() => setIsGlitching(false), 300)

    // Appeler le callback de clic si présent
    onPlatformChange?.(platformId)

    // 1. Mettre à jour l'UI localement immédiatement via le callback parent si présent
    if (onUserUpdate && propUser) {
      onUserUpdate({
        ...propUser,
        platformPreference: platformId || undefined
      })
    }

    // 2. Sauvegarder dans l'API si on a un utilisateur
    if (user?.id) {
      setIsSaving(true)
      try {
        await updatePlatformPreference(user.id, platformId)
        await refreshUser()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la préférence:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  return (
    <div className={`relative transition-all duration-75 ${isGlitching ? 'translate-x-1 skew-x-2 brightness-125' : ''}`}>
      {/* Glitch overlays when active */}
      {isGlitching && (
        <>
          <div className="absolute inset-0 z-50 bg-pop-pink/20 -translate-x-2 translate-y-1 mix-blend-screen pointer-events-none animate-pulse" />
          <div className="absolute inset-0 z-50 bg-pop-blue/20 translate-x-1 -translate-y-1 mix-blend-multiply pointer-events-none animate-pulse" />
        </>
      )}

      <PlatformSelector
        selectedPlatform={user?.platformPreference || ''}
        onPlatformChange={handlePlatformChange}
        disabled={disabled || isSaving}
        showClearOption={showClearOption}
      />

      {/* Indicateur de sauvegarde discret */}
      {isSaving && !isGlitching && (
        <div className="absolute top-6 right-8">
          <div className="flex items-center gap-2 px-3 py-1 bg-pop-blue border-2 border-black rounded-lg shadow-neo-sm">
            <svg className="animate-spin h-3 w-3 text-black" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-[10px] font-black uppercase italic">Sync...</span>
          </div>
        </div>
      )}
    </div>
  )
}

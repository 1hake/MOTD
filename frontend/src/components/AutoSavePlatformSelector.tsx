import React from 'react'
import PlatformSelector from './PlatformSelector'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

type AutoSavePlatformSelectorProps = {
  disabled?: boolean
  showClearOption?: boolean
  user?: {
    id: number
    platformPreference?: string
  } // Prop optionnelle pour passer les données utilisateur
  onUserUpdate?: (updatedUser: any) => void // Callback pour mettre à jour les données utilisateur
}

export default function AutoSavePlatformSelector({
  disabled = false,
  showClearOption = true,
  user: propUser,
  onUserUpdate
}: AutoSavePlatformSelectorProps) {
  const { user: contextUser, refreshUser } = useAuth()

  // Utiliser les données passées en prop ou celles du contexte
  const user = propUser || contextUser

  const handlePlatformChange = async (platformId: string) => {
    // Cette fonction est appelée par PlatformSelector mais n'a pas besoin de faire quoi que ce soit
    // car la sauvegarde est gérée automatiquement dans PlatformSelector
    console.log('Platform changed to:', platformId)

    // Si on a un callback de mise à jour, l'appeler immédiatement avec la nouvelle valeur
    if (onUserUpdate && propUser) {
      // Mettre à jour immédiatement avec la nouvelle préférence
      const updatedUser = {
        ...propUser,
        platformPreference: platformId || undefined
      }
      onUserUpdate(updatedUser)
    }
  }

  return (
    <PlatformSelector
      selectedPlatform={user?.platformPreference || ''}
      onPlatformChange={handlePlatformChange}
      disabled={disabled}
      showClearOption={showClearOption}
      autoSave={true}
    />
  )
}

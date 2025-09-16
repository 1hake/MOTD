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

    // Si on a un callback de mise à jour, l'appeler après un délai
    if (onUserUpdate && propUser) {
      setTimeout(async () => {
        try {
          // Rafraîchir les données utilisateur depuis le serveur
          const response = await api.get(`/users/${propUser.id}`)
          onUserUpdate(response.data)
        } catch (error) {
          console.error('Error refreshing user data:', error)
        }
      }, 1000) // Attendre 1 seconde pour que la sauvegarde soit terminée
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

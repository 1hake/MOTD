import React, { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import PlatformSelector from '../components/PlatformSelector'
import { useToast } from '../components/Toast'

type User = {
  id: number
  email: string
  name?: string
  profileImage?: string
  platformPreference?: string
}

export default function EditProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    platformPreference: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [hasChanges, setHasChanges] = useState(false)
  const navigate = useNavigate()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const originalDataRef = useRef({
    name: '',
    email: '',
    platformPreference: ''
  })
  const { user: currentUser, isAuthenticated, refreshUser } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    ;(async () => {
      if (!isAuthenticated || !currentUser) {
        navigate('/login')
        return
      }

      try {
        setLoading(true)
        const userRes = await api.get(`/users/${currentUser.id}`)
        const userData = userRes.data
        setUser(userData)
        const initialFormData = {
          name: userData.name || '',
          email: userData.email || '',
          platformPreference: userData.platformPreference || ''
        }
        setFormData(initialFormData)
        originalDataRef.current = { ...initialFormData }
      } catch (error) {
        console.error('Error fetching user data:', error)
        console.error('Erreur lors du chargement des données utilisateur')
      } finally {
        setLoading(false)
      }
    })()
  }, [navigate, currentUser, isAuthenticated])

  const autoSave = useCallback(async () => {
    if (saving || !user) return

    setSaving(true)
    setSaveStatus('saving')

    try {
      const updateData: any = {}

      // Only include fields that have changed
      if (formData.name !== originalDataRef.current.name) {
        updateData.name = formData.name || null
      }
      if (formData.email !== originalDataRef.current.email) {
        updateData.email = formData.email
      }
      if (formData.platformPreference !== originalDataRef.current.platformPreference) {
        updateData.platformPreference = formData.platformPreference || null
      }

      // Only make the request if there are changes
      if (Object.keys(updateData).length > 0) {
        await api.put(`/users/${user.id}`, updateData)
        setSaveStatus('saved')

        // Update local user state and original data reference
        setUser((prev) => (prev ? { ...prev, ...updateData } : null))
        originalDataRef.current = { ...formData }
        setHasChanges(false)

        // Refresh the user data in AuthContext to ensure Profile page shows updated data
        await refreshUser()

        // Show success toast
        showToast('Profil mis à jour avec succès !', 'success')

        // Reset status after a delay
        setTimeout(() => {
          setSaveStatus('idle')
        }, 2000)
      } else {
        setSaveStatus('idle')
        setHasChanges(false)
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setSaveStatus('error')
      const errorMessage = error.response?.data?.error || 'Erreur lors de la mise à jour du profil'
      
      // Show error toast
      showToast(errorMessage, 'error')

      // Reset error status after a delay
      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    } finally {
      setSaving(false)
    }
  }, [formData, user, saving, refreshUser, showToast])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Check if there are changes
    const newFormData = { ...formData, [field]: value }
    const hasFormChanges =
      newFormData.name !== originalDataRef.current.name ||
      newFormData.email !== originalDataRef.current.email ||
      newFormData.platformPreference !== originalDataRef.current.platformPreference

    setHasChanges(hasFormChanges)

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for auto-save (2 seconds after user stops typing)
    if (hasFormChanges) {
      saveTimeoutRef.current = setTimeout(() => {
        autoSave()
      }, 2000)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  if (loading) {
    return <LoadingState message="Chargement des paramètres..." />
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <div className="text-center space-y-4">
          <div className="text-6xl">❌</div>
          <div className="text-xl font-semibold text-red-600">Erreur de chargement</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-gray-100">
      <div className="max-w-2xl mx-auto px-6 py-12 pb-32">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">Modifier le profil</h1>
              <p className="text-gray-400">Personnalisez vos informations et préférences</p>
            </div>
            {/* Auto-save status indicator */}
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <>
                  <svg className="animate-spin h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-sm text-blue-400">Sauvegarde...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-green-400">Sauvegardé</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm text-red-400">Erreur</span>
                </>
              )}
              {hasChanges && saveStatus === 'idle' && (
                <span className="text-sm text-yellow-400">Modifications en attente...</span>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-8">
          <div className="space-y-8">
            {/* Profile Picture Section */}
            <div className="space-y-4 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800/30 p-6">
              <label className="block text-lg font-semibold text-white">Photo de profil</label>
              <div className="flex items-center gap-6">
                {/* Current Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>

                {/* Upload Button (placeholder for future implementation) */}
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled
                    className="px-6 py-3 bg-gray-700/50 text-gray-400 rounded-lg cursor-not-allowed opacity-50 transition-colors"
                  >
                    Changer la photo
                  </button>
                  <p className="text-sm text-gray-400">Fonctionnalité bientôt disponible</p>
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="space-y-6 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800/30 p-6">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-3">
                Informations personnelles
              </h3>

              {/* Name Field */}
              <div className="space-y-3">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-300">
                  Nom d'affichage
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full px-4 py-4 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
                  placeholder="Votre nom d'affichage"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={saving}
                />
                <p className="text-sm text-gray-400">Ce nom sera visible par vos amis</p>
              </div>

              {/* Email Field */}
              <div className="space-y-3">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-4 py-4 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Platform Preference Section */}
            <PlatformSelector
              selectedPlatform={formData.platformPreference}
              onPlatformChange={(platformId) => handleInputChange('platformPreference', platformId)}
              disabled={saving}
              showClearOption={true}
            />

            {/* Auto-save info */}
            <div className="bg-gray-900/20 backdrop-blur-sm rounded-xl border border-gray-800/30 p-4">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Vos modifications sont automatiquement sauvegardées</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

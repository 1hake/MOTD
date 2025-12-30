import React, { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import AutoSavePlatformSelector from '../components/AutoSavePlatformSelector'
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
    ; (async () => {
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

      // Only include fields that have changed (excluding platformPreference which is handled separately)
      if (formData.name !== originalDataRef.current.name) {
        updateData.name = formData.name || null
      }
      if (formData.email !== originalDataRef.current.email) {
        updateData.email = formData.email
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

    // Check if there are changes (excluding platformPreference which is handled separately)
    const newFormData = { ...formData, [field]: value }
    const hasFormChanges =
      newFormData.name !== originalDataRef.current.name ||
      newFormData.email !== originalDataRef.current.email

    setHasChanges(hasFormChanges)

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for auto-save (2 seconds after user stops typing)
    // Only for non-platform preference fields
    if (hasFormChanges && field !== 'platformPreference') {
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
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-12 pb-32">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-6 mb-8">
            <button
              onClick={() => navigate('/profile')}
              className="p-3 rounded-xl bg-white border-3 border-black shadow-neo-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all"
            >
              <svg className="w-6 h-6 text-black stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-4xl font-black text-black uppercase italic tracking-tight">Modifier le profil</h1>
              <p className="text-black font-bold opacity-60 uppercase text-sm">Personnalisez vos informations</p>
            </div>
            {/* Auto-save status indicator - compact version */}
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <div className="flex items-center justify-center w-10 h-10 bg-pop-blue border-3 border-black rounded-xl shadow-neo-sm">
                  <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              {saveStatus === 'saved' && (
                <div className="flex items-center justify-center w-10 h-10 bg-pop-mint border-3 border-black rounded-xl shadow-neo-sm">
                  <svg className="w-6 h-6 text-black stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center justify-center w-10 h-10 bg-pop-red border-3 border-black rounded-xl shadow-neo-sm">
                  <svg className="w-6 h-6 text-black stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-10">
          <div className="space-y-10">
            {/* Profile Picture Section */}
            <div className="card p-8">
              <label className="block text-xl font-black text-black uppercase italic mb-6">Photo de profil</label>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Current Avatar */}
                <div className="w-24 h-24 bg-pop-pink border-3 border-black rounded-2xl flex items-center justify-center text-black text-3xl font-black shadow-neo">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>

                {/* Upload Button */}
                <div className="space-y-3 text-center sm:text-left">
                  <button
                    type="button"
                    disabled
                    className="px-6 py-3 bg-white border-3 border-black text-black/40 font-black uppercase italic rounded-xl cursor-not-allowed opacity-50"
                  >
                    Changer la photo
                  </button>
                  <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Fonctionnalité bientôt disponible</p>
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="card p-8 space-y-8">
              <h3 className="text-xl font-black text-black uppercase italic border-b-3 border-black pb-4">
                Informations personnelles
              </h3>

              {/* Name Field */}
              <div className="space-y-3">
                <label htmlFor="name" className="block text-sm font-black text-black uppercase">
                  Nom d'affichage
                </label>
                <input
                  id="name"
                  type="text"
                  className="input-field"
                  placeholder="Votre nom d'affichage"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={saving}
                />
                <p className="text-xs font-bold text-black opacity-60 uppercase">Ce nom sera visible par vos amis</p>
              </div>

              {/* Email Field */}
              <div className="space-y-3">
                <label htmlFor="email" className="block text-sm font-black text-black uppercase">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input-field"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Platform Preference Section */}
            <AutoSavePlatformSelector
              user={user}
              onUserUpdate={(updatedUser) => {
                const newPlatformPreference = updatedUser.platformPreference || ''
                setFormData(prev => ({ ...prev, platformPreference: newPlatformPreference }))
                originalDataRef.current.platformPreference = newPlatformPreference
                setUser(prevUser => prevUser ? { ...prevUser, platformPreference: newPlatformPreference } : null)
                setHasChanges(false)
              }}
              disabled={false}
              showClearOption={true}
            />

            {/* Auto-save info */}
            <div className="bg-pop-yellow border-3 border-black shadow-neo-sm rounded-2xl p-6">
              <div className="flex items-center gap-4 text-black font-bold uppercase text-sm">
                <svg className="w-6 h-6 stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Vos modifications sont sauvegardées automatiquement</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating save status indicator */}
        {(saveStatus !== 'idle' || hasChanges) && (
          <div className="fixed bottom-8 right-8 z-50">
            <div className={`
              flex items-center gap-4 px-6 py-4 rounded-2xl shadow-neo border-3 border-black transition-all duration-300 transform
              ${saveStatus === 'saving' ? 'bg-pop-blue text-black translate-y-[-4px]' : ''}
              ${saveStatus === 'saved' ? 'bg-pop-mint text-black translate-y-[-4px]' : ''}
              ${saveStatus === 'error' ? 'bg-pop-red text-black translate-y-[-4px]' : ''}
              ${hasChanges && saveStatus === 'idle' ? 'bg-pop-yellow text-black' : ''}
            `}>
              {saveStatus === 'saving' && (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm font-black uppercase italic">Sauvegarde...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <svg className="w-5 h-5 text-black stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-black uppercase italic">Sauvegardé !</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <svg className="w-5 h-5 text-black stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm font-black uppercase italic">Erreur</span>
                </>
              )}
              {hasChanges && saveStatus === 'idle' && (
                <>
                  <div className="w-3 h-3 bg-black rounded-full animate-pulse"></div>
                  <span className="text-sm font-black uppercase italic">Modifications en attente</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

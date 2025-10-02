import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Search from './Search'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { generateMusicServiceLinks } from '../lib/musicServices'

interface EmptyFeedCTAProps {
  show: boolean
  onSearchStateChange?: (isSearching: boolean) => void
}

const EmptyFeedCTA: React.FC<EmptyFeedCTAProps> = ({ show, onSearchStateChange }) => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [selected, setSelected] = useState<{
    title: string
    artist: string
    link: string
    cover?: string | null
    id?: number
  } | null>(null)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchStart = (query: string) => {
    console.log('Search query changed:', query)
    setSearchQuery(query)
    const trimmedQuery = query.trim()

    // Set searching state based on whether there's a query
    const newIsSearching = trimmedQuery.length > 0
    setIsSearching(newIsSearching)

    // Notify parent component about search state change
    onSearchStateChange?.(newIsSearching)

    // Clear any previous errors when starting a new search
    if (trimmedQuery && error) {
      setError(null)
    }
  }

  const handlePostSong = async () => {
    if (!selected || isSubmitting) return

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      navigate('/login')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // Generate links for all music services
      const musicLinks = selected.id
        ? generateMusicServiceLinks({
          id: selected.id,
          title: selected.title,
          artist: selected.artist
        })
        : {}

      await api.post('/posts', {
        title: selected.title,
        artist: selected.artist,
        link: selected.link,
        coverUrl: selected.cover,
        description: description.trim() || undefined,
        timezoneOffset: new Date().getTimezoneOffset(),
        ...musicLinks
      })

      // Reload the page to show the new post
      window.location.reload()
    } catch (err: any) {
      setIsSubmitting(false)

      // Handle 400 error (already posted today)
      if (err.response?.status === 400) {
        setError("Déjà posté aujourd'hui")
      } else {
        setError('Erreur lors de la publication. Veuillez réessayer.')
      }
    }
  }

  const handleCancel = () => {
    setSelected(null)
    setDescription('')
    setError(null)
    setIsSearching(false)
    setSearchQuery('')

    // Notify parent that search state is reset
    onSearchStateChange?.(false)
  }

  if (!show) return null

  return (
    <div
      className={`text-white rounded-2xl px-6 transition-all duration-500 ease-out ${isSearching ? 'pb-24 transform' : ''
        }`}
    >
      {!selected ? (
        <div className="space-y-6">
          {/* Header */}
          <div
            className={`text-center space-y-3 transition-all duration-300 ${isSearching ? 'opacity-75 scale-95' : 'opacity-100 scale-100'
              }`}
          >
            <div>
              <h3 className="text-xl font-bold mb-2">Partagez votre chanson du jour</h3>
              <p className="text-gray-300 text-sm">Recherchez et partagez votre musique préférée avec vos amis.</p>
            </div>
          </div>

          {/* Integrated Search */}
          <div className={`transition-all duration-300 ${isSearching ? 'pb-20 transform scale-102' : ''}`}>
            <Search
              onSelect={(track) => {
                setSelected({
                  title: track.title,
                  artist: track.artist,
                  link: `https://www.deezer.com/track/${track.id}`,
                  cover: track.cover || null,
                  id: track.id
                })
                setError(null)
                setIsSearching(false)
                setSearchQuery('')

                // Notify parent that search state is reset
                onSearchStateChange?.(false)
              }}
              onSearchChange={handleSearchStart}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-slideUp">
          {/* Selected Track Card */}
          <div className="relative bg-white rounded-xl p-6 space-y-4 shadow-xl border border-gray-100 overflow-hidden">
            {/* Blurred Background Cover */}
            {selected.cover && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60 blur-sm"
                style={{ backgroundImage: `url(${selected.cover})` }}
              />
            )}
            {/* Close button on top-right of card */}
            <button
              onClick={handleCancel}
              className="absolute top-0 right-4 z-20 text-black hover:text-gray-600 transition-all duration-200 p-2 hover:bg-gray-100 rounded-lg hover:scale-110 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content Overlay */}
            <div className="relative z-10">
              {/* Header inside card */}


              {/* Cover and Track Info */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-lg transition-transform hover:scale-105">
                  {selected.cover ? (
                    <img src={selected.cover} alt={`${selected.title} cover`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-2xl text-gray-400">🎵</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-black truncate" title={selected.title}>
                    {selected.title}
                  </h4>
                  <p className="text-gray-600 truncate" title={selected.artist}>
                    {selected.artist}
                  </p>
                </div>
              </div>

              {/* Description Input */}
              <div className="pt-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ajouter une description (optionnel)..."
                  maxLength={280}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10 transition-all duration-200 resize-none text-black placeholder-gray-500"
                  style={{ minHeight: '80px' }}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {description.length}/280 caractères
                  </span>
                  {description.length > 0 && (
                    <button
                      onClick={() => setDescription('')}
                      className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Effacer
                    </button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handlePostSong}
                  disabled={isSubmitting || !!error}
                  className={`w-full px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${error
                    ? 'bg-red-50 text-red-600 border border-red-200 cursor-not-allowed'
                    : isSubmitting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-gray-800 active:bg-gray-900 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                >
                  {error ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {error}
                    </>
                  ) : isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Publication...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Publier ma chanson
                    </>
                  )}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmptyFeedCTA

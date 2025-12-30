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
        id: selected.id,
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
      className={`text-black rounded-2xl px-6 transition-all duration-500 ease-out ${isSearching ? 'pb-24 transform' : ''
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
              <h3 className="text-2xl font-black mb-2 uppercase italic">Partagez votre chanson du jour</h3>
              <p className="text-black/60 font-bold uppercase text-xs tracking-wider">Recherchez et partagez votre musique préférée avec vos amis.</p>
            </div>
          </div>

          {/* Integrated Search */}
          <div className={`transition-all duration-300 ${isSearching ? 'pb-20 transform' : ''}`}>
            <Search
              onSelect={(track) => {
                console.log("🚀 ~ track:", track)
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
          <div className="relative bg-white rounded-2xl p-6 space-y-6 shadow-neo border-3 border-black overflow-hidden">
            {/* Close button on top-right of card */}
            <button
              onClick={handleCancel}
              className="absolute top-2 right-2 z-20 text-black hover:bg-pop-pink transition-all duration-200 p-2 border-2 border-transparent hover:border-black rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content Overlay */}
            <div className="relative z-10 space-y-6">
              {/* Cover and Track Info */}
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-3 border-black flex-shrink-0 shadow-neo-sm transition-transform hover:rotate-2">
                  {selected.cover ? (
                    <img src={selected.cover} alt={`${selected.title} cover`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-pop-pink flex items-center justify-center">
                      <span className="text-3xl">🎵</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-black text-black truncate uppercase italic" title={selected.title}>
                    {selected.title}
                  </h4>
                  <p className="text-black/70 font-bold uppercase text-sm" title={selected.artist}>
                    {selected.artist}
                  </p>
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-black/40 px-1">Description (optionnel)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Pourquoi cette chanson ?"
                  maxLength={280}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-3 border-black focus:outline-none focus:bg-pop-blue/10 transition-all duration-200 resize-none text-black font-bold placeholder-black/30"
                  style={{ minHeight: '100px' }}
                />
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black uppercase text-black/40">
                    {description.length}/280
                  </span>
                  {description.length > 0 && (
                    <button
                      onClick={() => setDescription('')}
                      className="text-[10px] font-black uppercase text-black/40 hover:text-black underline transition-colors"
                    >
                      Effacer
                    </button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2">
                <button
                  onClick={handlePostSong}
                  disabled={isSubmitting || !!error}
                  className={`w-full px-6 py-4 rounded-xl font-black uppercase italic transition-all duration-200 flex items-center justify-center gap-2 border-3 border-black ${error
                    ? 'bg-red-200 text-black'
                    : isSubmitting
                      ? 'bg-gray-100 text-black/30 cursor-not-allowed'
                      : 'bg-pop-mint text-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                    }`}
                >
                  {error ? (
                    error
                  ) : isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                      Publication...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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

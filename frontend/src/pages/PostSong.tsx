import React, { useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import Search from '../components/Search'
import { generateMusicServiceLinks } from '../lib/musicServices'

export default function PostSong() {
  const [selected, setSelected] = useState<{
    title: string
    artist: string
    link: string
    cover?: string | null
    id?: number
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const submit = async () => {
    if (!selected || isSubmitting) return

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
        deezerLink: musicLinks.deezer,
        spotifyLink: musicLinks.spotify,
        appleMusicLink: musicLinks.appleMusic,
        userId
      })

      navigate('/feed')
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
    setError(null)
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] p-4 overflow-hidden">
      <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ${isSearching ? 'pt-0' : 'pt-24'}`}>
        {!selected ? (
          <div className="flex flex-col items-center">
            {/* Header for search */}
            <div className={`text-center transition-all duration-500 ${isSearching ? 'h-0 opacity-0' : 'mb-8'}`}>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                Partager votre son du jour
              </h1>
              <p className="text-gray-600 text-lg">
                Recherchez et sélectionnez la musique que vous souhaitez partager.
              </p>
            </div>
            {/* Search Component */}
            <div className="w-full">
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
                }}
                onSearchChange={(query) => setIsSearching(!!query)}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Confirmation View */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 text-center animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Votre sélection</h2>

              {/* Big Cover Art */}
              <div className="relative w-64 h-64 mx-auto rounded-2xl shadow-2xl overflow-hidden mb-6">
                {selected.cover ? (
                  <img src={selected.cover} alt={`${selected.title} cover`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center">
                    <span className="text-5xl text-emerald-600">🎵</span>
                  </div>
                )}
              </div>

              {/* Track Info */}
              <h3 className="text-3xl font-bold text-gray-900 truncate" title={selected.title}>
                {selected.title}
              </h3>
              <p className="text-xl text-gray-600 truncate" title={selected.artist}>
                {selected.artist}
              </p>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-4">
                <button
                  onClick={submit}
                  disabled={isSubmitting || !!error}
                  className={`w-full px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
                    error
                      ? 'bg-red-100 text-red-600 cursor-not-allowed border-2 border-red-200'
                      : isSubmitting
                      ? 'bg-emerald-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 hover:shadow-xl transform hover:scale-105 active:scale-95'
                  } shadow-lg`}
                >
                  {error ? (
                    error
                  ) : isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Publication...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      ✨ <span>Publier</span>
                    </span>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  disabled={isSubmitting}
                >
                  Choisir une autre chanson
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

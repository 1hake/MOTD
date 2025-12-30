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
  const [isPublic, setIsPublic] = useState(true)
  const [description, setDescription] = useState('')
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
        id: selected.id,
        isPublic,
        description,
        ...musicLinks,
        userId: user.id
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
    setIsPublic(true)
    setDescription('')
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] p-4 overflow-x-hidden">
      <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ${isSearching ? 'pt-[env(safe-area-inset-top)]' : 'pt-24 pb-20'}`}>
        {!selected ? (
          <div className="flex flex-col items-center">
            {/* Header for search */}
            <div className={`text-center transition-all duration-500 ${isSearching ? 'h-0 opacity-0 overflow-hidden mb-0' : 'mb-12'}`}>
              <div className="inline-block bg-pop-yellow border-3 border-black px-4 py-1 mb-6 rotate-[-2deg] shadow-neo-sm">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-black">Partager ma pépite</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic mb-6 leading-[0.9] tracking-tighter">
                C'est quoi <br />
                <span className="relative inline-block">
                  <span className="relative z-10">ton son</span>
                  <div className="absolute bottom-1 left-0 w-full h-4 bg-pop-mint -rotate-1 -z-0 border-2 border-black"></div>
                </span> du jour ?
              </h1>
              <p className="text-black/60 font-bold uppercase tracking-wider text-sm">
                Recherchez et sélectionnez la musique à partager.
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
          <div className="animate-slide-up pb-12">
            <div className="card bg-white relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-pop-yellow border-l-3 border-b-3 border-black -translate-y-12 translate-x-12 rotate-45 z-0"></div>

              <div className="relative z-10 p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  {/* Left: Big Cover Art */}
                  <div className="flex-shrink-0">
                    <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-xl border-3 border-black shadow-neo overflow-hidden group">
                      {selected.cover ? (
                        <img src={selected.cover} alt={`${selected.title} cover`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-pop-pink flex items-center justify-center">
                          <span className="text-6xl">🎵</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Track Info & Post Settings */}
                  <div className="flex-grow w-full">
                    <div className="mb-6 text-center md:text-left">
                      <div className="inline-block bg-black text-white px-3 py-0.5 text-[10px] font-black uppercase tracking-widest mb-2 italic">Sélection du jour</div>
                      <h3 className="text-2xl md:text-4xl font-black text-black uppercase italic leading-tight mb-1 line-clamp-2" title={selected.title}>
                        {selected.title}
                      </h3>
                      <p className="text-lg md:text-xl text-black font-bold uppercase tracking-tight opacity-60 line-clamp-1" title={selected.artist}>
                        {selected.artist}
                      </p>
                    </div>

                    {/* Description Input */}
                    <div className="mb-6">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black mb-2 italic">Ajouter un commentaire (optionnel)</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Dis-nous pourquoi ce son est une pépite..."
                        className="input-field min-h-[100px] resize-none text-sm"
                        maxLength={200}
                      />
                      <div className="flex justify-end mt-1">
                        <span className="text-[10px] font-bold text-black/40 uppercase">{description.length}/200</span>
                      </div>
                    </div>

                    {/* Visibility Switch */}
                    <div className="flex items-center justify-between p-4 bg-pop-yellow/10 rounded-xl border-3 border-black shadow-neo-sm mb-8">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border-2 border-black ${isPublic ? 'bg-pop-mint' : 'bg-gray-200'}`}>
                          {isPublic ? (
                            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2a3 3 0 01-3 3H6a3 3 0 01-3-3v-2m18-3l-3-3m0 0l-3 3m3-3v8m-11-8h2" />
                            </svg>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-black uppercase italic text-xs">Visibilité</span>
                          <span className="text-[10px] font-bold text-black/50 uppercase">
                            {isPublic ? 'Tout le monde' : 'Amis seulement'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full border-3 border-black transition-all duration-200 focus:outline-none ${isPublic ? 'bg-pop-mint' : 'bg-gray-300'
                          }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform duration-200 ${isPublic ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={submit}
                        disabled={isSubmitting || !!error}
                        className={`btn-primary w-full text-lg py-4 flex items-center justify-center gap-3 ${error ? 'bg-pop-red' : ''}`}
                      >
                        {error ? (
                          <span className="flex items-center gap-2">⚠️ {error}</span>
                        ) : isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                            Publication...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2 uppercase italic font-black">
                            ✨ Publier ma pépite
                          </span>
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="font-black text-black/40 hover:text-black uppercase tracking-widest text-[10px] transition-colors py-2"
                        disabled={isSubmitting}
                      >
                        Annuler et choisir un autre son
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useState, useRef, useEffect } from 'react'
import { savePost, unsavePost, getDeezerTrackPreview } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

type SongCardProps = {
  id: number
  title: string
  artist: string
  description?: string
  link: string
  deezerLink?: string
  spotifyLink?: string
  appleMusicLink?: string
  youtubeLink?: string
  deezerTrackId?: string
  coverUrl?: string
  sharedBy?: string
  saveCount?: number
  isSavedByUser?: boolean
  showSaves?: boolean
  isOwnPost?: boolean
  className?: string
  horizontal?: boolean
  userPlatformPreference?: string
  onSaveChange?: (postId: number, isSaved: boolean, newSaveCount: number) => void
  // Enhanced user display props
  userInfo?: {
    id: number
    name?: string
    email: string
    username?: string
  }
  date?: string
  onUserClick?: () => void
  showUserHeader?: boolean

}

export default function SongCard({
  id,
  title,
  artist,
  description,
  link,
  deezerLink,
  spotifyLink,
  appleMusicLink,
  youtubeLink,
  deezerTrackId,
  coverUrl,
  sharedBy,
  saveCount = 0,
  isSavedByUser = false,
  showSaves = true,
  isOwnPost = false,
  className = '',
  horizontal = false,
  userPlatformPreference,
  onSaveChange,
  userInfo,
  date,
  onUserClick,
  showUserHeader = false
}: SongCardProps) {
  const [saved, setSaved] = useState(isSavedByUser)
  const [saves, setSaves] = useState(saveCount)
  const [isSaving, setIsSaving] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  console.log({ deezerTrackId, previewUrl })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { isAuthenticated } = useAuth()

  // Fetch preview URL when component mounts if deezerTrackId is available
  useEffect(() => {
    if (deezerTrackId) {
      getDeezerTrackPreview(deezerTrackId)
        .then(response => {
          if (response.data.preview) {
            setPreviewUrl(response.data.preview)
          }
        })
        .catch(error => console.error('Error fetching preview:', error))
    }
  }, [deezerTrackId])

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handleCardClick = () => {
    if (!previewUrl) return

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    } else {
      const audio = new Audio(previewUrl)
      audioRef.current = audio

      audio.addEventListener('ended', () => {
        setIsPlaying(false)
      })

      audio.addEventListener('error', () => {
        console.error('Error playing audio')
        setIsPlaying(false)
      })

      audio.play()
      setIsPlaying(true)
    }
  }
  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (isSaving || !isAuthenticated) return

    try {
      setIsSaving(true)

      const newSavedState = !saved
      const newSavesCount = newSavedState ? saves + 1 : saves - 1

      setSaved(newSavedState)
      setSaves(newSavesCount)
      onSaveChange?.(id, newSavedState, newSavesCount)

      if (newSavedState) {
        await savePost(id)
      } else {
        await unsavePost(id)
      }
    } catch (error) {
      console.error('Error toggling save:', error)
      // Revert optimistic update on error
      setSaved(saved)
      setSaves(saves)
      onSaveChange?.(id, saved, saves)
    } finally {
      setIsSaving(false)
    }
  }

  // Get the preferred platform URL and display info
  const getPreferredPlatform = () => {
    const preference = userPlatformPreference?.toLowerCase()

    switch (preference) {
      case 'spotify':
        return spotifyLink ? { url: spotifyLink, name: 'Spotify', icon: '🎧', color: 'bg-green-500' } : null
      case 'deezer':
        return deezerLink ? { url: deezerLink, name: 'Deezer', icon: '🎵', color: 'bg-orange-500' } : null
      case 'apple':
      case 'apple music':
      case 'applemusic':
        return appleMusicLink ? { url: appleMusicLink, name: 'Apple Music', icon: '🎼', color: 'bg-gray-800' } : null
      case 'youtube':
        return youtubeLink ? { url: youtubeLink, name: 'YouTube', icon: '📺', color: 'bg-red-500' } : null
      default:
        // Fallback to first available platform
        if (spotifyLink) return { url: spotifyLink, name: 'Spotify', icon: '🎧', color: 'bg-green-500' }
        if (deezerLink) return { url: deezerLink, name: 'Deezer', icon: '🎵', color: 'bg-orange-500' }
        if (appleMusicLink) return { url: appleMusicLink, name: 'Apple Music', icon: '🎼', color: 'bg-gray-800' }
        if (youtubeLink) return { url: youtubeLink, name: 'YouTube', icon: '📺', color: 'bg-red-500' }
        return null
    }
  }

  const preferredPlatform = getPreferredPlatform()
  if (horizontal) {
    return (
      <div
        onClick={handleCardClick}
        className={`relative flex items-stretch gap-0 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 ${previewUrl ? 'cursor-pointer hover:bg-gray-800/70' : 'cursor-default'} overflow-hidden transition-colors touch-manipulation ${className}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Cover Image - full height with no padding */}
        <div className="flex-shrink-0 w-20 relative">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`${title} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {/* Play/Pause overlay indicator */}
          {previewUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                {isPlaying ? (
                  <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Song Info */}
        <div className="flex-grow min-w-0 p-4 flex flex-col justify-center">
          {sharedBy && (
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {sharedBy.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-gray-400">Partagé par {sharedBy}</span>
            </div>
          )}

          <h3
            className="font-semibold text-white text-base leading-tight mb-1"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
            title={title}
          >
            {title}
          </h3>
          <p
            className="text-gray-300 text-sm"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
            title={artist}
          >
            {artist}
          </p>
          {description && (
            <p
              className="text-gray-400 text-xs mt-1 italic"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
              title={description}
            >
              "{description}"
            </p>
          )}
        </div>

        {/* Right side with play button and like button */}
        <div className="flex-shrink-0 flex flex-col justify-between p-4">
          {/* Play button at top */}
          <div className="flex justify-end">
            {preferredPlatform && (
              <a
                href={preferredPlatform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-3 py-2 ${preferredPlatform.color}/90 hover:${preferredPlatform.color} text-white rounded-full transition-all duration-200`}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm">{preferredPlatform.icon}</span>
                <span className="text-xs font-medium">Écouter</span>
              </a>
            )}
          </div>

          {/* Save button at bottom */}
          {showSaves && (
            <div className="flex justify-end mt-2">
              {!isOwnPost ? (
                <button
                  onClick={handleSaveToggle}
                  disabled={isSaving}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full backdrop-blur-sm transition-all duration-200 ${saved ? 'bg-blue-500/90 text-white hover:bg-blue-600/90' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700/70 hover:text-white'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg
                    className={`w-4 h-4 ${saved ? 'fill-current' : 'stroke-current fill-none'}`}
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                  <span className="text-sm font-medium">{saves}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-700/50 rounded-full text-gray-400">
                  <svg
                    className="w-4 h-4 stroke-current fill-none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                  <span className="text-sm font-medium">{saves}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800/30 overflow-hidden ${className}`}>
      {/* User header */}
      {showUserHeader && userInfo && (
        <div className="flex items-center gap-3 p-4 border-b border-gray-800/30">
          <button
            onClick={onUserClick}
            className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-lg flex items-center justify-center text-white text-sm font-bold transition-transform"
          >
            {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : userInfo.email.charAt(0).toUpperCase()}
          </button>
          <div className="flex-1 min-w-0">
            <button
              onClick={onUserClick}
              className="font-medium text-white hover:text-indigo-300 transition-colors text-left"
            >
              {userInfo.name || userInfo.email.split('@')[0]}
            </button>
            <p className="text-gray-400 text-sm">@{userInfo.username || userInfo.email.split('@')[0]}</p>
          </div>
          {date && (
            <div className="text-xs text-gray-500">
              {new Date(date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short'
              })}
            </div>
          )}
        </div>
      )}

      {/* Song card content */}
      <div
        key={id}
        onClick={handleCardClick}
        className={`card relative overflow-hidden h-80 w-full group animate-in touch-manipulation ${previewUrl ? 'cursor-pointer' : 'cursor-default'}`}
        style={{
          ...(coverUrl
            ? {
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }
            : {
              backgroundColor: '#f3f4f6'
            }),
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />

        {/* Play/Pause indicator overlay */}
        {previewUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
              {isPlaying ? (
                <svg className="w-10 h-10 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Shared by indicator at the top left (only show if not using user header) */}
        {sharedBy && !showUserHeader && (
          <div className="absolute top-4 left-4 z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-800">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {sharedBy.charAt(0).toUpperCase()}
              </div>
              <span>Partagé par {sharedBy}</span>
            </div>
          </div>
        )}

        {/* Song info at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <h3
            className="font-bold text-xl mb-2 leading-tight text-white drop-shadow-lg"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
            title={title}
          >
            {title}
          </h3>
          <p
            className="text-white/90 text-base font-medium drop-shadow-md mb-3"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
            title={artist}
          >
            {artist}
          </p>
          {description && (
            <p
              className="text-white/80 text-sm italic drop-shadow-md mb-4 leading-relaxed"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
              title={description}
            >
              "{description}"
            </p>
          )}

        </div>

        {/* Play button at top right */}
        {preferredPlatform && (
          <div className="absolute top-4 right-4 z-20">
            <a
              href={preferredPlatform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-3 py-2 ${preferredPlatform.color}/90 hover:${preferredPlatform.color} text-white rounded-full backdrop-blur-sm transition-all duration-200`}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm">{preferredPlatform.icon}</span>
              <span className="text-sm font-medium">Écouter</span>
            </a>
          </div>
        )}

        {/* Save button/count at bottom right */}
        {showSaves && (
          <div className="absolute bottom-4 right-4 z-20">
            {!isOwnPost ? (
              <button
                onClick={handleSaveToggle}
                disabled={isSaving}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full backdrop-blur-sm transition-all duration-200 ${saved ? 'bg-blue-500/90 text-white hover:bg-blue-600/90' : 'bg-black/50 text-white hover:bg-black/70'
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg
                  className={`w-4 h-4 ${saved ? 'fill-current' : 'stroke-current fill-none'}`}
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
                <span className="text-sm font-medium">{saves}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white">
                <svg
                  className="w-4 h-4 stroke-current fill-none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
                <span className="text-sm font-medium">{saves}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

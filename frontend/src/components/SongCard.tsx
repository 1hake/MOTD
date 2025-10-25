import React, { useState, useRef, useEffect } from 'react'
import { savePost, unsavePost, getDeezerTrackPreview } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useAudio } from '../contexts/AudioContext'

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
  userInfo?: {
    id: number
    name?: string
    email: string
    username?: string
  }
  date?: string
  onUserClick?: () => void
  showUserHeader?: boolean
  disableAudioClick?: boolean
}

type PlatformInfo = {
  url: string
  name: string
  icon: JSX.Element
  color: string
}

// Platform icons as SVG components
const PlatformIcons = {
  Spotify: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  ),
  Deezer: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.81 8.1h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm-3.7-5.55h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm-3.7-5.55h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31zm0 1.85h2.76c.17 0 .31-.14.31-.31s-.14-.31-.31-.31h-2.76c-.17 0-.31.14-.31.31s.14.31.31.31z" />
    </svg>
  ),
  AppleMusic: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  ),
  YouTube: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
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
  showUserHeader = false,
  disableAudioClick = false
}: SongCardProps) {
  const [saved, setSaved] = useState(isSavedByUser)
  const [saves, setSaves] = useState(saveCount)
  const [isSaving, setIsSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const audio = useAudio()

  const isPlaying = audio.isPlaying(id)

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

  // Cleanup audio when component unmounts or when full-screen mode is entered
  useEffect(() => {
    // Listen for full-screen mode events to stop audio
    const handleStopAudio = () => {
      audio.pause(id)
    }

    window.addEventListener('stopAllSongCardAudio', handleStopAudio)

    return () => {
      window.removeEventListener('stopAllSongCardAudio', handleStopAudio)
    }
  }, [audio, id])

  // Get the preferred platform URL and display info
  const getPreferredPlatform = (): PlatformInfo | null => {
    const preference = userPlatformPreference?.toLowerCase()

    switch (preference) {
      case 'spotify':
        return spotifyLink ? { url: spotifyLink, name: 'Spotify', icon: PlatformIcons.Spotify, color: 'bg-green-500 hover:bg-green-600' } : null
      case 'deezer':
        return deezerLink ? { url: deezerLink, name: 'Deezer', icon: PlatformIcons.Deezer, color: 'bg-orange-500 hover:bg-orange-600' } : null
      case 'apple':
      case 'apple music':
      case 'applemusic':
        return appleMusicLink ? { url: appleMusicLink, name: 'Apple Music', icon: PlatformIcons.AppleMusic, color: 'bg-pink-500 hover:bg-pink-600' } : null
      case 'youtube':
        return youtubeLink ? { url: youtubeLink, name: 'YouTube', icon: PlatformIcons.YouTube, color: 'bg-red-500 hover:bg-red-600' } : null
      default:
        // Fallback to first available platform
        if (spotifyLink) return { url: spotifyLink, name: 'Spotify', icon: PlatformIcons.Spotify, color: 'bg-green-500 hover:bg-green-600' }
        if (deezerLink) return { url: deezerLink, name: 'Deezer', icon: PlatformIcons.Deezer, color: 'bg-orange-500 hover:bg-orange-600' }
        if (appleMusicLink) return { url: appleMusicLink, name: 'Apple Music', icon: PlatformIcons.AppleMusic, color: 'bg-pink-500 hover:bg-pink-600' }
        if (youtubeLink) return { url: youtubeLink, name: 'YouTube', icon: PlatformIcons.YouTube, color: 'bg-red-500 hover:bg-red-600' }
        return null
    }
  }

  const handleAudioToggle = () => {
    if (!previewUrl) return

    audio.toggle(id, previewUrl).catch(err => {
      console.error('Error toggling audio:', err)
    })
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

  const preferredPlatform = getPreferredPlatform()

  // Render components
  const renderPlayPauseButton = (size: 'small' | 'large' = 'large') => {
    if (!previewUrl) return null

    const sizeClasses = size === 'small'
      ? 'w-10 h-10'
      : 'w-20 h-20'
    const iconSizeClasses = size === 'small'
      ? 'w-5 h-5'
      : 'w-10 h-10'

    return (
      <div className={`${sizeClasses} rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-xl transition-transform duration-200 ${isPlaying ? 'scale-95' : 'hover:scale-110'}`}>
        {isPlaying ? (
          <svg className={`${iconSizeClasses} text-gray-900`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className={`${iconSizeClasses} text-gray-900 ${size === 'small' ? 'ml-0.5' : 'ml-1'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    )
  }

  const renderPlatformButton = (compact: boolean = false) => {
    if (!preferredPlatform) return null

    return (
      <a
        href={preferredPlatform.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 px-4 py-2.5 ${preferredPlatform.color} text-white rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95`}
        onClick={(e) => e.stopPropagation()}
        title={`Listen on ${preferredPlatform.name}`}
      >
        {preferredPlatform.icon}
      </a>
    )
  }

  const renderSaveButton = () => {
    if (!showSaves) return null

    if (isOwnPost) {
      return (
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
      )
    }

    return (
      <button
        onClick={handleSaveToggle}
        disabled={isSaving}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full backdrop-blur-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${saved
          ? 'bg-blue-500/90 text-white hover:bg-blue-600/90 shadow-lg'
          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700/70 hover:text-white'
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
    )
  }
  if (horizontal) {
    return (
      <div
        className={`relative flex items-stretch gap-0 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden transition-colors touch-manipulation ${className}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Cover Image with preview button */}
        <div
          className={`flex-shrink-0 w-20 relative group ${disableAudioClick ? '' : 'cursor-pointer'}`}
          onClick={disableAudioClick ? undefined : handleAudioToggle}
        >
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
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${isPlaying ? 'bg-black/60' : 'bg-black/40 group-hover:bg-black/60'}`}>
              {renderPlayPauseButton('small')}
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

        {/* Right side with platform button and save button */}
        <div className="flex-shrink-0 flex flex-col justify-between p-4 gap-2">
          {renderPlatformButton(true)}
          {renderSaveButton()}
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
        onClick={disableAudioClick ? undefined : handleAudioToggle}
        className={`card relative overflow-hidden h-80 w-full group ${previewUrl && !disableAudioClick ? 'cursor-pointer' : 'cursor-default'}`}
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
          <div className="absolute inset-0 flex items-center justify-center transition-all duration-200">
            {renderPlayPauseButton('large')}
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

        {/* Platform button at top right */}
        <div className="absolute top-4 right-4 z-20">
          {renderPlatformButton(false)}
        </div>

        {/* Save button at bottom right */}
        <div className="absolute bottom-4 right-4 z-20">
          {renderSaveButton()}
        </div>
      </div>
    </div>
  )
}

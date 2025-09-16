import React, { useState } from 'react'
import { likePost, unlikePost } from '../lib/api'
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
  coverUrl?: string
  sharedBy?: string
  likeCount?: number
  isLikedByUser?: boolean
  showLikes?: boolean
  className?: string
  horizontal?: boolean
  userPlatformPreference?: string
  onLikeChange?: (postId: number, isLiked: boolean, newLikeCount: number) => void
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
  coverUrl,
  sharedBy,
  likeCount = 0,
  isLikedByUser = false,
  showLikes = true,
  className = '',
  horizontal = false,
  userPlatformPreference,
  onLikeChange,
  userInfo,
  date,
  onUserClick,
  showUserHeader = false
}: SongCardProps) {
  const [liked, setLiked] = useState(isLikedByUser)
  const [likes, setLikes] = useState(likeCount)
  const [isLiking, setIsLiking] = useState(false)
  const { isAuthenticated } = useAuth()
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (isLiking || !isAuthenticated) return

    try {
      setIsLiking(true)

      const newLikedState = !liked
      const newLikesCount = newLikedState ? likes + 1 : likes - 1

      setLiked(newLikedState)
      setLikes(newLikesCount)
      onLikeChange?.(id, newLikedState, newLikesCount)

      if (newLikedState) {
        await likePost(id)
      } else {
        await unlikePost(id)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert optimistic update on error
      setLiked(liked)
      setLikes(likes)
      onLikeChange?.(id, liked, likes)
    } finally {
      setIsLiking(false)
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
        className={`flex items-stretch gap-0 bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 cursor-pointer overflow-hidden ${className}`}
      >
        {/* Cover Image - full height with no padding */}
        <div className="flex-shrink-0 w-20">
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

        {/* Play and Like buttons */}
        <div className="flex-shrink-0 flex items-center gap-2 p-4">
          {/* Play button */}
          {preferredPlatform && (
            <a
              href={preferredPlatform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-3 py-2 ${preferredPlatform.color}/90 hover:${preferredPlatform.color} text-white rounded-full transition-all duration-200 hover:scale-105`}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm">{preferredPlatform.icon}</span>
              <span className="text-xs font-medium">Écouter</span>
            </a>
          )}

          {/* Like button */}
          {showLikes && (
            <button
              onClick={handleLikeToggle}
              disabled={isLiking}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-200 ${liked ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700/70 hover:text-white'
                } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg
                className={`w-4 h-4 ${liked ? 'fill-current' : 'stroke-current fill-none'}`}
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="text-sm font-medium">{likes}</span>
            </button>
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
            className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-lg flex items-center justify-center text-white text-sm font-bold hover:scale-105 transition-transform"
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
        className={`card relative overflow-hidden h-80 w-full group animate-in cursor-pointer transition-transform duration-300`}
        style={
          coverUrl
            ? {
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }
            : {
              backgroundColor: '#f3f4f6'
            }
        }
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />

        {/* Shared by indicator at the top (only show if not using user header) */}
        {sharedBy && !showUserHeader && (
          <div className="absolute top-4 left-4 right-4 z-20">
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

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {/* Play button */}
            {preferredPlatform && (
              <a
                href={preferredPlatform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-4 py-2 ${preferredPlatform.color}/90 hover:${preferredPlatform.color} text-white rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-105`}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm">{preferredPlatform.icon}</span>
                <span className="text-sm font-medium">Écouter sur {preferredPlatform.name}</span>
              </a>
            )}

            {/* Like button */}
            {showLikes && (
              <button
                onClick={handleLikeToggle}
                disabled={isLiking}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full backdrop-blur-sm transition-all duration-200 ${liked ? 'bg-red-500/90 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                  } ${isLiking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              >
                <svg
                  className={`w-4 h-4 ${liked ? 'fill-current' : 'stroke-current fill-none'}`}
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="text-sm font-medium">{likes}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

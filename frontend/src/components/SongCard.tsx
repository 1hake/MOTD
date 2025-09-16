import React, { useState } from 'react'
import { likePost, unlikePost } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

type SongCardProps = {
  id: number
  title: string
  artist: string
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
  onLikeChange?: (postId: number, isLiked: boolean, newLikeCount: number) => void
}

export default function SongCard({
  id,
  title,
  artist,
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
  onLikeChange
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
  return (
    <div
      key={id}
      className={`card relative overflow-hidden h-80 w-full group animate-in cursor-pointer transition-transform duration-300 ${className}`}
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

      {/* Shared by indicator at the top */}
      {sharedBy && (
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

        {/* Platform links */}
        <div className="flex items-center gap-2 mb-3">
          {deezerLink && (
            <a
              href={deezerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/90 hover:bg-orange-600/90 text-white rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-105"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm">🎵</span>
              <span className="text-xs font-medium">Deezer</span>
            </a>
          )}
          {spotifyLink && (
            <a
              href={spotifyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/90 hover:bg-green-600/90 text-white rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-105"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm">🎧</span>
              <span className="text-xs font-medium">Spotify</span>
            </a>
          )}
          {appleMusicLink && (
            <a
              href={appleMusicLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/90 hover:bg-gray-900/90 text-white rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-105"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm">🎼</span>
              <span className="text-xs font-medium">Apple</span>
            </a>
          )}
          {youtubeLink && (
            <a
              href={youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/90 hover:bg-red-600/90 text-white rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-105"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm">📺</span>
              <span className="text-xs font-medium">YouTube</span>
            </a>
          )}
        </div>

        {/* Like button and count */}
        {showLikes && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleLikeToggle}
              disabled={isLiking}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm transition-all duration-200 ${
                liked ? 'bg-red-500/90 text-white' : 'bg-white/20 text-white hover:bg-white/30'
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
          </div>
        )}
      </div>
    </div>
  )
}

import React from 'react'
import SongCard from './SongCard'

type Post = {
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
  date: string
  saveCount?: number
  isSavedByUser?: boolean
  user?: {
    id: number
    email: string
  }
}

interface PostsSectionProps {
  title: string
  posts: Post[]
  showCount?: boolean
  emptyMessage?: React.ReactNode
  onSaveChange?: (postId: number, isSaved: boolean, newSaveCount: number) => void
  currentUserId?: number
}

const PostsSection: React.FC<PostsSectionProps> = ({ title, posts, showCount = false, emptyMessage, onSaveChange, currentUserId }) => {
  console.log({ posts })
  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-start gap-3">
        <div className="h-8 w-1 bg-white from-music-500 to-accent-500 rounded-full"></div>
        <h2 className="text-xl font-bold text-white">
          {title}
          {showCount && posts.length > 0 && (
            <span className="ml-2 bg-music-100/70 text-music-700 text-sm font-medium px-3 py-1 rounded-2xl backdrop-blur-sm">
              {posts.length}
            </span>
          )}
        </h2>
      </div>

      {posts.length === 0 ? (
        emptyMessage || <p className="text-primary-500 text-center py-8 italic">Aucune chanson pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <SongCard
              key={post.id}
              id={post.id}
              title={post.title}
              artist={post.artist}
              description={post.description}
              link={post.link}
              deezerLink={post.deezerLink}
              spotifyLink={post.spotifyLink}
              appleMusicLink={post.appleMusicLink}
              coverUrl={post.coverUrl}
              sharedBy={post.user?.email}
              saveCount={post.saveCount}
              isSavedByUser={post.isSavedByUser}
              showSaves={!!post.user?.email} // Only show saves for shared posts
              isOwnPost={post.user?.id === currentUserId}
              onSaveChange={onSaveChange}
              className="animate-up"
              deezerTrackId={post.deezerTrackId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PostsSection

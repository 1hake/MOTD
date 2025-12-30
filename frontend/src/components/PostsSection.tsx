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
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-black text-black uppercase italic tracking-tight">
          {title}
        </h2>
        {showCount && posts.length > 0 && (
          <span className="bg-pop-pink border-2 border-black text-black text-sm font-black px-3 py-1 rounded-lg shadow-neo-sm transform rotate-3">
            {posts.length}
          </span>
        )}
      </div>

      {posts.length === 0 ? (
        emptyMessage || <p className="text-black/50 text-center py-8 italic font-bold">Aucune chanson pour le moment.</p>
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

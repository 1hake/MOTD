import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import SongCard from './SongCard'
import ViewSwitcher from './ViewSwitcher'

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
  saveCount: number
  isSavedByUser: boolean
}

interface ProfileViewProps {
  posts: Post[]
  onSaveChange: (postId: number, isSaved: boolean, newSaveCount: number) => void
  isOwnPost: boolean
  userPlatformPreference?: string
}

const ProfileView: React.FC<ProfileViewProps> = ({
  posts,
  onSaveChange,
  isOwnPost,
  userPlatformPreference,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [isSticky, setIsSticky] = useState(false)
  const stickyTriggerRef = useRef<HTMLDivElement>(null)

  // Simple and clean date display
  const getDateDisplay = (dateString: string) => {
    const postDate = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    // Reset time to compare only dates
    const postDateOnly = new Date(postDate.getFullYear(), postDate.getMonth(), postDate.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())

    if (postDateOnly.getTime() === todayOnly.getTime()) {
      return {
        displayText: "Aujourd'hui",
        isToday: true
      }
    } else if (postDateOnly.getTime() === yesterdayOnly.getTime()) {
      return {
        displayText: 'Hier',
        isToday: false
      }
    } else {
      return {
        displayText: postDate.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: postDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        }),
        isToday: false
      }
    }
  }

  const groupPostsByDate = (posts: Post[]) => {
    const grouped: { [key: string]: Post[] } = {}
    posts.forEach((post) => {
      const date = new Date(post.date).toDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(post)
    })
    return grouped
  }

  const groupedPosts = groupPostsByDate(posts)
  const sortedDates = Object.keys(groupedPosts).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  // Observe sticky position for filter bar
  useEffect(() => {
    if (!stickyTriggerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting)
      },
      {
        threshold: 1.0,
        rootMargin: '-1px 0px 0px 0px'
      }
    )

    observer.observe(stickyTriggerRef.current)

    return () => observer.disconnect()
  }, [sortedDates])

  if (sortedDates.length === 0) {
    return (
      <div className="card text-center py-20 px-8">
        <div className="text-8xl mb-6">🎵</div>
        <h3 className="text-2xl font-black text-black mb-4 uppercase italic">Aucune chanson partagée</h3>
        <p className="text-lg font-bold text-black opacity-60">L'aventure musicale commence ici !</p>
      </div>
    )
  }

  return (
    <>
      {/* Sticky trigger element - invisible marker */}
      <div ref={stickyTriggerRef} className="h-px" />

      {/* View Switcher */}
      <div
        className={`sticky top-0 z-40 pb-4 -mx-6 px-6 mb-6 transition-all duration-200 ${isSticky ? 'pt-[max(1rem,env(safe-area-inset-top))]' : 'pt-4'
          }`}
      >
        <ViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      {/* Posts History */}
      <div className={`mb-24 ${viewMode === 'grid' ? 'space-y-12' : 'space-y-10'}`}>
        {sortedDates.map((date) => {
          const dateDisplay = getDateDisplay(date)
          return (
            <div key={date} className="space-y-6">
              {/* Neo Brutalist date header */}
              <div className="flex items-center gap-4">
                <h2
                  className={`text-sm font-black uppercase italic px-4 py-1.5 border-2 border-black rounded-lg shadow-neo-sm ${dateDisplay.isToday ? 'bg-pop-pink text-black' : 'bg-pop-mint text-black'
                    }`}
                >
                  {dateDisplay.displayText}
                </h2>
                <div className="h-1 bg-black flex-1 rounded-full opacity-10"></div>
              </div>

              {/* Songs for this date */}
              <motion.div
                layout
                className={
                  dateDisplay.isToday
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" // Today's songs always in grid
                    : viewMode === 'grid'
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                      : "space-y-6" // List view for previous songs
                }
              >
                {groupedPosts[date].map((post) => (
                  <motion.div
                    layout
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SongCard
                      id={post.id}
                      title={post.title}
                      artist={post.artist}
                      description={post.description}
                      link={post.link}
                      deezerLink={post.deezerLink}
                      spotifyLink={post.spotifyLink}
                      appleMusicLink={post.appleMusicLink}
                      youtubeLink={post.youtubeLink}
                      coverUrl={post.coverUrl}
                      saveCount={post.saveCount}
                      isSavedByUser={post.isSavedByUser}
                      onSaveChange={onSaveChange}
                      showSaves={true}
                      isOwnPost={isOwnPost}
                      horizontal={!dateDisplay.isToday && viewMode === 'list'}
                      userPlatformPreference={userPlatformPreference}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default ProfileView


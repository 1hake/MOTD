import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useParams } from 'react-router-dom'
import SongCard from '../components/SongCard'
import LoadingState from '../components/LoadingState'
import FollowButton from '../components/FollowButton'

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
  likeCount: number
  isLikedByUser: boolean
}

type User = {
  id: number
  email: string
  name?: string
  platformPreference?: string
}

export default function FriendProfile() {
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [friendsCount, setFriendsCount] = useState(0)
  const navigate = useNavigate()
  const { userId } = useParams()
  const { user: currentUser, isAuthenticated } = useAuth()

  useEffect(() => {
    ; (async () => {
      if (!isAuthenticated || !currentUser) {
        navigate('/login')
        return
      }

      if (!userId) {
        navigate('/explorer')
        return
      }

      const targetUserId = parseInt(userId, 10)
      if (!Number.isFinite(targetUserId)) {
        navigate('/explorer')
        return
      }

      try {
        setLoading(true)

        // Fetch user info
        const userRes = await api.get(`/users/${targetUserId}`)
        setUser(userRes.data)

        // Fetch user's posts
        const postsRes = await api.get(`/posts/friends/${targetUserId}`)
        setPosts(postsRes.data)

        // Fetch friends count
        const friendsRes = await api.get(`/friends/${targetUserId}/count`)
        setFriendsCount(friendsRes.data.count)
      } catch (error) {
        console.error('Error fetching friend profile data:', error)
        navigate('/explorer')
      } finally {
        setLoading(false)
      }
    })()
  }, [navigate, userId, isAuthenticated, currentUser])

  const handleLikeChange = (postId: number, isLiked: boolean, newLikeCount: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === postId ? { ...p, isLikedByUser: isLiked, likeCount: newLikeCount } : p))
    )
  }


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

  if (loading) {
    return <LoadingState message="Chargement du profil..." />
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <div className="text-center space-y-4">
          <div className="text-6xl">❌</div>
          <div className="text-xl font-semibold text-red-600">Utilisateur non trouvé</div>
        </div>
      </div>
    )
  }

  const groupedPosts = groupPostsByDate(posts)
  const sortedDates = Object.keys(groupedPosts).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className="min-h-screen text-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/explorer')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'explorateur
          </button>
        </div>

        {/* Profile Header */}
        <div className="mb-12">
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-800/30 p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="mb-4">
                  <h1 className="text-2xl font-semibold text-white mb-1">
                    {user.name || user.email.split('@')[0]}
                  </h1>
                  <p className="text-gray-400">@{user.email.split('@')[0]}</p>
                </div>

                {/* Stats */}
                <div className="flex justify-center md:justify-start gap-6 mb-4">
                  <div className="text-center">
                    <span className="text-lg font-semibold text-white">{posts.length}</span>
                    <span className="text-sm text-gray-400 ml-1">
                      chanson{posts.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/friends/${user?.id}`)}
                    className="text-center hover:text-indigo-300 transition-colors"
                  >
                    <span className="text-lg font-semibold text-white">{friendsCount}</span>
                    <span className="text-sm text-gray-400 ml-1">
                      ami{friendsCount > 1 ? 's' : ''}
                    </span>
                  </button>
                </div>

                {/* Follow button */}
                {currentUser && user.id !== currentUser.id && (
                  <div className="flex justify-center md:justify-start">
                    <FollowButton currentUserId={currentUser.id} targetUserId={user.id} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        {sortedDates.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-1 p-1 bg-gray-900/40 backdrop-blur-sm rounded-lg border border-gray-800/30">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'grid'
                  ? 'bg-gray-700/60 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                  }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grille
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'list'
                  ? 'bg-gray-700/60 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                  }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Liste
              </button>
            </div>
          </div>
        )}

        {/* Posts History */}
        {sortedDates.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🎵</div>
            <h3 className="text-2xl font-semibold text-gray-200 mb-4">Aucune chanson partagée</h3>
            <p className="text-lg text-gray-500">L'aventure musicale commence ici !</p>
          </div>
        ) : (
          <div className={`mb-24 ${viewMode === 'grid' ? 'space-y-10' : 'space-y-8'}`}>
            {sortedDates.map((date) => {
              const dateDisplay = getDateDisplay(date)
              return (
                <div key={date} className="space-y-4">
                  {/* Clean date header - different styles for grid vs list */}
                  {viewMode === 'grid' || dateDisplay.isToday ? (
                    <div className="flex items-center gap-4">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
                      <h2 className={`text-lg font-semibold px-4 py-2 rounded-full ${dateDisplay.isToday
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-gray-800/50 text-gray-300 border border-gray-700/30'
                        }`}>
                        {dateDisplay.displayText}
                      </h2>
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-sm font-medium text-gray-400 bg-gray-800/30 px-3 py-1 rounded-md">
                        {dateDisplay.displayText}
                      </h2>
                      <div className="h-px bg-gray-700/50 flex-1"></div>
                    </div>
                  )}

                  {/* Songs for this date */}
                  <div className={
                    dateDisplay.isToday
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" // Today's songs always in grid
                      : viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-4" // List view for previous songs - bigger spacing
                  }>
                    {groupedPosts[date].map((post) => (
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
                        youtubeLink={post.youtubeLink}
                        coverUrl={post.coverUrl}
                        likeCount={post.likeCount}
                        isLikedByUser={post.isLikedByUser}
                        onLikeChange={handleLikeChange}
                        showLikes={true}
                        horizontal={!dateDisplay.isToday && viewMode === 'list'}
                        userPlatformPreference={currentUser?.platformPreference}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

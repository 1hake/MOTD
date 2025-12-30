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
  saveCount: number
  isSavedByUser: boolean
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

  const handleSaveChange = (postId: number, isSaved: boolean, newSaveCount: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === postId ? { ...p, isSavedByUser: isSaved, saveCount: newSaveCount } : p))
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
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/explorer')}
            className="group flex items-center gap-2 text-black/40 hover:text-black transition-colors font-black uppercase italic text-xs tracking-widest"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'explorateur
          </button>
        </div>

        {/* Profile Header */}
        <div className="mb-12 pb-12 border-b-4 border-black">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-pop-pink border-4 border-black rounded-3xl flex items-center justify-center text-black text-3xl md:text-5xl font-black shadow-neo shrink-0 -rotate-2">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>

            {/* User Info & Actions */}
            <div className="flex-1 flex flex-col gap-6 w-full text-center md:text-left pt-2">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-5xl font-black text-black uppercase italic leading-none mb-2">
                    {user.name || user.email.split('@')[0]}
                  </h1>
                  <p className="text-lg md:text-xl font-bold text-black opacity-60">@{user.email.split('@')[0]}</p>
                </div>

                {/* Follow button */}
                {currentUser && user.id !== currentUser.id && (
                  <div className="flex justify-center md:justify-end">
                    <FollowButton currentUserId={currentUser.id} targetUserId={user.id} />
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-10">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-2xl md:text-3xl font-black text-black">{posts.length}</span>
                  <span className="text-[10px] md:text-xs font-black text-black opacity-40 uppercase tracking-widest">
                    chansons
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/friends/${user?.id}`)}
                  className="flex flex-col items-center md:items-start group"
                >
                  <span className="text-2xl md:text-3xl font-black text-black group-hover:text-pop-blue transition-colors">
                    {friendsCount}
                  </span>
                  <span className="text-[10px] md:text-xs font-black text-black opacity-40 uppercase tracking-widest">
                    amis
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        {sortedDates.length > 0 && (
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-2 p-1.5 bg-white border-3 border-black rounded-xl shadow-neo-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black uppercase transition-all duration-200 ${viewMode === 'grid'
                  ? 'bg-pop-pink border-2 border-black text-black shadow-none'
                  : 'text-black opacity-60 hover:opacity-100'
                  }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grille
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black uppercase transition-all duration-200 ${viewMode === 'list'
                  ? 'bg-pop-pink border-2 border-black text-black shadow-none'
                  : 'text-black opacity-60 hover:opacity-100'
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
          <div className="card text-center py-20 px-8">
            <div className="text-8xl mb-6">🎵</div>
            <h3 className="text-2xl font-black text-black mb-4 uppercase italic">Aucune chanson partagée</h3>
            <p className="text-lg font-bold text-black opacity-60">L'aventure musicale commence ici !</p>
          </div>
        ) : (
          <div className={`mb-24 ${viewMode === 'grid' ? 'space-y-12' : 'space-y-10'}`}>
            {sortedDates.map((date) => {
              const dateDisplay = getDateDisplay(date)
              return (
                <div key={date} className="space-y-6">
                  {/* Neo Brutalist date header */}
                  <div className="flex items-center gap-4">
                    <h2 className={`text-sm font-black uppercase italic px-4 py-1.5 border-2 border-black rounded-lg shadow-neo-sm ${dateDisplay.isToday
                      ? 'bg-pop-pink text-black'
                      : 'bg-pop-mint text-black'
                      }`}>
                      {dateDisplay.displayText}
                    </h2>
                    <div className="h-1 bg-black flex-1 rounded-full opacity-10"></div>
                  </div>

                  {/* Songs for this date */}
                  <div className={
                    dateDisplay.isToday
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" // Today's songs always in grid
                      : viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        : "space-y-6" // List view for previous songs
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
                        saveCount={post.saveCount}
                        isSavedByUser={post.isSavedByUser}
                        onSaveChange={handleSaveChange}
                        showSaves={true}
                        isOwnPost={false}
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

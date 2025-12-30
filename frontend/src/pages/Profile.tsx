import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import SongCard from '../components/SongCard'
import LoadingState from '../components/LoadingState'
import LogoutButton from '../components/LogoutButton'
import AutoSavePlatformSelector from '../components/AutoSavePlatformSelector'

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

export default function Profile() {
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [friendsCount, setFriendsCount] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const navigate = useNavigate()
  const { user: currentUser, isAuthenticated } = useAuth()

  useEffect(() => {
    ; (async () => {
      if (!isAuthenticated || !currentUser) {
        navigate('/login')
        return
      }

      try {
        setLoading(true)
        // Fetch user info
        const userRes = await api.get(`/users/${currentUser.id}`)
        setUser(userRes.data)

        // Fetch user's posts
        const postsRes = await api.get('/posts/me')
        setPosts(postsRes.data)

        // Fetch friends count
        const friendsRes = await api.get(`/friends/${currentUser.id}/count`)
        setFriendsCount(friendsRes.data.count)

        // Fetch saved posts count
        const savedRes = await api.get('/posts/saved/count')
        setSavedCount(savedRes.data.count)
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setLoading(false)
      }
    })()
  }, [navigate, isAuthenticated, currentUser, currentUser?.name, currentUser?.platformPreference])

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
        {/* Profile Header */}
        <div className="mb-8">
          <div className="card p-5">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 bg-pop-pink border-3 border-black rounded-2xl flex items-center justify-center text-black text-2xl font-black shadow-neo-sm shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>

              {/* User Info & Actions */}
              <div className="flex-1 flex flex-col gap-4 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h1 className="text-2xl font-black text-black uppercase italic leading-none mb-1">
                      {user.name || user.email.split('@')[0]}
                    </h1>
                    <p className="text-black font-bold opacity-70 text-sm">@{user.email.split('@')[0]}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-center sm:justify-end gap-3">
                    <button
                      onClick={() => navigate('/profile/edit')}
                      className="px-4 py-1.5 bg-pop-blue text-black font-black uppercase italic border-2 border-black rounded-lg shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-200 flex items-center gap-2 text-xs"
                    >
                      <svg className="w-3 h-3 stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                    <LogoutButton className="text-xs px-4 py-1.5" />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-center sm:justify-start gap-6 border-t-2 border-black/5 pt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black text-black">{posts.length}</span>
                    <span className="text-[10px] font-black text-black opacity-50 uppercase tracking-tighter">
                      chansons
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/friends/me')}
                    className="flex items-center gap-1.5 hover:translate-y-[-1px] transition-transform"
                  >
                    <span className="text-lg font-black text-black">{friendsCount}</span>
                    <span className="text-[10px] font-black text-black opacity-50 uppercase tracking-tighter">
                      amis
                    </span>
                  </button>
                  <button
                    onClick={() => navigate('/saved')}
                    className="flex items-center gap-1.5 hover:translate-y-[-1px] transition-transform"
                  >
                    <span className="text-lg font-black text-black">{savedCount}</span>
                    <span className="text-[10px] font-black text-black opacity-50 uppercase tracking-tighter">
                      sauvées
                    </span>
                  </button>
                </div>
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
                        isOwnPost={true}
                        horizontal={!dateDisplay.isToday && viewMode === 'list'}
                        userPlatformPreference={user?.platformPreference}
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

import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import ProfileView from '../components/ProfileView'

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

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-12">
        {/* Profile Header */}
        <div className="mb-8 pb-12 border-b-4 border-black">
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

                {/* Action buttons */}
                <div className="flex justify-center md:justify-end gap-3 h-fit">
                  <button
                    onClick={() => navigate('/profile/edit')}
                    className="px-5 py-2 bg-pop-blue text-black font-black uppercase italic border-3 border-black rounded-xl shadow-neo-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all duration-200 flex items-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4 stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                  </button>
                </div>
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
                  onClick={() => navigate('/friends/me')}
                  className="flex flex-col items-center md:items-start group"
                >
                  <span className="text-2xl md:text-3xl font-black text-black group-hover:text-pop-blue transition-colors">
                    {friendsCount}
                  </span>
                  <span className="text-[10px] md:text-xs font-black text-black opacity-40 uppercase tracking-widest">
                    amis
                  </span>
                </button>
                <button
                  onClick={() => navigate('/saved')}
                  className="flex flex-col items-center md:items-start group"
                >
                  <span className="text-2xl md:text-3xl font-black text-black group-hover:text-pop-pink transition-colors">
                    {savedCount}
                  </span>
                  <span className="text-[10px] md:text-xs font-black text-black opacity-40 uppercase tracking-widest">
                    sauvées
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <ProfileView
          posts={posts}
          onSaveChange={handleSaveChange}
          isOwnPost={true}
          userPlatformPreference={user?.platformPreference}
        />
      </div>
    </div>
  )
}

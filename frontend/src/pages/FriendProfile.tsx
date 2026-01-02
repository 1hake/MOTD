import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import FollowButton from '../components/FollowButton'
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

export default function FriendProfile() {
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
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
        {/* Floating Back button */}
        <button
          onClick={() => navigate('/explorer')}
          className="fixed top-[max(1rem,env(safe-area-inset-top))] left-4 z-50 p-3 rounded-xl bg-white border-3 border-black shadow-neo-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all"
        >
          <svg className="w-6 h-6 text-black stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

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

        {/* Posts Section */}
        <ProfileView
          posts={posts}
          onSaveChange={handleSaveChange}
          isOwnPost={false}
          userPlatformPreference={currentUser?.platformPreference}
        />
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { initPushSafe } from '../push'
import EmptyFeedCTA from '../components/EmptyFeedCTA'
import PostsSection from '../components/PostsSection'
import EmptyFriendsState from '../components/EmptyFriendsState'
import LoadingState from '../components/LoadingState'
import NotificationPermissionCard from '../components/NotificationPermissionCard'
import logo2 from '../assets/img/logoblack.png'

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
  deezerTrackId?: string
  coverUrl?: string
  date: string
  saveCount?: number
  isSavedByUser?: boolean
  isPublic: boolean
  user?: {
    id: number
    email: string
    name?: string
  }
}

export default function Feed() {
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [friendsPosts, setFriendsPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  // Scroll to top when component mounts (for navigation from other pages)
  useEffect(() => {
    // Only scroll to top if we're significantly scrolled down
    if (window.scrollY > 200) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }, [])

  const handleSaveChange = (postId: number, isSaved: boolean, newSaveCount: number) => {
    // Update the friends posts array
    setFriendsPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, saveCount: newSaveCount, isSavedByUser: isSaved } : post))
    )

    // Update the all posts array as well
    setAllPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, saveCount: newSaveCount, isSavedByUser: isSaved } : post))
    )
  }

  useEffect(() => {
    ; (async () => {
      if (!isAuthenticated || !user) {
        navigate('/login')
        return
      }

      try {
        // Fetch user's own posts for today using server-side filtering
        const timezoneOffset = new Date().getTimezoneOffset()
        const myPostsRes = await api.get(`/posts/me?today=true&timezoneOffset=${timezoneOffset}`)
        const todayMyPosts = myPostsRes.data

        // Fetch friends' posts specifically
        const friendsPostsRes = await api.get(`/friends/posts?timezoneOffset=${timezoneOffset}`)
        const friendsPostsData = friendsPostsRes.data

        setMyPosts(todayMyPosts)

        // Only show friends' posts if user has posted today
        if (todayMyPosts.length > 0) {
          setFriendsPosts(friendsPostsData)
          setAllPosts([...todayMyPosts, ...friendsPostsData])
        } else {
          setFriendsPosts([])
          setAllPosts(todayMyPosts)
        }

        // Initialize push listeners safely (no-op on web)
        initPushSafe().catch(() => { })
      } catch (error) {
        console.error('Error fetching feed data:', error)
      } finally {
        setLoading(false)
      }
    })()
  }, [navigate])

  if (loading) {
    return <LoadingState message="Chargement du feed..." />
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-32 space-y-8">
        {/* image logo */}
        <div
          className={`w-full flex justify-center transition-all duration-1000 ease-in-out overflow-hidden ${isSearching ? 'h-0 opacity-0' : 'h-auto opacity-100'
            }`}
        >
          <img
            src={logo2}
            alt="DIGGER"
            className={`transition-all duration-500 ${myPosts.length === 0 ? 'w-64 mb-4' : 'w-56'
              } ${isSearching ? 'transform scale-75' : ''}`}
          />
        </div>

        {/* Notification permission prompt (only on mobile) */}
        <NotificationPermissionCard />

        {/* Empty feed CTA */}
        <EmptyFeedCTA
          show={myPosts.length === 0}
          onSearchStateChange={setIsSearching}
        />

        {/* My posts today */}
        {myPosts.length > 0 && <PostsSection title="Ma chanson du jour" posts={myPosts} currentUserId={user?.id} userPlatformPreference={user?.platformPreference} />}

        {/* Friends' posts */}
        {myPosts.length > 0 && (
          <PostsSection
            title="Musiques de mes amis"
            posts={friendsPosts}
            showCount={true}
            emptyMessage={<EmptyFriendsState />}
            onSaveChange={handleSaveChange}
            currentUserId={user?.id}
            userPlatformPreference={user?.platformPreference}
          />
        )}
      </div>
    </div>
  )
}

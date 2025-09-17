import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { initPushSafe } from '../push'
import EmptyFeedCTA from '../components/EmptyFeedCTA'
import PostsSection from '../components/PostsSection'
import EmptyFriendsState from '../components/EmptyFriendsState'
import LoadingState from '../components/LoadingState'
import logo2 from '../assets/img/logo2.png'

type Post = {
  id: number
  title: string
  artist: string
  link: string
  coverUrl?: string
  date: string
  likeCount?: number
  isLikedByUser?: boolean
  user?: {
    id: number
    email: string
  }
}

export default function Feed() {
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [friendsPosts, setFriendsPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
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

  const handleLikeChange = (postId: number, isLiked: boolean, newLikeCount: number) => {
    // Update the friends posts array
    setFriendsPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, likeCount: newLikeCount, isLikedByUser: isLiked } : post))
    )

    // Update the all posts array as well
    setAllPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, likeCount: newLikeCount, isLikedByUser: isLiked } : post))
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
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 pb-24">
        {/* image logo */}
        <div className="w-full flex justify-center ">
          <img src={logo2} alt="DIGGER" className={myPosts.length === 0 ? 'w-64 mb-4 mt-8' : 'w-56'} />
        </div>
        {/* Empty feed CTA */}
        <EmptyFeedCTA show={myPosts.length === 0} />

        {/* My posts today */}
        {myPosts.length > 0 && <PostsSection title="Ma chanson du jour" posts={myPosts} currentUserId={user?.id} />}

        {/* Friends' posts */}
        {myPosts.length > 0 && (
          <PostsSection
            title="Musiques de mes amis"
            posts={friendsPosts}
            showCount={true}
            emptyMessage={<EmptyFriendsState />}
            onLikeChange={handleLikeChange}
            currentUserId={user?.id}
          />
        )}
      </div>
    </div>
  )
}
